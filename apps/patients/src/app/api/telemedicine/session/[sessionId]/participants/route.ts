import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@autamedica/auth/server'
import { logger } from '@autamedica/shared'

export async function POST(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    const sessionId = params.sessionId

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    if (!authSession) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const sessionRes = await supabase
      .from('telemedicine_sessions')
      .select('room_id, doctor_id, patient_id')
      .eq('id', sessionId)
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({})) as { role?: string }
    let role = typeof body.role === 'string' ? body.role : null

    if (!role) {
      role = sessionRes.data.doctor_id === authSession.user.id ? 'doctor' : 'patient'
    }

    const insert = await supabase
      .from('telemedicine_room_participants')
      .insert({
        room_id: sessionRes.data.room_id,
        user_id: authSession.user.id,
        role,
      })

    if (insert.error) throw insert.error

    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('[Telemedicina] participants POST error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    const sessionId = params.sessionId

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    if (!authSession) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const sessionRes = await supabase
      .from('telemedicine_sessions')
      .select('room_id')
      .eq('id', sessionId)
      .single()

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({})) as { left?: boolean }

    if (!body.left) {
      return NextResponse.json({ ok: false, error: 'left_required' }, { status: 400 })
    }

    const res = await supabase
      .from('telemedicine_room_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', sessionRes.data.room_id)
      .eq('user_id', authSession.user.id)
      .is('left_at', null)

    if (res.error) throw res.error

    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('[Telemedicina] participants PATCH error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
