import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@autamedica/types/database';

// Environment validation with detailed error messages
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please check your .env.local file or deployment configuration.'
    );
  }

  if (!anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please check your .env.local file or deployment configuration.'
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: ${url}. ` +
      'Please ensure it follows the format: https://your-project.supabase.co'
    );
  }

  return { url, anonKey };
};

// Shared auth configuration
const createAuthConfig = (options: {
  persistSession?: boolean;
  autoRefreshToken?: boolean;
  detectSessionInUrl?: boolean;
}) => ({
  auth: {
    persistSession: options.persistSession ?? false,
    autoRefreshToken: options.autoRefreshToken ?? false,
    detectSessionInUrl: options.detectSessionInUrl ?? true,
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
});

// Server-only client factory (for use in Server Components and API routes)
export const createServerSupabaseClient = (): SupabaseClient<Database> => {
  const { url, anonKey } = getSupabaseConfig();

  return createClient<Database>(url, anonKey, {
    ...createAuthConfig({
      persistSession: false,
      autoRefreshToken: false,
    }),
  });
};

// Browser client (for use in Client Components)
export const createBrowserSupabaseClient = (): SupabaseClient<Database> => {
  const { url, anonKey } = getSupabaseConfig();

  return createClient<Database>(url, anonKey, {
    ...createAuthConfig({
      persistSession: true,
      autoRefreshToken: true,
    }),
  });
};

// Legacy exports for backward compatibility
// @deprecated Use createServerSupabaseClient instead
export const supabase = () => createServerSupabaseClient();

// @deprecated Use createBrowserSupabaseClient instead
export const createBrowserClient = createBrowserSupabaseClient;

// Singleton pattern for browser client (with proper cleanup)
let browserClientInstance: SupabaseClient<Database> | null = null;

export const getBrowserSupabaseClient = (): SupabaseClient<Database> => {
  if (typeof window === 'undefined') {
    throw new Error(
      'getBrowserSupabaseClient can only be called in browser environment. ' +
      'Use createServerSupabaseClient for server-side usage.'
    );
  }

  if (!browserClientInstance) {
    browserClientInstance = createBrowserSupabaseClient();

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        browserClientInstance?.auth.signOut();
        browserClientInstance = null;
      });
    }
  }

  return browserClientInstance;
};

// Type-safe database access helpers
export type SupabaseClientType = SupabaseClient<Database>;
export type AuthUser = NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']>;
export type AuthSession = NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getSession']>>['data']['session']>;

// Health check utility
export const checkSupabaseConnection = async (
  client: SupabaseClient<Database>
): Promise<{ healthy: boolean; latency?: number; error?: string }> => {
  try {
    const start = Date.now();
    await client.from('profiles').select('id').limit(1).single();
    const latency = Date.now() - start;

    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};