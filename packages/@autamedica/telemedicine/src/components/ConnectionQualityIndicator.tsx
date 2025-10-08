/**
 * Connection Quality Indicator Component
 * Visual display of WebRTC connection quality metrics
 *
 * @module ConnectionQualityIndicator
 */

'use client';

import { useState, useEffect } from 'react';
import type {
  ConnectionQuality,
  ConnectionStats,
  DetailedStats,
} from '@/hooks/useConnectionQuality';

export interface ConnectionQualityIndicatorProps {
  stats: ConnectionStats | null;
  detailedStats?: DetailedStats | null;
  className?: string;
  compact?: boolean;
  showAlert?: boolean;
}

/**
 * Quality config for visual display
 */
const QUALITY_CONFIG: Record<
  ConnectionQuality,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  excellent: {
    label: 'Excelente',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '●●●●',
  },
  good: {
    label: 'Buena',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '●●●○',
  },
  fair: {
    label: 'Regular',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '●●○○',
  },
  poor: {
    label: 'Mala',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '●○○○',
  },
  disconnected: {
    label: 'Desconectado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '○○○○',
  },
};

/**
 * Format bitrate for display
 */
function formatBitrate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${Math.round(kbps)} kbps`;
}

/**
 * Format latency for display
 */
function formatLatency(ms: number): string {
  return `${Math.round(ms)} ms`;
}

/**
 * Format packet loss for display
 */
function formatPacketLoss(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

/**
 * Connection Quality Indicator Component
 */
export function ConnectionQualityIndicator({
  stats,
  detailedStats,
  className = '',
  compact = false,
  showAlert = true,
}: ConnectionQualityIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPoorAlert, setShowPoorAlert] = useState(false);

  // Show alert when quality drops
  useEffect(() => {
    if (!stats || !showAlert) return;

    if (stats.quality === 'poor' || stats.quality === 'disconnected') {
      setShowPoorAlert(true);
      const timer = setTimeout(() => setShowPoorAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [stats?.quality, showAlert]);

  if (!stats) {
    return (
      <div className={`rounded-lg bg-gray-100 p-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-600">Conectando...</span>
        </div>
      </div>
    );
  }

  const config = QUALITY_CONFIG[stats.quality];

  // Compact mode - just show quality badge
  if (compact && !isExpanded) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 rounded-full px-3 py-1 ${config.bgColor} transition-all hover:scale-105`}
        >
          <span className={`text-sm font-medium ${config.color}`}>{config.icon}</span>
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Poor Connection Alert */}
      {showPoorAlert && (stats.quality === 'poor' || stats.quality === 'disconnected') && (
        <div className="animate-pulse rounded-lg border-2 border-red-500 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Conexión inestable</p>
              <p className="text-xs text-red-600">
                La calidad de video puede verse afectada. Verifica tu conexión a internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Header with Quality Badge */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg px-3 py-1 ${config.bgColor}`}>
              <span className={`text-sm font-medium ${config.color}`}>{config.icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Calidad de Conexión</p>
              <p className={`text-xs font-bold ${config.color}`}>{config.label}</p>
            </div>
          </div>

          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Minimizar
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bitrate */}
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-600">Bitrate</p>
            <p className="text-lg font-bold text-gray-900">{formatBitrate(stats.bitrate)}</p>
          </div>

          {/* Latency */}
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-600">Latencia</p>
            <p className="text-lg font-bold text-gray-900">{formatLatency(stats.latency)}</p>
          </div>

          {/* Packet Loss */}
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-600">Pérdida de Paquetes</p>
            <p className="text-lg font-bold text-gray-900">{formatPacketLoss(stats.packetLoss)}</p>
          </div>

          {/* Jitter */}
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-600">Jitter</p>
            <p className="text-lg font-bold text-gray-900">{formatLatency(stats.jitter)}</p>
          </div>
        </div>

        {/* Detailed Stats (optional) */}
        {detailedStats && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Ver estadísticas detalladas
            </summary>

            <div className="mt-3 space-y-3 text-xs">
              {/* Video Stats */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                <p className="mb-2 font-semibold text-gray-700">📹 Video</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enviado:</span>
                    <span className="font-medium text-gray-900">
                      {formatBitrate(detailedStats.video.sent.bitrate)} @ {detailedStats.video.sent.fps} fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recibido:</span>
                    <span className="font-medium text-gray-900">
                      {formatBitrate(detailedStats.video.received.bitrate)} @ {detailedStats.video.received.fps} fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolución:</span>
                    <span className="font-medium text-gray-900">
                      {detailedStats.video.received.resolution || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio Stats */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                <p className="mb-2 font-semibold text-gray-700">🎤 Audio</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enviado:</span>
                    <span className="font-medium text-gray-900">
                      {formatBitrate(detailedStats.audio.sent.bitrate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recibido:</span>
                    <span className="font-medium text-gray-900">
                      {formatBitrate(detailedStats.audio.received.bitrate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Stats */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                <p className="mb-2 font-semibold text-gray-700">🔌 Conexión</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RTT:</span>
                    <span className="font-medium text-gray-900">
                      {formatLatency(detailedStats.connection.currentRoundTripTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ancho de banda:</span>
                    <span className="font-medium text-gray-900">
                      {formatBitrate(detailedStats.connection.availableOutgoingBitrate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-gray-900">
                      {detailedStats.connection.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        )}

        {/* Timestamp */}
        <p className="mt-3 text-xs text-gray-400">
          Actualizado: {new Date(stats.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
