export {
  getSupabaseBrowserClient,
  getSupabaseServerClient,
  getSupabaseClient,
  AppSupabaseClient as PatientsSupabaseClient,
} from '@autamedica/supabase-client';

// Exports for backwards compatibility
export {
  getSupabaseClient as createClient,
  getSupabaseBrowserClient as createBrowserClient,
} from '@autamedica/supabase-client';