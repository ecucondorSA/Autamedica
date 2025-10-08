import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { Database } from '@autamedica/types';
import { getSupabaseConfig, createServerAuthConfig } from './config';

/**
 * Server Supabase client (Server Components, API Routes, Middleware)
 * - Cookie-based session management
 * - Safe for server environments
 * - Uses centralized config
 */

// Use ReturnType to infer correct type from createServerClient
type ServerClient = ReturnType<typeof createServerClient<Database>>;

export const createServerSupabaseClient = async (
  cookieStore?: ReadonlyRequestCookies
): Promise<ServerClient> => {
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
export type SupabaseServerClientType = ServerClient;
export type ServerAuthUser = NonNullable<
  Awaited<ReturnType<ServerClient['auth']['getUser']>>['data']['user']
>;
export type ServerAuthSession = NonNullable<
  Awaited<ReturnType<ServerClient['auth']['getSession']>>['data']['session']
>;

/**
 * Health check utility for server
 */
export const checkSupabaseServerConnection = async (
  client: ServerClient
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

/**
 * Server-side ProfileManager factory
 */
export const createServerProfileManager = async () => {
  const { ProfileManager } = await import('../profile-manager');
  const client = await createServerSupabaseClient();
  return new ProfileManager(client as any);
};
