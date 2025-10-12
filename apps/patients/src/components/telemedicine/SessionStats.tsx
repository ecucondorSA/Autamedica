'use client'

import { Signal, Clock, Wifi, Activity } from 'lucide-react'

export interface SessionStatsProps {
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  duration: string // Formatted duration (e.g., "15:32")
  bandwidth?: number // in Kbps
  latency?: number // in ms
  packetLoss?: number // percentage
  className?: string
}

/**
 * SessionStats - Indicadores de calidad y estadísticas de sesión
 *
 * Muestra:
 * - Calidad de conexión (excellent/good/fair/poor)
 * - Duración de la sesión
 * - Bandwidth (opcional)
 * - Latencia (opcional)
 * - Packet loss (opcional)
 *
 * @example
 * <SessionStats
 *   connectionQuality="good"
 *   duration="15:32"
 *   bandwidth={1500}
 *   latency={45}
 *   packetLoss={0.2}
 * />
 */
export function SessionStats({
  connectionQuality,
  duration,
  bandwidth,
  latency,
  packetLoss,
  className = '',
}: SessionStatsProps) {
  const qualityConfig = {
    excellent: {
      label: 'Excelente',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    good: {
      label: 'Buena',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    fair: {
      label: 'Regular',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    poor: {
      label: 'Pobre',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    unknown: {
      label: 'Desconocida',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
    },
  }

  const config = qualityConfig[connectionQuality]

  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 bg-gray-900/90 backdrop-blur-sm rounded-xl border ${config.borderColor} ${className}`}>
      {/* Connection Quality */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor}`}>
        <Signal className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-white">{duration}</span>
      </div>

      {/* Bandwidth (optional) */}
      {bandwidth !== undefined && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
          <Wifi className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            {bandwidth < 1000 ? `${bandwidth} Kbps` : `${(bandwidth / 1000).toFixed(1)} Mbps`}
          </span>
        </div>
      )}

      {/* Latency (optional) */}
      {latency !== undefined && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{latency}ms</span>
        </div>
      )}

      {/* Packet Loss (optional) */}
      {packetLoss !== undefined && packetLoss > 0 && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          packetLoss < 1 ? 'bg-yellow-500/10' : 'bg-red-500/10'
        }`}>
          <span className={`text-sm font-medium ${
            packetLoss < 1 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {packetLoss.toFixed(1)}% pérdida
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * ConnectionBadge - Badge simple de conexión (versión compacta)
 *
 * Para usar en ParticipantTile u otros componentes pequeños
 */
export function ConnectionBadge({
  quality,
  size = 'sm',
}: {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const colorClasses = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
    unknown: 'text-gray-500',
  }

  return (
    <Signal className={`${sizeClasses[size]} ${colorClasses[quality]}`} />
  )
}
