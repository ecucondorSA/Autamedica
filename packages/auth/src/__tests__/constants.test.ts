import { describe, it, expect } from 'vitest';
import { AUTH_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '../constants';

describe('Auth Constants', () => {
  describe('AUTH_COOKIE_NAME', () => {
    it('should have correct cookie name', () => {
      expect(AUTH_COOKIE_NAME).toBe('sb-auth-token');
    });
  });

  describe('SESSION_COOKIE_OPTIONS', () => {
    it('should have secure cookie configuration', () => {
      expect(SESSION_COOKIE_OPTIONS).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    });

    it('should have maxAge set', () => {
      expect(SESSION_COOKIE_OPTIONS.maxAge).toBeGreaterThan(0);
    });

    it('should have path set to root', () => {
      expect(SESSION_COOKIE_OPTIONS.path).toBe('/');
    });
  });
});
