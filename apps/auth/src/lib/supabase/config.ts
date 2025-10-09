import { ensureClientEnv } from '@autamedica/shared';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

/**
 * Centralized Supabase configuration
 * Uses ensureClientEnv with static CLIENT_ENV_MAP for Next.js build-time injection
 */
export const getSupabaseConfig = () => {
  const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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
