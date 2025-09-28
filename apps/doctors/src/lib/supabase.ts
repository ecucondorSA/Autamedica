"use client"

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@autamedica/types'

let cachedClient: SupabaseClient<Database> | null = null
let warned = false

export function createClient(): SupabaseClient<Database> | null {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxNTI5NDYsImV4cCI6MjA0MzcyODk0Nn0.95oSUvOFAm1bGmfNPsY5Ni4lCvmGp6ePfmXN0NgHnJw'

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
