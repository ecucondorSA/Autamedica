import { ensureEnv } from '@autamedica/shared';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

/**
 * Centralized Supabase configuration
 * Uses ensureEnv to follow monorepo rules (only @autamedica/shared can access process.env directly)
 */
export const getSupabaseConfig = () => {
  const url = ensureEnv('NEXT_PUBLIC_SUPABASE_URL', {
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co',
  });

  const anonKey = ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', {
    description: 'Supabase anonymous key for client-side auth',
  });

  return { url, anonKey };
};

/**
 * Shared auth configuration for browser clients
 */
export const createBrowserAuthConfig = (): SupabaseClientOptions<'public'> => ({
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': '@autamedica/auth-app',
    },
  },
});

/**
 * Shared auth configuration for server clients
 */
export const createServerAuthConfig = (): SupabaseClientOptions<'public'> => ({
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': '@autamedica/auth-app-server',
    },
  },
});
