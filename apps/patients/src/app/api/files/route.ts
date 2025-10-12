import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared';
import { getUserIdFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';

const BUCKET = 'patient-files';

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);

    const prefix = `${userId}/`;
    const { data: objects, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 100, offset: 0 });
    if (error) throw error;

    const list = Array.isArray(objects) ? objects : [];
    return NextResponse.json({ ok: true, data: { files: list.map(o => ({
      name: o.name,
      path: prefix + o.name,
      size: o.metadata?.size ?? null,
      lastModified: o.updated_at ?? null,
      contentType: o.metadata?.mimetype ?? null,
    })) } });
  } catch (e: any) {
    logger.error('[API] files GET error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const filename: string | undefined = body?.filename;
    if (!filename) return NextResponse.json({ ok: false, error: 'filename_required' }, { status: 400 });

    const suggestedPath = `${userId}/${Date.now()}-${filename}`;
    // Client will upload using supabase-js (browser) to storage.from(BUCKET).upload(suggestedPath, file)
    return NextResponse.json({ ok: true, data: { bucket: BUCKET, path: suggestedPath } });
  } catch (e: any) {
    logger.error('[API] files POST error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const path: string | undefined = body?.path;
    if (!path || !path.startsWith(`${userId}/`)) return NextResponse.json({ ok: false, error: 'invalid_path' }, { status: 400 });

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(url, serviceKey);
    const { error } = await admin.storage.from(BUCKET).remove([path]);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    logger.error('[API] files DELETE error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}
