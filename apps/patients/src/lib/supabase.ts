'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@autamedica/types'

let cachedClient: SupabaseClient<Database> | null = null
let warned = false

export function createClient(): SupabaseClient<Database> | null {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warned) {
      console.warn('[Supabase] Variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están definidas. Las operaciones autenticadas se omitirán.')
      warned = true
    }
    return null
  }

  cachedClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return cachedClient
}
