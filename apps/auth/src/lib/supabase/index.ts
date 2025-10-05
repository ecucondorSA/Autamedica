/**
 * Centralized Supabase client exports
 *
 * Usage:
 * - Client Components: import { getBrowserSupabaseClient } from '@/lib/supabase'
 * - Server Components: import { createServerSupabaseClient } from '@/lib/supabase'
 * - Configuration: import { getSupabaseConfig } from '@/lib/supabase'
 */

// Browser client (client components only)
export {
  getBrowserSupabaseClient,
  type SupabaseClientType,
  type AuthUser,
  type AuthSession,
} from './client';

// Server client (server components, API routes)
export {
  createServerSupabaseClient,
  checkSupabaseServerConnection,
  createServerProfileManager,
  type SupabaseServerClientType,
  type ServerAuthUser,
  type ServerAuthSession,
} from './server';

// Shared configuration
export {
  getSupabaseConfig,
  createBrowserAuthConfig,
  createServerAuthConfig,
} from './config';
