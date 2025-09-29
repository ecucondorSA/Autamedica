/**
 * HTTP API for signaling server using fetch and polling
 * More reliable than WebSockets for medical applications
 */

export class HttpSignalingAPI {
  constructor() {
    // Store rooms and messages in memory (in production, use KV or D1)
    this.rooms = new Map() // roomId -> { users: Set, messages: Array }
    this.userSessions = new Map() // userId -> { roomId, lastPing, userType }
  }

  async handleRequest(request, _env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      })
    }

    try {
      // Health check
      if (pathname === '/health') {
        return this.jsonResponse({
          status: 'ok',
          time: new Date().toISOString(),
          service: 'autamedica-http-signaling'
        }, { headers: corsHeaders })
      }

      // Join room
      if (pathname === '/api/join' && method === 'POST') {
        return this.handleJoin(request, corsHeaders)
      }

      // Leave room
      if (pathname === '/api/leave' && method === 'POST') {
        return this.handleLeave(request, corsHeaders)
      }

      // Send message (offer, answer, ice-candidate)
      if (pathname === '/api/message' && method === 'POST') {
        return this.handleMessage(request, corsHeaders)
      }

      // Poll for messages
      if (pathname === '/api/poll' && method === 'GET') {
        return this.handlePoll(request, corsHeaders)
      }

      // Get room info
      if (pathname === '/api/room' && method === 'GET') {
        return this.handleRoomInfo(request, corsHeaders)
      }

      // Heartbeat/ping
      if (pathname === '/api/ping' && method === 'POST') {
        return this.handlePing(request, corsHeaders)
      }

      return this.jsonResponse({ error: 'Not found' }, {
        status: 404,
        headers: corsHeaders
      })

    } catch (error) {
      console.error('HTTP API Error:', error)
      return this.jsonResponse({
        error: 'Internal server error',
        details: error.message
      }, {
        status: 500,
        headers: corsHeaders
      })
    }
  }

  async handleJoin(request, corsHeaders) {
    const body = await request.json()
    const { roomId, userId, userType } = body

    if (!roomId || !userId || !userType) {
      return this.jsonResponse({
        error: 'Missing required fields: roomId, userId, userType'
      }, { status: 400, headers: corsHeaders })
    }

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Set(),
        messages: [],
        pendingCalls: new Map() // Store pending calls for patients
      })
    }

    const room = this.rooms.get(roomId)

    // Add user to room
    const userInfo = { userId, userType, joinedAt: Date.now() }
    room.users.add(JSON.stringify(userInfo))

    // Store user session
    this.userSessions.set(userId, {
      roomId,
      userType,
      lastPing: Date.now()
    })

    // Notify other users
    const joinMessage = {
      type: 'user-joined',
      from: userId,
      roomId,
      data: { userType },
      timestamp: Date.now()
    }
    room.messages.push(joinMessage)

    // Check for pending calls for this patient
    if (userType === 'patient' && room.pendingCalls) {
      const pendingCall = room.pendingCalls.get('current')
      if (pendingCall) {
        console.log(`Delivering pending call to patient ${userId}`)
        // Add pending call to messages so patient receives it immediately
        room.messages.push({
          ...pendingCall,
          timestamp: Date.now() // Update timestamp to ensure it's received
        })
      }
    }

    // Get current room state
    const users = Array.from(room.users).map(u => JSON.parse(u))

    console.log(`User ${userId} joined room ${roomId} as ${userType}`)

    return this.jsonResponse({
      success: true,
      roomState: {
        users: users.filter(u => u.userId !== userId), // Exclude self
        roomId
      }
    }, { headers: corsHeaders })
  }

  async handleLeave(request, corsHeaders) {
    const body = await request.json()
    const { roomId, userId } = body

    if (!roomId || !userId) {
      return this.jsonResponse({
        error: 'Missing required fields: roomId, userId'
      }, { status: 400, headers: corsHeaders })
    }

    const room = this.rooms.get(roomId)
    if (!room) {
      return this.jsonResponse({
        error: 'Room not found'
      }, { status: 404, headers: corsHeaders })
    }

    // Remove user from room
    const userSession = this.userSessions.get(userId)
    if (userSession) {
      const userInfo = { userId, userType: userSession.userType, joinedAt: 0 }
      room.users.delete(JSON.stringify(userInfo))
      this.userSessions.delete(userId)

      // Notify other users
      const leaveMessage = {
        type: 'user-left',
        from: userId,
        roomId,
        data: { userType: userSession.userType },
        timestamp: Date.now()
      }
      room.messages.push(leaveMessage)

      console.log(`User ${userId} left room ${roomId}`)
    }

    return this.jsonResponse({
      success: true
    }, { headers: corsHeaders })
  }

  async handleMessage(request, corsHeaders) {
    const body = await request.json()
    const { roomId, from, to, type, data } = body

    if (!roomId || !from || !type) {
      return this.jsonResponse({
        error: 'Missing required fields: roomId, from, type'
      }, { status: 400, headers: corsHeaders })
    }

    const room = this.rooms.get(roomId)
    if (!room) {
      return this.jsonResponse({
        error: 'Room not found'
      }, { status: 404, headers: corsHeaders })
    }

    // Store the message
    const message = {
      type,
      from,
      to,
      roomId,
      data,
      timestamp: Date.now()
    }
    room.messages.push(message)

    // If it's an incoming call, store it as pending for patients who join later
    if (type === 'incoming-call' && room.pendingCalls) {
      console.log(`Storing pending call from ${from}`)
      room.pendingCalls.set('current', message)
    }

    // If patient accepts or rejects call, clear pending call
    if ((type === 'patient-joined' || type === 'call-rejected') && room.pendingCalls) {
      console.log(`Clearing pending call`)
      room.pendingCalls.delete('current')
    }

    // Keep only last 100 messages per room
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100)
    }

    console.log(`Message ${type} from ${from} to ${to || 'all'} in room ${roomId}`)

    return this.jsonResponse({
      success: true,
      messageId: message.timestamp
    }, { headers: corsHeaders })
  }

  async handlePoll(request, corsHeaders) {
    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')
    const userId = url.searchParams.get('userId')
    const since = parseInt(url.searchParams.get('since') || '0')

    if (!roomId || !userId) {
      return this.jsonResponse({
        error: 'Missing required params: roomId, userId'
      }, { status: 400, headers: corsHeaders })
    }

    const room = this.rooms.get(roomId)
    if (!room) {
      return this.jsonResponse({
        messages: [],
        timestamp: Date.now()
      }, { headers: corsHeaders })
    }

    // Filter messages for this user since last poll
    const messages = room.messages
      .filter(msg => {
        // Include messages after 'since' timestamp
        if (msg.timestamp <= since) return false

        // Don't send back user's own messages
        if (msg.from === userId) return false

        // If message has specific target, only send to that user
        if (msg.to && msg.to !== userId) return false

        return true
      })
      .slice(-20) // Limit to last 20 messages

    return this.jsonResponse({
      messages,
      timestamp: Date.now()
    }, { headers: corsHeaders })
  }

  async handleRoomInfo(request, corsHeaders) {
    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')

    if (!roomId) {
      return this.jsonResponse({
        error: 'Missing required param: roomId'
      }, { status: 400, headers: corsHeaders })
    }

    const room = this.rooms.get(roomId)
    if (!room) {
      return this.jsonResponse({
        roomId,
        users: [],
        exists: false
      }, { headers: corsHeaders })
    }

    const users = Array.from(room.users).map(u => JSON.parse(u))

    return this.jsonResponse({
      roomId,
      users,
      exists: true,
      messageCount: room.messages.length
    }, { headers: corsHeaders })
  }

  async handlePing(request, corsHeaders) {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return this.jsonResponse({
        error: 'Missing required field: userId'
      }, { status: 400, headers: corsHeaders })
    }

    const session = this.userSessions.get(userId)
    if (session) {
      session.lastPing = Date.now()
    }

    return this.jsonResponse({
      success: true,
      timestamp: Date.now()
    }, { headers: corsHeaders })
  }

  jsonResponse(data, options = {}) {
    const { status = 200, headers = {} } = options
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  }

  // Cleanup inactive users (call periodically)
  cleanup() {
    const now = Date.now()
    const timeout = 30000 // 30 seconds

    for (const [userId, session] of this.userSessions) {
      if (now - session.lastPing > timeout) {
        console.log(`Cleaning up inactive user: ${userId}`)

        const room = this.rooms.get(session.roomId)
        if (room) {
          const userInfo = { userId, userType: session.userType, joinedAt: 0 }
          room.users.delete(JSON.stringify(userInfo))

          // Notify others that user left
          const leaveMessage = {
            type: 'user-left',
            from: userId,
            roomId: session.roomId,
            data: { userType: session.userType },
            timestamp: now
          }
          room.messages.push(leaveMessage)
        }

        this.userSessions.delete(userId)
      }
    }
  }
}
