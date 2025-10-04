'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, AuthSession, SupabaseClientType } from '../lib/supabase';
import { getBrowserSupabaseClient } from '../lib/supabase';
import type { UserRole } from '@autamedica/types';
import { logger } from '@autamedica/shared';

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  initialized: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signInWithOAuth: (provider: 'google') => Promise<{ success: boolean; error?: AuthError }>;
  signOut: () => Promise<{ success: boolean; error?: AuthError }>;
  signUp: (email: string, password: string, options?: {
    data?: Record<string, unknown>;
    redirectTo?: string;
  }) => Promise<{ success: boolean; error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  refreshSession: () => Promise<{ success: boolean; error?: AuthError }>;
}

export interface UseAuthReturn extends AuthState, AuthActions {
  supabase: SupabaseClientType;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

// Custom hook for comprehensive auth management
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    initialized: false,
  });

  const router = useRouter();
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  // Helper to create auth errors
  const createAuthError = useCallback((message: string, error?: unknown): AuthError => ({
    message,
    code: error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined,
    details: error,
  }), []);

  // Helper to update state safely
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(current => ({ ...current, ...updates }));
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          updateState({
            error: createAuthError('Failed to get session', error),
            loading: false,
            initialized: true,
          });
          return;
        }

        updateState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
          initialized: true,
        });
      } catch (error) {
        if (!mounted) return;

        updateState({
          error: createAuthError('Auth initialization failed', error),
          loading: false,
          initialized: true,
        });
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // logger.info('Auth event:', event, session?.user?.id);

        updateState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });

        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            router.refresh();
            break;
          case 'SIGNED_OUT':
            router.push('/auth/select-role');
            break;
          case 'TOKEN_REFRESHED':
            // logger.info('Token refreshed successfully');
            break;
          case 'PASSWORD_RECOVERY':
            router.push('/auth/reset-password');
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, createAuthError, updateState]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    updateState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const authError = createAuthError(
          error.message === 'Invalid login credentials'
            ? 'Email o contrase�a incorrectos'
            : error.message,
          error
        );
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      updateState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error de conexi�n', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google') => {
    updateState({ loading: true, error: null });

    try {
      const { data: _data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const authError = createAuthError(`Error con ${provider}`, error);
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      // OAuth redirect happens, so we don't update state here
      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error de autenticaci�n', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Sign out
  const signOut = useCallback(async () => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const authError = createAuthError('Error al cerrar sesi�n', error);
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      updateState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error de conexi�n', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Sign up
  const signUp = useCallback(async (
    email: string,
    password: string,
    options?: { data?: Record<string, unknown>; redirectTo?: string }
  ) => {
    updateState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: options?.data,
          emailRedirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const authError = createAuthError(
          error.message.includes('already registered')
            ? 'Ya existe una cuenta con este email'
            : error.message,
          error
        );
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      updateState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error al crear cuenta', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    updateState({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        const authError = createAuthError('Error al enviar email', error);
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      updateState({ loading: false, error: null });
      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error de conexi�n', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    updateState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        const authError = createAuthError('Error al actualizar sesi�n', error);
        updateState({ loading: false, error: authError });
        return { success: false, error: authError };
      }

      updateState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const authError = createAuthError('Error de conexi�n', error);
      updateState({ loading: false, error: authError });
      return { success: false, error: authError };
    }
  }, [supabase, createAuthError, updateState]);

  // Computed values
  const isAuthenticated = useMemo(() => !!state.user && !!state.session, [state.user, state.session]);

  const hasRole = useCallback((role: UserRole) => {
    // This would need to be enhanced with actual role checking logic
    // from the profile or user metadata
    return state.user?.user_metadata?.role === role;
  }, [state.user]);

  return {
    ...state,
    supabase,
    isAuthenticated,
    hasRole,
    signIn,
    signInWithOAuth,
    signOut,
    signUp,
    resetPassword,
    refreshSession,
  };
};