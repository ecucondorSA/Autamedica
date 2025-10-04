import { useState, useEffect, useRef, useCallback } from 'react'
import { WebRTCClient, type ConnectionState, type MediaConstraints } from '../webrtc-client'

export interface TelemedicineClientState {
  client: WebRTCClient | null
  connectionState: ConnectionState
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  error: Error | null
  isConnecting: boolean
  reconnectAttempts: number
}

export interface TelemedicineClientActions {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  startLocalStream: (constraints?: MediaConstraints) => Promise<MediaStream | void>
  stopLocalStream: () => void
}

export type TelemedicineClientHook = TelemedicineClientState & TelemedicineClientActions

interface UseTelemedicineClientOptions {
  autoConnect?: boolean
  maxReconnectAttempts?: number
  reconnectBackoffBase?: number
  reconnectBackoffMax?: number
  mediaConstraints?: MediaConstraints
}

const DEFAULT_OPTIONS: Required<UseTelemedicineClientOptions> = {
  autoConnect: false,
  maxReconnectAttempts: 5,
  reconnectBackoffBase: 1000,
  reconnectBackoffMax: 10000,
  mediaConstraints: { video: true, audio: true }
}

export function useTelemedicineClient(
  roomId: string,
  userId: string,
  userType: 'doctor' | 'patient' | 'nurse',
  options: UseTelemedicineClientOptions = {}
): TelemedicineClientHook {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [state, setState] = useState<TelemedicineClientState>({
    client: null,
    connectionState: 'disconnected',
    localStream: null,
    remoteStreams: new Map(),
    error: null,
    isConnecting: false,
    reconnectAttempts: 0
  })

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const clientRef = useRef<WebRTCClient | undefined>(undefined)

  // Calculate exponential backoff delay
  const calculateBackoffDelay = useCallback((attempt: number): number => {
    const delay = Math.min(
      opts.reconnectBackoffBase * Math.pow(2, attempt),
      opts.reconnectBackoffMax
    )
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }, [opts.reconnectBackoffBase, opts.reconnectBackoffMax])

  // Initialize WebRTC client
  useEffect(() => {
    logger.info(`[useTelemedicineClient] Initializing for ${userType}: ${userId} in room ${roomId}`)

    const client = new WebRTCClient({
      userId,
      userType,
      roomId
    })

    clientRef.current = client

    // Set up event listeners
    client.on('connection-state', (connectionState: any) => {
      logger.info(`[useTelemedicineClient] Connection state:`, connectionState)
      setState(prev => ({
        ...prev,
        connectionState,
        isConnecting: connectionState === 'connecting',
        error: connectionState === 'failed' ? new Error('Connection failed') : null
      }))

      // Handle reconnection on failure
      if (connectionState === 'failed' && state.reconnectAttempts < opts.maxReconnectAttempts) {
        const delay = calculateBackoffDelay(state.reconnectAttempts)
        logger.info(`[useTelemedicineClient] Scheduling reconnection in ${delay}ms (attempt ${state.reconnectAttempts + 1})`)

        reconnectTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }))
          client.connect(roomId).catch(error => {
            logger.error('[useTelemedicineClient] Reconnection failed:', error)
          })
        }, delay)
      }

      // Reset reconnect attempts on successful connection
      if (connectionState === 'connected') {
        setState(prev => ({ ...prev, reconnectAttempts: 0, error: null }))
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = undefined
        }
      }
    })

    client.on('local-stream', (stream: any) => {
      logger.info(`[useTelemedicineClient] Got local stream`)
      setState(prev => ({ ...prev, localStream: stream }))
    })

    client.on('remote-stream', (stream: any, userId: any) => {
      logger.info(`[useTelemedicineClient] Got remote stream from:`, userId)
      setState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams).set(userId, stream)
      }))
    })

    client.on('user-left', (userId: any) => {
      logger.info(`[useTelemedicineClient] User left:`, userId)
      setState(prev => {
        const newRemoteStreams = new Map(prev.remoteStreams)
        newRemoteStreams.delete(userId)
        return { ...prev, remoteStreams: newRemoteStreams }
      })
    })

    client.on('error', (error) => {
      logger.error(`[useTelemedicineClient] WebRTC error:`, error)
      setState(prev => ({ ...prev, error }))
    })

    setState(prev => ({ ...prev, client }))

    // Auto-connect if enabled
    if (opts.autoConnect) {
      client.connect(roomId).catch(error => {
        logger.error('[useTelemedicineClient] Auto-connect failed:', error)
        setState(prev => ({ ...prev, error }))
      })
    }

    return () => {
      logger.info(`[useTelemedicineClient] Cleaning up`)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      client.disconnect()
    }
  }, [roomId, userId, userType, opts.autoConnect, opts.maxReconnectAttempts])

  // Connect function
  const connect = useCallback(async (): Promise<void> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized')
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      await clientRef.current.connect(roomId)
    } catch (error) {
      logger.error('[useTelemedicineClient] Connect failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Connection failed'),
        isConnecting: false
      }))
      throw error
    }
  }, [roomId])

  // Disconnect function
  const disconnect = useCallback(async (): Promise<void> => {
    if (!clientRef.current) return

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }

    setState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      isConnecting: false
    }))

    await clientRef.current.disconnect()
  }, [])

  // Start local stream
  const startLocalStream = useCallback(async (constraints?: MediaConstraints): Promise<MediaStream | void> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized')
    }

    try {
      const stream = await clientRef.current.startLocalStream(constraints || opts.mediaConstraints)
      return stream
    } catch (error) {
      logger.error('[useTelemedicineClient] Failed to start local stream:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to access media devices')
      }))
      throw error
    }
  }, [opts.mediaConstraints])

  // Stop local stream
  const stopLocalStream = useCallback((): void => {
    if (!clientRef.current) return
    clientRef.current.stopLocalStream()
    setState(prev => ({ ...prev, localStream: null }))
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    startLocalStream,
    stopLocalStream
  }
}