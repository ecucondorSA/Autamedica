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
 * @returns Singleton Supabase client for the current session
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const supabase = useSupabase()
 *   
 *   const fetchData = async () => {
 *     const { data } = await supabase.from('table').select('*')
 *   }
 * }
 * ```
 */
export function useSupabase(): SupabaseClient {
  const client = useMemo(() => createBrowserClient(), [])
  return client
}
