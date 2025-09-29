'use client';

import { createBrowserClient } from '@autamedica/auth';

// Mock Supabase client for dev bypass mode
const createMockClient = () => {
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            user: { id: 'dev-doctor-1', email: 'doctor@dev.local' },
            access_token: 'dev-token'
          }
        },
        error: null
      }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      })
    }
  };
};

let supabaseClient: any = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // Return mock client for SSR
    return createMockClient() as any;
  }

  // Check if dev bypass is enabled
  const isDevBypass = process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === 'true';

  if (isDevBypass) {
    return createMockClient() as any;
  }

  // Create real client only once on client-side
  if (!supabaseClient) {
    supabaseClient = createBrowserClient();
  }

  return supabaseClient;
}

export const supabase = typeof window !== 'undefined' ? createClient() : createMockClient() as any;
