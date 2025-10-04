import {
  createBrowserClient as createAuthBrowserClient,
  createServerClient as createAuthServerClient,
} from '@autamedica/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';

// Reuse Supabase database generics across the app
export type AppSupabaseClient = SupabaseClient<Database>;

let browserClient: AppSupabaseClient | null = null;

/**
 * Get browser client for client-side operations
 * Singleton pattern to reuse same instance
 */
export function getSupabaseBrowserClient(): AppSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient() can only be used in browser context');
  }

  if (!browserClient) {
    browserClient = createAuthBrowserClient() as AppSupabaseClient;
  }

  return browserClient;
}

/**
 * Obtiene el cliente de navegador sin lanzar excepción en entornos SSR.
 * Retorna null cuando se invoca fuera del browser.
 */
export function getOptionalSupabaseBrowserClient(): AppSupabaseClient | null {
  return typeof window === 'undefined' ? null : getSupabaseBrowserClient();
}

/**
 * Get server client for SSR operations
 * Creates new instance with server-side cookie handling
 */
export async function getSupabaseServerClient(): Promise<AppSupabaseClient> {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient() can only be used in server context');
  }

  return (await createAuthServerClient()) as AppSupabaseClient;
}

/**
 * Universal client getter
 * Automatically detects environment and returns appropriate client
 */
export function getSupabaseClient(): AppSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient() cannot be used in SSR. Use getSupabaseServerClient() instead.'
    );
  }

  return getSupabaseBrowserClient();
}
