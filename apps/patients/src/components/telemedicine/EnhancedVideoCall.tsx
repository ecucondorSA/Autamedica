'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { usePatientPortal } from '@/components/layout/PatientPortalShell';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useTelemedicine } from '@/hooks';
import { VideoStream } from '@/components/telemedicine/VideoStream';
import { VideoControls } from '@/components/telemedicine/VideoControls';
import { VideoOverlays } from '@/components/telemedicine/VideoOverlays';
import type { EnhancedVideoCallProps } from '@/types/telemedicine';

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

  return (
    <div className={`flex min-h-0 flex-1 flex-col text-white ${className}`}>
      <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col lg:flex-row`}>
        {/* Sección principal de video */}
        <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">
            {/* Stream de video */}
            <VideoStream
              videoRef={videoRef}
              screenShareRef={screenShareRef}
              localStream={videoCall.localStream}
              screenStream={videoCall.screenStream}
              isVideoEnabled={videoCall.isVideoEnabled}
              cameraError={videoCall.cameraError}
              callStatus={videoCall.callStatus}
              onStartCall={videoCall.startCall}
            />

            {/* Overlays sobre el video */}
            <VideoOverlays
              callStatus={videoCall.callStatus}
              callQuality={callQuality}
              isScreenSharing={videoCall.isScreenSharing}
              isFocusMode={isFocusMode}
              showControls={showControls}
              showQualityOverlay={showQualityOverlay}
              currentSession={currentSession}
              formattedDuration={formattedDuration}
              onToggleFocusMode={toggleFocusMode}
            />

            {/* Controles de video DENTRO del contenedor */}
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
          </div>

        </section>
      </div>

      {/* Overlay de calidad móvil */}
      {isFocusMode && showQualityOverlay && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center lg:hidden">
          <div className="flex items-center gap-2 rounded-full border border-stone-500/30 bg-stone-500/10 px-4 py-2 text-xs text-stone-200 shadow-lg backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-stone-400"></span>
            Video optimizado para consulta
          </div>
        </div>
      )}
    </div>
  );
}
