import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://testing.supabase.autamedica.local';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'testing-anon-key';
process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  cleanup()
})
