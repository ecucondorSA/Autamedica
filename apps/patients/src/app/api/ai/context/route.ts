import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared';
import { getUserIdFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);

    const [{ data: profile }, { data: patient }] = await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
      admin.from('patients').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    const summary = {
      name: profile?.full_name ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || null,
      email: profile?.email ?? null,
      role: profile?.role ?? 'patient',
      portal: profile?.portal ?? 'patients',
      gender: patient?.gender ?? null,
      bloodType: patient?.blood_type ?? null,
      heightCm: patient?.height_cm ?? null,
      weightKg: patient?.weight_kg ?? null,
      birthDate: patient?.birth_date ?? null,
    };

    return NextResponse.json({ ok: true, data: { summary } });
  } catch (e: any) {
    logger.error('[AI] context GET error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}

