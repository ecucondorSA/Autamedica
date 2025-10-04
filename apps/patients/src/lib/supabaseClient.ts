/**
 * @fileoverview Supabase client for patients app
 * Uses centralized @autamedica/auth package for both browser and SSR
 */

import {
  createBrowserClient as createAuthBrowserClient,
  createServerClient as createAuthServerClient
} from '@autamedica/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';

// Reuse Supabase database generics across the app
export type PatientsSupabaseClient = SupabaseClient<Database>;

let browserClient: PatientsSupabaseClient | null = null;

/**
 * Get browser client for client-side operations
 * Singleton pattern to reuse same instance
 */
export function getSupabaseBrowserClient(): PatientsSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient() can only be used in browser context');
  }

  if (!browserClient) {
    browserClient = createAuthBrowserClient() as PatientsSupabaseClient;
  }

  return browserClient;
}

/**
 * Get server client for SSR operations
 * Creates new instance with server-side cookie handling
 */
export async function getSupabaseServerClient(): Promise<PatientsSupabaseClient> {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient() can only be used in server context');
  }

  return (await createAuthServerClient()) as PatientsSupabaseClient;
}

/**
 * Universal client getter
 * Automatically detects environment and returns appropriate client
 */
export function getSupabaseClient(): PatientsSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient() cannot be used in SSR. Use getSupabaseServerClient() instead.'
    );
  }

  return getSupabaseBrowserClient();
}

// Exports for backwards compatibility
export const createClient = getSupabaseClient;
export const createBrowserClient = getSupabaseBrowserClient;
