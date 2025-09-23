import http from 'node:http'
import { createHash } from 'node:crypto'
import { env } from './env.js'
import { logger } from './logger.js'
import { validateJoinPayload } from './validation.js'

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

function computeAcceptValue(key) {
  return createHash('sha1').update(key + GUID).digest('base64')
}

function encodeFrame(payload) {
  const data = Buffer.from(payload)
  const length = data.length
  let header

  if (length < 126) {
    header = Buffer.alloc(2)
    header[1] = length
  } else if (length < 65536) {
    header = Buffer.alloc(4)
    header[1] = 126
    header.writeUInt16BE(length, 2)
  } else {
    header = Buffer.alloc(10)
    header[1] = 127
    header.writeBigUInt64BE(BigInt(length), 2)
  }

  header[0] = 0x80 | 0x01
  return Buffer.concat([header, data])
}

function decodeFrames(buffer, onFrame) {
  let offset = 0

  while (offset + 2 <= buffer.length) {
    const firstByte = buffer[offset]
    const opcode = firstByte & 0x0f
    const isFinal = (firstByte & 0x80) !== 0
    const secondByte = buffer[offset + 1]
    const isMasked = (secondByte & 0x80) !== 0
    let payloadLength = secondByte & 0x7f
    offset += 2

    if (payloadLength === 126) {
      if (offset + 2 > buffer.length) return offset - 2
      payloadLength = buffer.readUInt16BE(offset)
      offset += 2
    } else if (payloadLength === 127) {
      if (offset + 8 > buffer.length) return offset - 2
      const lengthBig = buffer.readBigUInt64BE(offset)
      payloadLength = Number(lengthBig)
      offset += 8
    }

    let maskingKey
    if (isMasked) {
      if (offset + 4 > buffer.length) return offset - 2
      maskingKey = buffer.subarray(offset, offset + 4)
      offset += 4
    }

    if (offset + payloadLength > buffer.length) {
      return offset - (isMasked ? 6 : 2)
    }

    const payload = buffer.subarray(offset, offset + payloadLength)
    offset += payloadLength

    if (isMasked && maskingKey) {
      for (let i = 0; i < payload.length; i += 1) {
        payload[i] ^= maskingKey[i % 4]
      }
    }

    onFrame({ opcode, isFinal, data: payload })
  }

  return offset
}

function createSocketContext(socket) {
  let buffer = Buffer.alloc(0)
  let isAlive = true

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])

    decodeFrames(buffer, (frame) => {
      if (frame.opcode === 0x8) {
        socket.end()
        return
      }

      if (frame.opcode === 0x9) {
        socket.write(Buffer.concat([Buffer.from([0x8a, 0x00]), frame.data]))
        return
      }

      if (frame.opcode === 0x1) {
        socket.emit('ws-message', frame.data.toString('utf8'))
      }
    })
  })

  socket.on('close', () => {
    isAlive = false
  })

  return {
    socket,
    send(data) {
      if (!isAlive) return
      socket.write(encodeFrame(data))
    },
  }
}

export class SignalingServer {
  constructor() {
    this.httpServer = http.createServer(this.requestHandler.bind(this))
    this.clients = new Map()
    this.rooms = new Map()

    this.httpServer.on('upgrade', (request, socket) => this.handleUpgrade(request, socket))

    this.httpServer.on('listening', () => {
      const address = this.httpServer.address()
      logger.info('signaling-server listening', {
        host: address && typeof address === 'object' ? address.address : 'unknown',
        port: address && typeof address === 'object' ? address.port : env.SIGNALING_PORT,
        path: env.SIGNALING_PATH,
      })
    })
  }

  listen() {
    this.httpServer.listen(env.SIGNALING_PORT, env.SIGNALING_HOST)
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.httpServer.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  requestHandler(req, res) {
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

  handleUpgrade(request, socket) {
    const { url, headers } = request
    if (!url || !headers || url !== env.SIGNALING_PATH) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
      socket.destroy()
      return
    }

    const key = headers['sec-websocket-key']
    if (!key) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
      socket.destroy()
      return
    }

    const accept = computeAcceptValue(Array.isArray(key) ? key[0] : key)
    const headersResponse = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '\r\n',
    ]

    socket.write(headersResponse.join('\r\n'))

    const context = createSocketContext(socket)
    this.registerClient(context)
  }

  registerClient(context) {
    const { socket } = context

    socket.on('ws-message', (raw) => {
      try {
        const envelope = JSON.parse(raw)
        this.handleEnvelope(context, envelope)
      } catch (error) {
        logger.warn('message:invalid', { error: error instanceof Error ? error.message : String(error) })
        context.send(JSON.stringify({ type: 'error', data: 'Invalid message payload' }))
      }
    })

    socket.on('close', () => {
      this.disconnect(context)
    })

    socket.on('error', (error) => {
      logger.error('connection:error', { error: error instanceof Error ? error.message : String(error) })
      this.disconnect(context)
    })
  }

  handleEnvelope(context, envelope) {
    switch (envelope.type) {
      case 'join': {
        const result = validateJoinPayload(envelope)
        if (!result.success) {
          context.send(
            JSON.stringify({
              type: 'error',
              data: `join payload invalid: ${result.error}`,
            }),
          )
          return
        }

        this.attachToRoom(context, result.data)
        break
      }
      case 'leave': {
        this.disconnect(context)
        break
      }
      case 'offer':
      case 'answer':
      case 'ice-candidate': {
        const client = this.clients.get(context.socket)
        if (!client) {
          context.send(JSON.stringify({ type: 'error', data: 'Not joined' }))
          return
        }
        this.forwardMessage(client, envelope)
        break
      }
      default:
        context.send(JSON.stringify({ type: 'error', data: `Unsupported message type: ${envelope.type}` }))
    }
  }

  attachToRoom(context, payload) {
    const { socket } = context
    const { roomId, from, data } = payload

    const previous = this.clients.get(socket)
    if (previous) {
      this.leaveRoom(previous)
    }

    const client = {
      id: from,
      socket,
      roomId,
      userType: data.userType,
      send: context.send.bind(context),
    }

    this.clients.set(socket, client)

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }

    this.rooms.get(roomId).add(client)

    logger.info('room:join', { roomId, userId: from, userType: data.userType, peers: this.rooms.get(roomId).size })

    this.broadcast(roomId, {
      type: 'user-joined',
      from,
      roomId,
      data: { userType: data.userType },
    }, socket)
  }

  forwardMessage(sender, envelope) {
    const room = this.rooms.get(sender.roomId)
    if (!room) return

    const message = { ...envelope, roomId: sender.roomId, from: sender.id }

    if (envelope.to) {
      const target = [...room].find((client) => client.id === envelope.to)
      if (target) {
        target.send(JSON.stringify(message))
      }
      return
    }

    for (const client of room) {
      if (client.socket === sender.socket) continue
      client.send(JSON.stringify(message))
    }
  }

  disconnect(context) {
    const client = this.clients.get(context.socket)
    if (!client) return

    this.leaveRoom(client)
    this.clients.delete(context.socket)

    this.broadcast(client.roomId, {
      type: 'user-left',
      from: client.id,
      roomId: client.roomId,
      data: { userType: client.userType },
    }, context.socket)

    logger.info('room:leave', { roomId: client.roomId, userId: client.id })
  }

  leaveRoom(client) {
    const room = this.rooms.get(client.roomId)
    if (!room) return

    room.delete(client)
    if (room.size === 0) {
      this.rooms.delete(client.roomId)
    }
  }

  broadcast(roomId, message, excludeSocket) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const payload = JSON.stringify(message)
    for (const client of room) {
      if (client.socket === excludeSocket) continue
      client.send(payload)
    }
  }

  collectStats() {
    const details = {}
    for (const [roomId, clients] of this.rooms.entries()) {
      details[roomId] = clients.size
    }
    return {
      rooms: this.rooms.size,
      clients: this.clients.size,
      details,
    }
  }
}
