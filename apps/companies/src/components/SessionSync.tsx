'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * SessionSync Component
 *
 * Handles session synchronization in development when redirecting from Auth Hub.
 * In localhost, cookies don't work across different ports, so we pass tokens via URL.
 *
 * This component:
 * 1. Checks for access_token and refresh_token in URL params
 * 2. Sets them in Supabase client
 * 3. Cleans up the URL
 * 4. Allows the app to continue normally
 */
export function SessionSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Set the session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        // Clean up URL by removing tokens
        urlParams.delete('access_token');
        urlParams.delete('refresh_token');

        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      });
    }
  }, []);

  return null;
}
