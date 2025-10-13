"use client"

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import type { JSX, ReactNode } from 'react'
import dynamic from 'next/dynamic'
import {
  Brain,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
  Sparkles,
  Activity,
  ChevronUp,
  ChevronDown,
  FileText,
  Pill,
  X
} from 'lucide-react'
import { useActiveSession, usePatientData } from '@/hooks'
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser'
import { useDoctorsPortal } from '@/components/layout/DoctorsPortalShell'
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore'
import { logger } from '@autamedica/shared'

// 🚀 Lazy load componentes pesados con dynamic imports
const TelemedicineSignalingPanel = dynamic(
  () => import('@/components/telemedicine/TelemedicineSignalingPanel').then(mod => ({ default: mod.TelemedicineSignalingPanel })),
  {
    loading: () => (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800/60 bg-[#101d32] p-6">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="text-sm text-slate-300">Cargando panel de telemedicina...</span>
      </div>
    ),
    ssr: false
  }
)

const QuickNotesModal = dynamic(
  () => import('@/components/medical/QuickNotesModal').then(mod => ({ default: mod.QuickNotesModal })),
  {
    loading: () => null,
    ssr: false
  }
)

const PrescriptionModal = dynamic(
  () => import('@/components/medical/PrescriptionModal').then(mod => ({ default: mod.PrescriptionModal })),
  {
    loading: () => null,
    ssr: false
  }
)

const StartCallButton = dynamic(
  () => import('@/components/calls/StartCallButton').then(mod => ({ default: mod.StartCallButton })),
  {
    loading: () => (
      <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-2 text-sm font-semibold text-white">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando...
      </div>
    ),
    ssr: false
  }
)

type ControlButtonProps = {
  active: boolean
  iconActive: ReactNode
  iconInactive: ReactNode
  label: string
  onClick: () => void
}

type QuickActionProps = {
  label: string
  emoji: string
  intent?: 'default' | 'primary' | 'success'
  onClick?: () => void
}

export default function DoctorsHomePage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenShareRef = useRef<HTMLVideoElement | null>(null)

  // Hooks para obtener datos de autenticación y paciente
  const { user, loading: authLoading } = useAuthenticatedUser()
  const { session } = useActiveSession()
  const { patient } = usePatientData(session?.patientId ?? null)

  // Store centralizado de historial médico
  const { addEntry, suggestPrescriptions, analyzeVitals } = useMedicalHistoryStore()

  const { isFocusMode, setFocusMode } = useDoctorsPortal()

  useEffect(() => {
    return () => setFocusMode(false)
  }, [setFocusMode])

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showDiagnosisPanel, setShowDiagnosisPanel] = useState(false)
  const [showTelemedicinePanel, setShowTelemedicinePanel] = useState(false)
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false)
  const [showQualityOverlay, setShowQualityOverlay] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null)

  const signalingRoomId = useMemo(() => session?.sessionId ?? 'guest-room', [session?.sessionId])
  const signalingUserId = useMemo(() => {
    if (typeof window === 'undefined' || typeof crypto === 'undefined') {
      return 'dr-invitado'
    }
    const storageKey = 'autamedica-doctor-signaling-id'
    const cached = window.sessionStorage.getItem(storageKey)
    if (cached) {
      return cached
    }
    const generated = crypto.randomUUID()
    window.sessionStorage.setItem(storageKey, generated)
    return generated
  }, [])

  useEffect(() => {
    if (callStatus !== 'live') {
      return
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1_000)

    return () => clearInterval(interval)
  }, [callStatus])

  // Mostrar overlay de calidad temporalmente cuando cambie el estado de la llamada
  useEffect(() => {
    if (callStatus === 'live') {
      setShowQualityOverlay(true)
      setFocusMode(true) // Activar modo foco automáticamente en llamada
      setIsQuickActionsCollapsed(true) // Colapsar acciones rápidas
      const timer = setTimeout(() => {
        setShowQualityOverlay(false)
      }, 3000) // Se oculta después de 3 segundos
      return () => clearTimeout(timer)
    } else {
      setFocusMode(false)
    }
  }, [callStatus])

  // Auto-ocultar controles después de 3 segundos sin movimiento del mouse
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (mouseTimer) clearTimeout(mouseTimer)

      const timer = setTimeout(() => {
        if (callStatus === 'live' && isFocusMode) {
          setShowControls(false)
        }
      }, 3000)

      setMouseTimer(timer)
    }

    if (isFocusMode) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        if (mouseTimer) clearTimeout(mouseTimer)
      }
    }
  }, [isFocusMode, callStatus, mouseTimer])

  useEffect(() => {
    if (!isFocusMode) {
      setIsQuickActionsVisible(false)
      setIsQuickActionsCollapsed(false)
    }
  }, [isFocusMode])

  useEffect(() => {
    return () => {
      stopMedia(localStream)
      stopMedia(screenStream)
    }
  }, [localStream, screenStream])

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream
    }
  }, [screenStream])

  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(callDuration / 60)
    const seconds = callDuration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [callDuration])

  const callQuality = useMemo((): { label: string; color: string } => {
    if (cameraError) {
      return { label: 'Sin señal', color: 'text-rose-400' }
    }
    if (callStatus === 'live') {
      return { label: 'HD', color: 'text-emerald-400' }
    }
    if (callStatus === 'connecting') {
      return { label: 'Inicializando', color: 'text-amber-400' }
    }
    return { label: 'En espera', color: 'text-slate-400' }
  }, [cameraError, callStatus])

  async function handleActivateCamera() {
    if (callStatus === 'live') {
      return
    }

    try {
      setCameraError(null)
      setCallStatus('connecting')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      })

      setLocalStream(stream)
      setIsVideoEnabled(true)
      setIsMuted(false)
      setCallDuration(0)
      setCallStatus('live')
    } catch (error) {
      logger.error('[VideoCall] Error al activar la cámara', error)
      const message =
        error instanceof DOMException
          ? error.message
          : 'No se pudo acceder a la cámara. Verifica los permisos del navegador.'
      setCameraError(message)
      setCallStatus('idle')
    }
  }

  function handleToggleAudio() {
    if (!localStream) {
      return
    }
    const nextMuted = !isMuted
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
  }

  function handleToggleVideo() {
    if (!localStream) {
      return
    }
    const nextEnabled = !isVideoEnabled
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled
    })
    setIsVideoEnabled(nextEnabled)
  }

  async function handleToggleScreenShare() {
    if (isScreenSharing) {
      stopMedia(screenStream)
      setScreenStream(null)
      setIsScreenSharing(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      setScreenStream(stream)
      setIsScreenSharing(true)
    } catch (error) {
      logger.warn('[VideoCall] El usuario canceló la compartición de pantalla', error)
      setIsScreenSharing(false)
    }
  }

  function handleEndCall() {
    stopMedia(localStream)
    stopMedia(screenStream)
    setLocalStream(null)
    setScreenStream(null)
    setIsVideoEnabled(false)
    setIsMuted(false)
    setIsScreenSharing(false)
    setCallStatus('ended')
  }

  // Manejar acciones médicas con actualización automática
  function handleTakeNotes() {
    setShowNotesModal(true)
  }

  function handlePrescribe() {
    setShowPrescriptionModal(true)
  }

  async function handleAnalyzeWithAI() {
    setAiProcessing(true)
    setShowDiagnosisPanel(true)

    // Simular análisis IA
    await new Promise(resolve => setTimeout(resolve, 2000))

    await addEntry({
      type: 'analysis',
      content: 'Análisis IA completado: Posible faringitis aguda',
      metadata: {
        aiAnalysis: {
          suggestions: ['Antibióticos recomendados', 'Reposo 48h'],
          riskFactors: ['Fiebre elevada'],
          confidence: 0.85
        }
      },
      doctorId: user?.id || 'current-doctor',
      patientId: session?.patientId || 'guest-patient',
      autoGenerated: true
    })

    setAiProcessing(false)
  }

  const toggleQuickActionsVisibility = () => {
    setIsQuickActionsVisible((prev) => {
      const next = !prev
      if (next) {
        setIsQuickActionsCollapsed(false)
      }
      return next
    })
  }

  const closeQuickActions = () => {
    setIsQuickActionsVisible(false)
  }

  const toggleFocusMode = () => {
    const next = !isFocusMode
    setFocusMode(next)
    if (next) {
      setIsQuickActionsCollapsed(true)
      setIsQuickActionsVisible(false)
    }
  }


  return (
    <div className="flex min-h-0 flex-1 flex-col text-slate-100">
      <div className={`call-area ${isFocusMode ? 'gap-3' : 'gap-4'} flex min-h-0 flex-1 flex-col lg:flex-row`}>
        <section className="call-area__videoCard relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">
            {cameraError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0d1b2f] px-4 py-6 text-center text-slate-300 sm:px-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-rose-200">
                  <VideoOff className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100">No se detectó cámara</h3>
                <p className="max-w-md text-sm text-slate-400">{cameraError}</p>
                <button
                  type="button"
                  onClick={handleActivateCamera}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Reintentar
                </button>
              </div>
            ) : localStream ? (
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
              <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#0d1b2f] px-4 py-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-200">
                  <VideoOff className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Cámara no activada</h3>
                  <p className="text-sm text-slate-400">Inicia una llamada con el paciente para comenzar la videoconsulta</p>
                </div>
                <div className="flex flex-col gap-3">
                  {authLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-2 text-sm font-semibold text-white">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Autenticando...
                    </div>
                  ) : user ? (
                    <StartCallButton
                      doctorId={user.id}
                      patientId={session?.patientId || 'demo-patient-1'}
                      patientName={patient ? (patient as any).full_name : 'Paciente'}
                      className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                    />
                  ) : (
                    <div className="flex flex-col gap-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30 px-4 py-3 text-sm">
                      <div>
                        <p className="text-yellow-200 font-medium">Autenticación requerida</p>
                        <p className="text-yellow-300/80 text-xs">Inicia sesión para poder realizar llamadas</p>
                      </div>
                      <a
                        href={`${typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WEB_APP_URL ? process.env.NEXT_PUBLIC_WEB_APP_URL : 'http://localhost:3000'}/auth/login?portal=medico`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Iniciar sesión como médico
                      </a>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleActivateCamera}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    O activar cámara directamente
                  </button>
                </div>
              </div>
            )}

            {callStatus === 'connecting' && (
              <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-3 bg-[#0d1b2f]/80 text-slate-200 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
                <p className="text-sm font-medium">Inicializando videollamada…</p>
              </div>
            )}

            {isScreenSharing && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/20 px-4 py-1 text-xs text-blue-100">
                <ScreenShare className="h-4 w-4" />
                Compartiendo pantalla
              </div>
            )}

            {isFocusMode && patient && callStatus === 'live' && showControls && (
              <div className="video-badge z-10">
                <div className="flex items-center gap-3 rounded-lg bg-slate-900/80 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{patient?.full_name ?? 'Paciente'}</p>
                      <p className="text-[10px] text-slate-400">{patient?.age ?? '—'} años • {formattedDuration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${callQuality.color}`}>
                      {callQuality.label}
                    </span>
                    <span className="text-[10px] text-slate-500">• 45ms</span>
                  </div>
                </div>
              </div>
            )}

            {showQualityOverlay && callStatus === 'live' && !isFocusMode && (
              <div className={`absolute top-4 left-4 transition-all duration-1000 ${
                showQualityOverlay ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                  <span className="font-medium text-emerald-200">
                    {callQuality.label} • 45ms • Estable
                  </span>
                </div>
              </div>
            )}

            <div className="absolute right-4 top-4 flex flex-col items-end gap-3">
              {callStatus === 'live' && (
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    isFocusMode
                      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400/60 hover:text-white'
                  }`}
                >
                  {isFocusMode ? 'Salir modo foco' : 'Activar modo foco'}
                </button>
              )}

              {screenStream && (
                <div className="hidden h-32 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/70 shadow-lg sm:block">
                  <video ref={screenShareRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                </div>
              )}
            </div>

            <div className={`video-overlay autoHide ${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-slate-800/80 bg-slate-900/90 px-4 py-3 shadow-lg sm:flex-nowrap sm:justify-start sm:px-6">
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
                  className={`flex items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-500 ${
                    isFocusMode ? 'h-10 w-10' : 'h-12 w-12'
                  }`}
                >
                  <PhoneOff className={isFocusMode ? 'h-4 w-4' : 'h-5 w-5'} />
                </button>
              </div>
            </div>
          </div>

          {showTelemedicinePanel && (
            <TelemedicineSignalingPanel
              roomId={signalingRoomId}
              userId={signalingUserId}
              userType="doctor"
              metadata={{
                patientId: session?.patientId ?? 'guest-patient',
                patientName: patient?.full_name ?? 'Paciente invitado',
              }}
              className="mt-3 rounded-2xl border border-slate-800/60 bg-[#101d32] p-4 shadow-2xl shadow-slate-900/20 sm:p-6"
            />
          )}
        </section>

        {isFocusMode && (
          <button
            type="button"
            onClick={toggleQuickActionsVisibility}
            className={`call-area__quickActionsHandle hidden flex-col items-center gap-1 rounded-2xl border border-slate-700/70 bg-slate-900/85 px-3 py-3 text-xs font-medium text-slate-200 shadow-lg transition hover:border-emerald-500/60 hover:text-white lg:flex ${
              isQuickActionsVisible ? 'ring-1 ring-emerald-400/60' : ''
            }`}
            aria-expanded={isQuickActionsVisible}
            aria-label="Herramientas rápidas de la consulta"
          >
            {isQuickActionsVisible ? (
              <>
                <X className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Cerrar panel</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-emerald-300">
                  <FileText className="h-3 w-3" />
                  <Pill className="h-3 w-3" />
                  <Activity className="h-3 w-3" />
                  <MonitorUp className="h-3 w-3" />
                  <Brain className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide">Herramientas</span>
                <span className="text-[10px] font-normal text-slate-400">Notas · Rx · Signos · IA</span>
              </>
            )}
          </button>
        )}

        <aside
          className={`right-drawer hidden h-full flex-col space-y-3 rounded-2xl border border-slate-800/60 bg-[#101d32] p-3 shadow-xl shadow-slate-900/20 lg:flex ${
            isFocusMode && isQuickActionsVisible ? 'right-drawer--open' : ''
          }`}
        >
          <div className="flex items-center justify-between px-1 pb-0">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Acciones rápidas</h3>
            <div className="flex items-center gap-1">
              {isFocusMode && (
                <button
                  type="button"
                  onClick={closeQuickActions}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
                  aria-label="Cerrar acciones rápidas"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
                aria-expanded={!isQuickActionsCollapsed}
                aria-controls="quick-actions-panel"
              >
                {isQuickActionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isQuickActionsCollapsed && (
            <div id="quick-actions-panel" className="space-y-3 px-1 pb-2">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <CompactAction
                  label="Notas"
                  icon={<FileText className="h-4 w-4" />}
                  onClick={handleTakeNotes}
                />
                <CompactAction
                  label="Prescribir"
                  icon={<Pill className="h-4 w-4" />}
                  onClick={handlePrescribe}
                />
                <CompactAction
                  label="Signos vitales"
                  icon={<Activity className="h-4 w-4" />}
                />
                <CompactAction
                  label={showTelemedicinePanel ? 'Ocultar telemedicina' : 'Telemedicina'}
                  icon={<MonitorUp className="h-4 w-4" />}
                  intent={showTelemedicinePanel ? 'primary' : 'default'}
                  onClick={() => setShowTelemedicinePanel(!showTelemedicinePanel)}
                />
                <CompactAction
                  label={aiProcessing ? 'Procesando...' : 'Análisis IA'}
                  icon={<Brain className="h-4 w-4" />}
                  intent="success"
                  onClick={handleAnalyzeWithAI}
                />
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <p className="text-xs text-emerald-200">Sincronización automática</p>
                </div>
              </div>
            </div>
          )}

          {isQuickActionsCollapsed && (
            <div className="px-1 pb-2">
              <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 py-2">
                <FileText className="h-3 w-3 text-slate-400" />
                <Pill className="h-3 w-3 text-slate-400" />
                <Activity className="h-3 w-3 text-slate-400" />
                <Brain className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">5 acciones disponibles</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {isFocusMode && (
        <div className="mt-3 flex items-center justify-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsQuickActionsCollapsed(false)}
            className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-xs text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            <MonitorUp className="h-4 w-4" />
            Acciones rápidas
          </button>
        </div>
      )}

      {isFocusMode && (
        <div className="fixed bottom-6 right-6 z-20 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className="rounded-full border border-slate-700/60 bg-slate-900/80 p-3 text-slate-200 transition hover:border-slate-500 hover:text-white"
            aria-label="Alternar controles"
          >
            {showControls ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsQuickActionsCollapsed(false)}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg transition hover:bg-emerald-400"
          >
            <Sparkles className="h-4 w-4" />
            Acciones
          </button>
        </div>
      )}

      {isFocusMode && showQualityOverlay && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center lg:hidden">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200 shadow-lg">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
            Video optimizado para modo foco
          </div>
        </div>
      )}

      {showDiagnosisPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800/80 bg-[#0f1f35] p-5 shadow-2xl sm:p-6">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Análisis IA · {patient?.full_name ?? 'Paciente'}</h2>
                  <p className="text-xs text-slate-400">Carga un resumen de síntomas para generar diagnósticos asistidos.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosisPanel(false)}
                className="self-start rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:self-auto"
              >
                Cerrar
              </button>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                <span>Síntomas principales</span>
                <textarea
                  defaultValue="Dolor de garganta severo, fiebre de 38.5°C, dificultad para tragar"
                  className="min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Duración de síntomas</span>
                <input
                  defaultValue="2 días"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </label>
            </div>

            {aiProcessing && (
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                <p className="text-sm text-blue-200">Analizando síntomas con IA...</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Datos encriptados y auditados.
              </div>
              <button
                type="button"
                disabled={aiProcessing}
                className="flex items-center gap-2 self-stretch rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 sm:self-auto"
              >
                <Brain className="h-4 w-4" />
                {aiProcessing ? 'Analizando...' : 'Analizar con IA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <QuickNotesModal
          patientName={(patient as any)?.full_name || 'Paciente'}
          patientId={session?.patientId || 'guest-patient'}
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {showPrescriptionModal && (
        <PrescriptionModal
          patientName={(patient as any)?.full_name || 'Paciente'}
          patientId={session?.patientId || 'guest-patient'}
          onClose={() => setShowPrescriptionModal(false)}
        />
      )}

      {isFocusMode && isQuickActionsVisible && (
        <button
          type="button"
          className="call-area__drawerScrim fixed inset-0 z-30 hidden bg-slate-950/60 backdrop-blur-sm lg:block"
          aria-label="Cerrar acciones rápidas"
          onClick={closeQuickActions}
        />
      )}

    </div>
  )
}

function stopMedia(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.stop()
  })
}


function ControlButton({ active, iconActive, iconInactive, label, onClick }: ControlButtonProps): JSX.Element {
  const { isFocusMode } = useDoctorsPortal()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition ${
        isFocusMode ? 'h-10 w-10' : 'h-12 w-12'
      } ${
        active
          ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
      }`}
      aria-label={label}
      title={label}
    >
      {active ? iconActive : iconInactive}
    </button>
  )
}

function QuickAction({ label, emoji, intent = 'default', onClick }: QuickActionProps): JSX.Element {
  const intentStyles = {
    default: 'border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-900',
    primary: 'border-blue-500/60 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30',
    success: 'border-emerald-500/60 bg-emerald-600/20 text-emerald-100 hover:bg-emerald-600/30',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${intentStyles[intent]}`}
    >
      <span className="flex items-center gap-3">
        <span className="text-lg" aria-hidden>
          {emoji}
        </span>
        {label}
      </span>
      <MonitorUp className="h-4 w-4 text-slate-500" aria-hidden />
    </button>
  )
}

interface CompactActionProps {
  label: string
  icon: JSX.Element
  intent?: 'default' | 'primary' | 'success'
  onClick?: () => void
}

function CompactAction({ label, icon, intent = 'default', onClick }: CompactActionProps): JSX.Element {
  const intentStyles = {
    default: 'border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60',
    primary: 'border-blue-500/40 bg-blue-600/10 text-blue-200 hover:bg-blue-600/20',
    success: 'border-emerald-500/40 bg-emerald-600/10 text-emerald-200 hover:bg-emerald-600/20',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${intentStyles[intent]}`}
    >
      <span className={intent === 'success' ? 'text-emerald-400' : intent === 'primary' ? 'text-blue-400' : 'text-slate-400'}>
        {icon}
      </span>
      {label}
    </button>
  )
}
