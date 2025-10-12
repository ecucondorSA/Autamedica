import { NextResponse } from 'next/server'
import { logger } from '@autamedica/shared'
import { getUserIdFromRequest } from '@/lib/server/auth'
import { buildPatientContext, persistPatientContextFiles, getAdminClient } from '@/lib/ai/context-builder'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const admin = await getAdminClient()
    const ctx = await buildPatientContext(userId, admin)
    const persisted = await persistPatientContextFiles(userId, ctx, admin)

    return NextResponse.json({ ok: true, data: { summary: ctx.summary, storage: persisted } })
  } catch (e: any) {
    logger.error('[AI] context sync error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'internal_error' }, { status: 500 })
  }
}

