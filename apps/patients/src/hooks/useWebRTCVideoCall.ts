/**
 * Hook completo para videollamadas WebRTC con Signaling
 *
 * Integra:
 * - RTCPeerConnection para comunicación peer-to-peer
 * - Supabase Realtime para signaling
 * - Manejo de local/remote streams
 * - Auto-negociación de conexión
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabase } from '@autamedica/auth/react';
import { SupabaseSignalingService } from '@/services/SupabaseSignalingService';
import { logger } from '@autamedica/shared';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

interface UseWebRTCVideoCallOptions {
  roomId: string;
  userId: string;
  autoStart?: boolean;
}

interface WebRTCVideoCallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  connectionState: RTCPeerConnectionState;
  error: string | null;
  remotePeerId: string | null;
}

interface WebRTCVideoCallActions {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  switchCamera: () => Promise<void>;
}

export function useWebRTCVideoCall(
  options: UseWebRTCVideoCallOptions
): [WebRTCVideoCallState, WebRTCVideoCallActions] {
  const { roomId, userId, autoStart = false } = options;

  const supabase = useSupabase();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingServiceRef = useRef<SupabaseSignalingService | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [state, setState] = useState<WebRTCVideoCallState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isConnecting: false,
    isCameraOn: true,
    isMicOn: true,
    connectionState: 'new',
    error: null,
    remotePeerId: null,
  });

  /**
   * Inicializar local media (cámara y micrófono)
   */
  const initializeLocalStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));

      logger.info('[WebRTC] Local stream initialized');
      return stream;
    } catch (error) {
      logger.error('[WebRTC] Error accessing media devices:', error);
      setState(prev => ({
        ...prev,
        error: 'No se pudo acceder a la cámara o micrófono',
      }));
      throw error;
    }
  }, []);

  /**
   * Crear RTCPeerConnection
   */
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Manejar remote stream
    pc.ontrack = (event) => {
      logger.info('[WebRTC] Received remote track');
      const [remoteStream] = event.streams;
      setState(prev => ({ ...prev, remoteStream }));
    };

    // Manejar cambios en estado de conexión
    pc.onconnectionstatechange = () => {
      logger.info('[WebRTC] Connection state:', pc.connectionState);
      setState(prev => ({
        ...prev,
        connectionState: pc.connectionState,
        isConnected: pc.connectionState === 'connected',
        isConnecting: pc.connectionState === 'connecting',
      }));

      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setState(prev => ({
          ...prev,
          error: 'Conexión perdida. Intentando reconectar...',
        }));
      }
    };

    // Manejar ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingServiceRef.current) {
        logger.info('[WebRTC] Sending ICE candidate');
        signalingServiceRef.current.sendIceCandidate(
          event.candidate.toJSON(),
          state.remotePeerId || undefined
        );
      }
    };

    return pc;
  }, [state.remotePeerId]);

  /**
   * Iniciar llamada (crear oferta)
   */
  const startCall = useCallback(async () => {
    if (!supabase) {
      setState(prev => ({ ...prev, error: 'Supabase no disponible' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // 1. Obtener local stream
      const localStream = await initializeLocalStream();

      // 2. Crear peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // 3. Agregar local tracks al peer connection
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // 4. Inicializar servicio de signaling
      const signaling = new SupabaseSignalingService(supabase, userId, {
        onOffer: async (offer, from) => {
          logger.info('[WebRTC] Received offer from:', from);
          await pc.setRemoteDescription(offer);

          // Crear answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await signaling.sendAnswer(answer, from);

          // Procesar pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];

          setState(prev => ({ ...prev, remotePeerId: from }));
        },

        onAnswer: async (answer, from) => {
          logger.info('[WebRTC] Received answer from:', from);
          await pc.setRemoteDescription(answer);

          // Procesar pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        },

        onIceCandidate: async (candidate, from) => {
          logger.info('[WebRTC] Received ICE candidate from:', from);
          try {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(candidate);
            } else {
              // Guardar para procesar después
              pendingCandidatesRef.current.push(candidate);
            }
          } catch (error) {
            logger.error('[WebRTC] Error adding ICE candidate:', error);
          }
        },

        onPeerJoined: async (peerId) => {
          logger.info('[WebRTC] Peer joined:', peerId);
          setState(prev => ({ ...prev, remotePeerId: peerId }));

          // Si somos el primero, crear oferta
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await signaling.sendOffer(offer, peerId);
        },

        onPeerLeft: (peerId) => {
          logger.info('[WebRTC] Peer left:', peerId);
          setState(prev => ({
            ...prev,
            remotePeerId: null,
            remoteStream: null,
            error: 'El otro participante salió de la llamada',
          }));
        },

        onError: (error) => {
          logger.error('[WebRTC] Signaling error:', error);
          setState(prev => ({ ...prev, error: error.message }));
        },
      });

      signalingServiceRef.current = signaling;

      // 5. Unirse a la sala
      await signaling.joinRoom(roomId);

      logger.info('[WebRTC] Call started in room:', roomId);
    } catch (error) {
      logger.error('[WebRTC] Error starting call:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al iniciar la llamada',
        isConnecting: false,
      }));
    }
  }, [supabase, userId, roomId, initializeLocalStream, createPeerConnection]);

  /**
   * Finalizar llamada
   */
  const endCall = useCallback(() => {
    // Cerrar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Detener local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Desconectar signaling
    if (signalingServiceRef.current) {
      signalingServiceRef.current.disconnect();
      signalingServiceRef.current = null;
    }

    setState({
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isConnecting: false,
      isCameraOn: true,
      isMicOn: true,
      connectionState: 'closed',
      error: null,
      remotePeerId: null,
    });

    logger.info('[WebRTC] Call ended');
  }, []);

  /**
   * Toggle cámara
   */
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isCameraOn: videoTrack.enabled }));
      }
    }
  }, []);

  /**
   * Toggle micrófono
   */
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isMicOn: audioTrack.enabled }));
      }
    }
  }, []);

  /**
   * Cambiar cámara (frontal/trasera en móviles)
   */
  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return;

    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode === 'user' ? 'environment' : 'user',
        },
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Reemplazar track en peer connection
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current
          .getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Detener track anterior
      videoTrack.stop();

      // Actualizar local stream
      localStreamRef.current.removeTrack(videoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      setState(prev => ({ ...prev, localStream: localStreamRef.current }));
    } catch (error) {
      logger.error('[WebRTC] Error switching camera:', error);
    }
  }, []);

  // Auto-start si está habilitado
  useEffect(() => {
    if (autoStart) {
      startCall();
    }

    // Cleanup al desmontar
    return () => {
      endCall();
    };
  }, []);

  return [
    state,
    {
      startCall,
      endCall,
      toggleCamera,
      toggleMic,
      switchCamera,
    },
  ];
}
