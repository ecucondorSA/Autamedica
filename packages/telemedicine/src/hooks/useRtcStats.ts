import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '@autamedica/shared'
import type { WebRTCClient } from '../webrtc-client'

export interface RtcStatsData {
  rtt: number | null // Round trip time in ms
  packetLoss: number | null // Packet loss percentage (0-100)
  bitrateKbps: number | null // Bitrate in Kbps
  framesPerSecond: number | null // Video FPS
  audioLevel: number | null // Audio level (0-1)
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  timestamp: number
}

export interface RtcStatsState {
  stats: RtcStatsData
  isCollecting: boolean
  error: Error | null
  history: RtcStatsData[] // Last 30 samples
}

export interface RtcStatsActions {
  startCollection: () => void
  stopCollection: () => void
  getAverageStats: (samples?: number) => Partial<RtcStatsData>
  clearHistory: () => void
}

export type RtcStatsHook = RtcStatsState & RtcStatsActions

interface UseRtcStatsOptions {
  interval?: number // Collection interval in ms
  autoStart?: boolean
  maxHistorySize?: number
}

const DEFAULT_OPTIONS: Required<UseRtcStatsOptions> = {
  interval: 2000, // 2 seconds
  autoStart: true,
  maxHistorySize: 30 // Keep last 30 samples (1 minute at 2s interval)
}

function createEmptyStats(): RtcStatsData {
  return {
    rtt: null,
    packetLoss: null,
    bitrateKbps: null,
    framesPerSecond: null,
    audioLevel: null,
    connectionQuality: 'unknown',
    timestamp: Date.now()
  }
}

function calculateConnectionQuality(stats: Partial<RtcStatsData>): RtcStatsData['connectionQuality'] {
  const { rtt, packetLoss } = stats

  if (rtt === null || rtt === undefined || packetLoss === null || packetLoss === undefined) return 'unknown'

  if (rtt < 100 && packetLoss < 1) return 'excellent'
  if (rtt < 200 && packetLoss < 3) return 'good'
  if (rtt < 400 && packetLoss < 5) return 'fair'
  return 'poor'
}

export function useRtcStats(
  client: WebRTCClient | null,
  options: UseRtcStatsOptions = {}
): RtcStatsHook {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [state, setState] = useState<RtcStatsState>({
    stats: createEmptyStats(),
    isCollecting: false,
    error: null,
    history: []
  })

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const previousStatsRef = useRef<Map<string, any>>(new Map())

  // Collect stats from peer connections
  const collectStats = useCallback(async (): Promise<RtcStatsData> => {
    if (!client) {
      return createEmptyStats()
    }

    try {
      const peerConnections = client.getPeerConnections()
      const statsData = createEmptyStats()
      let validConnections = 0

      // Aggregate stats from all peer connections
      for (const [userId, pc] of peerConnections) {
        if (pc.connectionState !== 'connected') continue

        const stats = await pc.getStats()
        const currentStats = new Map()

        stats.forEach((report) => {
          currentStats.set(report.id, report)
        })

        // Calculate RTT from ICE candidate pairs
        for (const [, report] of currentStats.entries()) {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            if (typeof report.currentRoundTripTime === 'number') {
              const rtt = report.currentRoundTripTime * 1000 // Convert to ms
              statsData.rtt = statsData.rtt === null ? rtt : Math.max(statsData.rtt, rtt)
            }
          }
        }

        // Calculate packet loss and bitrate from inbound RTP streams
        for (const [id, report] of currentStats.entries()) {
          if (report.type === 'inbound-rtp') {
            // Packet loss calculation
            if (typeof report.packetsLost === 'number' && typeof report.packetsReceived === 'number') {
              const totalPackets = report.packetsLost + report.packetsReceived
              if (totalPackets > 0) {
                const packetLossPercent = (report.packetsLost / totalPackets) * 100
                statsData.packetLoss = statsData.packetLoss === null
                  ? packetLossPercent
                  : Math.max(statsData.packetLoss, packetLossPercent)
              }
            }

            // Bitrate calculation
            const previousReport = previousStatsRef.current.get(id)
            if (previousReport && typeof report.bytesReceived === 'number') {
              const bytesDiff = report.bytesReceived - (previousReport.bytesReceived || 0)
              const timeDiff = report.timestamp - (previousReport.timestamp || 0)

              if (timeDiff > 0) {
                const bitrateKbps = (bytesDiff * 8) / (timeDiff) // Convert to Kbps
                statsData.bitrateKbps = statsData.bitrateKbps === null
                  ? bitrateKbps
                  : statsData.bitrateKbps + bitrateKbps
              }
            }

            // Video FPS (for video streams)
            if (report.kind === 'video' && typeof report.framesPerSecond === 'number') {
              statsData.framesPerSecond = statsData.framesPerSecond === null
                ? report.framesPerSecond
                : Math.max(statsData.framesPerSecond, report.framesPerSecond)
            }

            // Audio level (for audio streams)
            if (report.kind === 'audio' && typeof report.audioLevel === 'number') {
              statsData.audioLevel = statsData.audioLevel === null
                ? report.audioLevel
                : Math.max(statsData.audioLevel, report.audioLevel)
            }
          }
        }

        // Store current stats for next calculation
        previousStatsRef.current = currentStats
        validConnections++
      }

      // Calculate connection quality
      statsData.connectionQuality = calculateConnectionQuality(statsData)
      statsData.timestamp = Date.now()

      return statsData

    } catch (error) {
      logger.error('[useRtcStats] Failed to collect stats:', error)
      throw error
    }
  }, [client])

  // Start stats collection
  const startCollection = useCallback(() => {
    if (intervalRef.current || !client) return

    setState(prev => ({ ...prev, isCollecting: true, error: null }))

    const collect = async () => {
      try {
        const stats = await collectStats()
        setState(prev => {
          const newHistory = [...prev.history, stats].slice(-opts.maxHistorySize)
          return {
            ...prev,
            stats,
            history: newHistory,
            error: null
          }
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Stats collection failed'),
          isCollecting: false
        }))
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = undefined
        }
      }
    }

    // Collect immediately
    collect()

    // Set up interval
    intervalRef.current = setInterval(collect, opts.interval)
    logger.info(`[useRtcStats] Started stats collection (interval: ${opts.interval}ms)`)
  }, [client, collectStats, opts.interval, opts.maxHistorySize])

  // Stop stats collection
  const stopCollection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }

    setState(prev => ({ ...prev, isCollecting: false }))
    logger.info('[useRtcStats] Stopped stats collection')
  }, [])

  // Calculate average stats over last N samples
  const getAverageStats = useCallback((samples: number = 10): Partial<RtcStatsData> => {
    const recentHistory = state.history.slice(-samples)
    if (recentHistory.length === 0) return {}

    const totals = {
      rtt: 0,
      packetLoss: 0,
      bitrateKbps: 0,
      framesPerSecond: 0,
      audioLevel: 0
    }

    const counts = {
      rtt: 0,
      packetLoss: 0,
      bitrateKbps: 0,
      framesPerSecond: 0,
      audioLevel: 0
    }

    recentHistory.forEach(stats => {
      Object.keys(totals).forEach(key => {
        const value = stats[key as keyof typeof totals]
        if (value !== null && typeof value === 'number') {
          totals[key as keyof typeof totals] += value
          counts[key as keyof typeof counts]++
        }
      })
    })

    const averages: Partial<RtcStatsData> = {}
    Object.keys(totals).forEach(key => {
      const count = counts[key as keyof typeof counts]
      if (count > 0) {
        averages[key as keyof typeof totals] = totals[key as keyof typeof totals] / count
      }
    })

    return averages
  }, [state.history])

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }))
  }, [])

  // Auto-start collection when client becomes available
  useEffect(() => {
    if (opts.autoStart && client && client.getConnectionState() === 'connected') {
      startCollection()
    }

    return () => {
      stopCollection()
    }
  }, [client, opts.autoStart, startCollection, stopCollection])

  // Listen for connection state changes
  useEffect(() => {
    if (!client) return

    const handleConnectionState = (connectionState: string) => {
      if (connectionState === 'connected' && opts.autoStart) {
        startCollection()
      } else if (connectionState !== 'connected') {
        stopCollection()
      }
    }

    client.on('connection-state', handleConnectionState as any)

    return () => {
      client.off('connection-state', handleConnectionState as any)
    }
  }, [client, opts.autoStart, startCollection, stopCollection])

  return {
    ...state,
    startCollection,
    stopCollection,
    getAverageStats,
    clearHistory
  }
}