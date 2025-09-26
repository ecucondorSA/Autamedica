/**
 * WebRTC Client for AltaMedica Telemedicine
 * Handles peer-to-peer video/audio connections with signaling server
 */

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

export class WebRTCClient {
  private ws: WebSocket | null = null
  private peerConnections = new Map<string, RTCPeerConnection>()
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
    this.config = {
      signalingUrl: 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling',
      iceServers: WebRTCClient.DEFAULT_ICE_SERVERS,
      roomId: 'default-room',
      ...config
    }
  }

  // Event listener methods
  on<T extends keyof WebRTCEvents>(event: T, listener: WebRTCEvents[T]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
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
      for (const [userId, pc] of this.peerConnections) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream!)
        })
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
    for (const [userId, pc] of this.peerConnections) {
      pc.close()
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
        // Create offer for the new user if we have local stream
        if (this.localStream) {
          await this.createPeerConnection(message.from, true)
        }
        break

      case 'user-left':
        this.emit('user-left', message.from)
        const pc = this.peerConnections.get(message.from)
        if (pc) {
          pc.close()
          this.peerConnections.delete(message.from)
        }
        break

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

  private async createPeerConnection(userId: string, createOffer: boolean): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection({ iceServers: this.config.iceServers })

    // Add local stream tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream from', userId)
      this.emit('remote-stream', event.streams[0], userId)
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          to: userId,
          data: event.candidate
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer connection with ${userId} state:`, pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.peerConnections.delete(userId)
      }
    }

    this.peerConnections.set(userId, pc)

    // Create offer if requested
    if (createOffer) {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      this.sendSignalingMessage({
        type: 'offer',
        to: userId,
        data: offer
      })
    }

    return pc
  }

  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.createPeerConnection(userId, false)

    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    this.sendSignalingMessage({
      type: 'answer',
      to: userId,
      data: answer
    })
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(userId)
    if (pc) {
      await pc.setRemoteDescription(answer)
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(userId)
    if (pc) {
      await pc.addIceCandidate(candidate)
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
    return new Map(this.peerConnections)
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