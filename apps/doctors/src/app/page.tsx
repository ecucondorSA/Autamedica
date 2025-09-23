"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'
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
} from 'lucide-react'
import { useActiveSession, usePatientData } from '@/hooks'

const CALL_BADGE_CLASSES = {
  good: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  warning: 'bg-amber-400/10 text-amber-200 border border-amber-400/20',
  danger: 'bg-rose-500/10 text-rose-200 border border-rose-500/20',
} as const

type CallQualityTone = keyof typeof CALL_BADGE_CLASSES

type ControlButtonProps = {
  active: boolean
  iconActive: ReactNode
  iconInactive: ReactNode
  label: string
  onClick: () => void
}

type InfoCardProps = {
  title: string
  accent: string
  children: ReactNode
}

type QuickActionProps = {
  label: string
  emoji: string
  intent?: 'default' | 'primary'
  onClick?: () => void
}

export default function DoctorsHomePage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenShareRef = useRef<HTMLVideoElement | null>(null)

  // Hooks para obtener datos de la sesión activa y paciente
  const { session } = useActiveSession()
  const { patient } = usePatientData(session?.patientId || null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showDiagnosisPanel, setShowDiagnosisPanel] = useState(false)

  useEffect(() => {
    if (callStatus !== 'live') {
      return
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1_000)

    return () => clearInterval(interval)
  }, [callStatus])

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

  const callQuality = useMemo((): { label: string; tone: CallQualityTone } => {
    if (cameraError) {
      return { label: 'Sin señal', tone: 'danger' }
    }
    if (callStatus === 'live') {
      return { label: 'HD', tone: 'good' }
    }
    if (callStatus === 'connecting') {
      return { label: 'Inicializando', tone: 'warning' }
    }
    return { label: 'En espera', tone: 'warning' }
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
      console.error('[VideoCall] Error al activar la cámara', error)
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
      console.warn('[VideoCall] El usuario canceló la compartición de pantalla', error)
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

  return (
    <div className="flex min-h-full flex-col gap-6 px-4 py-6 text-slate-100 sm:px-6 lg:flex-row">
      <section className="flex flex-1 flex-col gap-6">
        <div className="rounded-2xl border border-slate-800/60 bg-[#101d32] p-4 shadow-2xl shadow-slate-900/20 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
            <span className={`rounded-full px-3 py-1 font-semibold ${CALL_BADGE_CLASSES[callQuality.tone]}`}>
              {callQuality.label}
            </span>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-200">
              {callStatus === 'live' ? '45ms latencia' : 'Latencia desconocida'}
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              {callStatus === 'live' ? 'Estable' : 'En espera'}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-[#0d1b2f]">
            <div className="aspect-video">
              {cameraError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-slate-300 sm:px-8">
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
                  className={`h-full w-full object-cover transition-opacity ${isVideoEnabled ? 'opacity-100' : 'opacity-0'}`}
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-8 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-200">
                    <VideoOff className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100">Cámara en modo demo</h3>
                    <p className="text-sm text-slate-400">Haz clic en "Activar cámara" para inicializar</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleActivateCamera}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Activar cámara
                  </button>
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
            </div>

            {screenStream && (
              <div className="absolute right-4 top-4 hidden h-32 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/70 shadow-lg sm:block">
                <video ref={screenShareRef} className="h-full w-full object-cover" autoPlay muted playsInline />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 sm:px-0">
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
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-500"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard title="Paciente" accent="bg-emerald-500/20 text-emerald-200">
            {patient ? (
              <>
                <p className="text-sm font-semibold text-slate-100">{patient.full_name}</p>
                <p className="text-xs text-slate-400">
                  {patient.age} años · {session?.sessionType === 'general' ? 'Consulta general' :
                   session?.sessionType === 'seguimiento' ? 'Seguimiento' :
                   session?.sessionType === 'urgencia' ? 'Urgencia' :
                   session?.sessionType === 'especialidad' ? 'Especialidad' : 'Consulta general'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-300">Cargando paciente...</p>
                <p className="text-xs text-slate-400">Obteniendo información</p>
              </>
            )}
          </InfoCard>
          <InfoCard title="Duración" accent="bg-amber-500/20 text-amber-200">
            <p className="text-2xl font-semibold text-slate-100">{formattedDuration}</p>
            <p className="text-xs text-slate-400">Tiempo en llamada</p>
          </InfoCard>
          <InfoCard title="Calidad" accent="bg-blue-500/20 text-blue-200">
            <p className="text-sm font-semibold text-slate-100">
              {callStatus === 'live' ? callQuality.label : 'En espera'}
            </p>
            <p className="text-xs text-slate-400">
              Latencia {callStatus === 'live' ? '45ms' : '—'}
            </p>
          </InfoCard>
        </div>
      </section>

      <aside className="w-full space-y-4 rounded-2xl border border-slate-800/60 bg-[#101d32] p-4 shadow-xl shadow-slate-900/20 lg:max-w-sm lg:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Acciones rápidas</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:block">
          <QuickAction label="Tomar notas" emoji="📝" />
          <QuickAction label="Prescribir medicamento" emoji="💊" />
          <QuickAction label="Ver signos vitales" emoji="📊" />
          <QuickAction label="Historial médico" emoji="📋" />
          <QuickAction
            label="Analizar con IA"
            emoji="🤖"
            intent="primary"
            onClick={() => setShowDiagnosisPanel(true)}
          />
          <QuickAction label="Programar seguimiento" emoji="📅" />
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Estado de la llamada</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center justify-between">
              <span>Calidad</span>
              <span className="text-emerald-300">{callQuality.label}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Latencia</span>
              <span className="text-blue-200">{callStatus === 'live' ? '45ms' : 'N/D'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Conexión</span>
              <span className="text-emerald-300">{callStatus === 'live' ? 'Estable' : 'En espera'}</span>
            </li>
          </ul>
        </div>
      </aside>

      {showDiagnosisPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800/80 bg-[#0f1f35] p-5 shadow-2xl sm:p-6">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Análisis IA · María González</h2>
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

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Datos encriptados y auditados.
              </div>
              <button
                type="button"
                className="flex items-center gap-2 self-stretch rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 sm:self-auto"
              >
                <Brain className="h-4 w-4" />
                Analizar con IA
              </button>
            </div>
          </div>
        </div>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
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

function InfoCard({ title, accent, children }: InfoCardProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#101d32] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{title}</p>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>{title}</div>
      <div className="mt-4 space-y-1 text-sm text-slate-300">{children}</div>
    </div>
  )
}

function QuickAction({ label, emoji, intent = 'default', onClick }: QuickActionProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
        intent === 'primary'
          ? 'border-blue-500/60 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30'
          : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-900'
      }`}
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
