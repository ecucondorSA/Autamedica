'use client';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';
import { patientsEnv } from '@/lib/env';

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
            user: { id: 'dev-patient-1', email: 'patient@dev.local' },
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

let supabaseClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    // Return mock client for SSR
    return createMockClient() as any;
  }

  // Check if dev bypass is enabled
  const isDevBypass = patientsEnv.authDevBypassEnabled;

  if (isDevBypass) {
    return createMockClient() as any;
  }

  // Create real client only once on client-side
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient<Database>(
      patientsEnv.supabase.url,
      patientsEnv.supabase.anonKey,
      { auth: { persistSession: false } },
    );
  }

  return supabaseClient;
}

export const supabase: SupabaseClient<Database> = typeof window !== 'undefined'
  ? createClient()
  : (createMockClient() as any);
