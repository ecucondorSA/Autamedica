import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebRTC } from './useWebRTC';
import { SignalingService, SignalingEvent, getSignalingService } from '@/services/SignalingService';

/**
 * Hook orquestador completo para videollamadas WebRTC
 *
 * Combina:
 * - useWebRTC (peer connection)
 * - SignalingService (coordinación)
 * - Local media (cámara/micrófono)
 *
 * Workflow completo:
 * 1. Obtener local stream (getUserMedia)
 * 2. Conectar a signaling server
 * 3. Unirse a sala
 * 4. Inicializar peer connection
 * 5. Negociar SDP (offer/answer)
 * 6. Intercambiar ICE candidates
 * 7. Stream bidireccional establecido
 */

export interface WebRTCCallConfig {
  /** ID de la sala de videoconsulta */
  roomId: string;
  /** ID del usuario actual */
  userId: string;
  /** URL del signaling server */
  signalingServerUrl?: string;
  /** Token de autenticación */
  authToken?: string;
  /** Constraints de media */
  mediaConstraints?: MediaStreamConstraints;
}

export interface WebRTCCallState {
  /** Stream local (cámara/micrófono) */
  localStream: MediaStream | null;
  /** Stream remoto (del médico) */
  remoteStream: MediaStream | null;
  /** Estado de la llamada */
  callStatus: 'idle' | 'connecting' | 'connected' | 'failed' | 'ended';
  /** Video local habilitado */
  isVideoEnabled: boolean;
  /** Audio local habilitado */
  isAudioEnabled: boolean;
  /** Compartir pantalla activo */
  isScreenSharing: boolean;
  /** Error */
  error: string | null;
  /** Estadísticas de conexión */
  connectionStats: {
    bitrate: number;
    latency: number;
    packetLoss: number;
  } | null;
}

export interface WebRTCCallActions {
  /** Iniciar llamada */
  startCall: () => Promise<void>;
  /** Finalizar llamada */
  endCall: () => void;
  /** Toggle video */
  toggleVideo: () => void;
  /** Toggle audio */
  toggleAudio: () => void;
  /** Toggle screen share */
  toggleScreenShare: () => Promise<void>;
}

const DEFAULT_SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8888';

const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export function useWebRTCCall(config: WebRTCCallConfig): [WebRTCCallState, WebRTCCallActions] {
  const {
    roomId,
    userId,
    signalingServerUrl = DEFAULT_SIGNALING_URL,
    authToken,
    mediaConstraints = DEFAULT_MEDIA_CONSTRAINTS,
  } = config;

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<WebRTCCallState['callStatus']>('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebRTC hook
  const [webrtcState, webrtcActions] = useWebRTC({
    onRemoteStream: (stream) => {
      console.log('[useWebRTCCall] Remote stream received');
    },
    onIceCandidate: (candidate) => {
      // Enviar ICE candidate al peer remoto vía signaling
      if (signalingRef.current) {
        signalingRef.current.sendIceCandidate(roomId, candidate);
      }
    },
    onConnectionStateChange: (state) => {
      console.log('[useWebRTCCall] Connection state:', state);

      if (state === 'connected') {
        setCallStatus('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        setCallStatus('failed');
        setError('Conexión perdida. Intenta reconectar.');
      }
    },
  });

  // Refs
  const signalingRef = useRef<SignalingService | null>(null);
  const isInitiatorRef = useRef(false); // ¿Soy el que inicia la llamada?

  /**
   * Obtener local media stream (cámara/micrófono)
   */
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      console.log('[useWebRTCCall] Requesting local media...');
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log('[useWebRTCCall] Local stream obtained');
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[useWebRTCCall] Failed to get local media:', err);
      setError('No se pudo acceder a la cámara o micrófono');
      return null;
    }
  }, [mediaConstraints]);

  /**
   * Configurar event listeners del signaling service
   */
  const setupSignalingListeners = useCallback((signaling: SignalingService) => {
    // Oferta recibida (soy el receptor)
    signaling.on(SignalingEvent.OFFER_RECEIVED, async ({ offer }) => {
      console.log('[useWebRTCCall] Offer received, creating answer...');
      isInitiatorRef.current = false;

      // Establecer remote description (la oferta)
      await webrtcActions.setRemoteDescription(offer);

      // Crear y enviar respuesta
      const answer = await webrtcActions.createAnswer();
      if (answer && signalingRef.current) {
        signalingRef.current.sendAnswer(roomId, answer);
      }
    });

    // Respuesta recibida (soy el iniciador)
    signaling.on(SignalingEvent.ANSWER_RECEIVED, async ({ answer }) => {
      console.log('[useWebRTCCall] Answer received');
      await webrtcActions.setRemoteDescription(answer);
    });

    // ICE candidate recibido
    signaling.on(SignalingEvent.ICE_CANDIDATE_RECEIVED, async ({ candidate }) => {
      console.log('[useWebRTCCall] ICE candidate received');
      await webrtcActions.addIceCandidate(candidate);
    });

    // Usuario se unió a la sala
    signaling.on(SignalingEvent.USER_JOINED, async ({ userId: remoteUserId }) => {
      console.log('[useWebRTCCall] User joined:', remoteUserId);

      // Si soy el primer usuario en la sala, espero
      // Si llega otro usuario, inicio la negociación
      isInitiatorRef.current = true;

      // Crear y enviar oferta
      const offer = await webrtcActions.createOffer();
      if (offer && signalingRef.current) {
        signalingRef.current.sendOffer(roomId, offer);
      }
    });

    // Usuario salió de la sala
    signaling.on(SignalingEvent.USER_LEFT, () => {
      console.log('[useWebRTCCall] User left');
      setCallStatus('ended');
    });

    // Error de signaling
    signaling.on(SignalingEvent.ERROR, (err) => {
      console.error('[useWebRTCCall] Signaling error:', err);
      setError('Error de conexión al servidor');
      setCallStatus('failed');
    });
  }, [roomId, webrtcActions]);

  /**
   * Iniciar llamada
   */
  const startCall = useCallback(async () => {
    try {
      console.log('[useWebRTCCall] Starting call...');
      setCallStatus('connecting');
      setError(null);

      // 1. Obtener local stream
      const stream = await getLocalStream();
      if (!stream) {
        setCallStatus('failed');
        return;
      }

      // 2. Conectar a signaling server
      console.log('[useWebRTCCall] Connecting to signaling server...');
      const signaling = getSignalingService({
        serverUrl: signalingServerUrl,
        userId,
        authToken,
      });

      signalingRef.current = signaling;

      // Configurar listeners
      setupSignalingListeners(signaling);

      // Conectar
      await signaling.connect();

      // 3. Unirse a sala
      console.log('[useWebRTCCall] Joining room:', roomId);
      signaling.joinRoom(roomId);

      // 4. Inicializar peer connection
      console.log('[useWebRTCCall] Initializing peer connection...');
      webrtcActions.initializePeerConnection();

      // 5. Agregar local stream a peer connection
      webrtcActions.addLocalStream(stream);

      console.log('[useWebRTCCall] Call started successfully');
    } catch (err) {
      console.error('[useWebRTCCall] Failed to start call:', err);
      setError('No se pudo iniciar la llamada');
      setCallStatus('failed');
    }
  }, [
    roomId,
    userId,
    signalingServerUrl,
    authToken,
    getLocalStream,
    setupSignalingListeners,
    webrtcActions,
  ]);

  /**
   * Finalizar llamada
   */
  const endCall = useCallback(() => {
    console.log('[useWebRTCCall] Ending call...');

    // Detener local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Detener screen share si está activo
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }

    // Salir de la sala
    if (signalingRef.current) {
      signalingRef.current.leaveRoom();
      signalingRef.current.disconnect();
      signalingRef.current = null;
    }

    // Cerrar peer connection
    webrtcActions.closePeerConnection();

    setCallStatus('ended');
  }, [localStream, screenStream, webrtcActions]);

  /**
   * Toggle video local
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  /**
   * Toggle audio local
   */
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  /**
   * Toggle screen share
   */
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Detener screen share
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      // Iniciar screen share
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
          },
          audio: false,
        });

        setScreenStream(stream);
        setIsScreenSharing(true);

        // Detener automáticamente cuando el usuario cancela desde el navegador
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error('[useWebRTCCall] Failed to start screen share:', err);
        setError('No se pudo compartir la pantalla');
      }
    }
  }, [isScreenSharing, screenStream]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  /**
   * Effect: Actualizar estadísticas periódicamente
   */
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(async () => {
      const stats = await webrtcActions.getConnectionStats();
      // Stats se actualizan automáticamente en webrtcState
    }, 2000);

    return () => clearInterval(interval);
  }, [callStatus, webrtcActions]);

  return [
    {
      localStream,
      remoteStream: webrtcState.remoteStream,
      callStatus,
      isVideoEnabled,
      isAudioEnabled,
      isScreenSharing,
      error: error || webrtcState.error,
      connectionStats: webrtcState.stats,
    },
    {
      startCall,
      endCall,
      toggleVideo,
      toggleAudio,
      toggleScreenShare,
    },
  ];
}
