'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { JSX } from 'react'
import type { SupabaseProfile } from '@autamedica/types'
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
  User,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { IncomingCallModal } from '@/components/calls/IncomingCallModal'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'

type CallStatus = 'idle' | 'connecting' | 'live' | 'ended'

interface ControlButtonProps {
  active: boolean
  iconActive: React.ReactNode
  iconInactive: React.ReactNode
  label: string
  onClick: () => void
}

export default function PatientsHomePage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenShareRef = useRef<HTMLVideoElement | null>(null)

  // Estados básicos
  const [userName, setUserName] = useState('Paciente')
  const [patientProfile, setPatientProfile] = useState<SupabaseProfile | null>(null)

  // Estados de video
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const _signalingUserId = useMemo(() => {
    if (typeof window === 'undefined' || typeof crypto === 'undefined') {
      return 'patient-demo'
    }
    const key = 'autamedica-patient-signaling-id'
    const cached = window.sessionStorage.getItem(key)
    if (cached) return cached
    const generated = crypto.randomUUID()
    window.sessionStorage.setItem(key, generated)
    return generated
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const fallbackName = user.email?.split('@')[0] ?? 'Paciente'
        const name = user.user_metadata?.name || user.user_metadata?.full_name || fallbackName
        setUserName(name)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Profile fetch error', error)
          return
        }

        if (profile) {
          setPatientProfile(profile)
        }
      } catch (error) {
        console.error('Supabase initialization failed', error)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (callStatus !== 'live') return

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

  const callQuality = useMemo((): { label: string; color: string } => {
    if (cameraError) return { label: 'Sin señal', color: 'text-rose-400' }
    if (callStatus === 'live') return { label: 'HD', color: 'text-emerald-400' }
    if (callStatus === 'connecting') return { label: 'Inicializando', color: 'text-amber-400' }
    return { label: 'En espera', color: 'text-slate-400' }
  }, [cameraError, callStatus])

  async function handleActivateCamera() {
    if (callStatus === 'live') return

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
    if (!localStream) return
    const nextMuted = !isMuted
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
  }

  function handleToggleVideo() {
    if (!localStream) return
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
      console.warn('[VideoCall] Usuario canceló compartir pantalla', error)
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
    <div className="flex h-screen w-full overflow-hidden bg-ivory-base">
      {/* Sidebar Plegable */}
      <CollapsibleSidebar />

      {/* Área Central de Video - 58% */}
      <main className="flex flex-1 flex-col p-6">
        {/* Header con info del paciente */}
        {patientProfile && (
          <div className="mb-4 rounded-xl border border-stone-200 bg-white p-4 shadow-md">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <p className="text-base font-bold text-stone-900">
                  {patientProfile.first_name ?? ''} {patientProfile.last_name ?? ''}
                </p>
                <p className="text-xs text-stone-500">ID • {patientProfile.id.slice(0, 8)}</p>
              </div>
              <span className="rounded-full bg-stone-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                {patientProfile.role === 'patient' ? 'Paciente' : patientProfile.role}
              </span>
              <span className="text-xs text-stone-600">{patientProfile.email}</span>
            </div>
          </div>
        )}

        {/* Área de Video */}
        <div className="relative flex flex-1 overflow-hidden rounded-xl border-2 border-stone-300 bg-white shadow-xl">
          {cameraError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-rose-200">
                <VideoOff className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">No se detectó cámara</h3>
              <p className="max-w-md text-sm text-stone-600">{cameraError}</p>
              <button
                type="button"
                onClick={handleActivateCamera}
                className="btn-primary-ivory px-5 py-2 text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : localStream ? (
            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity ${
                isVideoEnabled ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-lg">
                <User className="h-12 w-12" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-stone-900">Portal de Telemedicina</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Conecta con tu médico para iniciar la videoconsulta
                </p>
              </div>
              <button
                type="button"
                onClick={handleActivateCamera}
                className="mt-4 btn-primary-ivory px-8 py-3 text-sm"
              >
                Iniciar videoconsulta
              </button>
            </div>
          )}

          {/* Estado conectando */}
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm font-semibold text-stone-900">Conectando con su médico…</p>
            </div>
          )}

          {/* Indicador compartir pantalla */}
          {isScreenSharing && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/20 px-4 py-1 text-xs text-blue-100">
              <ScreenShare className="h-4 w-4" />
              Compartiendo pantalla
            </div>
          )}

          {/* Badge de video en vivo */}
          {callStatus === 'live' && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-3 rounded-lg bg-slate-900/80 px-3 py-2 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{userName}</p>
                    <p className="text-[10px] text-slate-400">Consulta • {formattedDuration}</p>
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

          {/* Preview pantalla compartida */}
          {screenStream && (
            <div className="absolute right-4 top-4 h-32 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/70 shadow-lg">
              <video ref={screenShareRef} className="h-full w-full object-cover" autoPlay muted playsInline />
            </div>
          )}

          {/* Controles de video */}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full border-2 border-stone-200 bg-white px-6 py-3 shadow-2xl">
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
      </main>

      {/* Panel Derecho Plegable */}
      <CollapsibleRightPanel context="dashboard" />

      {/* Modal de llamada entrante */}
      <IncomingCallModal
        onAccept={(callId, roomId) => {
          console.log('✅ Call accepted:', { callId, roomId })
        }}
        onDecline={(callId) => {
          console.log('❌ Call declined:', { callId })
        }}
      />
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
      className={`flex h-12 w-12 items-center justify-center rounded-full transition shadow-md ${
        active
          ? 'bg-stone-800 text-white hover:bg-stone-900'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
      }`}
      aria-label={label}
      title={label}
    >
      {active ? iconActive : iconInactive}
    </button>
  )
}
