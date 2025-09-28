'use client'

import { createBrowserClient } from '@supabase/ssr'
import { ensureClientEnv } from '@autamedica/shared'

export function createClient() {
  const supabaseUrl = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}