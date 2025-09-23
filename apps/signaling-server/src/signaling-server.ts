import http from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import type { AddressInfo } from 'node:net'

import { env } from './env.js'
import { logger } from './logger.js'
import { validateJoinPayload, type SignalingEnvelope } from './validation.js'

interface ConnectedClient {
  id: string
  ws: WebSocket
  roomId: string
  userType: 'doctor' | 'patient' | 'unknown'
}

export class SignalingServer {
  private readonly httpServer: http.Server
  private readonly wss: WebSocketServer
  private readonly rooms: Map<string, Set<ConnectedClient>> = new Map()
  private readonly clients: Map<WebSocket, ConnectedClient> = new Map()

  constructor() {
    this.httpServer = http.createServer(this.requestHandler)
    this.wss = new WebSocketServer({ server: this.httpServer, path: env.SIGNALING_PATH })

    this.httpServer.on('listening', () => {
      const address = this.httpServer.address() as AddressInfo
      logger.info('signaling-server listening', {
        host: address.address,
        port: address.port,
        path: env.SIGNALING_PATH,
      })
    })

    this.setupWebSocket()
  }

  listen(): void {
    this.httpServer.listen(env.SIGNALING_PORT, env.SIGNALING_HOST)
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss.close((wsError) => {
        if (wsError) {
          reject(wsError)
          return
        }

        this.httpServer.close((httpError) => {
          if (httpError) {
            reject(httpError)
          } else {
            resolve()
          }
        })
      })
    })
  }

  private readonly requestHandler: http.RequestListener = (req, res) => {
    if (!req.url) {
      res.writeHead(400)
      res.end('Bad request')
      return
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }))
      return
    }

    if (req.url === '/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(this.collectStats()))
      return
    }

    res.writeHead(404)
    res.end('Not found')
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws, req) => {
      logger.info('connection:open', { ip: req.socket.remoteAddress })

      ws.on('message', (raw) => {
        try {
          const envelope = JSON.parse(raw.toString()) as SignalingEnvelope
          this.handleEnvelope(ws, envelope)
        } catch (error) {
          logger.warn('message:invalid', { error })
          ws.send(JSON.stringify({ type: 'error', data: 'Invalid message payload' }))
        }
      })

      ws.on('close', () => {
        this.disconnect(ws)
      })

      ws.on('error', (error) => {
        logger.error('connection:error', { error })
        this.disconnect(ws)
      })
    })
  }

  private handleEnvelope(ws: WebSocket, envelope: SignalingEnvelope): void {
    switch (envelope.type) {
      case 'join': {
        const result = validateJoinPayload(envelope)
        if (!result.success) {
          ws.send(
            JSON.stringify({
              type: 'error',
              data: 'join payload invalid',
              details: result.error.flatten(),
            }),
          )
          return
        }

        this.registerClient(ws, result.data.roomId, result.data.from, result.data.data.userType)
        this.broadcast(result.data.roomId, {
          type: 'user-joined',
          from: result.data.from,
          roomId: result.data.roomId,
          data: { userType: result.data.data.userType },
        }, ws)
        break
      }
      case 'leave': {
        this.disconnect(ws)
        break
      }
      case 'offer':
      case 'answer':
      case 'ice-candidate': {
        const client = this.clients.get(ws)
        if (!client) {
          ws.send(JSON.stringify({ type: 'error', data: 'Not joined' }))
          return
        }
        this.forwardToTarget(client, envelope)
        break
      }
      default: {
        ws.send(JSON.stringify({ type: 'error', data: `Unsupported message type: ${envelope.type}` }))
      }
    }
  }

  private registerClient(ws: WebSocket, roomId: string, userId: string, userType: ConnectedClient['userType']): void {
    const previous = this.clients.get(ws)
    if (previous) {
      this.removeFromRoom(previous)
    }

    const client: ConnectedClient = { id: userId, ws, roomId, userType }
    this.clients.set(ws, client)

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId)!.add(client)

    logger.info('room:join', { roomId, userId, userType, peers: this.rooms.get(roomId)!.size })
  }

  private forwardToTarget(sender: ConnectedClient, envelope: SignalingEnvelope): void {
    const room = this.rooms.get(sender.roomId)
    if (!room) return

    const message = { ...envelope, roomId: sender.roomId, from: sender.id }

    if (envelope.to) {
      const target = [...room].find((client) => client.id === envelope.to)
      if (target && target.ws.readyState === WebSocket.OPEN) {
        target.ws.send(JSON.stringify(message))
      }
      return
    }

    for (const client of room) {
      if (client.ws === sender.ws || client.ws.readyState !== WebSocket.OPEN) continue
      client.ws.send(JSON.stringify(message))
    }
  }

  private disconnect(ws: WebSocket): void {
    const client = this.clients.get(ws)
    if (!client) return

    this.removeFromRoom(client)
    this.clients.delete(ws)

    this.broadcast(client.roomId, {
      type: 'user-left',
      from: client.id,
      roomId: client.roomId,
      data: { userType: client.userType },
    }, ws)

    logger.info('room:leave', { roomId: client.roomId, userId: client.id })
  }

  private removeFromRoom(client: ConnectedClient): void {
    const room = this.rooms.get(client.roomId)
    if (!room) return

    room.delete(client)
    if (room.size === 0) {
      this.rooms.delete(client.roomId)
    }
  }

  private broadcast(roomId: string, message: SignalingEnvelope, exclude?: WebSocket): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    const payload = JSON.stringify(message)
    for (const client of room) {
      if (client.ws === exclude || client.ws.readyState !== WebSocket.OPEN) continue
      client.ws.send(payload)
    }
  }

  private collectStats() {
    const stats = {
      rooms: this.rooms.size,
      clients: this.clients.size,
      details: {} as Record<string, number>,
    }

    for (const [roomId, clients] of this.rooms.entries()) {
      stats.details[roomId] = clients.size
    }

    return stats
  }
}
