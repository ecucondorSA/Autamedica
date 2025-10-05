'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';
import { getSupabaseConfig, createBrowserAuthConfig } from './config';

/**
 * Browser Supabase client (Client Components only)
 * - Singleton pattern with proper cleanup
 * - Uses centralized config (no direct process.env access)
 * - Auto session management
 */
let browserClientInstance: SupabaseClient<Database> | null = null;

export const getBrowserSupabaseClient = (): SupabaseClient<Database> => {
  if (typeof window === 'undefined') {
    throw new Error(
      'getBrowserSupabaseClient can only be called in browser environment. ' +
      'Use createServerSupabaseClient for server-side usage.'
    );
  }

  if (!browserClientInstance) {
    const { url, anonKey } = getSupabaseConfig();

    browserClientInstance = createBrowserClient<Database>(
      url,
      anonKey,
      createBrowserAuthConfig()
    );

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      browserClientInstance?.removeAllChannels();
      browserClientInstance = null;
    });
  }

  return browserClientInstance;
};

// Type exports
export type SupabaseClientType = SupabaseClient<Database>;
export type AuthUser = NonNullable<
  Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']
>;
export type AuthSession = NonNullable<
  Awaited<ReturnType<SupabaseClientType['auth']['getSession']>>['data']['session']
>;
