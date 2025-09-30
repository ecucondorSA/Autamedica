/**
 * HTTP-based WebRTC Client for AltaMedica Telemedicine
 * Uses fetch and polling instead of WebSockets for better reliability
 */

export interface HttpWebRTCConfig {
  signalingUrl: string
  iceServers: RTCIceServer[]
  roomId?: string
  userId: string
  userType: 'doctor' | 'patient' | 'nurse'
  pollInterval?: number // milliseconds
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed' | 'closed'

export interface HttpWebRTCEvents {
  'connection-state': (state: ConnectionState) => void
  'remote-stream': (stream: MediaStream, userId: string) => void
  'local-stream': (stream: MediaStream) => void
  'user-joined': (userId: string, userType: string) => void
  'user-left': (userId: string) => void
  'error': (error: Error) => void
}

export class HttpWebRTCClient {
  private peerConnections = new Map<string, RTCPeerConnection>()
  private localStream: MediaStream | null = null
  private config: HttpWebRTCConfig
  private eventListeners = new Map<keyof HttpWebRTCEvents, Function[]>()
  private connectionState: ConnectionState = 'disconnected'
  private pollTimer: number | null = null
  private lastPollTimestamp = 0
  private isPolling = false

  // Default ICE servers (using public STUN servers)
  private static readonly DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]

  constructor(config: Partial<HttpWebRTCConfig> & { userId: string; userType: 'doctor' | 'patient' | 'nurse' }) {
    this.config = {
      signalingUrl: 'https://autamedica-http-signaling-server.ecucondor.workers.dev',
      iceServers: HttpWebRTCClient.DEFAULT_ICE_SERVERS,
      roomId: 'default-room',
      pollInterval: 1000, // Poll every second
      ...config
    }
  }

  // Event listener methods
  on<T extends keyof HttpWebRTCEvents>(event: T, listener: HttpWebRTCEvents[T]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off<T extends keyof HttpWebRTCEvents>(event: T, listener: HttpWebRTCEvents[T]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit<T extends keyof HttpWebRTCEvents>(event: T, ...args: Parameters<HttpWebRTCEvents[T]>): void {
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

      // Join the room via HTTP API
      const joinResponse = await fetch(`${this.config.signalingUrl}/api/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: finalRoomId,
          userId: this.config.userId,
          userType: this.config.userType
        })
      })

      if (!joinResponse.ok) {
        throw new Error(`Join failed: ${joinResponse.status}`)
      }

      const joinData = await joinResponse.json()

      if (!joinData.success) {
        throw new Error(`Join failed: ${joinData.error}`)
      }

      console.log('Successfully joined room:', finalRoomId)

      // Process existing users in the room
      if (joinData.roomState?.users) {
        for (const user of joinData.roomState.users) {
          this.emit('user-joined', user.userId, user.userType)
        }
      }

      this.setConnectionState('connected')

      // Start polling for messages
      this.startPolling()

    } catch (error) {
      console.error('Connection failed:', error)
      this.setConnectionState('failed')
      this.emit('error', error as Error)
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

    // Stop polling
    this.stopPolling()

    // Leave room via HTTP API
    if (this.config.roomId) {
      try {
        await fetch(`${this.config.signalingUrl}/api/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roomId: this.config.roomId,
            userId: this.config.userId
          })
        })
      } catch (error) {
        console.error('Error leaving room:', error)
      }
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

  private startPolling(): void {
    if (this.isPolling) return

    this.isPolling = true
    this.lastPollTimestamp = Date.now()

    const poll = async () => {
      if (!this.isPolling || this.connectionState !== 'connected') {
        return
      }

      try {
        const response = await fetch(
          `${this.config.signalingUrl}/api/poll?roomId=${encodeURIComponent(this.config.roomId!)}&userId=${encodeURIComponent(this.config.userId)}&since=${this.lastPollTimestamp}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          this.lastPollTimestamp = data.timestamp

          // Process messages
          for (const message of data.messages) {
            await this.handleSignalingMessage(message)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        // Don't emit error for polling failures - just retry
      }

      // Schedule next poll
      this.pollTimer = window.setTimeout(poll, this.config.pollInterval!)
    }

    // Start polling immediately
    poll()
  }

  private stopPolling(): void {
    this.isPolling = false
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    }
  }

  private async sendSignalingMessage(message: any): Promise<void> {
    try {
      const response = await fetch(`${this.config.signalingUrl}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: this.config.roomId,
          from: this.config.userId,
          ...message
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send signaling message:', error)
      this.emit('error', error as Error)
    }
  }

  private async handleSignalingMessage(message: any): Promise<void> {
    console.log('Received signaling message:', message)

    switch (message.type) {
      case 'user-joined':
        this.emit('user-joined', message.from, message.data?.userType || 'unknown')
        // Create offer for the new user if we have local stream
        if (this.localStream) {
          await this.createPeerConnection(message.from, true)
        }
        break

      case 'user-left': {
        this.emit('user-left', message.from)
        const pc = this.peerConnections.get(message.from)
        if (pc) {
          pc.close()
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

      default:
        console.warn('Unknown message type:', message.type)
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
      const stream = event.streams?.[0]
      if (stream) {
        this.emit('remote-stream', stream, userId)
      }
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

  // Keep-alive ping
  async ping(): Promise<void> {
    if (this.connectionState === 'connected') {
      try {
        await fetch(`${this.config.signalingUrl}/api/ping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.config.userId
          })
        })
      } catch (error) {
        console.error('Ping failed:', error)
      }
    }
  }
}