/**
 * Reconnection Hook
 * Automatic reconnection for WebRTC connections
 *
 * @module useReconnection
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionState =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'failed';

export interface ReconnectionConfig {
  /** Maximum number of reconnection attempts */
  maxAttempts?: number;
  /** Initial delay in ms (doubles each attempt) */
  initialDelay?: number;
  /** Maximum delay between attempts in ms */
  maxDelay?: number;
  /** Enable ICE restart on reconnection */
  enableIceRestart?: boolean;
  /** Callback when reconnection starts */
  onReconnectStart?: () => void;
  /** Callback when reconnection succeeds */
  onReconnectSuccess?: () => void;
  /** Callback when reconnection fails */
  onReconnectFailed?: (attempts: number) => void;
  /** Custom reconnection logic */
  reconnectFn?: () => Promise<void>;
}

export interface UseReconnectionOptions {
  /** WebRTC peer connection to monitor */
  peerConnection: RTCPeerConnection | null;
  /** Socket.io or WebSocket connection to monitor */
  signaling: any;
  /** Configuration options */
  config?: ReconnectionConfig;
  /** Enable automatic reconnection */
  enabled?: boolean;
}

export interface UseReconnectionReturn {
  /** Current connection state */
  state: ConnectionState;
  /** Number of reconnection attempts */
  attempts: number;
  /** Whether reconnection is in progress */
  isReconnecting: boolean;
  /** Manually trigger reconnection */
  reconnect: () => Promise<void>;
  /** Reset reconnection state */
  reset: () => void;
  /** Next retry delay in seconds */
  nextRetryIn: number;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(
  attempt: number,
  initialDelay: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Hook for automatic WebRTC reconnection
 */
export function useReconnection(
  options: UseReconnectionOptions
): UseReconnectionReturn {
  const {
    peerConnection,
    signaling,
    config = {},
    enabled = true,
  } = options;

  const {
    maxAttempts = 10,
    initialDelay = 1000,
    maxDelay = 30000,
    enableIceRestart = true,
    onReconnectStart,
    onReconnectSuccess,
    onReconnectFailed,
    reconnectFn,
  } = config;

  const [state, setState] = useState<ConnectionState>('connected');
  const [attempts, setAttempts] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef(false);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextRetryIn(0);
  }, []);

  /**
   * Reset reconnection state
   */
  const reset = useCallback(() => {
    clearTimers();
    setAttempts(0);
    setState('connected');
    isReconnectingRef.current = false;
  }, [clearTimers]);

  /**
   * Perform reconnection
   */
  const performReconnection = useCallback(async () => {
    if (!peerConnection || !signaling) {
      console.warn('[Reconnection] Missing peer connection or signaling');
      return;
    }

    try {
      // Use custom reconnect function if provided
      if (reconnectFn) {
        await reconnectFn();
      } else {
        // Default: ICE restart
        if (enableIceRestart && peerConnection.restartIce) {
          console.log('[Reconnection] Performing ICE restart');
          peerConnection.restartIce();
        }

        // Renegotiate connection
        if (peerConnection.createOffer) {
          const offer = await peerConnection.createOffer({ iceRestart: enableIceRestart });
          await peerConnection.setLocalDescription(offer);

          // Send offer through signaling
          if (signaling.emit) {
            signaling.emit('offer', { sdp: offer });
          }
        }
      }

      console.log('[Reconnection] Reconnection successful');
      setState('connected');
      reset();
      onReconnectSuccess?.();
    } catch (error) {
      console.error('[Reconnection] Reconnection failed:', error);
      throw error;
    }
  }, [peerConnection, signaling, enableIceRestart, reconnectFn, reset, onReconnectSuccess]);

  /**
   * Attempt reconnection with backoff
   */
  const attemptReconnection = useCallback(
    async (attemptNumber: number) => {
      if (attemptNumber >= maxAttempts) {
        console.error('[Reconnection] Max attempts reached');
        setState('failed');
        isReconnectingRef.current = false;
        onReconnectFailed?.(attemptNumber);
        return;
      }

      const delay = calculateBackoff(attemptNumber, initialDelay, maxDelay);
      const delaySeconds = Math.ceil(delay / 1000);

      console.log(
        `[Reconnection] Attempt ${attemptNumber + 1}/${maxAttempts} in ${delaySeconds}s`
      );

      setState('reconnecting');
      setAttempts(attemptNumber + 1);
      setNextRetryIn(delaySeconds);

      // Start countdown
      let remaining = delaySeconds;
      countdownIntervalRef.current = setInterval(() => {
        remaining--;
        setNextRetryIn(remaining);
        if (remaining <= 0 && countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      // Schedule reconnection attempt
      reconnectTimeoutRef.current = setTimeout(async () => {
        try {
          await performReconnection();
        } catch (error) {
          // Retry on next attempt
          attemptReconnection(attemptNumber + 1);
        }
      }, delay);
    },
    [maxAttempts, initialDelay, maxDelay, performReconnection, onReconnectFailed]
  );

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(async () => {
    if (isReconnectingRef.current) {
      console.warn('[Reconnection] Already reconnecting');
      return;
    }

    isReconnectingRef.current = true;
    clearTimers();
    onReconnectStart?.();

    try {
      await performReconnection();
    } catch (error) {
      // Start retry loop
      attemptReconnection(0);
    }
  }, [clearTimers, performReconnection, attemptReconnection, onReconnectStart]);

  /**
   * Monitor peer connection state
   */
  useEffect(() => {
    if (!enabled || !peerConnection) return;

    const handleConnectionStateChange = () => {
      const connectionState = peerConnection.connectionState;
      console.log('[Reconnection] Connection state:', connectionState);

      switch (connectionState) {
        case 'connected':
          if (state !== 'connected') {
            reset();
          }
          break;

        case 'disconnected':
        case 'failed':
          if (state === 'connected' && !isReconnectingRef.current) {
            console.warn('[Reconnection] Connection lost, starting reconnection');
            setState('disconnected');
            reconnect();
          }
          break;

        case 'closed':
          setState('failed');
          clearTimers();
          break;
      }
    };

    const handleIceConnectionStateChange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log('[Reconnection] ICE state:', iceState);

      if (iceState === 'failed' && state === 'connected' && !isReconnectingRef.current) {
        console.warn('[Reconnection] ICE failed, starting reconnection');
        setState('disconnected');
        reconnect();
      }
    };

    peerConnection.addEventListener('connectionstatechange', handleConnectionStateChange);
    peerConnection.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);

    return () => {
      peerConnection.removeEventListener('connectionstatechange', handleConnectionStateChange);
      peerConnection.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
    };
  }, [enabled, peerConnection, state, reconnect, reset, clearTimers]);

  /**
   * Monitor signaling connection
   */
  useEffect(() => {
    if (!enabled || !signaling) return;

    const handleDisconnect = () => {
      console.warn('[Reconnection] Signaling disconnected');
      if (state === 'connected' && !isReconnectingRef.current) {
        setState('disconnected');
        reconnect();
      }
    };

    const handleReconnect = () => {
      console.log('[Reconnection] Signaling reconnected');
      if (state !== 'connected') {
        reconnect();
      }
    };

    // Socket.io events
    if (signaling.on) {
      signaling.on('disconnect', handleDisconnect);
      signaling.on('reconnect', handleReconnect);
    }

    return () => {
      if (signaling.off) {
        signaling.off('disconnect', handleDisconnect);
        signaling.off('reconnect', handleReconnect);
      }
    };
  }, [enabled, signaling, state, reconnect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    state,
    attempts,
    isReconnecting: isReconnectingRef.current || state === 'reconnecting',
    reconnect,
    reset,
    nextRetryIn,
  };
}
