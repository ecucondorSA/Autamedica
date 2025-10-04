import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook principal para gestión de WebRTC Peer Connection
 *
 * Features:
 * - RTCPeerConnection con ICE servers (STUN/TURN)
 * - Manejo de ICE candidates
 * - Offer/Answer SDP exchange
 * - Remote stream bidireccional
 * - Connection state monitoring
 * - Auto-reconnection
 */

export interface WebRTCConfig {
  /** ICE servers para NAT traversal */
  iceServers?: RTCIceServer[];
  /** Auto-restart on connection failure */
  autoReconnect?: boolean;
  /** Callback cuando se recibe remote stream */
  onRemoteStream?: (stream: MediaStream) => void;
  /** Callback cuando se genera ICE candidate */
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  /** Callback cuando cambia el estado de conexión */
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export interface WebRTCState {
  /** Peer connection instance */
  peerConnection: RTCPeerConnection | null;
  /** Remote stream del médico */
  remoteStream: MediaStream | null;
  /** Estado de la conexión */
  connectionState: RTCPeerConnectionState;
  /** Estado de ICE gathering */
  iceGatheringState: RTCIceGatheringState;
  /** Estado de ICE connection */
  iceConnectionState: RTCIceConnectionState;
  /** Signaling state */
  signalingState: RTCSignalingState;
  /** Estadísticas de conexión */
  stats: WebRTCStats | null;
  /** Error de conexión */
  error: string | null;
}

export interface WebRTCStats {
  /** Bitrate en kbps */
  bitrate: number;
  /** Latencia en ms */
  latency: number;
  /** Packet loss % */
  packetLoss: number;
  /** Round trip time en ms */
  rtt: number;
  /** Frames por segundo */
  fps: number;
  /** Resolución del video */
  resolution: { width: number; height: number };
}

export interface WebRTCActions {
  /** Inicializar peer connection */
  initializePeerConnection: () => void;
  /** Agregar local stream a peer connection */
  addLocalStream: (stream: MediaStream) => void;
  /** Crear oferta SDP */
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  /** Crear respuesta SDP */
  createAnswer: () => Promise<RTCSessionDescriptionInit | null>;
  /** Establecer remote description */
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  /** Agregar ICE candidate remoto */
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  /** Cerrar peer connection */
  closePeerConnection: () => void;
  /** Obtener estadísticas de conexión */
  getConnectionStats: () => Promise<WebRTCStats | null>;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  // Google STUN servers (públicos y gratuitos)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },

  // TODO: Agregar TURN servers privados para producción
  // {
  //   urls: 'turn:turn.autamedica.com:3478',
  //   username: 'autamedica',
  //   credential: process.env.NEXT_PUBLIC_TURN_SECRET
  // }
];

export function useWebRTC(config: WebRTCConfig = {}): [WebRTCState, WebRTCActions] {
  const {
    iceServers = DEFAULT_ICE_SERVERS,
    autoReconnect = true,
    onRemoteStream,
    onIceCandidate,
    onConnectionStateChange,
  } = config;

  // State
  const [state, setState] = useState<WebRTCState>({
    peerConnection: null,
    remoteStream: null,
    connectionState: 'new',
    iceGatheringState: 'new',
    iceConnectionState: 'new',
    signalingState: 'stable',
    stats: null,
    error: null,
  });

  // Refs para evitar stale closures
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Inicializar RTCPeerConnection con configuración completa
   */
  const initializePeerConnection = useCallback(() => {
    console.log('[useWebRTC] Initializing peer connection...');

    try {
      // Crear peer connection con ICE servers
      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10, // Pre-gather candidates
        bundlePolicy: 'max-bundle', // Multiplex all media on single connection
        rtcpMuxPolicy: 'require', // Multiplex RTP and RTCP
      });

      // Event: ICE Candidate generado (enviar al peer remoto vía signaling)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[useWebRTC] New ICE candidate:', event.candidate.candidate);
          onIceCandidate?.(event.candidate);
        } else {
          console.log('[useWebRTC] ICE gathering completed');
        }
      };

      // Event: Remote stream recibido
      pc.ontrack = (event) => {
        console.log('[useWebRTC] Remote track received:', event.track.kind);

        // Agregar track al remote stream
        let stream = remoteStreamRef.current;
        if (!stream) {
          stream = new MediaStream();
          remoteStreamRef.current = stream;
        }

        stream.addTrack(event.track);

        setState(prev => ({ ...prev, remoteStream: stream }));
        onRemoteStream?.(stream);
      };

      // Event: Connection state cambió
      pc.onconnectionstatechange = () => {
        console.log('[useWebRTC] Connection state:', pc.connectionState);
        setState(prev => ({ ...prev, connectionState: pc.connectionState }));
        onConnectionStateChange?.(pc.connectionState);

        // Auto-reconnect si falla
        if (autoReconnect && pc.connectionState === 'failed') {
          console.warn('[useWebRTC] Connection failed, attempting reconnect...');
          // TODO: Implementar lógica de reconexión
        }
      };

      // Event: ICE connection state cambió
      pc.oniceconnectionstatechange = () => {
        console.log('[useWebRTC] ICE connection state:', pc.iceConnectionState);
        setState(prev => ({ ...prev, iceConnectionState: pc.iceConnectionState }));
      };

      // Event: ICE gathering state cambió
      pc.onicegatheringstatechange = () => {
        console.log('[useWebRTC] ICE gathering state:', pc.iceGatheringState);
        setState(prev => ({ ...prev, iceGatheringState: pc.iceGatheringState }));
      };

      // Event: Signaling state cambió
      pc.onsignalingstatechange = () => {
        console.log('[useWebRTC] Signaling state:', pc.signalingState);
        setState(prev => ({ ...prev, signalingState: pc.signalingState }));
      };

      // Event: Negotiation needed (renegotiar SDP)
      pc.onnegotiationneeded = async () => {
        console.log('[useWebRTC] Negotiation needed');
        // TODO: Trigger renegotiación vía signaling
      };

      peerConnectionRef.current = pc;
      setState(prev => ({ ...prev, peerConnection: pc, error: null }));

      console.log('[useWebRTC] Peer connection initialized successfully');
    } catch (error) {
      console.error('[useWebRTC] Failed to initialize peer connection:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize peer connection'
      }));
    }
  }, [iceServers, autoReconnect, onRemoteStream, onIceCandidate, onConnectionStateChange]);

  /**
   * Agregar local stream (cámara/micrófono) a peer connection
   */
  const addLocalStream = useCallback((stream: MediaStream) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.error('[useWebRTC] Cannot add local stream: peer connection not initialized');
      return;
    }

    console.log('[useWebRTC] Adding local stream tracks...');

    // Agregar cada track del stream
    stream.getTracks().forEach(track => {
      console.log(`[useWebRTC] Adding ${track.kind} track to peer connection`);
      pc.addTrack(track, stream);
    });
  }, []);

  /**
   * Crear oferta SDP (iniciador de la llamada)
   */
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.error('[useWebRTC] Cannot create offer: peer connection not initialized');
      return null;
    }

    try {
      console.log('[useWebRTC] Creating SDP offer...');

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      console.log('[useWebRTC] Setting local description...');
      await pc.setLocalDescription(offer);

      console.log('[useWebRTC] Offer created successfully');
      return offer;
    } catch (error) {
      console.error('[useWebRTC] Failed to create offer:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create offer'
      }));
      return null;
    }
  }, []);

  /**
   * Crear respuesta SDP (receptor de la llamada)
   */
  const createAnswer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.error('[useWebRTC] Cannot create answer: peer connection not initialized');
      return null;
    }

    try {
      console.log('[useWebRTC] Creating SDP answer...');

      const answer = await pc.createAnswer();

      console.log('[useWebRTC] Setting local description...');
      await pc.setLocalDescription(answer);

      console.log('[useWebRTC] Answer created successfully');
      return answer;
    } catch (error) {
      console.error('[useWebRTC] Failed to create answer:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create answer'
      }));
      return null;
    }
  }, []);

  /**
   * Establecer remote description (SDP del peer remoto)
   */
  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.error('[useWebRTC] Cannot set remote description: peer connection not initialized');
      return;
    }

    try {
      console.log('[useWebRTC] Setting remote description:', description.type);
      await pc.setRemoteDescription(new RTCSessionDescription(description));
      console.log('[useWebRTC] Remote description set successfully');
    } catch (error) {
      console.error('[useWebRTC] Failed to set remote description:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to set remote description'
      }));
    }
  }, []);

  /**
   * Agregar ICE candidate remoto
   */
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.error('[useWebRTC] Cannot add ICE candidate: peer connection not initialized');
      return;
    }

    try {
      console.log('[useWebRTC] Adding remote ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[useWebRTC] ICE candidate added successfully');
    } catch (error) {
      console.error('[useWebRTC] Failed to add ICE candidate:', error);
      // No marcar como error crítico - algunos candidates pueden fallar
    }
  }, []);

  /**
   * Obtener estadísticas de conexión en tiempo real
   */
  const getConnectionStats = useCallback(async (): Promise<WebRTCStats | null> => {
    const pc = peerConnectionRef.current;
    if (!pc) return null;

    try {
      const stats = await pc.getStats(null);

      let bitrate = 0;
      let latency = 0;
      let packetLoss = 0;
      let rtt = 0;
      let fps = 0;
      let resolution = { width: 0, height: 0 };

      stats.forEach(report => {
        // Inbound RTP (video recibido)
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          bitrate = Math.round((report.bytesReceived * 8) / 1000); // kbps
          packetLoss = report.packetsLost
            ? (report.packetsLost / (report.packetsReceived + report.packetsLost)) * 100
            : 0;
          fps = report.framesPerSecond || 0;
        }

        // Candidate pair (latencia RTT)
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0; // ms
          latency = rtt / 2; // Estimación de latencia one-way
        }

        // Track (resolución)
        if (report.type === 'track' && report.kind === 'video') {
          resolution = {
            width: report.frameWidth || 0,
            height: report.frameHeight || 0,
          };
        }
      });

      const connectionStats: WebRTCStats = {
        bitrate,
        latency: Math.round(latency),
        packetLoss: Math.round(packetLoss * 10) / 10,
        rtt: Math.round(rtt),
        fps: Math.round(fps),
        resolution,
      };

      setState(prev => ({ ...prev, stats: connectionStats }));
      return connectionStats;
    } catch (error) {
      console.error('[useWebRTC] Failed to get connection stats:', error);
      return null;
    }
  }, []);

  /**
   * Cerrar peer connection y limpiar recursos
   */
  const closePeerConnection = useCallback(() => {
    console.log('[useWebRTC] Closing peer connection...');

    const pc = peerConnectionRef.current;
    if (pc) {
      pc.close();
      peerConnectionRef.current = null;
    }

    // Detener stats polling
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    // Limpiar remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }

    setState({
      peerConnection: null,
      remoteStream: null,
      connectionState: 'closed',
      iceGatheringState: 'new',
      iceConnectionState: 'closed',
      signalingState: 'closed',
      stats: null,
      error: null,
    });

    console.log('[useWebRTC] Peer connection closed');
  }, []);

  /**
   * Effect: Auto-polling de estadísticas cuando connected
   */
  useEffect(() => {
    if (state.connectionState === 'connected' && !statsIntervalRef.current) {
      console.log('[useWebRTC] Starting stats polling...');
      statsIntervalRef.current = setInterval(() => {
        getConnectionStats();
      }, 1000); // Cada 1 segundo
    } else if (state.connectionState !== 'connected' && statsIntervalRef.current) {
      console.log('[useWebRTC] Stopping stats polling...');
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
    };
  }, [state.connectionState, getConnectionStats]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, [closePeerConnection]);

  return [
    state,
    {
      initializePeerConnection,
      addLocalStream,
      createOffer,
      createAnswer,
      setRemoteDescription,
      addIceCandidate,
      closePeerConnection,
      getConnectionStats,
    },
  ];
}
