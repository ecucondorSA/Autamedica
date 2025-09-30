/**
 * WebRTC Client for AltaMedica Telemedicine
 * Handles peer-to-peer video/audio connections with signaling server
 */

import { loadIceServers } from './config/ice-servers'

export interface WebRTCConfig {
  signalingUrl: string
  iceServers: RTCIceServer[]
  roomId?: string
  userId: string
  userType: 'doctor' | 'patient' | 'nurse'
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed' | 'closed'

export interface WebRTCEvents {
  'connection-state': (state: ConnectionState) => void
  'remote-stream': (stream: MediaStream, userId: string) => void
  'local-stream': (stream: MediaStream) => void
  'user-joined': (userId: string, userType: string) => void
  'user-left': (userId: string) => void
  'error': (error: Error) => void
}

interface PeerState {
  pc: RTCPeerConnection
  pendingIceCandidates: RTCIceCandidateInit[]
  isMakingOffer: boolean
  isSettingRemoteAnswerPending: boolean
  ignoreOffer: boolean
  isPolite: boolean
}

export class WebRTCClient {
  private ws: WebSocket | null = null
  private peerConnections = new Map<string, PeerState>()
  private localStream: MediaStream | null = null
  private config: WebRTCConfig
  private eventListeners = new Map<keyof WebRTCEvents, Function[]>()
  private connectionState: ConnectionState = 'disconnected'

  // Default ICE servers (using public STUN servers)
  private static readonly DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]

  constructor(config: Partial<WebRTCConfig> & { userId: string; userType: 'doctor' | 'patient' | 'nurse' }) {
    // Use environment-configured ICE servers or fallback to defaults
    const iceServers = config.iceServers || loadIceServers() || WebRTCClient.DEFAULT_ICE_SERVERS

    this.config = {
      signalingUrl: 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling',
      iceServers,
      roomId: 'default-room',
      ...config
    }
  }

  // Event listener methods
  on<T extends keyof WebRTCEvents>(event: T, listener: WebRTCEvents[T]): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)

    // Return unsubscribe function
    return () => {
      this.off(event, listener)
    }
  }

  off<T extends keyof WebRTCEvents>(event: T, listener: WebRTCEvents[T]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit<T extends keyof WebRTCEvents>(event: T, ...args: Parameters<WebRTCEvents[T]>): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          // @ts-ignore
          listener(...args)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state
      this.emit('connection-state', state)
    }
  }

  async connect(roomId?: string): Promise<void> {
    if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
      return
    }

    this.setConnectionState('connecting')

    try {
      const finalRoomId = roomId || this.config.roomId!
      const wsUrl = `${this.config.signalingUrl}?roomId=${encodeURIComponent(finalRoomId)}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        // Join the room
        this.sendSignalingMessage({
          type: 'join',
          from: this.config.userId,
          data: { userType: this.config.userType }
        })
      }

      this.ws.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data))
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.setConnectionState('failed')
        this.emit('error', new Error('WebSocket connection failed'))
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.setConnectionState('disconnected')
        this.cleanup()
      }

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        const originalOnOpen = this.ws!.onopen
        this.ws!.onopen = (event) => {
          clearTimeout(timeout)
          originalOnOpen?.call(this.ws!, event)
          resolve()
        }

        const originalOnError = this.ws!.onerror
        this.ws!.onerror = (error) => {
          clearTimeout(timeout)
          originalOnError?.call(this.ws!, error)
          reject(new Error('WebSocket connection failed'))
        }
      })

    } catch (error) {
      this.setConnectionState('failed')
      throw error
    }
  }

  async startLocalStream(constraints: MediaConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.emit('local-stream', this.localStream)

      // Add tracks to all existing peer connections
      for (const [, peerState] of this.peerConnections) {
        this.attachLocalTracks(peerState.pc)
      }

      return this.localStream
    } catch (error) {
      console.error('Failed to get local stream:', error)
      this.emit('error', new Error('Failed to access camera/microphone'))
      throw error
    }
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
  }

  async disconnect(): Promise<void> {
    this.setConnectionState('disconnected')

    if (this.ws) {
      this.sendSignalingMessage({ type: 'leave' })
      this.ws.close()
      this.ws = null
    }

    this.cleanup()
  }

  private cleanup(): void {
    // Close all peer connections
    for (const [, peerState] of this.peerConnections) {
      peerState.pc.close()
    }
    this.peerConnections.clear()

    // Stop local stream
    this.stopLocalStream()
  }

  private sendSignalingMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private async handleSignalingMessage(message: any): Promise<void> {
    console.log('Received signaling message:', message)

    switch (message.type) {
      case 'room-state':
        // Handle initial room state
        for (const user of message.data.users) {
          this.emit('user-joined', user.id, user.userType)
        }
        this.setConnectionState('connected')
        break

      case 'user-joined':
        this.emit('user-joined', message.from, message.data.userType)
        this.ensurePeerConnection(message.from)
        break

      case 'user-left': {
        this.emit('user-left', message.from)
        const peerState = this.peerConnections.get(message.from)
        if (peerState) {
          peerState.pc.close()
          this.peerConnections.delete(message.from)
        }
        break
      }

      case 'offer':
        await this.handleOffer(message.from, message.data)
        break

      case 'answer':
        await this.handleAnswer(message.from, message.data)
        break

      case 'ice-candidate':
        await this.handleIceCandidate(message.from, message.data)
        break

      case 'error':
        console.error('Signaling error:', message.data)
        this.emit('error', new Error(message.data))
        break
    }
  }

  private ensurePeerConnection(userId: string): PeerState {
    let peerState = this.peerConnections.get(userId)
    if (peerState) {
      return peerState
    }

    const pc = new RTCPeerConnection({ iceServers: this.config.iceServers })
    const isPolite = this.config.userType !== 'doctor'

    peerState = {
      pc,
      pendingIceCandidates: [],
      isMakingOffer: false,
      isSettingRemoteAnswerPending: false,
      ignoreOffer: false,
      isPolite
    }

    pc.ontrack = (event) => {
      console.log('Received remote stream from', userId)
      const stream = event.streams?.[0]
      if (stream) {
        this.emit('remote-stream', stream, userId)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          to: userId,
          data: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log(`Peer connection with ${userId} state:`, pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.peerConnections.delete(userId)
      }
    }

    pc.onnegotiationneeded = async () => {
      if (!peerState || peerState.isPolite) {
        return
      }

      try {
        peerState!.isMakingOffer = true
        await pc.setLocalDescription()

        if (pc.localDescription) {
          this.sendSignalingMessage({
            type: 'offer',
            to: userId,
            data: pc.localDescription
          })
        }
      } catch (error) {
        console.error('Failed to handle negotiationneeded:', error)
      } finally {
        if (peerState) {
          peerState.isMakingOffer = false
        }
      }
    }

    this.attachLocalTracks(pc)

    this.peerConnections.set(userId, peerState)
    return peerState
  }

  private attachLocalTracks(pc: RTCPeerConnection): void {
    const stream = this.localStream
    if (!stream) return

    const existingTrackIds = new Set(
      pc.getSenders()
        .map(sender => sender.track?.id)
        .filter((id): id is string => Boolean(id))
    )

    stream.getTracks().forEach(track => {
      if (!existingTrackIds.has(track.id)) {
        pc.addTrack(track, stream)
      }
    })
  }

  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerState = this.ensurePeerConnection(userId)
    const { pc } = peerState

    const offerCollision = peerState.isMakingOffer || pc.signalingState !== 'stable'

    peerState.ignoreOffer = !peerState.isPolite && offerCollision
    if (peerState.ignoreOffer) {
      console.warn('Ignoring offer due to collision (impolite peer)')
      return
    }

    try {
      if (offerCollision) {
        console.log('Offer collision detected, rolling back local description')
        await pc.setLocalDescription({ type: 'rollback' })
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      this.attachLocalTracks(pc)

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      this.sendSignalingMessage({
        type: 'answer',
        to: userId,
        data: answer
      })

      await this.flushPendingIceCandidates(peerState)
      peerState.ignoreOffer = false
    } catch (error) {
      console.error('Failed to handle offer:', error)
    }
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerState = this.peerConnections.get(userId)
    if (!peerState) return

    try {
      peerState.isSettingRemoteAnswerPending = true
      await peerState.pc.setRemoteDescription(new RTCSessionDescription(answer))
      await this.flushPendingIceCandidates(peerState)
    } catch (error) {
      console.error('Failed to handle answer:', error)
    } finally {
      peerState.isSettingRemoteAnswerPending = false
      peerState.ignoreOffer = false
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerState = this.ensurePeerConnection(userId)
    const { pc } = peerState

    if (pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error('Failed to add ICE candidate:', error)
      }
    } else {
      console.log('Remote description not set yet, queuing ICE candidate')
      peerState.pendingIceCandidates.push(candidate)
    }
  }

  private async flushPendingIceCandidates(peerState: PeerState): Promise<void> {
    if (!peerState.pc.remoteDescription) {
      return
    }

    while (peerState.pendingIceCandidates.length > 0) {
      const candidateInit = peerState.pendingIceCandidates.shift()!
      try {
        await peerState.pc.addIceCandidate(new RTCIceCandidate(candidateInit))
      } catch (error) {
        console.error('Failed to add queued ICE candidate:', error)
      }
    }
  }

  // Utility methods
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getPeerConnections(): Map<string, RTCPeerConnection> {
    const map = new Map<string, RTCPeerConnection>()
    for (const [userId, peerState] of this.peerConnections) {
      map.set(userId, peerState.pc)
    }
    return map
  }

  // Media control methods
  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled
      return videoTrack.enabled
    }
    return false
  }

  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  isVideoEnabled(): boolean {
    if (!this.localStream) return false
    const videoTrack = this.localStream.getVideoTracks()[0]
    return videoTrack ? videoTrack.enabled : false
  }

  isAudioEnabled(): boolean {
    if (!this.localStream) return false
    const audioTrack = this.localStream.getAudioTracks()[0]
    return audioTrack ? audioTrack.enabled : false
  }
}
