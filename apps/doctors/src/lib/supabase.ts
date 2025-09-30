'use client';

import { createBrowserClient } from '@autamedica/auth';

let supabaseClient: any = null;

export function createClient() {
  // Create real client only once on client-side
  if (!supabaseClient && typeof window !== 'undefined') {
    supabaseClient = createBrowserClient();
  }

  return supabaseClient || createBrowserClient();
}

export const supabase = createClient();
