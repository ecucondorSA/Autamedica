import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared'
import { getUserIdFromRequest } from '@/lib/server/auth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL')
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY')
    const admin = createClient(url, serviceKey)

    const patterns = await admin.from('ai_user_patterns').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200)
      .then(r => (r.error ? [] : (r.data as any[])))
      .catch(() => [] as any[])
    const faqs = await admin.from('ai_user_faq').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200)
      .then(r => (r.error ? [] : (r.data as any[])))
      .catch(() => [] as any[])

    return NextResponse.json({ ok: true, data: { patterns, faqs } })
  } catch (e: any) {
    logger.warn('[AI] patterns GET error', e)
    // Si tablas no existen, devolver listas vacías
    return NextResponse.json({ ok: true, data: { patterns: [], faqs: [] } })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL')
    const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY')
    const admin = createClient(url, serviceKey)

    const body = await request.json().catch(() => ({}))
    const kind: 'pattern' | 'faq' | undefined = body?.type

    if (kind === 'pattern') {
      const pattern = (body?.pattern as string | undefined)?.trim()
      const intent = (body?.intent as string | undefined)?.trim()
      if (!pattern || !intent) return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
      try {
        const { error } = await admin.from('ai_user_patterns').insert({ user_id: userId, pattern, intent, active: true })
        if (error) throw error
        return NextResponse.json({ ok: true })
      } catch (e) {
        logger.warn('[AI] insert pattern failed', e as any)
        return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 400 })
      }
    }

    if (kind === 'faq') {
      const question = (body?.question as string | undefined)?.trim()
      const answer = (body?.answer as string | undefined)?.trim()
      if (!question || !answer) return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
      try {
        const { error } = await admin.from('ai_user_faq').insert({ user_id: userId, question, answer, active: true })
        if (error) throw error
        return NextResponse.json({ ok: true })
      } catch (e) {
        logger.warn('[AI] insert faq failed', e as any)
        return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 })
  } catch (e: any) {
    logger.error('[AI] patterns POST error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

