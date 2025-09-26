/**
 * Durable Object for managing WebSocket connections in a signaling room
 * Each room is a separate Durable Object instance with persistent state
 */
/* global WebSocketPair */

export class SignalingRoom {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.sessions = new Map() // clientId -> WebSocket
    this.clients = new Map()  // WebSocket -> client info
  }

  async fetch(request) {
    // Validate WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade')
    if (upgradeHeader !== 'websocket') {
      console.log('Invalid upgrade header:', upgradeHeader)
      return new Response('WebSocket upgrade required', {
        status: 426,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      })
    }

    console.log('Creating WebSocket pair...')

    try {
      // Create WebSocket pair
      const webSocketPair = new WebSocketPair()
      const [client, server] = Object.values(webSocketPair)

      // Accept the server-side WebSocket
      server.accept()
      console.log('WebSocket accepted in Durable Object')

      // Store connection info
      const connectionId = crypto.randomUUID()
      console.log('Generated connection ID:', connectionId)

      // Handle WebSocket events
      server.addEventListener('message', (event) => {
        console.log('Message received:', event.data)
        this.handleMessage(server, event.data)
      })

      server.addEventListener('close', (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        this.handleDisconnect(server)
      })

      server.addEventListener('error', (event) => {
        console.error('WebSocket error in Durable Object:', event)
        this.handleDisconnect(server)
      })

      // Return the client-side WebSocket
      return new Response(null, {
        status: 101,
        webSocket: client,
      })

    } catch (error) {
      console.error('Error creating WebSocket pair:', error)
      return new Response('WebSocket connection failed', { status: 500 })
    }
  }

  handleMessage(socket, rawMessage) {
    try {
      const envelope = JSON.parse(rawMessage)

      switch (envelope.type) {
        case 'join':
          this.handleJoin(socket, envelope)
          break
        case 'leave':
          this.handleDisconnect(socket)
          break
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          this.forwardMessage(socket, envelope)
          break
        default:
          this.sendError(socket, `Unsupported message type: ${envelope.type}`)
      }
    } catch (error) {
      console.error('Message parsing error:', error)
      this.sendError(socket, 'Invalid message format')
    }
  }

  handleJoin(socket, envelope) {
    const { from, data } = envelope

    // Validate join payload
    if (!from || !data?.userType) {
      this.sendError(socket, 'Invalid join payload - missing from or userType')
      return
    }

    // Remove any existing session for this client
    const existingSocket = this.sessions.get(from)
    if (existingSocket && existingSocket !== socket) {
      this.handleDisconnect(existingSocket)
    }

    // Register the new client
    const client = {
      id: from,
      userType: data.userType,
      socket: socket,
      joinedAt: Date.now()
    }

    this.sessions.set(from, socket)
    this.clients.set(socket, client)

    console.log(`Client ${from} joined as ${data.userType}. Total clients: ${this.sessions.size}`)

    // Notify other clients about the new user
    this.broadcast({
      type: 'user-joined',
      from: from,
      data: { userType: data.userType }
    }, socket)

    // Send current room state to the new client
    const roomUsers = []
    for (const [, clientSocket] of this.sessions) {
      if (clientSocket !== socket) {
        const clientInfo = this.clients.get(clientSocket)
        if (clientInfo) {
          roomUsers.push({
            id: clientInfo.id,
            userType: clientInfo.userType
          })
        }
      }
    }

    socket.send(JSON.stringify({
      type: 'room-state',
      data: { users: roomUsers }
    }))
  }

  forwardMessage(senderSocket, envelope) {
    const sender = this.clients.get(senderSocket)
    if (!sender) {
      this.sendError(senderSocket, 'Not joined to room')
      return
    }

    const message = {
      ...envelope,
      from: sender.id
    }

    // If message has a specific target
    if (envelope.to) {
      const targetSocket = this.sessions.get(envelope.to)
      if (targetSocket) {
        targetSocket.send(JSON.stringify(message))
      }
      return
    }

    // Broadcast to all other clients
    this.broadcast(message, senderSocket)
  }

  handleDisconnect(socket) {
    const client = this.clients.get(socket)
    if (!client) return

    console.log(`Client ${client.id} disconnected. Remaining: ${this.sessions.size - 1}`)

    // Remove from maps
    this.sessions.delete(client.id)
    this.clients.delete(socket)

    // Notify other clients
    this.broadcast({
      type: 'user-left',
      from: client.id,
      data: { userType: client.userType }
    }, socket)

    // Close the socket if not already closed
    try {
      socket.close()
    } catch (error) {
      // Socket might already be closed
    }
  }

  broadcast(message, excludeSocket = null) {
    const payload = JSON.stringify(message)

    for (const [clientId, socket] of this.sessions) {
      if (socket === excludeSocket) continue

      try {
        socket.send(payload)
      } catch (error) {
        console.error(`Failed to send message to ${clientId}:`, error)
        // Remove disconnected socket
        this.handleDisconnect(socket)
      }
    }
  }

  sendError(socket, message) {
    try {
      socket.send(JSON.stringify({
        type: 'error',
        data: message
      }))
    } catch (error) {
      console.error('Failed to send error message:', error)
    }
  }
}
