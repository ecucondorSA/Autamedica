/**
 * REST API Routes for LiveKit
 *
 * Endpoints HTTP para gestionar videoconsultas con LiveKit
 */

import { Router, type Request, type Response } from 'express';
import { livekitService } from './livekit.js';
import { logger } from './logger.js';

const router: Router = Router();

/**
 * POST /api/consultations/create
 * Crear sala de consulta médica
 */
router.post('/api/consultations/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId, patientId, doctorId } = req.body;

    if (!consultationId || !patientId || !doctorId) {
      res.status(400).json({
        error: 'Missing required fields: consultationId, patientId, doctorId'
      });
      return;
    }

    logger.info(`[API] Creating consultation room: ${consultationId}`);

    const room = await livekitService.createConsultationRoom(
      consultationId,
      patientId,
      doctorId
    );

    res.json({
      success: true,
      data: room
    });

  } catch (error: any) {
    logger.error('[API] Error creating consultation:', error);
    res.status(500).json({
      error: 'Failed to create consultation room',
      message: error.message
    });
  }
});

/**
 * POST /api/consultations/:id/recording/start
 * Iniciar grabación de consulta
 */
router.post('/api/consultations/:id/recording/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const consultationId = req.params.id || 'unknown';
    const { roomName } = req.body;

    if (!roomName) {
      res.status(400).json({ error: 'Missing roomName' });
      return;
    }

    logger.info(`[API] Starting recording for consultation: ${consultationId}`);

    const result = await livekitService.startRecording(roomName, consultationId);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    logger.error('[API] Error starting recording:', error);
    res.status(500).json({
      error: 'Failed to start recording',
      message: error.message
    });
  }
});

/**
 * POST /api/consultations/:id/recording/stop
 * Detener grabación
 */
router.post('/api/consultations/:id/recording/stop', async (req: Request, res: Response): Promise<void> => {
  try {
    const { egressId } = req.body;

    if (!egressId) {
      res.status(400).json({ error: 'Missing egressId' });
      return;
    }

    logger.info(`[API] Stopping recording: ${egressId}`);

    await livekitService.stopRecording(egressId);

    res.json({
      success: true,
      message: 'Recording stopped'
    });

  } catch (error: any) {
    logger.error('[API] Error stopping recording:', error);
    res.status(500).json({
      error: 'Failed to stop recording',
      message: error.message
    });
  }
});

/**
 * GET /api/rooms/active
 * Listar salas activas
 */
router.get('/api/rooms/active', async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await livekitService.listActiveRooms();

    res.json({
      success: true,
      data: rooms
    });

  } catch (error: any) {
    logger.error('[API] Error listing rooms:', error);
    res.status(500).json({
      error: 'Failed to list rooms',
      message: error.message
    });
  }
});

/**
 * GET /api/rooms/:roomName/stats
 * Obtener estadísticas de sala
 */
router.get('/api/rooms/:roomName/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const roomName = req.params.roomName;

    if (!roomName) {
      res.status(400).json({ error: 'Missing roomName' });
      return;
    }

    const stats = await livekitService.getRoomStats(roomName);

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    logger.error('[API] Error getting room stats:', error);
    res.status(500).json({
      error: 'Failed to get room stats',
      message: error.message
    });
  }
});

/**
 * DELETE /api/rooms/:roomName/participants/:identity
 * Desconectar participante
 */
router.delete('/api/rooms/:roomName/participants/:identity', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomName, identity } = req.params;

    if (!roomName || !identity) {
      res.status(400).json({ error: 'Missing roomName or identity' });
      return;
    }

    await livekitService.disconnectParticipant(roomName, identity);

    res.json({
      success: true,
      message: 'Participant disconnected'
    });

  } catch (error: any) {
    logger.error('[API] Error disconnecting participant:', error);
    res.status(500).json({
      error: 'Failed to disconnect participant',
      message: error.message
    });
  }
});

export { router as livekitRoutes };
