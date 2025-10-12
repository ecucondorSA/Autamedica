'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Video, VideoOff, Signal, User } from 'lucide-react'

export interface Participant {
  id: string
  name: string
  role: 'doctor' | 'patient'
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor'
  videoTrack?: MediaStreamTrack
  audioTrack?: MediaStreamTrack
}

export interface ParticipantGridProps {
  participants: Participant[]
  localParticipant?: Participant
  className?: string
}

function ParticipantTile({ participant, isLocal = false }: { participant: Participant; isLocal?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    if (!videoRef.current || !participant.videoTrack) return

    const stream = new MediaStream([participant.videoTrack])
    videoRef.current.srcObject = stream
    videoRef.current.play().catch(console.error)
    setHasVideo(true)

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [participant.videoTrack])

  const qualityColors = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
  }

  const qualityColor = participant.connectionQuality ? qualityColors[participant.connectionQuality] : 'text-gray-500'

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-2xl">
      {/* Video Stream */}
      {participant.isVideoEnabled && hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-gray-300 font-medium">{participant.name}</p>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar: Name + Connection Quality */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-white text-sm font-medium">{participant.name}</span>
            {isLocal && (
              <span className="text-xs text-blue-400 font-semibold">(Tú)</span>
            )}
            {participant.role === 'doctor' && (
              <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/20 rounded-full">
                Doctor
              </span>
            )}
          </div>

          {participant.connectionQuality && (
            <div className={`flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full ${qualityColor}`}>
              <Signal className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Bottom Bar: Media Status */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {!participant.isVideoEnabled && (
            <div className="p-2 bg-red-600/80 backdrop-blur-sm rounded-full">
              <VideoOff className="w-4 h-4 text-white" />
            </div>
          )}
          {!participant.isAudioEnabled && (
            <div className="p-2 bg-red-600/80 backdrop-blur-sm rounded-full">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ParticipantGrid - Grid responsivo de participantes en videollamada
 *
 * Layouts automáticos:
 * - 1 participante: Full screen
 * - 2 participantes: 2 columnas
 * - 3-4 participantes: Grid 2x2
 * - 5-6 participantes: Grid 2x3
 * - 7+ participantes: Grid 3x3
 *
 * Features:
 * - Indicadores de conexión (excellent/good/fair/poor)
 * - Estados de video/audio por participante
 * - Badge de rol (Doctor)
 * - Indicador "Tú" para participante local
 * - Video placeholders con avatar
 *
 * @example
 * <ParticipantGrid
 *   localParticipant={localUser}
 *   participants={remoteParticipants}
 * />
 */
export function ParticipantGrid({
  participants,
  localParticipant,
  className = '',
}: ParticipantGridProps) {
  const allParticipants = localParticipant
    ? [localParticipant, ...participants]
    : participants

  const count = allParticipants.length

  // Grid layout automático según cantidad de participantes
  const gridClass =
    count === 1
      ? 'grid-cols-1'
      : count === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : count <= 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          : count <= 6
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid gap-4 ${gridClass} ${className}`}>
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          isLocal={localParticipant?.id === participant.id}
        />
      ))}
    </div>
  )
}
