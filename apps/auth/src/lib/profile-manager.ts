import { z } from 'zod';
import type { SupabaseClientType } from './supabase';
import { getBrowserSupabaseClient } from './supabase';
import type { UserRole } from '@autamedica/types';

// Zod schemas for validation
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'company', 'admin', 'organization_admin', 'platform_admin']),
  portal: z.enum(['patients', 'doctors', 'companies', 'admin']),
  organization_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AuditLogEntrySchema = z.object({
  id: z.number(),
  event: z.string(),
  data: z.record(z.unknown()),
  created_at: z.string().datetime(),
});

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Types derived from schemas
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// Result types for better error handling
export type ProfileResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ProfileError;
};

export interface ProfileError {
  code: string;
  message: string;
  details?: unknown;
}

// Modern ProfileManager class with comprehensive error handling
export class ProfileManager {
  private client: SupabaseClientType;

  constructor(client?: SupabaseClientType) {
    this.client = client ?? getBrowserSupabaseClient();
  }

  // Static factory methods for different environments
  static browser(): ProfileManager {
    return new ProfileManager(getBrowserSupabaseClient());
  }

  // Note: server() method removed to avoid bundling issues
  // Use createServerProfileManager from server-specific files instead

  // Helper to create error objects
  private createError(code: string, message: string, details?: unknown): ProfileError {
    return { code, message, details };
  }

  // Helper to validate and parse data
  private validateData<T>(schema: z.ZodSchema<T>, data: unknown): ProfileResult<T> {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'VALIDATION_ERROR',
          'Invalid data format',
          error instanceof z.ZodError ? error.errors : error
        ),
      };
    }
  }

  /**
   * Get current user profile with comprehensive error handling
   */
  async getCurrentProfile(): Promise<ProfileResult<UserProfile | null>> {
    try {
      const { data, error } = await this.client.rpc('get_current_profile');

      if (error) {
        return {
          success: false,
          error: this.createError(
            'RPC_ERROR',
            'Failed to fetch user profile',
            error
          ),
        };
      }

      if (!data) {
        return { success: true, data: null };
      }

      const validation = this.validateData(UserProfileSchema, data);
      if (!validation.success) {
        return validation;
      }

      return { success: true, data: validation.data };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Connection failed while fetching profile',
          error
        ),
      };
    }
  }

  /**
   * Update portal and role for current user with validation
   */
  async setPortalAndRole(
    portal: UserProfile['portal'],
    role?: UserRole,
    organizationId?: string
  ): Promise<ProfileResult<boolean>> {
    try {
      // Validate inputs
      if (organizationId && !z.string().uuid().safeParse(organizationId).success) {
        return {
          success: false,
          error: this.createError(
            'VALIDATION_ERROR',
            'Invalid organization ID format'
          ),
        };
      }

      const { data: _data, error } = await this.client.rpc('set_portal_and_role', {
        p_portal: portal,
        p_role: role || null,
        p_organization_id: organizationId || null,
      });

      if (error) {
        return {
          success: false,
          error: this.createError(
            'RPC_ERROR',
            'Failed to update portal and role',
            error
          ),
        };
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Connection failed while updating profile',
          error
        ),
      };
    }
  }

  /**
   * Get audit log with pagination and filtering
   */
  async getAuditLog(
    options: {
      userId?: string;
      limit?: number;
      offset?: number;
      eventFilter?: string;
    } = {}
  ): Promise<ProfileResult<AuditLogEntry[]>> {
    try {
      const { userId, limit = 50, offset = 0, eventFilter } = options;

      // Validate pagination parameters
      if (limit < 1 || limit > 1000) {
        return {
          success: false,
          error: this.createError(
            'VALIDATION_ERROR',
            'Limit must be between 1 and 1000'
          ),
        };
      }

      if (offset < 0) {
        return {
          success: false,
          error: this.createError(
            'VALIDATION_ERROR',
            'Offset must be non-negative'
          ),
        };
      }

      const { data, error } = await this.client.rpc('get_user_audit_log', {
        p_user_id: userId || null,
        p_limit: limit,
        p_offset: offset,
        p_event_filter: eventFilter || null,
      });

      if (error) {
        return {
          success: false,
          error: this.createError(
            'RPC_ERROR',
            'Failed to fetch audit log',
            error
          ),
        };
      }

      const validatedEntries: AuditLogEntry[] = [];
      for (const entry of data || []) {
        const validation = this.validateData(AuditLogEntrySchema, entry);
        if (validation.success) {
          validatedEntries.push(validation.data);
        }
      }

      return { success: true, data: validatedEntries };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Connection failed while fetching audit log',
          error
        ),
      };
    }
  }

  /**
   * Check if current user has admin role
   */
  async isAdmin(): Promise<ProfileResult<boolean>> {
    const profileResult = await this.getCurrentProfile();

    if (!profileResult.success) {
      return profileResult as ProfileResult<boolean>;
    }

    const isAdminRole = profileResult.data?.role === 'admin' ||
                       profileResult.data?.role === 'organization_admin' ||
                       profileResult.data?.role === 'platform_admin';

    return { success: true, data: isAdminRole };
  }

  /**
   * Check if current user has specific role
   */
  async hasRole(role: UserRole): Promise<ProfileResult<boolean>> {
    const profileResult = await this.getCurrentProfile();

    if (!profileResult.success) {
      return profileResult as ProfileResult<boolean>;
    }

    return {
      success: true,
      data: profileResult.data?.role === role
    };
  }

  /**
   * Check if current user has portal access
   */
  async hasPortalAccess(portal: UserProfile['portal']): Promise<ProfileResult<boolean>> {
    const profileResult = await this.getCurrentProfile();

    if (!profileResult.success) {
      return profileResult as ProfileResult<boolean>;
    }

    const hasAccess = profileResult.data?.portal === portal ||
                     ['admin', 'organization_admin', 'platform_admin'].includes(profileResult.data?.role || '');

    return { success: true, data: hasAccess };
  }

  /**
   * Update profile with validated input
   */
  async updateProfile(updates: ProfileUpdate): Promise<ProfileResult<boolean>> {
    try {
      // Validate input data
      const validation = this.validateData(ProfileUpdateSchema, updates);
      if (!validation.success) {
        return validation as ProfileResult<boolean>;
      }

      const validatedUpdates = validation.data;

      // Get current user
      const { data: { user }, error: userError } = await this.client.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: this.createError(
            'AUTH_ERROR',
            'User not authenticated'
          ),
        };
      }

      const { error } = await this.client
        .from('profiles')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return {
          success: false,
          error: this.createError(
            'DATABASE_ERROR',
            'Failed to update profile',
            error
          ),
        };
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Connection failed while updating profile',
          error
        ),
      };
    }
  }

  /**
   * Get profile by ID (admin only)
   */
  async getProfileById(profileId: string): Promise<ProfileResult<UserProfile | null>> {
    try {
      // Validate UUID format
      if (!z.string().uuid().safeParse(profileId).success) {
        return {
          success: false,
          error: this.createError(
            'VALIDATION_ERROR',
            'Invalid profile ID format'
          ),
        };
      }

      // Check admin access first
      const adminCheck = await this.isAdmin();
      if (!adminCheck.success) {
        return adminCheck as ProfileResult<UserProfile | null>;
      }

      if (!adminCheck.data) {
        return {
          success: false,
          error: this.createError(
            'PERMISSION_ERROR',
            'Admin access required'
          ),
        };
      }

      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null };
        }

        return {
          success: false,
          error: this.createError(
            'DATABASE_ERROR',
            'Failed to fetch profile',
            error
          ),
        };
      }

      const validation = this.validateData(UserProfileSchema, data);
      if (!validation.success) {
        return validation;
      }

      return { success: true, data: validation.data };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Connection failed while fetching profile',
          error
        ),
      };
    }
  }

  /**
   * Health check for profile service
   */
  async healthCheck(): Promise<ProfileResult<{ status: string; latency: number }>> {
    try {
      const start = Date.now();

      const { error } = await this.client
        .from('profiles')
        .select('id')
        .limit(1);

      const latency = Date.now() - start;

      if (error) {
        return {
          success: false,
          error: this.createError(
            'HEALTH_CHECK_ERROR',
            'Service health check failed',
            error
          ),
        };
      }

      return {
        success: true,
        data: {
          status: 'healthy',
          latency,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(
          'NETWORK_ERROR',
          'Health check connection failed',
          error
        ),
      };
    }
  }
}

// Singleton instances for convenience
export const browserProfileManager = ProfileManager.browser();

// Server-side ProfileManager factory will be available in supabase-server.ts

// Legacy export - DO NOT USE in new code, use browserProfileManager instead
// @deprecated Use browserProfileManager for client code or createServerProfileManager for server code
export const profileManager = browserProfileManager;