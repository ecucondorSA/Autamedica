import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@autamedica/auth/server'
import { logger } from '@autamedica/shared'

export async function POST(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    const sessionId = params.sessionId

    const body = await request.json().catch(() => ({})) as { event_type?: string; event_data?: any }
    const eventType = typeof body.event_type === 'string' ? body.event_type.trim() : ''
    const eventData = body.event_data ?? null

    if (!eventType) {
      return NextResponse.json({ ok: false, error: 'event_type_required' }, { status: 400 })
    }

    const res = await supabase
      .from('telemedicine_session_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
      })

    if (res.error) throw res.error

    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('[Telemedicina] events POST error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
