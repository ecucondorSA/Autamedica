'use client'

import {
  AppSupabaseClient,
  getOptionalSupabaseBrowserClient,
} from '@autamedica/supabase-client'

export function createClient(): AppSupabaseClient | null {
  return getOptionalSupabaseBrowserClient()
}
