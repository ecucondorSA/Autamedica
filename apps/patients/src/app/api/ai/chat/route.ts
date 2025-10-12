import { NextResponse } from 'next/server';
import { logger } from '@autamedica/shared';

export const runtime = 'nodejs';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages: Message[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) return NextResponse.json({ ok: false, error: 'messages_required' }, { status: 400 });

    // Placeholder: echo last user message. Replace with provider integration.
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    const answer = lastUser ? `Auta: recibí tu mensaje: "${lastUser}"` : 'Auta: ¿en qué puedo ayudarte?';

    return NextResponse.json({ ok: true, data: { reply: answer } });
  } catch (e: any) {
    logger.error('[AI] chat POST error', e);
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 });
  }
}

