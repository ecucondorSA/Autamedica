import { createBrowserClient as createAuthBrowserClient } from '@autamedica/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';
import { patientsEnv } from './env';

// Reuse Supabase database generics across the app
export type PatientsSupabaseClient = SupabaseClient<Database>;

const mockClient = () => {
  const NOOP = () => Promise.resolve({ data: null, error: null });

  return {
    from: () => ({
      select: NOOP,
      insert: NOOP,
      update: NOOP,
      delete: NOOP,
      upsert: NOOP,
      maybeSingle: NOOP,
      single: NOOP,
      eq: () => ({ select: NOOP, update: NOOP, delete: NOOP, maybeSingle: NOOP, single: NOOP }),
    }),
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: {
              user: {
                id: 'mock-user',
                email: 'mock@patient.local',
              },
            },
          },
          error: null,
        }),
      getUser: () =>
        Promise.resolve({
          data: {
            user: {
              id: 'mock-user',
              email: 'mock@patient.local',
            },
          },
          error: null,
        }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
        error: null,
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: () => ({
        upload: NOOP,
        download: NOOP,
        remove: NOOP,
      }),
    },
  } as unknown as PatientsSupabaseClient;
};

let browserClient: PatientsSupabaseClient | null = null;

export function getSupabaseBrowserClient(): PatientsSupabaseClient {
  if (patientsEnv.authDevBypassEnabled) {
    return mockClient();
  }

  if (typeof window === 'undefined') {
    return mockClient();
  }

  if (!browserClient) {
    browserClient = createAuthBrowserClient() as PatientsSupabaseClient;
  }

  return browserClient;
}

export function getSupabaseClient(): PatientsSupabaseClient {
  if (typeof window === 'undefined') {
    return mockClient();
  }

  return getSupabaseBrowserClient();
}

export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : mockClient();
export const createClient = getSupabaseClient;
export const createBrowserClient = getSupabaseBrowserClient;
