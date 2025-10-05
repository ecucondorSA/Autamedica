import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@autamedica/types';
import { isDevelopment } from '@autamedica/shared';

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

// Shared auth configuration for server
const createServerAuthConfig = () => ({
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    debug: isDevelopment(),
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

// Server-only client with cookies support (for use in Server Components and API routes)
export const createServerSupabaseClient = async (
  cookieStore?: ReadonlyRequestCookies
): Promise<SupabaseClient<Database>> => {
  const { url, anonKey } = getSupabaseConfig();
  const store = cookieStore ?? await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          store.set({ name, value, ...options });
        } catch {
          // Handle cases where cookies can't be set (e.g., in middleware)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          store.set({ name, value: '', ...options });
        } catch {
          // Handle cases where cookies can't be removed
        }
      },
    },
    ...createServerAuthConfig(),
  });
};

// Type exports
export type SupabaseServerClientType = SupabaseClient<Database>;
export type AuthUser = NonNullable<Awaited<ReturnType<SupabaseServerClientType['auth']['getUser']>>['data']['user']>;
export type AuthSession = NonNullable<Awaited<ReturnType<SupabaseServerClientType['auth']['getSession']>>['data']['session']>;

// Health check utility for server
export const checkSupabaseServerConnection = async (
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

// Server-side ProfileManager factory
export const createServerProfileManager = async () => {
  const { ProfileManager } = await import('./profile-manager');
  const client = await createServerSupabaseClient();
  return new ProfileManager(client as any);
};