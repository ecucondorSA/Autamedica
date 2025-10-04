/**
 * Connection Quality Monitoring Hook
 * Monitors WebRTC connection stats: bitrate, latency, packet loss, jitter
 *
 * @module useConnectionQuality
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@autamedica/shared';

/**
 * Connection Quality Levels
 */
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';

/**
 * Connection Statistics
 */
export interface ConnectionStats {
  bitrate: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
  jitter: number; // ms
  quality: ConnectionQuality;
  timestamp: number;
}

/**
 * Detailed Statistics for Advanced Monitoring
 */
export interface DetailedStats {
  video: {
    sent: {
      bitrate: number;
      fps: number;
      resolution: string;
      packetsLost: number;
      totalPackets: number;
    };
    received: {
      bitrate: number;
      fps: number;
      resolution: string;
      packetsLost: number;
      totalPackets: number;
    };
  };
  audio: {
    sent: {
      bitrate: number;
      packetsLost: number;
      totalPackets: number;
    };
    received: {
      bitrate: number;
      packetsLost: number;
      totalPackets: number;
    };
  };
  connection: {
    currentRoundTripTime: number;
    availableOutgoingBitrate: number;
    state: RTCPeerConnectionState;
  };
}

/**
 * Hook Options
 */
export interface UseConnectionQualityOptions {
  peerConnection: RTCPeerConnection | null;
  interval?: number; // ms, default 1000
  onQualityChange?: (quality: ConnectionQuality) => void;
  onStatsUpdate?: (stats: ConnectionStats) => void;
}

/**
 * Hook Return Type
 */
export interface UseConnectionQualityReturn {
  stats: ConnectionStats | null;
  detailedStats: DetailedStats | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Calculate connection quality based on stats
 */
function calculateQuality(stats: {
  bitrate: number;
  latency: number;
  packetLoss: number;
  jitter: number;
}): ConnectionQuality {
  const { bitrate, latency, packetLoss, jitter } = stats;

  // Disconnected if no bitrate
  if (bitrate === 0) {
    return 'disconnected';
  }

  // Poor quality conditions
  if (
    latency > 300 ||
    packetLoss > 5 ||
    jitter > 50 ||
    bitrate < 100
  ) {
    return 'poor';
  }

  // Fair quality conditions
  if (
    latency > 150 ||
    packetLoss > 2 ||
    jitter > 30 ||
    bitrate < 300
  ) {
    return 'fair';
  }

  // Good quality conditions
  if (
    latency > 80 ||
    packetLoss > 0.5 ||
    jitter > 15 ||
    bitrate < 500
  ) {
    return 'good';
  }

  // Excellent quality
  return 'excellent';
}

/**
 * Parse RTCStats to extract connection metrics
 */
async function parseStats(pc: RTCPeerConnection): Promise<{
  basic: ConnectionStats;
  detailed: DetailedStats;
}> {
  const stats = await pc.getStats();

  let bitrate = 0;
  let latency = 0;
  let packetLoss = 0;
  let jitter = 0;

  const videoSent = { bitrate: 0, fps: 0, resolution: '', packetsLost: 0, totalPackets: 0 };
  const videoReceived = { bitrate: 0, fps: 0, resolution: '', packetsLost: 0, totalPackets: 0 };
  const audioSent = { bitrate: 0, packetsLost: 0, totalPackets: 0 };
  const audioReceived = { bitrate: 0, packetsLost: 0, totalPackets: 0 };
  const connection = {
    currentRoundTripTime: 0,
    availableOutgoingBitrate: 0,
    state: pc.connectionState,
  };

  let bitrateCount = 0;
  let latencyCount = 0;

  stats.forEach((report) => {
    // Outbound RTP (sent)
    if (report.type === 'outbound-rtp') {
      if (report.kind === 'video' && report.bytesSent) {
        const kbps = (report.bytesSent * 8) / 1000;
        videoSent.bitrate = kbps;
        videoSent.fps = report.framesPerSecond || 0;
        videoSent.resolution = `${report.frameWidth || 0}x${report.frameHeight || 0}`;
        videoSent.packetsLost = report.packetsLost || 0;
        videoSent.totalPackets = report.packetsSent || 0;
        bitrate += kbps;
        bitrateCount++;
      }
      if (report.kind === 'audio' && report.bytesSent) {
        const kbps = (report.bytesSent * 8) / 1000;
        audioSent.bitrate = kbps;
        audioSent.packetsLost = report.packetsLost || 0;
        audioSent.totalPackets = report.packetsSent || 0;
        bitrate += kbps;
        bitrateCount++;
      }
    }

    // Inbound RTP (received)
    if (report.type === 'inbound-rtp') {
      if (report.kind === 'video' && report.bytesReceived) {
        const kbps = (report.bytesReceived * 8) / 1000;
        videoReceived.bitrate = kbps;
        videoReceived.fps = report.framesPerSecond || 0;
        videoReceived.resolution = `${report.frameWidth || 0}x${report.frameHeight || 0}`;
        videoReceived.packetsLost = report.packetsLost || 0;
        videoReceived.totalPackets = report.packetsReceived || 0;
        bitrate += kbps;
        bitrateCount++;

        // Jitter (video)
        if (report.jitter) {
          jitter = Math.max(jitter, report.jitter * 1000);
        }

        // Packet loss (video)
        if (report.packetsLost && report.packetsReceived) {
          const lossPercentage = (report.packetsLost / (report.packetsLost + report.packetsReceived)) * 100;
          packetLoss = Math.max(packetLoss, lossPercentage);
        }
      }

      if (report.kind === 'audio' && report.bytesReceived) {
        const kbps = (report.bytesReceived * 8) / 1000;
        audioReceived.bitrate = kbps;
        audioReceived.packetsLost = report.packetsLost || 0;
        audioReceived.totalPackets = report.packetsReceived || 0;
        bitrate += kbps;
        bitrateCount++;

        // Jitter (audio)
        if (report.jitter) {
          jitter = Math.max(jitter, report.jitter * 1000);
        }

        // Packet loss (audio)
        if (report.packetsLost && report.packetsReceived) {
          const lossPercentage = (report.packetsLost / (report.packetsLost + report.packetsReceived)) * 100;
          packetLoss = Math.max(packetLoss, lossPercentage);
        }
      }
    }

    // Candidate pair (for RTT)
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      if (report.currentRoundTripTime) {
        latency = report.currentRoundTripTime * 1000; // Convert to ms
        connection.currentRoundTripTime = latency;
        latencyCount++;
      }
      if (report.availableOutgoingBitrate) {
        connection.availableOutgoingBitrate = report.availableOutgoingBitrate / 1000; // kbps
      }
    }
  });

  // Average bitrate
  if (bitrateCount > 0) {
    bitrate = bitrate / bitrateCount;
  }

  const quality = calculateQuality({ bitrate, latency, packetLoss, jitter });

  return {
    basic: {
      bitrate,
      latency,
      packetLoss,
      jitter,
      quality,
      timestamp: Date.now(),
    },
    detailed: {
      video: {
        sent: videoSent,
        received: videoReceived,
      },
      audio: {
        sent: audioSent,
        received: audioReceived,
      },
      connection,
    },
  };
}

/**
 * Hook: Monitor WebRTC connection quality
 */
export function useConnectionQuality(options: UseConnectionQualityOptions): UseConnectionQualityReturn {
  const {
    peerConnection,
    interval = 1000,
    onQualityChange,
    onStatsUpdate,
  } = options;

  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQualityRef = useRef<ConnectionQuality | null>(null);

  const collectStats = useCallback(async () => {
    if (!peerConnection) return;

    try {
      const { basic, detailed } = await parseStats(peerConnection);

      setStats(basic);
      setDetailedStats(detailed);

      // Trigger callbacks
      onStatsUpdate?.(basic);

      if (previousQualityRef.current !== basic.quality) {
        onQualityChange?.(basic.quality);
        previousQualityRef.current = basic.quality;
      }
    } catch (error) {
      logger.error('Failed to collect WebRTC stats:', error);
    }
  }, [peerConnection, onStatsUpdate, onQualityChange]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring || !peerConnection) return;

    setIsMonitoring(true);
    collectStats(); // Initial collection

    intervalRef.current = setInterval(() => {
      collectStats();
    }, interval);
  }, [peerConnection, interval, collectStats, isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring when peerConnection becomes available
  useEffect(() => {
    if (peerConnection && peerConnection.connectionState === 'connected') {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [peerConnection, startMonitoring, stopMonitoring]);

  return {
    stats,
    detailedStats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
}
