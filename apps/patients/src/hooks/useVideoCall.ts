import { useState, useCallback } from 'react';
import type { VideoCallState, VideoCallActions, CallStatus, VideoStreamConfig } from '@/types/telemedicine';

/**
 * Default video configuration
 */
const DEFAULT_VIDEO_CONFIG: VideoStreamConfig = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  audio: true,
};

/**
 * Custom hook para manejar la lógica de videollamadas
 * Separa la lógica de MediaStream del componente UI
 */
export function useVideoCall() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  /**
   * Inicia la videollamada solicitando permisos de cámara y micrófono
   */
  const startCall = useCallback(async () => {
    if (callStatus === 'live') return;

    try {
      setCameraError(null);
      setCallStatus('connecting');

      const stream = await navigator.mediaDevices.getUserMedia(DEFAULT_VIDEO_CONFIG);

      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsMuted(false);
      setCallStatus('live');
    } catch (error) {
      console.error('[useVideoCall] Error accessing camera:', error);
      const message = error instanceof DOMException
        ? error.message
        : 'No se pudo acceder a la cámara. Verifica los permisos del navegador.';
      setCameraError(message);
      setCallStatus('idle');
    }
  }, [callStatus]);

  /**
   * Finaliza la videollamada y libera todos los recursos
   */
  const endCall = useCallback(() => {
    // Detener stream local
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Detener screen share
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }

    setIsVideoEnabled(false);
    setIsMuted(false);
    setIsScreenSharing(false);
    setCallStatus('ended');
  }, [localStream, screenStream]);

  /**
   * Toggle audio (silenciar/activar micrófono)
   */
  const toggleAudio = useCallback(() => {
    if (!localStream) return;

    const nextMuted = !isMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [localStream, isMuted]);

  /**
   * Toggle video (activar/desactivar cámara)
   */
  const toggleVideo = useCallback(() => {
    if (!localStream) return;

    const nextEnabled = !isVideoEnabled;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsVideoEnabled(nextEnabled);
  }, [localStream, isVideoEnabled]);

  /**
   * Toggle compartir pantalla
   */
  const toggleScreenShare = useCallback(async () => {
    // Si ya está compartiendo, detener
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      return;
    }

    // Solicitar compartir pantalla
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setScreenStream(stream);
      setIsScreenSharing(true);

      // Auto-detener cuando el usuario deja de compartir desde el navegador
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenStream(null);
        setIsScreenSharing(false);
      });
    } catch (error) {
      console.warn('[useVideoCall] Screen sharing cancelled by user:', error);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing, screenStream]);

  const state: VideoCallState = {
    localStream,
    screenStream,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    callStatus,
    cameraError,
  };

  const actions: VideoCallActions = {
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };

  return { ...state, ...actions };
}
