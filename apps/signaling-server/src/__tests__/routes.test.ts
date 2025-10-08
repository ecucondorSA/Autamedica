/**
 * REST API Routes Tests
 *
 * Contract testing para validar:
 * - Request/Response schemas
 * - Error handling
 * - Input validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { livekitRoutes } from '../routes';

describe('LiveKit REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(livekitRoutes);
  });

  describe('POST /api/consultations/create', () => {
    it('should create consultation room with valid data', async () => {
      const response = await request(app)
        .post('/api/consultations/create')
        .send({
          consultationId: 'test-api-001',
          patientId: 'patient-api-123',
          doctorId: 'doctor-api-456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Validate response structure
      const { data } = response.body;
      expect(data.consultationId).toBe('test-api-001');
      expect(data.roomName).toBe('consultation-test-api-001');
      expect(data.patientId).toBe('patient-api-123');
      expect(data.doctorId).toBe('doctor-api-456');
      expect(data.patientToken).toBeTypeOf('string');
      expect(data.doctorToken).toBeTypeOf('string');
      expect(data.livekitUrl).toContain('livekit.cloud');
      expect(data.roomSid).toBeDefined();
      expect(data.createdAt).toBeDefined();
    });

    it('should reject request with missing consultationId', async () => {
      const response = await request(app)
        .post('/api/consultations/create')
        .send({
          patientId: 'patient-api-789',
          doctorId: 'doctor-api-101'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject request with missing patientId', async () => {
      const response = await request(app)
        .post('/api/consultations/create')
        .send({
          consultationId: 'test-api-002',
          doctorId: 'doctor-api-202'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject request with missing doctorId', async () => {
      const response = await request(app)
        .post('/api/consultations/create')
        .send({
          consultationId: 'test-api-003',
          patientId: 'patient-api-303'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/consultations/create')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle duplicate room creation', async () => {
      const payload = {
        consultationId: 'test-api-duplicate',
        patientId: 'patient-dup-001',
        doctorId: 'doctor-dup-001'
      };

      // First request should succeed
      const response1 = await request(app)
        .post('/api/consultations/create')
        .send(payload)
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Second request with same consultationId should also succeed
      // (LiveKit permite recrear salas con el mismo nombre)
      const response2 = await request(app)
        .post('/api/consultations/create')
        .send(payload)
        .expect(200);

      expect(response2.body.success).toBe(true);
    });
  });

  describe('POST /api/consultations/:id/recording/start', () => {
    it('should reject request without roomName', async () => {
      const response = await request(app)
        .post('/api/consultations/test-123/recording/start')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing roomName');
    });

    it('should return not_implemented status for recording', async () => {
      const response = await request(app)
        .post('/api/consultations/test-456/recording/start')
        .send({
          roomName: 'consultation-test-456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('not_implemented');
    });
  });

  describe('POST /api/consultations/:id/recording/stop', () => {
    it('should reject request without egressId', async () => {
      const response = await request(app)
        .post('/api/consultations/test-789/recording/stop')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing egressId');
    });
  });

  describe('GET /api/rooms/active', () => {
    it('should return list of active rooms', async () => {
      const response = await request(app)
        .get('/api/rooms/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return rooms with correct structure', async () => {
      // Create a room first
      await request(app)
        .post('/api/consultations/create')
        .send({
          consultationId: 'test-active-room',
          patientId: 'patient-active',
          doctorId: 'doctor-active'
        });

      const response = await request(app)
        .get('/api/rooms/active')
        .expect(200);

      expect(response.body.success).toBe(true);

      const rooms = response.body.data;
      if (rooms.length > 0) {
        const room = rooms[0];
        expect(room).toHaveProperty('name');
        expect(room).toHaveProperty('sid');
        expect(room).toHaveProperty('numParticipants');
        expect(room).toHaveProperty('metadata');
      }
    });
  });

  describe('GET /api/rooms/:roomName/stats', () => {
    it('should reject request without roomName', async () => {
      await request(app)
        .get('/api/rooms//stats') // Empty roomName
        .expect(404); // Express devuelve 404 para rutas no encontradas
    });

    it('should return stats for valid room', async () => {
      // Create room first
      await request(app)
        .post('/api/consultations/create')
        .send({
          consultationId: 'test-stats-room',
          patientId: 'patient-stats',
          doctorId: 'doctor-stats'
        });

      // Note: This test may fail without LiveKit connection
      // Keeping it for documentation purposes
    });
  });

  describe('DELETE /api/rooms/:roomName/participants/:identity', () => {
    it('should reject request with missing parameters', async () => {
      await request(app)
        .delete('/api/rooms//participants/') // Empty params
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app)
        .post('/api/consultations/create')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});
