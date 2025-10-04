'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { usePatientPortal } from '@/components/layout/PatientPortalShell';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useTelemedicine } from '@/hooks';
import { useMockRemoteStream } from '@/hooks/useMockRemoteStream';
import { VideoLayout, ViewModeSelector } from '@/components/telemedicine/VideoLayout';
import { VideoControls } from '@/components/telemedicine/VideoControls';
import { VideoOverlays } from '@/components/telemedicine/VideoOverlays';
import type { EnhancedVideoCallProps, VideoViewMode, PIPPosition } from '@/types/telemedicine';

/**
 * Componente principal de videollamada refactorizado
 * Versión modular con hooks y componentes separados
 * INTEGRADO con Supabase para registro de sesiones
 */
export function EnhancedVideoCall({ roomId = 'patient-room', sessionId, className = '' }: EnhancedVideoCallProps & { sessionId?: string }) {
  // Refs para video streams
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  // Context del portal
  const { isFocusMode, setFocusMode } = usePatientPortal();

  // Sesión del paciente
  const { currentSession, formattedDuration } = usePatientSession();

  // Custom hook para lógica de video
  const videoCall = useVideoCall();

  // Hook de telemedicina para Supabase
  const telemedicine = useTelemedicine(sessionId);

  // Estados locales de UI
  const [showControls, setShowControls] = useState(true);
  const [showQualityOverlay, setShowQualityOverlay] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);

  // Estados de layout
  const [viewMode, setViewMode] = useState<VideoViewMode>('speaker');
  const [pipPosition, setPipPosition] = useState<PIPPosition>('bottom-right');

  // Mock remote stream (temporal hasta implementar WebRTC)
  // Se activa automáticamente cuando la llamada está "live"
  const remoteStream = useMockRemoteStream(videoCall.callStatus === 'live');

  // Calidad de la llamada
  const callQuality = useMemo(() => {
    if (videoCall.cameraError) {
      return { label: 'Sin conexión', color: 'text-red-400' };
    }
    if (videoCall.callStatus === 'live') {
      return { label: 'HD', color: 'text-green-400' };
    }
    if (videoCall.callStatus === 'connecting') {
      return { label: 'Conectando', color: 'text-yellow-400' };
    }
    return { label: 'En espera', color: 'text-gray-400' };
  }, [videoCall.cameraError, videoCall.callStatus]);

  // Auto-activar focus mode durante llamadas
  useEffect(() => {
    if (videoCall.callStatus === 'live') {
      setShowQualityOverlay(true);
      setFocusMode(true);
      const timer = setTimeout(() => setShowQualityOverlay(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setFocusMode(false);
    }
  }, [videoCall.callStatus, setFocusMode]);

  // Registrar eventos de sesión en Supabase
  useEffect(() => {
    if (!telemedicine.session) return;

    // Registrar cambios de estado de la llamada
    const logEvent = async (eventType: string, details: string) => {
      try {
        await telemedicine.logEvent(eventType, details);
      } catch (error) {
        console.error('Error logging telemedicine event:', error);
      }
    };

    if (videoCall.callStatus === 'live') {
      logEvent('call_started', 'Video call initiated successfully');
    } else if (videoCall.callStatus === 'ended') {
      logEvent('call_ended', 'Video call ended by patient');
    }
  }, [videoCall.callStatus, telemedicine]);

  // Auto-ocultar controles en focus mode
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (mouseTimer) clearTimeout(mouseTimer);

      const timer = setTimeout(() => {
        if (videoCall.callStatus === 'live' && isFocusMode) {
          setShowControls(false);
        }
      }, 3000);

      setMouseTimer(timer);
    };

    if (isFocusMode) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (mouseTimer) clearTimeout(mouseTimer);
      };
    }
  }, [isFocusMode, videoCall.callStatus, mouseTimer]);

  // Asignar streams a video elements
  useEffect(() => {
    if (videoRef.current && videoCall.localStream) {
      videoRef.current.srcObject = videoCall.localStream;
    }
  }, [videoCall.localStream]);

  useEffect(() => {
    if (screenShareRef.current && videoCall.screenStream) {
      screenShareRef.current.srcObject = videoCall.screenStream;
    }
  }, [videoCall.screenStream]);

  // Handlers de UI
  const toggleFocusMode = () => {
    const next = !isFocusMode;
    setFocusMode(next);
  };

  const handleSwapVideos = () => {
    // Swap será manejado internamente por VideoLayout
    console.log('[EnhancedVideoCall] Videos swapped');
  };

  const handlePIPPositionChange = (position: PIPPosition) => {
    setPipPosition(position);
  };

  const handleViewModeChange = (mode: VideoViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col text-white ${className}`}>
      <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col`}>
        {/* Sección principal de video con nuevo layout dual */}
        <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">

            {/* Nuevo VideoLayout con soporte para dual stream */}
            {videoCall.callStatus === 'live' ? (
              <VideoLayout
                localStream={videoCall.localStream}
                remoteStream={remoteStream}
                isLocalVideoEnabled={videoCall.isVideoEnabled}
                isRemoteVideoEnabled={true}
                viewMode={viewMode}
                pipPosition={pipPosition}
                onSwapVideos={handleSwapVideos}
                onPIPPositionChange={handlePIPPositionChange}
                className="absolute inset-0"
              />
            ) : (
              /* Placeholder inicial antes de iniciar llamada */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Videoconsulta Médica</h2>
                  <p className="text-white/70 mb-6">Presiona el botón para iniciar tu consulta</p>
                  <button
                    onClick={videoCall.startCall}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Iniciar Videoconsulta
                  </button>
                </div>
              </div>
            )}

            {/* Selector de modo de vista (top-right) */}
            {videoCall.callStatus === 'live' && (
              <div className="absolute top-4 right-4 z-30">
                <ViewModeSelector
                  currentMode={viewMode}
                  onChange={handleViewModeChange}
                />
              </div>
            )}

            {/* Controles de video DENTRO del contenedor */}
            {videoCall.callStatus === 'live' && (
              <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center pb-4">
                <VideoControls
                  isMuted={videoCall.isMuted}
                  isVideoEnabled={videoCall.isVideoEnabled}
                  isScreenSharing={videoCall.isScreenSharing}
                  showControls={showControls}
                  isFocusMode={isFocusMode}
                  onToggleAudio={videoCall.toggleAudio}
                  onToggleVideo={videoCall.toggleVideo}
                  onToggleScreenShare={videoCall.toggleScreenShare}
                  onEndCall={videoCall.endCall}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
