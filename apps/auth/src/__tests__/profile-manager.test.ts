import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileManager } from '../lib/profile-manager';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabaseClient = () => ({
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      limit: vi.fn(() => ({
        single: vi.fn(),
      })),
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  auth: {
    getUser: vi.fn(),
  },
});

describe('ProfileManager', () => {
  let profileManager: ProfileManager;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    profileManager = new ProfileManager(mockClient as unknown as SupabaseClient);
  });

  describe('getCurrentProfile', () => {
    it('should fetch current user profile successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'patient',
        portal: 'patients',
        metadata: {},
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockClient.rpc.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await profileManager.getCurrentProfile();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          id: 'user-123',
          email: 'test@example.com',
          role: 'patient',
        });
      }
      expect(mockClient.rpc).toHaveBeenCalledWith('get_current_profile');
    });

    it('should return null when no profile exists', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await profileManager.getCurrentProfile();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should handle RPC errors', async () => {
      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await profileManager.getCurrentProfile();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('RPC_ERROR');
      }
    });
  });

  describe('setPortalAndRole', () => {
    it('should update portal and role successfully', async () => {
      mockClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await profileManager.setPortalAndRole('doctors', 'doctor');

      expect(result.success).toBe(true);
      expect(mockClient.rpc).toHaveBeenCalledWith('set_portal_and_role', {
        p_portal: 'doctors',
        p_role: 'doctor',
        p_organization_id: null,
      });
    });

    it('should validate organization UUID format', async () => {
      const result = await profileManager.setPortalAndRole(
        'companies',
        'company_admin',
        'invalid-uuid'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('VALIDATION_ERROR');
        expect(result.error?.message).toContain('Invalid organization ID');
      }
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', async () => {
      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'admin',
          portal: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await profileManager.isAdmin();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should return false for non-admin roles', async () => {
      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'patient',
          portal: 'patients',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await profileManager.isAdmin();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });
  });

  describe('hasRole', () => {
    it('should return true if user has specified role', async () => {
      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'doctor-123',
          email: 'doctor@example.com',
          role: 'doctor',
          portal: 'doctors',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await profileManager.hasRole('doctor');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should return false if user has different role', async () => {
      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'patient-123',
          email: 'patient@example.com',
          role: 'patient',
          portal: 'patients',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await profileManager.hasRole('doctor');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status with latency', async () => {
      const mockFrom = mockClient.from();
      const mockSelect = mockFrom.select();
      mockSelect.limit().single.mockResolvedValue({
        data: { id: 'test-123' },
        error: null,
      });

      const result = await profileManager.healthCheck();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.status).toBe('healthy');
        expect(result.data?.latency).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return error on health check failure', async () => {
      const mockFrom = mockClient.from();
      const mockSelect = mockFrom.select();
      mockSelect.limit().single.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      const result = await profileManager.healthCheck();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('HEALTH_CHECK_ERROR');
      }
    });
  });
});
