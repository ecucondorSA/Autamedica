/**
 * Centralized Supabase client exports
 *
 * IMPORTANTE: Este archivo solo exporta funciones para CLIENT SIDE.
 * Para server-side, importa directamente desde './server'
 *
 * Usage:
 * - Client Components: import { getBrowserSupabaseClient } from '@/lib/supabase'
 * - Server Components: import { createServerSupabaseClient } from '@/lib/supabase/server'
 * - Configuration: import { getSupabaseConfig } from '@/lib/supabase/config'
 */

// Browser client (client components only)
export {
  getBrowserSupabaseClient,
  type SupabaseClientType,
  type AuthUser,
  type AuthSession,
} from './client';

// Shared configuration (safe for client bundles)
export {
  getSupabaseConfig,
  createBrowserAuthConfig,
} from './config';

// IMPORTANTE: NO exportamos funciones del servidor aquí para evitar
// contaminar el bundle del cliente con código que usa cookies() de Next.js
// Para server-side imports, usa:
// import { createServerSupabaseClient } from '@/lib/supabase/server'
