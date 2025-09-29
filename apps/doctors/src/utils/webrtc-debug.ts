/**
 * WebRTC Debug Utility
 * Provides detailed logging for WebRTC connections
 */

export class WebRTCDebugger {
  private prefix: string
  private enabled: boolean = true
  private logHistory: Array<{ timestamp: Date; message: string; data?: any }> = []

  constructor(role: 'doctor' | 'patient') {
    this.prefix = `[${role.toUpperCase()}]`

    // Expose globally for console access
    if (typeof window !== 'undefined') {
      (window as any).webrtcDebug = this
    }
  }

  private formatTime(): string {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
  }

  private log(level: 'info' | 'warn' | 'error' | 'success', message: string, data?: any) {
    if (!this.enabled) return

    const time = this.formatTime()
    const fullMessage = `${time} ${this.prefix} ${message}`

    // Store in history
    this.logHistory.push({
      timestamp: new Date(),
      message: fullMessage,
      data
    })

    // Keep only last 100 entries
    if (this.logHistory.length > 100) {
      this.logHistory = this.logHistory.slice(-100)
    }

    // Console output with styling
    const styles = {
      info: 'color: #3B82F6; font-weight: bold;',
      warn: 'color: #F59E0B; font-weight: bold;',
      error: 'color: #EF4444; font-weight: bold;',
      success: 'color: #10B981; font-weight: bold;'
    }

    console.log(`%c${fullMessage}`, styles[level], data || '')
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  success(message: string, data?: any) {
    this.log('success', message, data)
  }

  // Track detailed state
  logPeerConnection(pc: RTCPeerConnection | null, label: string = '') {
    if (!pc) {
      this.error(`${label} PeerConnection is null`)
      return
    }

    this.info(`${label} PeerConnection State:`, {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState
    })
  }

  logStream(stream: MediaStream | null, label: string = 'Stream') {
    if (!stream) {
      this.warn(`${label} is null`)
      return
    }

    const tracks = stream.getTracks()
    this.info(`${label} Analysis:`, {
      id: stream.id,
      active: stream.active,
      trackCount: tracks.length,
      tracks: tracks.map(track => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        id: track.id
      }))
    })
  }

  logSDP(description: RTCSessionDescription | null, type: 'offer' | 'answer') {
    if (!description) {
      this.warn(`${type} description is null`)
      return
    }

    const sdp = description.sdp
    const hasVideo = sdp.includes('m=video')
    const hasAudio = sdp.includes('m=audio')

    // Extract video codec
    const videoCodec = sdp.match(/a=rtpmap:\d+ ([^\/]+)\//)

    // Count ICE candidates
    const candidateCount = (sdp.match(/a=candidate/g) || []).length

    this.info(`SDP ${type.toUpperCase()} Analysis:`, {
      type: description.type,
      hasVideo,
      hasAudio,
      videoCodec: videoCodec?.[1] || 'unknown',
      candidateCount,
      sdpLength: sdp.length
    })

    // Log first few lines for quick check
    const lines = sdp.split('\n').slice(0, 10)
    console.groupCollapsed(`${this.prefix} SDP ${type} preview`)
    lines.forEach(line => console.log(line))
    console.groupEnd()
  }

  logTrackEvent(event: RTCTrackEvent) {
    const track = event.track
    const streams = event.streams

    this.success(`📹 TRACK RECEIVED:`, {
      kind: track.kind,
      id: track.id,
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      streamCount: streams.length,
      streamIds: streams.map(s => s.id)
    })

    if (streams[0]) {
      this.logStream(streams[0], 'Remote Stream from Track Event')
    }
  }

  logICECandidate(candidate: RTCIceCandidate | null, direction: 'sending' | 'receiving') {
    if (!candidate) return

    this.info(`ICE Candidate ${direction}:`, {
      protocol: candidate.protocol,
      type: candidate.type,
      address: candidate.address?.substring(0, 10) + '...',
      port: candidate.port,
      priority: candidate.priority,
      foundation: candidate.foundation?.substring(0, 10) + '...'
    })
  }

  // Comprehensive diagnostic
  async diagnose(pc: RTCPeerConnection | null): Promise<void> {
    console.group(`${this.prefix} 🔍 FULL DIAGNOSTIC`)

    if (!pc) {
      this.error('No PeerConnection to diagnose')
      console.groupEnd()
      return
    }

    // 1. Connection States
    console.log('%c📊 Connection States:', 'font-weight: bold; color: #6B7280;')
    this.logPeerConnection(pc)

    // 2. Local Streams/Tracks (Senders)
    console.log('%c📤 Outgoing Tracks (Senders):', 'font-weight: bold; color: #6B7280;')
    const senders = pc.getSenders()
    senders.forEach((sender, i) => {
      if (sender.track) {
        console.log(`  Sender ${i + 1}:`, {
          kind: sender.track.kind,
          enabled: sender.track.enabled,
          muted: sender.track.muted,
          readyState: sender.track.readyState,
          label: sender.track.label
        })
      } else {
        console.log(`  Sender ${i + 1}: No track`)
      }
    })

    // 3. Remote Streams/Tracks (Receivers)
    console.log('%c📥 Incoming Tracks (Receivers):', 'font-weight: bold; color: #6B7280;')
    const receivers = pc.getReceivers()
    receivers.forEach((receiver, i) => {
      if (receiver.track) {
        console.log(`  Receiver ${i + 1}:`, {
          kind: receiver.track.kind,
          enabled: receiver.track.enabled,
          muted: receiver.track.muted,
          readyState: receiver.track.readyState,
          id: receiver.track.id
        })
      } else {
        console.log(`  Receiver ${i + 1}: No track`)
      }
    })

    // 4. Get Stats
    console.log('%c📈 Connection Stats:', 'font-weight: bold; color: #6B7280;')
    try {
      const stats = await pc.getStats()
      const statsReport: any = {}

      stats.forEach(report => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          statsReport.connection = {
            roundTripTime: report.currentRoundTripTime,
            bytesReceived: report.bytesReceived,
            bytesSent: report.bytesSent
          }
        }
        if (report.type === 'inbound-rtp') {
          if (report.mediaType === 'video') {
            statsReport.videoInbound = {
              packetsReceived: report.packetsReceived,
              packetsLost: report.packetsLost,
              framesPerSecond: report.framesPerSecond,
              frameWidth: report.frameWidth,
              frameHeight: report.frameHeight
            }
          }
          if (report.mediaType === 'audio') {
            statsReport.audioInbound = {
              packetsReceived: report.packetsReceived,
              packetsLost: report.packetsLost
            }
          }
        }
        if (report.type === 'outbound-rtp') {
          if (report.mediaType === 'video') {
            statsReport.videoOutbound = {
              packetsSent: report.packetsSent,
              bytesSent: report.bytesSent,
              framesPerSecond: report.framesPerSecond
            }
          }
        }
      })

      console.table(statsReport)
    } catch (error) {
      this.error('Failed to get stats:', error)
    }

    // 5. Check Local and Remote Descriptions
    console.log('%c📝 Session Descriptions:', 'font-weight: bold; color: #6B7280;')
    if (pc.localDescription) {
      this.logSDP(pc.localDescription, 'offer')
    }
    if (pc.remoteDescription) {
      this.logSDP(pc.remoteDescription, 'answer')
    }

    console.groupEnd()
  }

  // Export logs for analysis
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2)
  }

  // Clear log history
  clearLogs() {
    this.logHistory = []
    console.clear()
    this.info('Logs cleared')
  }
}

// Helper function to create and attach debugger
export function attachWebRTCDebugger(pc: RTCPeerConnection, role: 'doctor' | 'patient'): WebRTCDebugger {
  const webrtcDebugger = new WebRTCDebugger(role)

  // Attach event listeners for automatic logging
  const originalOnTrack = pc.ontrack
  pc.ontrack = (event) => {
    webrtcDebugger.logTrackEvent(event)
    if (originalOnTrack) originalOnTrack(event)
  }

  const originalOnIceCandidate = pc.onicecandidate
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      webrtcDebugger.logICECandidate(event.candidate, 'sending')
    }
    if (originalOnIceCandidate) originalOnIceCandidate(event)
  }

  const originalOnConnectionStateChange = pc.onconnectionstatechange
  pc.onconnectionstatechange = () => {
    webrtcDebugger.info(`Connection state changed to: ${pc.connectionState}`)
    if (originalOnConnectionStateChange) originalOnConnectionStateChange()
  }

  const originalOnIceConnectionStateChange = pc.oniceconnectionstatechange
  pc.oniceconnectionstatechange = () => {
    webrtcDebugger.info(`ICE connection state changed to: ${pc.iceConnectionState}`)
    if (originalOnIceConnectionStateChange) originalOnIceConnectionStateChange()
  }

  return webrtcDebugger
}

// Console helper for quick diagnosis
export function quickDiagnosis() {
  console.log(`
  %c🔧 QUICK WEBRTC DIAGNOSIS

  Run these commands in console:

  1. Check if debugger is available:
     %cwebrtcDebug

  2. Run full diagnosis:
     %cwebrtcDebug.diagnose(peerConnectionRef.current)

  3. Export logs:
     %cwebrtcDebug.exportLogs()

  4. Check specific stream:
     %cwebrtcDebug.logStream(localVideoRef.current?.srcObject)

  5. Clear logs:
     %cwebrtcDebug.clearLogs()
  `,
    'color: #3B82F6; font-weight: bold; font-size: 14px;',
    'color: #10B981; font-family: monospace;',
    'color: #10B981; font-family: monospace;',
    'color: #10B981; font-family: monospace;',
    'color: #10B981; font-family: monospace;',
    'color: #10B981; font-family: monospace;'
  )
}
