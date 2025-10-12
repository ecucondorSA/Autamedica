import { NextResponse } from 'next/server';
import { logger } from '@autamedica/shared';
import { classifyIntent } from '@/lib/ai/intent-classifier';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text: string | undefined = body?.text;
    if (!text || text.trim().length === 0) return NextResponse.json({ ok: false, error: 'text_required' }, { status: 400 });
    const result = classifyIntent(text);
    return NextResponse.json({ ok: true, data: { intent: result.intent, score: result.score } });
  } catch (e: any) {
    logger.error('[AI] intent POST error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}

