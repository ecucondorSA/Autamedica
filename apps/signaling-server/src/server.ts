/**
 * WebRTC Signaling Server
 *
 * Servidor Socket.io para coordinar llamadas WebRTC entre pacientes y médicos
 *
 * Features:
 * - Room management con Supabase
 * - SDP offer/answer exchange
 * - ICE candidate exchange
 * - JWT authentication
 * - Connection monitoring
 * - Rate limiting
 */

// Load environment variables FIRST
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms.js';
import { authenticateSocket } from './auth.js';
import { logger } from './logger.js';
import type { ClientToServerEvents, ServerToClientEvents } from './types.js';
import { livekitRoutes } from './routes.js';

const PORT = parseInt(process.env.PORT || '8888', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3003';

// Express app
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json()); // Parse JSON bodies

// LiveKit REST API routes
app.use(livekitRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeRooms: roomManager.getActiveRoomsCount(),
    activeConnections: io.sockets.sockets.size,
  });
});

// HTTP server
const httpServer = createServer(app);

// Socket.io server
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

// Room manager
const roomManager = new RoomManager();

/**
 * Socket.io connection handler
 */
io.on('connection', async (socket: Socket) => {
  logger.info(`[Signaling] New connection: ${socket.id}`);

  // Extract userId from query params (set by client)
  const userId = socket.handshake.query.userId as string;
  const token = socket.handshake.query.token as string;

  if (!userId) {
    logger.warn(`[Signaling] Connection rejected: missing userId`);
    socket.disconnect(true);
    return;
  }

  // Authenticate
  const authResult = await authenticateSocket(userId, token);
  if (!authResult.authenticated) {
    logger.warn(`[Signaling] Authentication failed for user ${userId}`);
    socket.emit('error', { message: 'Authentication failed' });
    socket.disconnect(true);
    return;
  }

  logger.info(`[Signaling] User authenticated: ${userId}`);

  // Store user info in socket
  socket.data.userId = userId;
  socket.data.userRole = authResult.role;

  /**
   * JOIN ROOM
   */
  socket.on('join-room', async ({ roomId }) => {
    try {
      logger.info(`[Signaling] User ${userId} joining room ${roomId}`);

      // Join Socket.io room
      await socket.join(roomId);

      // Register in room manager
      const room = await roomManager.joinRoom(roomId, userId, socket.data.userRole);

      logger.info(`[Signaling] User ${userId} joined room ${roomId}. Total users: ${room.users.length}`);

      // Notify user they joined successfully
      socket.emit('room-joined', {
        roomId,
        users: room.users,
      });

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        roomId,
        userId,
        role: socket.data.userRole,
      });

      // If there are 2+ users, signal them to start negotiation
      if (room.users.length >= 2) {
        logger.info(`[Signaling] Room ${roomId} has 2+ users, triggering negotiation`);
      }
    } catch (error) {
      logger.error(`[Signaling] Error joining room:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * LEAVE ROOM
   */
  socket.on('leave-room', async ({ roomId }) => {
    try {
      logger.info(`[Signaling] User ${userId} leaving room ${roomId}`);

      // Leave Socket.io room
      await socket.leave(roomId);

      // Unregister from room manager
      await roomManager.leaveRoom(roomId, userId);

      // Notify others
      socket.to(roomId).emit('user-left', {
        roomId,
        userId,
      });

      logger.info(`[Signaling] User ${userId} left room ${roomId}`);
    } catch (error) {
      logger.error(`[Signaling] Error leaving room:`, error);
    }
  });

  /**
   * SDP OFFER
   */
  socket.on('offer', ({ roomId, offer }) => {
    logger.info(`[Signaling] Relaying SDP offer from ${userId} to room ${roomId}`);

    // Broadcast to others in room (except sender)
    socket.to(roomId).emit('offer', {
      roomId,
      userId,
      offer,
    });
  });

  /**
   * SDP ANSWER
   */
  socket.on('answer', ({ roomId, answer }) => {
    logger.info(`[Signaling] Relaying SDP answer from ${userId} to room ${roomId}`);

    socket.to(roomId).emit('answer', {
      roomId,
      userId,
      answer,
    });
  });

  /**
   * ICE CANDIDATE
   */
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    logger.info(`[Signaling] Relaying ICE candidate from ${userId} to room ${roomId}`);

    socket.to(roomId).emit('ice-candidate', {
      roomId,
      userId,
      candidate,
    });
  });

  /**
   * CALL INITIATED
   */
  socket.on('call-init', ({ roomId }) => {
    logger.info(`[Signaling] Call initiated by ${userId} in room ${roomId}`);

    socket.to(roomId).emit('call-init', {
      roomId,
      userId,
    });
  });

  /**
   * CALL ENDED
   */
  socket.on('call-end', ({ roomId }) => {
    logger.info(`[Signaling] Call ended by ${userId} in room ${roomId}`);

    socket.to(roomId).emit('call-end', {
      roomId,
      userId,
    });
  });

  /**
   * CONNECTION STATS UPDATE
   */
  socket.on('connection-stats', ({ roomId, stats }) => {
    logger.debug(`[Signaling] Connection stats from ${userId} in room ${roomId}:`, stats);

    // Broadcast stats to others in room
    socket.to(roomId).emit('peer-stats', {
      roomId,
      userId,
      stats,
    });
  });

  /**
   * DISCONNECT
   */
  socket.on('disconnect', async (reason) => {
    logger.info(`[Signaling] User ${userId} disconnected: ${reason}`);

    // Clean up all rooms user was in
    const userRooms = await roomManager.getUserRooms(userId);
    
    for (const roomId of userRooms) {
      await roomManager.leaveRoom(roomId, userId);
      
      // Notify others
      socket.to(roomId).emit('user-left', {
        roomId,
        userId,
      });
    }
  });

  /**
   * ERROR HANDLER
   */
  socket.on('error', (error) => {
    logger.error(`[Signaling] Socket error for user ${userId}:`, error);
  });
});

/**
 * Start server
 */
httpServer.listen(PORT, () => {
  logger.info(`[Signaling] Server running on port ${PORT}`);
  logger.info(`[Signaling] CORS origin: ${CORS_ORIGIN}`);
  logger.info(`[Signaling] Health check: http://localhost:${PORT}/health`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('[Signaling] SIGTERM received, closing server...');
  
  httpServer.close(() => {
    logger.info('[Signaling] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('[Signaling] SIGINT received, closing server...');
  
  httpServer.close(() => {
    logger.info('[Signaling] Server closed');
    process.exit(0);
  });
});

// Export for testing
export { io, roomManager };
