import { ensureClientEnv } from '@autamedica/shared'
import type { WSMessage, ControlMessage, SignalingMessage } from '../calls/types'

// WebSocket signaling client
export class SignalingClient {
  private ws: WebSocket | null = null
  private userId: string
  private roomId?: string
  private userType: 'doctor' | 'patient'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageQueue: WSMessage[] = []
  private listeners: Map<string, Set<(message: any) => void>> = new Map()

  constructor(userId: string, userType: 'doctor' | 'patient', roomId?: string) {
    this.userId = userId
    this.userType = userType
    this.roomId = roomId
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const signalingUrl = ensureClientEnv('NEXT_PUBLIC_SIGNALING_URL')
        let wsUrl = `${signalingUrl}?userId=${this.userId}&userType=${this.userType}`

        if (this.roomId) {
          wsUrl += `&roomId=${this.roomId}`
        }

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('[SignalingClient] Connected')
          this.reconnectAttempts = 0

          // Send queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift()!
            this.send(message)
          }

          resolve()
        }

        this.ws.onclose = (event) => {
          console.log('[SignalingClient] Disconnected:', event.code, event.reason)

          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            setTimeout(() => {
              console.log(`[SignalingClient] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
              this.connect()
            }, 1000 * this.reconnectAttempts)
          }
        }

        this.ws.onerror = (error) => {
          console.error('[SignalingClient] Error:', error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[SignalingClient] Failed to parse message:', error)
          }
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  send(message: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is ready
      this.messageQueue.push(message)
    }
  }

  // Control messages (user channel)
  sendToUser(toUserId: string, message: ControlMessage) {
    this.send({
      ...message,
      toUserId
    })
  }

  // Room messages (WebRTC signaling)
  sendToRoom(message: SignalingMessage) {
    this.send({
      ...message,
      from: this.userId
    })
  }

  // Join a room for WebRTC signaling
  joinRoom(roomId: string) {
    this.roomId = roomId
    this.send({
      type: 'join',
      roomId,
      userId: this.userId
    })
  }

  // Leave current room
  leaveRoom() {
    if (this.roomId) {
      this.send({
        type: 'leave',
        roomId: this.roomId,
        userId: this.userId
      })
      this.roomId = undefined
    }
  }

  // Event listeners
  on(event: string, callback: (message: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: string, callback: (message: any) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  private handleMessage(message: WSMessage) {
    console.log('[SignalingClient] Received:', message)

    // Emit to specific event listeners
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => callback(message))
    }

    // Emit to general message listeners
    const generalListeners = this.listeners.get('message')
    if (generalListeners) {
      generalListeners.forEach(callback => callback(message))
    }
  }

  // Convenience methods for common events
  onUserMessage(callback: (message: ControlMessage) => void) {
    return this.on('message', (message) => {
      // Filter for control messages sent to this user
      if (['invite', 'accept', 'decline', 'cancel', 'end'].includes(message.type)) {
        callback(message as ControlMessage)
      }
    })
  }

  onRoomMessage(callback: (message: SignalingMessage) => void) {
    return this.on('message', (message) => {
      // Filter for room signaling messages
      if (['join', 'leave', 'offer', 'answer', 'candidate'].includes(message.type)) {
        callback(message as SignalingMessage)
      }
    })
  }

  // Check connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

// React hook for using signaling client
export function createSignalingClient(userId: string, userType: 'doctor' | 'patient', roomId?: string): SignalingClient {
  return new SignalingClient(userId, userType, roomId)
}