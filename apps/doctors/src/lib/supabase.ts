'use client';

import { createBrowserClient } from '@autamedica/auth';

let supabaseClient: any = null;

export function createClient() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Create real client only once on client-side
  if (!supabaseClient) {
    supabaseClient = createBrowserClient();
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
    return client?.from || (() => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }));
  }
};
