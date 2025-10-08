export {
  getSupabaseBrowserClient,
  getSupabaseServerClient,
  getSupabaseClient,
} from '@autamedica/supabase-client';

// Exports for backwards compatibility
export {
  getSupabaseClient as createClient,
  getSupabaseBrowserClient as createBrowserClient,
} from '@autamedica/supabase-client';

// Type exports
export type { SupabaseClient } from '@supabase/supabase-js';