import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../lib/auth-service';
import type { SupabaseClientType } from '../lib/supabase';

// Mock Supabase client
const createMockSupabaseClient = () => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    refreshSession: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
  },
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    authService = new AuthService(mockClient as unknown as SupabaseClientType);
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: mockSession,
        },
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
      });

      expect(result.success).toBe(true);
      expect(result.data?.redirectUrl).toBeDefined();
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle invalid credentials error', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      });

      const result = await authService.signIn({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Email o contraseña incorrectos');
    });

    it('should normalize email to lowercase', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: {} },
        error: null,
      });

      await authService.signIn({
        email: 'TEST@EXAMPLE.COM',
        password: 'pass',
      });

      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass',
      });
    });
  });

  describe('signUp', () => {
    it('should create account successfully', async () => {
      mockClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-123', email: 'new@example.com' },
          session: {},
        },
        error: null,
      });

      const result = await authService.signUp({
        email: 'new@example.com',
        password: 'securepass',
        role: 'doctor',
        metadata: { fullName: 'Dr. Test' },
      });

      expect(result.success).toBe(true);
      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'securepass',
        options: expect.objectContaining({
          data: {
            role: 'doctor',
            fullName: 'Dr. Test',
          },
        }),
      });
    });

    it('should handle duplicate email error', async () => {
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          status: 400,
        },
      });

      const result = await authService.signUp({
        email: 'existing@example.com',
        password: 'pass',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Ya existe una cuenta con este email');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(mockClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      mockClient.auth.signOut.mockResolvedValue({
        error: {
          message: 'Network error',
          status: 500,
        },
      });

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Error al cerrar sesión');
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email', async () => {
      mockClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await authService.resetPassword('user@example.com');

      expect(result.success).toBe(true);
      expect(mockClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(Object)
      );
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: '123' },
      };

      mockClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
    });
  });
});
