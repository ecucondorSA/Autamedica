import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { ensureClientEnv, ensureServerEnv } from '@autamedica/shared';

export async function getUserIdFromRequest(): Promise<string | null> {
  const anonUrl = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const cookieStore = await cookies();
  const supabase = createServerClient(anonUrl, anonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set() { return undefined; },
      remove() { return undefined; },
    },
  });

  const authHeader = (await headers()).get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7);
    try {
      const adminTmp = createClient(anonUrl, ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY'));
      const { data: userRes } = await adminTmp.auth.getUser(token);
      if (userRes?.user) return userRes.user.id;
    } catch (_) { return null; }
  }

  const { data: userData } = await supabase.auth.getUser();
  return userData.user?.id ?? null;
}

