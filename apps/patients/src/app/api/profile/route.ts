import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared';
import { buildProfileUpdatePayload } from '@/lib/zod/profiles';
import { buildPatientUpdatePayload } from '@/lib/zod/patients';

export const runtime = 'nodejs';

async function getUserIdFromRequest(): Promise<string | null> {
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

  // Prefer bearer token in dev (ports different)
  const authHeader = (await headers()).get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7);
    try {
      const adminTmp = createClient(anonUrl, ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY'));
      const { data: userRes } = await adminTmp.auth.getUser(token);
      if (userRes?.user) return userRes.user.id;
    } catch (_) { void 0 }
  }

  const { data: userData } = await supabase.auth.getUser();
  return userData.user?.id ?? null;
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { profile, patient } = body ?? {};

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);

    let updatedProfile: any = null;
    let updatedPatient: any = null;

    // Update profiles
    if (profile) {
      const snake = buildProfileUpdatePayload(profile);
      try {
        // First try modern schema
        const upd = await admin.from('profiles').update(snake).eq('id', userId).select('*').single();
        if (upd.error) throw upd.error;
        updatedProfile = upd.data;
      } catch (err: any) {
        // Fallback to legacy: full_name
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || null;
        const legacy = await admin.from('profiles').update({ full_name: fullName }).eq('id', userId).select('*').single();
        if (legacy.error) {
          logger.error('[API] profile update failed', legacy.error);
          return NextResponse.json({ ok: false, error: legacy.error.message || 'profile_update_failed' }, { status: 400 });
        }
        updatedProfile = legacy.data;
      }
    }

    // Update patients (optional)
    if (patient) {
      const snake = buildPatientUpdatePayload(patient) as any;
      try {
        const upd = await admin.from('patients').update(snake).eq('user_id', userId).select('*').maybeSingle();
        if (upd.error) throw upd.error;
        if (!upd.data) {
          // create if missing
          const ins = await admin.from('patients').upsert({ user_id: userId, ...snake }, { onConflict: 'user_id' }).select('*').maybeSingle();
          if (ins.error) throw ins.error;
          updatedPatient = ins.data;
        } else {
          updatedPatient = upd.data;
        }
      } catch (err: any) {
        // Ignore if table not present or columns differ
        logger.warn('[API] patients update skipped:', err?.message || err);
      }
    }

    return NextResponse.json({ ok: true, data: { profile: updatedProfile, patient: updatedPatient } });
  } catch (e: any) {
    logger.error('[API] profile PATCH error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}
