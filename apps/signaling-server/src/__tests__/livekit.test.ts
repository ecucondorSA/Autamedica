/**
 * LiveKit Service Tests
 *
 * Tests críticos de seguridad HIPAA:
 * - Token generation con permisos por rol
 * - Validación de permissions (doctor vs patient)
 * - Room creation con metadata correcta
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { LiveKitService } from '../livekit';

describe('LiveKitService - Token Generation', () => {
  let service: LiveKitService;

  beforeAll(() => {
    service = new LiveKitService();
  });

  describe('Patient Token Permissions', () => {
    it('should generate patient token with correct permissions', async () => {
      const consultationId = 'test-consultation-001';
      const patientId = 'patient-123';
      const doctorId = 'doctor-456';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      expect(room.patientToken).toBeDefined();
      expect(room.patientToken).toBeTypeOf('string');

      // Decode JWT to verify claims
      const decodedToken = decodeJWT(room.patientToken);

      expect(decodedToken.video.roomJoin).toBe(true);
      expect(decodedToken.video.canPublish).toBe(true);
      expect(decodedToken.video.canSubscribe).toBe(true);

      // CRÍTICO: Pacientes NO pueden grabar
      expect(decodedToken.video.roomRecord).toBe(false);

      // CRÍTICO: Pacientes NO pueden compartir pantalla
      const allowedSources = decodedToken.video.canPublishSources || [];
      expect(allowedSources).not.toContain('screen_share');
      expect(allowedSources).toContain('camera');
      expect(allowedSources).toContain('microphone');
    });

    it('should include patient metadata in token', async () => {
      const consultationId = 'test-consultation-002';
      const patientId = 'patient-789';
      const doctorId = 'doctor-101';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      const decodedToken = decodeJWT(room.patientToken);
      const metadata = JSON.parse(decodedToken.metadata || '{}');

      expect(metadata.role).toBe('patient');
      expect(metadata.consultationId).toBe(consultationId);
      expect(metadata.userId).toBe(patientId);
    });
  });

  describe('Doctor Token Permissions', () => {
    it('should generate doctor token with recording permission', async () => {
      const consultationId = 'test-consultation-003';
      const patientId = 'patient-456';
      const doctorId = 'doctor-789';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      expect(room.doctorToken).toBeDefined();
      expect(room.doctorToken).toBeTypeOf('string');

      const decodedToken = decodeJWT(room.doctorToken);

      // CRÍTICO: Doctores SÍ pueden grabar (HIPAA compliance)
      expect(decodedToken.video.roomRecord).toBe(true);

      // CRÍTICO: Doctores SÍ pueden compartir pantalla
      const allowedSources = decodedToken.video.canPublishSources || [];
      expect(allowedSources).toContain('screen_share');
      expect(allowedSources).toContain('camera');
      expect(allowedSources).toContain('microphone');
    });

    it('should include doctor metadata in token', async () => {
      const consultationId = 'test-consultation-004';
      const patientId = 'patient-111';
      const doctorId = 'doctor-222';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      const decodedToken = decodeJWT(room.doctorToken);
      const metadata = JSON.parse(decodedToken.metadata || '{}');

      expect(metadata.role).toBe('doctor');
      expect(metadata.consultationId).toBe(consultationId);
      expect(metadata.userId).toBe(doctorId);
    });
  });

  describe('Room Creation', () => {
    it('should create room with HIPAA compliant metadata', async () => {
      const consultationId = 'test-consultation-005';
      const patientId = 'patient-333';
      const doctorId = 'doctor-444';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      expect(room.roomName).toBe(`consultation-${consultationId}`);
      expect(room.consultationId).toBe(consultationId);
      expect(room.patientId).toBe(patientId);
      expect(room.doctorId).toBe(doctorId);
      expect(room.livekitUrl).toBeDefined();
      expect(room.roomSid).toBeDefined();
      expect(room.createdAt).toBeInstanceOf(Date);
    });

    it('should return both patient and doctor tokens', async () => {
      const consultationId = 'test-consultation-006';
      const patientId = 'patient-555';
      const doctorId = 'doctor-666';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      expect(room.patientToken).toBeDefined();
      expect(room.doctorToken).toBeDefined();
      expect(room.patientToken).not.toBe(room.doctorToken);
    });
  });

  describe('Token Expiration', () => {
    it('should generate tokens with 2 hour TTL', async () => {
      const consultationId = 'test-consultation-007';
      const patientId = 'patient-777';
      const doctorId = 'doctor-888';

      const room = await service.createConsultationRoom(
        consultationId,
        patientId,
        doctorId
      );

      const patientDecoded = decodeJWT(room.patientToken);
      const doctorDecoded = decodeJWT(room.doctorToken);

      // Verificar que el token expira en ~2 horas (7200 segundos)
      const now = Math.floor(Date.now() / 1000);
      const patientExp = patientDecoded.exp || 0;
      const doctorExp = doctorDecoded.exp || 0;

      // Debe expirar entre 1.5 y 2.5 horas (margen de error)
      const minTTL = 5400; // 1.5 horas
      const maxTTL = 9000; // 2.5 horas

      expect(patientExp - now).toBeGreaterThan(minTTL);
      expect(patientExp - now).toBeLessThan(maxTTL);
      expect(doctorExp - now).toBeGreaterThan(minTTL);
      expect(doctorExp - now).toBeLessThan(maxTTL);
    });
  });
});

/**
 * Helper: Decode JWT token
 */
function decodeJWT(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  const payload = parts[1] || '';
  const decoded = Buffer.from(payload, 'base64').toString('utf8');
  return JSON.parse(decoded);
}
