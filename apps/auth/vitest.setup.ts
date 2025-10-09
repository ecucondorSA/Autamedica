import { afterEach, beforeAll, vi } from 'vitest'

// Provide stable environment defaults so Supabase client factories used in tests
// don't throw when ensureEnv validates configuration. These values are safe
// because Vitest never performs real network requests; they only need to be
// syntactically valid URLs/keys.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://testing.supabase.autamedica.local';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'testing-anon-key';
process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://auth.autamedica.test';
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})
