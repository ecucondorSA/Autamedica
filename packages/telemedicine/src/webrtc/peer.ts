import { getClientEnvOrDefault } from '@autamedica/shared'
import type { SignalingClient } from '../signaling/client'

// WebRTC peer connection manager
export class WebRTCPeer {
  private pc: RTCPeerConnection
  private signaling: SignalingClient
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private isInitiator: boolean
  private listeners: Map<string, Set<(event: any) => void>> = new Map()

  constructor(signaling: SignalingClient, isInitiator = false) {
    this.signaling = signaling
    this.isInitiator = isInitiator

    // Parse ICE servers from environment
    const iceServers = this.parseIceServers()

    this.pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10
    })

    this.setupPeerConnection()
    this.setupSignalingHandlers()
  }

  private parseIceServers(): RTCIceServer[] {
    try {
      const iceServersStr = getClientEnvOrDefault('NEXT_PUBLIC_ICE_SERVERS', '[]')
      const parsed = JSON.parse(iceServersStr)
      if (Array.isArray(parsed)) return parsed
      console.warn('[WebRTCPeer] NEXT_PUBLIC_ICE_SERVERS must be a JSON array; falling back to default')
    } catch (error) {
      console.error('[WebRTCPeer] Failed to parse NEXT_PUBLIC_ICE_SERVERS:', error)
    }

    // Default ICE servers
    return [
      { urls: ['stun:stun.l.google.com:19302'] }
    ]
  }

  private setupPeerConnection() {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendToRoom({
          type: 'candidate',
          candidate: event.candidate
        })
      }
    }

    this.pc.onconnectionstatechange = () => {
      console.log('[WebRTCPeer] Connection state:', this.pc.connectionState)
      this.emit('connectionstatechange', { state: this.pc.connectionState })

      if (this.pc.connectionState === 'connected') {
        this.emit('connected')
      } else if (this.pc.connectionState === 'failed') {
        this.emit('failed')
      }
    }

    this.pc.oniceconnectionstatechange = () => {
      console.log('[WebRTCPeer] ICE connection state:', this.pc.iceConnectionState)
      this.emit('iceconnectionstatechange', { state: this.pc.iceConnectionState })
    }

    this.pc.ontrack = (event) => {
      console.log('[WebRTCPeer] Received remote track')

      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
      }

      // Add tracks to remote stream
      event.streams[0]?.getTracks().forEach(track => {
        if (this.remoteStream && !this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track)
        }
      })

      this.emit('remotestream', { stream: this.remoteStream })
    }
  }

  private setupSignalingHandlers() {
    this.signaling.onRoomMessage(async (message) => {
      try {
        switch (message.type) {
          case 'offer':
            await this.handleOffer(message.sdp)
            break
          case 'answer':
            await this.handleAnswer(message.sdp)
            break
          case 'candidate':
            await this.handleCandidate(message.candidate)
            break
        }
      } catch (error) {
        console.error('[WebRTCPeer] Error handling signaling message:', error)
        this.emit('error', { error })
      }
    })
  }

  async startCall(): Promise<void> {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      })

      this.localStream = stream
      this.emit('localstream', { stream })

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        this.pc.addTrack(track, stream)
      })

      // If initiator, create offer
      if (this.isInitiator) {
        await this.createOffer()
      }

    } catch (error) {
      console.error('[WebRTCPeer] Failed to start call:', error)
      this.emit('error', { error })
      throw error
    }
  }

  private async createOffer(): Promise<void> {
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    this.signaling.sendToRoom({
      type: 'offer',
      sdp: offer.sdp!
    })
  }

  private async handleOffer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'offer', sdp })

    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)

    this.signaling.sendToRoom({
      type: 'answer',
      sdp: answer.sdp!
    })
  }

  private async handleAnswer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'answer', sdp })
  }

  private async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    await this.pc.addIceCandidate(candidate)
  }

  hangup(): void {
    // Stop local tracks
    this.localStream?.getTracks().forEach(track => track.stop())

    // Close peer connection
    this.pc.close()

    // Clear streams
    this.localStream = null
    this.remoteStream = null

    this.emit('hangup')
  }

  // Event handling
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data?: any) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Getters
  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState
  }

  get iceConnectionState(): RTCIceConnectionState {
    return this.pc.iceConnectionState
  }

  get localMediaStream(): MediaStream | null {
    return this.localStream
  }

  get remoteMediaStream(): MediaStream | null {
    return this.remoteStream
  }

  // Statistics
  async getStats(): Promise<RTCStatsReport> {
    return await this.pc.getStats()
  }

  async getSelectedCandidatePair(): Promise<RTCIceCandidatePairStats | null> {
    const stats = await this.getStats()
    let selected: RTCIceCandidatePairStats | null = null

    stats.forEach((report) => {
      if (report.type === 'candidate-pair' && (report as RTCIceCandidatePairStats).state === 'succeeded') {
        selected = report as RTCIceCandidatePairStats
      }
    })

    return selected
  }
}