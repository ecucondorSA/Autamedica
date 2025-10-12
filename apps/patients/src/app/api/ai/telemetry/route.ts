import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared'
import { getUserIdFromRequest } from '@/lib/server/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const message = (body?.message as string | undefined)?.slice(0, 2000) || ''
    const intent = (body?.intent as string | undefined)?.slice(0, 100) || 'unknown'
    const confidence = typeof body?.confidence === 'number' ? Number(body?.confidence) : null
    const usedPattern = Boolean(body?.usedPattern)
    const replyPreview = (body?.replyPreview as string | undefined)?.slice(0, 500) || null

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL')
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY')
    const admin = createClient(url, serviceKey)

    // Insertar si la tabla existe; si no, ignorar
    try {
      await admin.from('patient_ai_chats').insert({ user_id: userId, message, intent, confidence, used_pattern: usedPattern, reply_preview: replyPreview })
    } catch (e) {
      logger.warn('[AI] telemetry insert skipped:', (e as any)?.message || e)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    logger.error('[AI] telemetry error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

