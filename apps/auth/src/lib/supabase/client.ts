'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@autamedica/types';
import { getSupabaseConfig, createBrowserAuthConfig } from './config';

/**
 * Browser Supabase client (Client Components only)
 * - Singleton pattern with proper cleanup
 * - Uses centralized config (no direct process.env access)
 * - Auto session management
 */

// Use ReturnType to infer correct type from createBrowserClient
type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;
let browserClientInstance: BrowserClient | null = null;

export const getBrowserSupabaseClient = (): BrowserClient => {
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
export type SupabaseClientType = BrowserClient;
export type AuthUser = NonNullable<
  Awaited<ReturnType<BrowserClient['auth']['getUser']>>['data']['user']
>;
export type AuthSession = NonNullable<
  Awaited<ReturnType<BrowserClient['auth']['getSession']>>['data']['session']
>;
