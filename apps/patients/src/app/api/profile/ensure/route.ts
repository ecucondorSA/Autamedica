import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const anonUrl = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const anonKey = ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabase = createServerClient(anonUrl, anonKey, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    });

    // Try auth via Authorization: Bearer <token> header first (works in dev across ports)
    const authHeader = (await import('next/headers')).headers().get('authorization');
    let userId: string | null = null;
    if (authHeader?.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7);
      try {
        const adminTmp = createClient(anonUrl, ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY'));
        const { data: userRes, error: userErr } = await adminTmp.auth.getUser(token);
        if (!userErr && userRes?.user) userId = userRes.user.id;
      } catch {}
    }

    if (!userId) {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (!userErr && userData.user) {
        userId = userData.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);

    // Ensure profiles row (id PK) exists with minimal fields
    try {
      const { data: exists } = await admin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      if (!exists) {
        await admin
          .from('profiles')
          .insert({ id: userId })
          .throwOnError();
      }
    } catch (e) {
      logger.error('[API] ensure profile failed (profiles)', e as Error);
      return NextResponse.json({ ok: false, error: 'profiles_failed' }, { status: 400 });
    }

    // Optionally ensure patients row exists if table is present
    try {
      await admin.from('patients').upsert({ user_id: userId, active: true }, { onConflict: 'user_id', ignoreDuplicates: false });
    } catch {
      // ignore if table or constraint is different in this instance
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('[API] profile ensure error', err as Error);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}
