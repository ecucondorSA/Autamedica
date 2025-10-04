/**
 * Connection Monitor Hook (Integrated)
 * Combines quality monitoring with automatic reporting to Supabase
 *
 * @module useConnectionMonitor
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  useConnectionQuality,
  type UseConnectionQualityOptions,
  type ConnectionQuality,
  type ConnectionStats,
} from './useConnectionQuality';
import { reportConnectionQuality } from '@/lib/telemedicine';
import { logger } from '@autamedica/shared';

export interface UseConnectionMonitorOptions extends UseConnectionQualityOptions {
  participantId: string | null;
  reportInterval?: number; // ms, default 5000 (5 seconds)
  enableAutoReport?: boolean; // default true
}

export interface UseConnectionMonitorReturn {
  stats: ConnectionStats | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Hook: Monitor connection quality and auto-report to Supabase
 */
export function useConnectionMonitor(options: UseConnectionMonitorOptions): UseConnectionMonitorReturn {
  const {
    participantId,
    reportInterval = 5000,
    enableAutoReport = true,
    ...qualityOptions
  } = options;

  const reportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedStatsRef = useRef<ConnectionStats | null>(null);

  // Report stats to Supabase
  const reportStats = useCallback(
    async (stats: ConnectionStats) => {
      if (!participantId || !enableAutoReport) return;
      if (stats.quality === 'disconnected') return; // Don't report disconnected state

      try {
        await reportConnectionQuality(participantId, {
          bitrate: stats.bitrate,
          latency: stats.latency,
          packetLoss: stats.packetLoss,
          quality: stats.quality,
        });

        lastReportedStatsRef.current = stats;
      } catch (error) {
        logger.error('Failed to report connection quality:', error);
      }
    },
    [participantId, enableAutoReport]
  );

  // On quality change callback
  const handleQualityChange = useCallback(
    (quality: ConnectionQuality) => {
      logger.info(`[ConnectionMonitor] Quality changed to: ${quality}`);

      // Immediately report significant quality changes
      if (quality === 'poor' || quality === 'disconnected') {
        const currentStats = lastReportedStatsRef.current;
        if (currentStats && participantId) {
          reportStats(currentStats);
        }
      }
    },
    [participantId, reportStats]
  );

  // On stats update callback
  const handleStatsUpdate = useCallback(
    (stats: ConnectionStats) => {
      // Stats updated - will be reported on interval
    },
    []
  );

  // Use the base connection quality hook
  const {
    stats,
    isMonitoring,
    startMonitoring: startQualityMonitoring,
    stopMonitoring: stopQualityMonitoring,
  } = useConnectionQuality({
    ...qualityOptions,
    onQualityChange: handleQualityChange,
    onStatsUpdate: handleStatsUpdate,
  });

  // Setup periodic reporting
  useEffect(() => {
    if (!isMonitoring || !enableAutoReport || !participantId) {
      return;
    }

    // Initial report
    if (stats) {
      reportStats(stats);
    }

    // Setup interval
    reportTimerRef.current = setInterval(() => {
      if (stats) {
        reportStats(stats);
      }
    }, reportInterval);

    return () => {
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current);
        reportTimerRef.current = null;
      }
    };
  }, [isMonitoring, stats, reportInterval, enableAutoReport, participantId, reportStats]);

  const startMonitoring = useCallback(() => {
    startQualityMonitoring();
  }, [startQualityMonitoring]);

  const stopMonitoring = useCallback(() => {
    stopQualityMonitoring();

    // Clear report timer
    if (reportTimerRef.current) {
      clearInterval(reportTimerRef.current);
      reportTimerRef.current = null;
    }

    // Final report before stopping
    if (stats && participantId && enableAutoReport) {
      reportStats(stats);
    }
  }, [stopQualityMonitoring, stats, participantId, enableAutoReport, reportStats]);

  return {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
}
