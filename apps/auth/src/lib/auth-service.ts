import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';
import type { UserRole } from '@autamedica/types';
import { logger, getTargetUrlByRole } from '@autamedica/shared';
import { getBrowserSupabaseClient } from './supabase';

/**
 * Auth Service - Centralized authentication logic
 * Eliminates code duplication across components
 */

export interface SignInParams {
  email: string;
  password: string;
  role?: UserRole;
  returnTo?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  role?: UserRole;
  metadata?: Record<string, unknown>;
  returnTo?: string;
}

export interface OAuthSignInParams {
  provider: 'google';
  role?: UserRole;
  returnTo?: string;
}

export interface AuthServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export class AuthService {
  private client: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = (client ?? getBrowserSupabaseClient()) as SupabaseClient<Database>;
  }

  /**
   * Sign in with email and password
   */
  async signIn({
    email,
    password,
    role,
    returnTo,
  }: SignInParams): Promise<AuthServiceResult<{ redirectUrl: string }>> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message === 'Invalid login credentials'
              ? 'Email o contraseña incorrectos'
              : error.message,
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      // Determine redirect URL
      let redirectUrl = returnTo || (role ? getTargetUrlByRole(role) : '/auth/select-role');

      // In development (localhost with different ports), pass session via URL
      // because cookies don't work cross-port
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      if (isDevelopment && data.session) {
        const url = new URL(redirectUrl, window.location.origin);
        url.searchParams.set('access_token', data.session.access_token);
        url.searchParams.set('refresh_token', data.session.refresh_token);
        redirectUrl = url.toString();
      }

      return {
        success: true,
        data: { redirectUrl },
      };
    } catch (error) {
      logger.error('AuthService.signIn error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp({
    email,
    password,
    role,
    metadata = {},
    returnTo,
  }: SignUpParams): Promise<AuthServiceResult<{ redirectUrl: string }>> {
    try {
      const { data: _data, error } = await this.client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            ...metadata,
            role,
          },
          emailRedirectTo: returnTo
            ? `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
            : `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message.includes('already registered')
              ? 'Ya existe una cuenta con este email'
              : error.message,
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      // Determine redirect URL
      const redirectUrl = returnTo || (role ? getTargetUrlByRole(role) : '/auth/select-role');

      return {
        success: true,
        data: { redirectUrl },
      };
    } catch (error) {
      logger.error('AuthService.signUp error:', error);
      return {
        success: false,
        error: {
          message: 'Error al crear cuenta',
          details: error,
        },
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth({
    provider,
    role,
    returnTo,
  }: OAuthSignInParams): Promise<AuthServiceResult> {
    try {
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      if (role) callbackUrl.searchParams.set('role', role);
      if (returnTo) callbackUrl.searchParams.set('returnTo', returnTo);

      const { error } = await this.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            message: `Error con ${provider}`,
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      // OAuth redirect happens automatically
      return { success: true };
    } catch (error) {
      logger.error('AuthService.signInWithOAuth error:', error);
      return {
        success: false,
        error: {
          message: 'Error de autenticación',
          details: error,
        },
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<AuthServiceResult> {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        return {
          success: false,
          error: {
            message: 'Error al cerrar sesión',
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('AuthService.signOut error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthServiceResult> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error: {
            message: 'Error al enviar email',
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('AuthService.resetPassword error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthServiceResult> {
    try {
      const { error } = await this.client.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: {
            message: 'Error al actualizar sesión',
            code: error.status?.toString(),
            details: error,
          },
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('AuthService.refreshSession error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) {
        return {
          success: false,
          error: {
            message: 'Error al obtener sesión',
            details: error,
          },
        };
      }

      return {
        success: true,
        data: data.session,
      };
    } catch (error) {
      logger.error('AuthService.getSession error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }

  /**
   * Get current user
   */
  async getUser() {
    try {
      const { data, error } = await this.client.auth.getUser();

      if (error) {
        return {
          success: false,
          error: {
            message: 'Error al obtener usuario',
            details: error,
          },
        };
      }

      return {
        success: true,
        data: data.user,
      };
    } catch (error) {
      logger.error('AuthService.getUser error:', error);
      return {
        success: false,
        error: {
          message: 'Error de conexión',
          details: error,
        },
      };
    }
  }
}

// Singleton for browser usage
let authServiceInstance: AuthService | null = null;

export const getAuthService = (): AuthService => {
  if (typeof window === 'undefined') {
    throw new Error('getAuthService can only be called in browser environment');
  }

  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }

  return authServiceInstance;
};
