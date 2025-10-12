'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
import { usePatientPortal } from '@/components/layout/PatientPortalShell';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useTelemedicine } from '@/hooks';
import { useMockRemoteStream } from '@/hooks/useMockRemoteStream';
import { useRealRemoteStream } from '@/hooks/useRealRemoteStream';
import { VideoLayout, ViewModeSelector } from '@/components/telemedicine/VideoLayout';
import { VideoControls } from '@/components/telemedicine/VideoControls';
import type { EnhancedVideoCallProps, VideoViewMode, PIPPosition } from '@/types/telemedicine';
import { logger, featureFlags } from '@autamedica/shared';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

/**
 * Componente principal de videollamada refactorizado
 * Versión modular con hooks y componentes separados
 * INTEGRADO con Supabase para registro de sesiones
 */
export function EnhancedVideoCall({ roomId = 'patient-room', sessionId, className = '' }: EnhancedVideoCallProps & { sessionId?: string }) {
  // Context del portal
  const { isFocusMode, setFocusMode } = usePatientPortal();

  // Sesión del paciente
  const { currentSession, formattedDuration } = usePatientSession();

  // Custom hook para lógica de video
  const videoCall = useVideoCall();

  // Hook de telemedicina para Supabase
  const telemedicine = useTelemedicine(sessionId);
  const joinedRef = useRef(false);
  const isLiveKitEnabled = featureFlags.USE_LIVEKIT && !featureFlags.USE_MOCK_VIDEO;
  const liveKitConfig = isLiveKitEnabled ? telemedicine.livekit : null;

  const handleLiveKitConnected = useCallback(async () => {
    if (joinedRef.current) return;
    try {
      const joined = await telemedicine.joinSession('patient');
      if (!joined) return;
      joinedRef.current = true;
      await telemedicine.logEvent('call_started', 'LiveKit room connected');
    } catch (error) {
      logger.error('[EnhancedVideoCall] LiveKit onConnected error', error);
    }
  }, [telemedicine]);

  const handleLiveKitDisconnected = useCallback(async () => {
    if (!joinedRef.current) return;
    joinedRef.current = false;
    try {
      await telemedicine.leaveSession();
      await telemedicine.logEvent('call_ended', 'Room disconnected');
    } catch (error) {
      logger.error('[EnhancedVideoCall] LiveKit onDisconnected error', error);
    }
  }, [telemedicine]);

  // Estados locales de UI
  const [showControls, setShowControls] = useState(true);
  const [showQualityOverlay, setShowQualityOverlay] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);

  // Estados de layout
  const [viewMode, setViewMode] = useState<VideoViewMode>('speaker');
  const [pipPosition, setPipPosition] = useState<PIPPosition>('bottom-right');

  // Remote stream - usa mock en desarrollo, LiveKit en producción
  // Controlado por feature flag NEXT_PUBLIC_USE_MOCK_VIDEO
  const mockStream = featureFlags.USE_MOCK_VIDEO
    ? useMockRemoteStream(videoCall.callStatus === 'live')
    : null;

  // TODO: Pasar remoteParticipant de LiveKit cuando esté disponible
  const realStream = !featureFlags.USE_MOCK_VIDEO
    ? useRealRemoteStream(undefined) // Pasar remoteParticipant aquí
    : null;

  const remoteStream = featureFlags.USE_MOCK_VIDEO ? mockStream : realStream;

  // Calidad de la llamada
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
    if (isLiveKitEnabled) return;
    if (!telemedicine.session) return;

    // Registrar cambios de estado de la llamada
    const logEvent = async (eventType: string, details: string) => {
      try {
        await telemedicine.logEvent(eventType, details);
      } catch (error) {
        logger.error('Error logging telemedicine event:', error);
      }
    };

    if (videoCall.callStatus === 'live' && !joinedRef.current) {
      telemedicine.joinSession('patient');
      joinedRef.current = true;
      logEvent('call_started', 'Video call initiated successfully');
    } else if (videoCall.callStatus === 'ended' && joinedRef.current) {
      logEvent('call_ended', 'Video call ended by patient');
      telemedicine.leaveSession();
      joinedRef.current = false;
    }
  }, [isLiveKitEnabled, telemedicine, videoCall.callStatus]);

  useEffect(() => {
    if (!telemedicine.session) {
      joinedRef.current = false;
    }
  }, [telemedicine.session]);

  useEffect(() => {
    return () => {
      if (!joinedRef.current) return;
      joinedRef.current = false;
      void telemedicine.leaveSession();
      if (isLiveKitEnabled) {
        void telemedicine.logEvent('call_ended', 'Component unmounted');
      }
    };
  }, [isLiveKitEnabled, telemedicine]);

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

  // Handlers de UI
  const handleToggleVideo = async () => {
    await videoCall.toggleVideo();
    const state = !videoCall.isVideoEnabled;
    telemedicine.logEvent('video_toggled', `enabled:${state}`);
  };

  const handleToggleAudio = async () => {
    await videoCall.toggleAudio();
    const state = !videoCall.isMuted;
    telemedicine.logEvent('audio_toggled', `enabled:${state}`);
  };

  const handleToggleScreenShare = async () => {
    await videoCall.toggleScreenShare();
    telemedicine.logEvent('screen_share_toggled');
  };

  const handleSwapVideos = () => {
    // Swap será manejado internamente por VideoLayout
    // logger.info('[EnhancedVideoCall] Videos swapped');
  };

  const handlePIPPositionChange = (position: PIPPosition) => {
    setPipPosition(position);
  };

  const handleViewModeChange = (mode: VideoViewMode) => {
    setViewMode(mode);
  };

  if (isLiveKitEnabled) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col text-white ${className}`}>
        <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col`}>
          {telemedicine.session && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              <span>
                Sesión #{telemedicine.session.session_id.slice(0, 8)} · Estado: <strong>{telemedicine.session.status}</strong>
              </span>
              <span>
                Participantes: {telemedicine.participants.length} · Último evento: {telemedicine.events[0]?.event_type ?? 'ninguno'}
              </span>
            </div>
          )}

          <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg bg-black">
              {liveKitConfig ? (
                <LiveKitRoom
                  token={liveKitConfig.token}
                  serverUrl={liveKitConfig.url}
                  connect
                  video
                  audio
                  onConnected={() => {
                    void handleLiveKitConnected();
                  }}
                  onDisconnected={() => {
                    void handleLiveKitDisconnected();
                  }}
                  className="absolute inset-0 flex flex-col"
                >
                  <RoomAudioRenderer />
                  <VideoConference />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
                    <div className="mx-auto max-w-3xl">
                      <ControlBar
                        variation="minimal"
                        controls={{
                          microphone: true,
                          camera: true,
                          screenShare: false,
                          chat: true,
                          leave: true,
                        }}
                      />
                    </div>
                  </div>
                </LiveKitRoom>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
                  {telemedicine.loading ? (
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent border-white/60" />
                      <p className="text-white/80">Preparando tu videoconsulta...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-white/80">LiveKit activo, esperando token de sesión.</p>
                      <button
                        onClick={() => {
                          void telemedicine.refreshSession();
                        }}
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                      >
                        Reintentar conexión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col text-white ${className}`}>
      <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col`}>
        {telemedicine.session && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            <span>
              Sesión #{telemedicine.session.session_id.slice(0, 8)} · Estado: <strong>{telemedicine.session.status}</strong>
            </span>
            <span>
              Participantes: {telemedicine.participants.length} · Último evento:{' '}
              {telemedicine.events[0]?.event_type ?? 'ninguno'}
            </span>
          </div>
        )}

        <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
                <div className="text-center">
                  <h2 className="mb-2 text-2xl font-bold">Videoconsulta Médica</h2>
                  <p className="mb-6 text-white/70">Presiona el botón para iniciar tu consulta</p>
                  <button
                    onClick={videoCall.startCall}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold transition-all shadow-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-xl"
                  >
                    Iniciar Videoconsulta
                  </button>
                </div>
              </div>
            )}

            {videoCall.callStatus === 'live' && (
              <div className="absolute top-4 right-4 z-30">
                <ViewModeSelector currentMode={viewMode} onChange={handleViewModeChange} />
              </div>
            )}

            {videoCall.callStatus === 'live' && (
              <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center pb-4">
                <VideoControls
                  isMuted={videoCall.isMuted}
                  isVideoEnabled={videoCall.isVideoEnabled}
                  isScreenSharing={videoCall.isScreenSharing}
                  showControls={showControls}
                  isFocusMode={isFocusMode}
                  onToggleAudio={handleToggleAudio}
                  onToggleVideo={handleToggleVideo}
                  onToggleScreenShare={handleToggleScreenShare}
                  onEndCall={async () => {
                    await telemedicine.logEvent('call_ended', 'Video call ended by button');
                    await telemedicine.leaveSession();
                    videoCall.endCall();
                  }}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
