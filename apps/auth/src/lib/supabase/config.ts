import { ensureEnv } from '@autamedica/shared';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

/**
 * Centralized Supabase configuration
 * Uses ensureEnv to follow monorepo rules (only @autamedica/shared can access process.env directly)
 */
export const getSupabaseConfig = () => {
  // ensureEnv will throw if these are missing
  const url = ensureEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return { url, anonKey };
};

/**
 * Shared auth configuration for browser clients
 * Returns only the base Supabase options (cookies config is added in client.ts)
 */
export const createBrowserAuthConfig = () => ({
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
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
} satisfies Partial<SupabaseClientOptions<'public'>>);

/**
 * Shared auth configuration for server clients
 * Returns only the base Supabase options (cookies config is added in server.ts)
 */
export const createServerAuthConfig = () => ({
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
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
} satisfies Partial<SupabaseClientOptions<'public'>>);
