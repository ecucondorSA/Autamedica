'use client';

import {
  getSupabaseBrowserClient,
  AppSupabaseClient,
} from '@autamedica/supabase-client';

let supabaseClient: AppSupabaseClient | null = null;

export function createClient(): AppSupabaseClient | null {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Create real client only once on client-side
  if (!supabaseClient) {
    supabaseClient = getSupabaseBrowserClient();
  }

  return supabaseClient;
}

// Lazy getter para evitar ejecución en build time
export function getSupabase() {
  return createClient();
}

// Export para compatibilidad con imports existentes
// IMPORTANTE: Este NO se ejecuta en build time porque está en un módulo 'use client'
export const supabase = {
  get auth() {
    const client = createClient();
    return client?.auth || { getUser: async () => ({ data: { user: null }, error: null }) };
  },
  get from() {
    const client = createClient();
    const from = client?.from;
    if (from) {
      return from.bind(client);
    }
    return () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) });
  },
};