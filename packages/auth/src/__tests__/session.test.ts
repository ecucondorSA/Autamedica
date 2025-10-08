import { describe, it, expect, vi } from 'vitest';
import { validateSession, isSessionExpired, getSessionTimeRemaining } from '../session';

describe('Session Management', () => {
  describe('validateSession', () => {
    it('should validate active session', () => {
      const validSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        expires_at: Date.now() + 3600000, // 1 hour from now
      };

      expect(validateSession(validSession)).toBe(true);
    });

    it('should reject expired session', () => {
      const expiredSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        expires_at: Date.now() - 3600000, // 1 hour ago
      };

      expect(validateSession(expiredSession)).toBe(false);
    });

    it('should reject session without user', () => {
      const invalidSession = {
        user: null,
        expires_at: Date.now() + 3600000,
      };

      expect(validateSession(invalidSession as any)).toBe(false);
    });

    it('should reject session without expiration', () => {
      const invalidSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        expires_at: null,
      };

      expect(validateSession(invalidSession as any)).toBe(false);
    });
  });

  describe('isSessionExpired', () => {
    it('should detect expired session', () => {
      const expiredTime = Date.now() - 1000;
      expect(isSessionExpired(expiredTime)).toBe(true);
    });

    it('should detect active session', () => {
      const activeTime = Date.now() + 3600000;
      expect(isSessionExpired(activeTime)).toBe(false);
    });

    it('should handle edge case of exactly now', () => {
      const now = Date.now();
      // Should be expired if equal to current time
      expect(isSessionExpired(now)).toBe(true);
    });
  });

  describe('getSessionTimeRemaining', () => {
    it('should calculate time remaining correctly', () => {
      const futureTime = Date.now() + 3600000; // 1 hour
      const remaining = getSessionTimeRemaining(futureTime);

      expect(remaining).toBeGreaterThan(3599000); // ~1 hour
      expect(remaining).toBeLessThanOrEqual(3600000);
    });

    it('should return 0 for expired session', () => {
      const pastTime = Date.now() - 1000;
      expect(getSessionTimeRemaining(pastTime)).toBe(0);
    });

    it('should return 0 for current time', () => {
      const now = Date.now();
      expect(getSessionTimeRemaining(now)).toBeLessThanOrEqual(1);
    });
  });
});
