'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Loader2,
  Activity,
  MessageSquare,
  Heart,
  Thermometer,
  ChevronUp,
  ChevronDown,
  X,
  Settings,
  Camera
} from 'lucide-react';
import { usePatientPortal } from '@/components/layout/PatientPortalShell';
import { usePatientSession } from '@/hooks/usePatientSession';
import { TelemedicineSignalingPanel } from '@/components/telemedicine/TelemedicineSignalingPanel';
import { SymptomReportModal } from '@/components/medical/SymptomReportModal';
import { MedicationTrackerModal } from '@/components/medical/MedicationTrackerModal';
import { VitalSignsModal } from '@/components/medical/VitalSignsModal';

type ControlButtonProps = {
  active: boolean;
  iconActive: ReactNode;
  iconInactive: ReactNode;
  label: string;
  onClick: () => void;
};

type PatientActionProps = {
  label: string;
  icon: JSX.Element;
  intent?: 'default' | 'primary' | 'success' | 'warning';
  onClick?: () => void;
  disabled?: boolean;
};

interface EnhancedVideoCallProps {
  roomId?: string;
  className?: string;
}

export function EnhancedVideoCall({ roomId = 'patient-room', className = '' }: EnhancedVideoCallProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  // Context from patient portal
  const { isFocusMode, setFocusMode, isQuickActionsVisible, setQuickActionsVisible } = usePatientPortal();

  // Patient session data
  const { currentSession, hasActiveSession, formattedDuration } = usePatientSession();

  // Video call state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Focus mode controls
  const [showControls, setShowControls] = useState(true);
  const [showQualityOverlay, setShowQualityOverlay] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPatientActionsCollapsed, setIsPatientActionsCollapsed] = useState(false);

  // Medical modals state
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);

  const signalingUserId = useMemo(() => {
    if (typeof window === 'undefined' || typeof crypto === 'undefined') {
      return 'patient-guest';
    }
    const storageKey = 'autamedica-patient-signaling-id';
    const cached = window.sessionStorage.getItem(storageKey);
    if (cached) {
      return cached;
    }
    const generated = crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, generated);
    return generated;
  }, []);

  const callQuality = useMemo((): { label: string; color: string } => {
    if (cameraError) {
      return { label: 'Sin conexión', color: 'text-red-400' };
    }
    if (callStatus === 'live') {
      return { label: 'HD', color: 'text-green-400' };
    }
    if (callStatus === 'connecting') {
      return { label: 'Conectando', color: 'text-yellow-400' };
    }
    return { label: 'En espera', color: 'text-gray-400' };
  }, [cameraError, callStatus]);

  // Auto-activate focus mode during live calls and show quality overlay
  useEffect(() => {
    if (callStatus === 'live') {
      setShowQualityOverlay(true);
      setFocusMode(true);
      setIsPatientActionsCollapsed(true);
      const timer = setTimeout(() => {
        setShowQualityOverlay(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setFocusMode(false);
    }
  }, [callStatus, setFocusMode]);

  // Auto-hide controls in focus mode
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (mouseTimer) clearTimeout(mouseTimer);

      const timer = setTimeout(() => {
        if (callStatus === 'live' && isFocusMode) {
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
  }, [isFocusMode, callStatus, mouseTimer]);

  // Video stream setup
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      stopMedia(localStream);
      stopMedia(screenStream);
    };
  }, [localStream, screenStream]);

  async function handleStartCall() {
    if (callStatus === 'live') return;

    try {
      setCameraError(null);
      setCallStatus('connecting');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsMuted(false);
      setCallStatus('live');
    } catch (error) {
      console.error('[EnhancedVideoCall] Error accessing camera:', error);
      const message = error instanceof DOMException
        ? error.message
        : 'No se pudo acceder a la cámara. Verifica los permisos del navegador.';
      setCameraError(message);
      setCallStatus('idle');
    }
  }

  function handleToggleAudio() {
    if (!localStream) return;
    const nextMuted = !isMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }

  function handleToggleVideo() {
    if (!localStream) return;
    const nextEnabled = !isVideoEnabled;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsVideoEnabled(nextEnabled);
  }

  async function handleToggleScreenShare() {
    if (isScreenSharing) {
      stopMedia(screenStream);
      setScreenStream(null);
      setIsScreenSharing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      setScreenStream(stream);
      setIsScreenSharing(true);
    } catch (error) {
      console.warn('[EnhancedVideoCall] Screen sharing cancelled by user:', error);
      setIsScreenSharing(false);
    }
  }

  function handleEndCall() {
    stopMedia(localStream);
    stopMedia(screenStream);
    setLocalStream(null);
    setScreenStream(null);
    setIsVideoEnabled(false);
    setIsMuted(false);
    setIsScreenSharing(false);
    setCallStatus('ended');
  }

  const toggleQuickActionsVisibility = () => {
    setQuickActionsVisible(!isQuickActionsVisible);
    if (!isQuickActionsVisible) {
      setIsPatientActionsCollapsed(false);
    }
  };

  const toggleFocusMode = () => {
    const next = !isFocusMode;
    setFocusMode(next);
    if (next) {
      setIsPatientActionsCollapsed(true);
      setQuickActionsVisible(false);
    }
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col text-white ${className}`}>
      <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col lg:flex-row`}>
        {/* Main Video Section */}
        <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">
            {/* Camera Error State */}
            {cameraError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm px-4 py-6 text-center text-white">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-200">
                  <VideoOff className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white">No se detectó cámara</h3>
                <p className="max-w-md text-sm text-white/70">{cameraError}</p>
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="rounded-lg bg-white/20 hover:bg-white/30 px-5 py-2 text-sm font-semibold text-white transition backdrop-blur-sm border border-white/20"
                >
                  Reintentar
                </button>
              </div>
            ) : localStream ? (
              /* Active Video Stream */
              <video
                ref={videoRef}
                className={`call-area__video h-full w-full object-cover transition-opacity ${
                  isVideoEnabled ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                playsInline
                muted
              />
            ) : (
              /* Initial State - No Camera */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm px-4 py-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <Camera className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Videoconsulta</h3>
                  <p className="text-sm text-white/70">Inicia tu consulta médica por video</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="rounded-lg bg-white/20 hover:bg-white/30 px-6 py-2 text-sm font-semibold text-white transition backdrop-blur-sm border border-white/20"
                >
                  Iniciar videoconsulta
                </button>
              </div>
            )}

            {/* Connecting Overlay */}
            {callStatus === 'connecting' && (
              <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-3 bg-black/60 text-white backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                <p className="text-sm font-medium">Conectando videollamada…</p>
              </div>
            )}

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs text-white backdrop-blur-sm">
                <ScreenShare className="h-4 w-4" />
                Compartiendo pantalla
              </div>
            )}

            {/* Focus Mode Patient Info Badge */}
            {isFocusMode && currentSession && callStatus === 'live' && showControls && (
              <div className="video-badge z-10">
                <div className="flex items-center gap-3 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Dr. {currentSession.doctorName}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {currentSession.appointmentType} • {formattedDuration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${callQuality.color}`}>
                      {callQuality.label}
                    </span>
                    <span className="text-[10px] text-white/50">• 45ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Overlay */}
            {showQualityOverlay && callStatus === 'live' && !isFocusMode && (
              <div className={`absolute top-4 left-4 transition-all duration-1000 ${
                showQualityOverlay ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}>
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                  <span className="font-medium text-green-200">
                    {callQuality.label} • 45ms • Estable
                  </span>
                </div>
              </div>
            )}

            {/* Focus Mode Toggle */}
            <div className="absolute right-4 top-4 flex flex-col items-end gap-3">
              {callStatus === 'live' && (
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    isFocusMode
                      ? 'border-green-400/50 bg-green-500/10 text-green-200 hover:bg-green-500/20'
                      : 'border-white/30 bg-black/40 text-white hover:border-green-400/60 hover:text-white backdrop-blur-sm'
                  }`}
                >
                  {isFocusMode ? 'Salir modo foco' : 'Activar modo foco'}
                </button>
              )}

              {/* Screen Share Preview */}
              {screenStream && (
                <div className="hidden h-32 w-48 overflow-hidden rounded-lg border border-white/30 bg-black/50 shadow-lg sm:block backdrop-blur-sm">
                  <video ref={screenShareRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                </div>
              )}
            </div>

            {/* Video Controls Overlay */}
            <div className={`video-overlay autoHide ${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/20 bg-black/60 px-4 py-3 shadow-lg backdrop-blur-sm sm:flex-nowrap sm:justify-start sm:px-6">
                <ControlButton
                  active={!isMuted}
                  iconActive={<Mic className="h-5 w-5" />}
                  iconInactive={<MicOff className="h-5 w-5" />}
                  label={isMuted ? 'Activar micrófono' : 'Silenciar'}
                  onClick={handleToggleAudio}
                />
                <ControlButton
                  active={isVideoEnabled}
                  iconActive={<Video className="h-5 w-5" />}
                  iconInactive={<VideoOff className="h-5 w-5" />}
                  label={isVideoEnabled ? 'Ocultar video' : 'Mostrar video'}
                  onClick={handleToggleVideo}
                />
                <ControlButton
                  active={isScreenSharing}
                  iconActive={<ScreenShare className="h-5 w-5" />}
                  iconInactive={<ScreenShareOff className="h-5 w-5" />}
                  label={isScreenSharing ? 'Detener pantalla' : 'Compartir pantalla'}
                  onClick={handleToggleScreenShare}
                />
                <button
                  type="button"
                  onClick={handleEndCall}
                  className={`flex items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 ${
                    isFocusMode ? 'h-10 w-10' : 'h-12 w-12'
                  }`}
                >
                  <PhoneOff className={isFocusMode ? 'h-4 w-4' : 'h-5 w-5'} />
                </button>
              </div>
            </div>
          </div>

          {/* Telemedicine Signaling Panel */}
          <TelemedicineSignalingPanel
            roomId={roomId}
            userId={signalingUserId}
            userType="patient"
            metadata={{
              sessionId: currentSession?.sessionId || 'guest-session',
              patientName: 'Paciente'
            }}
            className="mt-3 rounded-2xl border border-white/20 bg-black/40 p-4 shadow-2xl backdrop-blur-sm sm:p-6"
          />
        </section>

        {/* Quick Actions Handle for Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={toggleQuickActionsVisibility}
            className={`call-area__quickActionsHandle hidden flex-col items-center gap-1 rounded-2xl border border-white/30 bg-black/60 px-3 py-3 text-xs font-medium text-white shadow-lg transition hover:border-green-500/60 hover:text-white backdrop-blur-sm lg:flex ${
              isQuickActionsVisible ? 'ring-1 ring-green-400/60' : ''
            }`}
            aria-expanded={isQuickActionsVisible}
            aria-label="Herramientas del paciente"
          >
            {isQuickActionsVisible ? (
              <>
                <X className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Cerrar</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-green-300">
                  <MessageSquare className="h-3 w-3" />
                  <Heart className="h-3 w-3" />
                  <Thermometer className="h-3 w-3" />
                  <Settings className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide">Acciones</span>
                <span className="text-[10px] font-normal text-white/60">Chat · Síntomas · Notas</span>
              </>
            )}
          </button>
        )}

        {/* Patient Actions Panel */}
        <aside
          className={`right-drawer hidden h-full flex-col space-y-3 rounded-2xl border border-white/20 bg-black/40 p-3 shadow-xl backdrop-blur-sm lg:flex ${
            isFocusMode && isQuickActionsVisible ? 'right-drawer--open' : ''
          }`}
        >
          <div className="flex items-center justify-between px-1 pb-0">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Herramientas</h3>
            <div className="flex items-center gap-1">
              {isFocusMode && (
                <button
                  type="button"
                  onClick={() => setQuickActionsVisible(false)}
                  className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar herramientas"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPatientActionsCollapsed(!isPatientActionsCollapsed)}
                className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-expanded={!isPatientActionsCollapsed}
                aria-controls="patient-actions-panel"
              >
                {isPatientActionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isPatientActionsCollapsed && (
            <div id="patient-actions-panel" className="space-y-3 px-1 pb-2">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <PatientAction
                  label="Chat con médico"
                  icon={<MessageSquare className="h-4 w-4" />}
                  intent="primary"
                  onClick={() => console.log('Chat functionality coming soon')}
                />
                <PatientAction
                  label="Reportar síntoma"
                  icon={<Heart className="h-4 w-4" />}
                  intent="warning"
                  onClick={() => setShowSymptomModal(true)}
                />
                <PatientAction
                  label="Signos vitales"
                  icon={<Thermometer className="h-4 w-4" />}
                  intent="success"
                  onClick={() => setShowVitalSignsModal(true)}
                />
                <PatientAction
                  label="Medicamentos"
                  icon={<Settings className="h-4 w-4" />}
                  onClick={() => setShowMedicationModal(true)}
                />
              </div>

              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-green-200">Consulta en progreso</p>
                </div>
              </div>
            </div>
          )}

          {isPatientActionsCollapsed && (
            <div className="px-1 pb-2">
              <div className="flex items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/5 py-2">
                <MessageSquare className="h-3 w-3 text-white/60" />
                <Heart className="h-3 w-3 text-white/60" />
                <Thermometer className="h-3 w-3 text-white/60" />
                <Settings className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/60">4 herramientas</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Focus Mode Controls */}
      {isFocusMode && (
        <div className="mt-3 flex items-center justify-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsPatientActionsCollapsed(false)}
            className="flex items-center gap-2 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-xs text-white transition hover:border-white/50 hover:text-white backdrop-blur-sm"
          >
            <Heart className="h-4 w-4" />
            Herramientas
          </button>
        </div>
      )}

      {/* Focus Mode Quality Overlay (Mobile) */}
      {isFocusMode && showQualityOverlay && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center lg:hidden">
          <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs text-green-200 shadow-lg backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
            Video optimizado para consulta
          </div>
        </div>
      )}

      {/* Medical Modals */}
      <SymptomReportModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        patientId="current-patient"
      />

      <MedicationTrackerModal
        isOpen={showMedicationModal}
        onClose={() => setShowMedicationModal(false)}
        patientId="current-patient"
      />

      <VitalSignsModal
        isOpen={showVitalSignsModal}
        onClose={() => setShowVitalSignsModal(false)}
        patientId="current-patient"
      />
    </div>
  );
}

function stopMedia(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
}

function ControlButton({ active, iconActive, iconInactive, label, onClick }: ControlButtonProps): JSX.Element {
  const { isFocusMode } = usePatientPortal();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition ${
        isFocusMode ? 'h-10 w-10' : 'h-12 w-12'
      } ${
        active
          ? 'bg-green-500 text-black hover:bg-green-400'
          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
      }`}
      aria-label={label}
      title={label}
    >
      {active ? iconActive : iconInactive}
    </button>
  );
}

function PatientAction({ label, icon, intent = 'default', onClick, disabled = false }: PatientActionProps): JSX.Element {
  const intentStyles = {
    default: 'border-white/30 bg-white/5 text-white hover:bg-white/10',
    primary: 'border-blue-500/40 bg-blue-600/10 text-blue-200 hover:bg-blue-600/20',
    success: 'border-green-500/40 bg-green-600/10 text-green-200 hover:bg-green-600/20',
    warning: 'border-yellow-500/40 bg-yellow-600/10 text-yellow-200 hover:bg-yellow-600/20',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${intentStyles[intent]}`}
    >
      <span className={
        intent === 'success' ? 'text-green-400' :
        intent === 'primary' ? 'text-blue-400' :
        intent === 'warning' ? 'text-yellow-400' :
        'text-white/60'
      }>
        {icon}
      </span>
      {label}
    </button>
  );
}