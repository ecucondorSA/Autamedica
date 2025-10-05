/**
 * @fileoverview Hook to get a singleton Supabase client instance
 * Optimizes performance by reusing the same client across components
 */

'use client'

import { useMemo } from 'react'
import { createBrowserClient } from '../client/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Hook to get a memoized Supabase client instance
 *
 * @returns Singleton Supabase client for the current session, or null in SSR
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const supabase = useSupabase()
 *
 *   const fetchData = async () => {
 *     if (!supabase) return; // Guard for SSR
 *     const { data } = await supabase.from('table').select('*')
 *   }
 * }
 * ```
 */
export function useSupabase(): SupabaseClient | null {
  const client = useMemo(() => {
    // SSR guard: return null during server-side rendering
    if (typeof window === 'undefined') {
      return null
    }
    return createBrowserClient()
  }, [])
  return client
}
