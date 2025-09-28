/**
 * Signaling Factory - Creates appropriate signaling transport based on environment
 * Supports Node.js WebSocket and Cloudflare Durable Objects
 */

export type SignalingImplementation = 'node' | 'cloudflare' | 'auto'

export interface SignalingConfig {
  url: string
  implementation: SignalingImplementation
  reconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

export interface SignalingTransport {
  connect(): Promise<void>
  disconnect(): void
  send(message: any): void
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  isConnected(): boolean
  getImplementation(): SignalingImplementation
}

class NodeWebSocketTransport implements SignalingTransport {
  private ws: WebSocket | null = null
  private config: SignalingConfig
  private eventHandlers = new Map<string, Function[]>()
  private reconnectTimeout?: NodeJS.Timeout
  private heartbeatInterval?: NodeJS.Timeout
  private reconnectAttempts = 0

  constructor(config: SignalingConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...config
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('[NodeWebSocketTransport] Connected to', this.config.url)
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit('message', data)
          } catch (error) {
            console.error('[NodeWebSocketTransport] Failed to parse message:', error)
            this.emit('error', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('[NodeWebSocketTransport] Disconnected:', event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnected', event.code, event.reason)

          // Auto-reconnect if not intentional
          if (event.code !== 1000 && this.reconnectAttempts < (this.config.reconnectAttempts || 5)) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('[NodeWebSocketTransport] Error:', error)
          this.emit('error', error)
          reject(error)
        }

        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = undefined
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.emit('disconnected', 1000, 'Client disconnect')
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[NodeWebSocketTransport] Cannot send message - not connected')
      this.emit('error', new Error('Not connected'))
    }
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getImplementation(): SignalingImplementation {
    return 'node'
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`[NodeWebSocketTransport] Error in ${event} handler:`, error)
        }
      })
    }
  }

  private scheduleReconnect(): void {
    const delay = this.config.reconnectDelay! * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`[NodeWebSocketTransport] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[NodeWebSocketTransport] Reconnection failed:', error)
      })
    }, delay)
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval && this.config.heartbeatInterval > 0) {
      this.heartbeatInterval = setInterval(() => {
        if (this.isConnected()) {
          this.send({ type: 'ping', timestamp: Date.now() })
        }
      }, this.config.heartbeatInterval)
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }
}

class CloudflareTransport implements SignalingTransport {
  private ws: WebSocket | null = null
  private config: SignalingConfig
  private eventHandlers = new Map<string, Function[]>()
  private reconnectTimeout?: NodeJS.Timeout
  private reconnectAttempts = 0

  constructor(config: SignalingConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      ...config
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Cloudflare Durable Objects WebSocket URL
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('[CloudflareTransport] Connected to Durable Object:', this.config.url)
          this.reconnectAttempts = 0
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit('message', data)
          } catch (error) {
            console.error('[CloudflareTransport] Failed to parse message:', error)
            this.emit('error', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('[CloudflareTransport] Disconnected:', event.code, event.reason)
          this.emit('disconnected', event.code, event.reason)

          // Auto-reconnect if not intentional
          if (event.code !== 1000 && this.reconnectAttempts < (this.config.reconnectAttempts || 5)) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('[CloudflareTransport] Error:', error)
          this.emit('error', error)
          reject(error)
        }

        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = undefined
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.emit('disconnected', 1000, 'Client disconnect')
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[CloudflareTransport] Cannot send message - not connected')
      this.emit('error', new Error('Not connected'))
    }
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getImplementation(): SignalingImplementation {
    return 'cloudflare'
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`[CloudflareTransport] Error in ${event} handler:`, error)
        }
      })
    }
  }

  private scheduleReconnect(): void {
    const delay = this.config.reconnectDelay! * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`[CloudflareTransport] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[CloudflareTransport] Reconnection failed:', error)
      })
    }, delay)
  }
}

/**
 * Create signaling transport based on environment configuration
 */
export function createSignalingTransport(config: SignalingConfig): SignalingTransport {
  let implementation = config.implementation

  // Auto-detect implementation if set to 'auto'
  if (implementation === 'auto') {
    if (config.url.includes('workers.dev') || config.url.includes('cloudflare')) {
      implementation = 'cloudflare'
    } else {
      implementation = 'node'
    }
  }

  console.log(`[SignalingFactory] Creating ${implementation} transport for ${config.url}`)

  switch (implementation) {
    case 'cloudflare':
      return new CloudflareTransport(config)
    case 'node':
    default:
      return new NodeWebSocketTransport(config)
  }
}

/**
 * Get signaling configuration from environment variables
 */
export function getSignalingConfigFromEnv(): SignalingConfig {
  // Default to the existing signaling server URL from webrtc-client.ts
  const defaultUrl = 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling'

  const url = typeof window !== 'undefined'
    ? (window as any).ENV?.NEXT_PUBLIC_WEBRTC_SIGNALING_URL || defaultUrl
    : process.env.NEXT_PUBLIC_WEBRTC_SIGNALING_URL || defaultUrl

  const implementation = (typeof window !== 'undefined'
    ? (window as any).ENV?.NEXT_PUBLIC_SIGNALING_IMPL
    : process.env.NEXT_PUBLIC_SIGNALING_IMPL) as SignalingImplementation || 'auto'

  return {
    url,
    implementation,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000
  }
}

/**
 * Create signaling transport using environment configuration
 */
export function createSignalingTransportFromEnv(): SignalingTransport {
  const config = getSignalingConfigFromEnv()
  return createSignalingTransport(config)
}