'use client';

import { Wifi, WifiOff, Activity } from 'lucide-react';
import type { VideoQualityIndicatorProps, VideoQuality } from '@/types/telemedicine';

/**
 * Indicador de calidad de conexión de video
 * Muestra: calidad actual, bitrate, latencia, packet loss
 */
export function VideoQualityIndicator({
  quality = 'auto',
  bitrate,
  latency,
  packetLoss,
  className = '',
}: VideoQualityIndicatorProps) {
  // Mapeo de calidad a colores y labels
  const qualityConfig: Record<VideoQuality, { label: string; color: string; icon: React.ReactNode }> = {
    hd: {
      label: 'HD',
      color: 'text-green-400 bg-green-500/20 border-green-500/30',
      icon: <Wifi className="h-3 w-3" />,
    },
    sd: {
      label: 'SD',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      icon: <Wifi className="h-3 w-3" />,
    },
    ld: {
      label: 'LD',
      color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      icon: <Wifi className="h-3 w-3" />,
    },
    auto: {
      label: 'Auto',
      color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      icon: <Activity className="h-3 w-3" />,
    },
  };

  // Determinar calidad basada en métricas si está en modo auto
  const getEffectiveQuality = (): VideoQuality => {
    if (quality !== 'auto') return quality;

    // Si no hay métricas, asumir auto
    if (!bitrate && !latency && packetLoss === undefined) return 'auto';

    // Calcular calidad basada en métricas
    const hasPoorLatency = latency && latency > 200; // >200ms es malo
    const hasHighPacketLoss = packetLoss && packetLoss > 5; // >5% es malo
    const hasLowBitrate = bitrate && bitrate < 500; // <500 kbps es muy bajo

    if (hasHighPacketLoss || hasPoorLatency || hasLowBitrate) {
      return 'ld';
    } else if (latency && latency > 100) {
      return 'sd';
    } else {
      return 'hd';
    }
  };

  const effectiveQuality = getEffectiveQuality();
  const config = qualityConfig[effectiveQuality];

  // Formatear bitrate
  const formatBitrate = (kbps: number): string => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Badge principal de calidad */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border backdrop-blur-sm ${config.color}`}>
        {config.icon}
        <span className="text-xs font-bold">{config.label}</span>
      </div>

      {/* Métricas detalladas (solo si están disponibles) */}
      {(bitrate || latency || packetLoss !== undefined) && (
        <div className="hidden md:flex items-center gap-2 text-xs text-white/70">
          {bitrate && (
            <div className="flex items-center gap-1">
              <span className="text-white/50">↓</span>
              <span>{formatBitrate(bitrate)}</span>
            </div>
          )}
          {latency && (
            <div className="flex items-center gap-1">
              <span className="text-white/50">⏱</span>
              <span>{latency}ms</span>
            </div>
          )}
          {packetLoss !== undefined && packetLoss > 0 && (
            <div className={`flex items-center gap-1 ${packetLoss > 5 ? 'text-red-400' : ''}`}>
              <WifiOff className="h-3 w-3" />
              <span>{packetLoss.toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Variante simple solo con badge
 */
export function VideoQualityBadge({ quality = 'auto' }: { quality?: VideoQuality }) {
  const config: Record<VideoQuality, { label: string; color: string }> = {
    hd: { label: 'HD', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    sd: { label: 'SD', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    ld: { label: 'LD', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    auto: { label: 'Auto', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  };

  const { label, color } = config[quality];

  return (
    <div className={`inline-flex px-2 py-1 rounded-md border text-xs font-bold backdrop-blur-sm ${color}`}>
      {label}
    </div>
  );
}
