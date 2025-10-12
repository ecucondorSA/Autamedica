import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@autamedica/auth/server'
import { logger, getOptionalClientEnv, ensureServerEnv } from '@autamedica/shared'
import { randomUUID } from 'node:crypto'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
]

function getSignalingUrl(): string {
  const clientUrl =
    getOptionalClientEnv?.('NEXT_PUBLIC_SIGNALING_SERVER_URL') ??
    getOptionalClientEnv?.('NEXT_PUBLIC_SIGNALING_SERVICE_URL') ??
    getOptionalClientEnv?.('NEXT_PUBLIC_SIGNALING_URL') ??
    null

  const serverUrl = process.env.SIGNALING_SERVICE_URL ?? process.env.SIGNALING_SERVER_URL ?? null
  return clientUrl ?? serverUrl ?? 'wss://telemedicina.autamedica.com'
}

type DbTelemedicineSession = {
  id: string
  patient_id: string
  doctor_id: string
  status: string
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  room_id: string | null
  created_at: string
  updated_at: string
}

type SessionPayload = {
  session_id: string
  room_id: string
  status: string
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
}

type StartResponse = {
  session: SessionPayload
  signaling: {
    room_id: string
    server_url: string
    ice_servers: Array<{ urls: string | string[]; username?: string; credential?: string }>
  }
}

function mapSession(row: DbTelemedicineSession): SessionPayload {
  return {
    session_id: row.id,
    room_id: row.room_id ?? '',
    status: row.status,
    scheduled_at: row.scheduled_at,
    started_at: row.started_at,
    ended_at: row.ended_at,
  }
}

async function resolvePatientId(supabase: ReturnType<typeof createRouteHandlerClient>, userId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new Error('patient_not_found')
  return data.id as string
}

function sanitizeUuid(input: unknown): string | null {
  if (typeof input === 'string' && input.trim().length > 0) return input.trim()
  return null
}

function getSignalingServiceUrl(): string | null {
  try {
    return ensureServerEnv('SIGNALING_SERVICE_URL')
  } catch {
    return null
  }
}

async function requestLiveKitPayload(
  signalingUrl: string,
  payload: { consultationId: string; patientId: string; doctorId: string }
): Promise<{ token: string; url: string; roomName?: string } | null> {
  try {
    const response = await fetch(`${signalingUrl.replace(/\/$/, '')}/api/consultations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`signaling_error_${response.status}: ${text}`)
    }

    const json = await response.json()
    const data = json?.data
    if (data?.patientToken && data?.livekitUrl) {
      return {
        token: data.patientToken,
        url: data.livekitUrl,
        roomName: data.roomName,
      }
    }
    return null
  } catch (err) {
    logger.error('[Telemedicina] LiveKit handshake failed', err)
    return null
  }
}

async function markAppointmentStatus(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  appointmentId: string | null,
  status: 'in_progress' | 'completed'
) {
  if (!appointmentId) return
  const updates: Record<string, unknown> = { status }
  if (status === 'completed') {
    updates.updated_at = new Date().toISOString()
  } else if (status === 'in_progress') {
    updates.updated_at = new Date().toISOString()
  }
  await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    if (!authSession) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as { doctor_id?: string; appointment_id?: string }
    const doctorId = sanitizeUuid(body.doctor_id)
    if (!doctorId) {
      return NextResponse.json({ ok: false, error: 'doctor_id_required' }, { status: 400 })
    }

    const patientId = await resolvePatientId(supabase, authSession.user.id)
    const signalingUrl = getSignalingServiceUrl()

    const existing = await supabase
      .from('telemedicine_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .eq('status', 'in_progress')
      .limit(1)
      .single()

    if (existing.data) {
      const participantsRes = await supabase
        .from('telemedicine_room_participants')
        .select('*')
        .eq('room_id', existing.data.room_id || '')

      const eventsRes = await supabase
        .from('telemedicine_session_events')
        .select('*')
        .eq('session_id', existing.data.id)
        .order('created_at', { ascending: false })
        .limit(50)

      const livekit = signalingUrl
        ? await requestLiveKitPayload(signalingUrl, {
            consultationId: existing.data.id,
            patientId,
            doctorId,
          })
        : null

      return NextResponse.json({
        ok: true,
        data: {
          session: mapSession(existing.data as DbTelemedicineSession),
          signaling: {
            room_id: existing.data.room_id || '',
            server_url: getSignalingUrl(),
            ice_servers: ICE_SERVERS,
          },
          participants: participantsRes.data ?? [],
          events: eventsRes.data ?? [],
          livekit,
        } satisfies StartResponse,
      })
    }

    const appointmentId = sanitizeUuid(body.appointment_id)
    if (appointmentId) {
      const conflict = await supabase
        .from('telemedicine_sessions')
        .select('id, status')
        .eq('appointment_id', appointmentId)
        .maybeSingle()

      if (conflict.data && conflict.data.status === 'in_progress') {
        return NextResponse.json({ ok: false, error: 'session_already_started' }, { status: 409 })
      }
    }

    const roomId = `room_${Date.now()}_${randomUUID()}`
    const nowIso = new Date().toISOString()

    const insertPayload = {
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      status: 'in_progress',
      scheduled_at: nowIso,
      started_at: nowIso,
      room_id: roomId,
    }

    const inserted = await supabase
      .from('telemedicine_sessions')
      .insert(insertPayload)
      .select('*')
      .single()

    if (inserted.error || !inserted.data) {
      logger.error('[Telemedicina] Error creando sesión', inserted.error)
      return NextResponse.json({ ok: false, error: 'session_create_failed' }, { status: 500 })
    }

    await markAppointmentStatus(supabase, appointmentId, 'in_progress')

    const livekit = signalingUrl
      ? await requestLiveKitPayload(signalingUrl, {
          consultationId: inserted.data.id,
          patientId,
          doctorId,
        })
      : null

    return NextResponse.json({
      ok: true,
      data: {
        session: mapSession(inserted.data as DbTelemedicineSession),
        signaling: {
          room_id: roomId,
          server_url: getSignalingUrl(),
          ice_servers: ICE_SERVERS,
        },
        participants: [],
        events: [],
        livekit,
      } satisfies StartResponse,
    })
  } catch (e) {
    logger.error('[Telemedicina] POST error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    if (!authSession) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('telemedicine_sessions')
      .select('*')

    if (sessionId) {
      query = query.eq('id', sessionId)
    } else {
      query = query
        .or(`patient_id.eq.${authSession.user.id},doctor_id.eq.${authSession.user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    const sessionRes = await query.maybeSingle()

    if (sessionRes.error) throw sessionRes.error
    if (!sessionRes.data) {
      return NextResponse.json({ ok: true, data: null })
    }

    const sessionRow = sessionRes.data as DbTelemedicineSession

    const participantsRes = await supabase
      .from('telemedicine_room_participants')
      .select('*')
      .eq('room_id', sessionRow.room_id || '')

    const eventsRes = await supabase
      .from('telemedicine_session_events')
      .select('*')
      .eq('session_id', sessionRow.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (participantsRes.error) throw participantsRes.error
    if (eventsRes.error) throw eventsRes.error

    const signalingUrl = getSignalingServiceUrl()
    const shouldRequestLivekit =
      signalingUrl &&
      sessionRow.status === 'in_progress' &&
      Boolean(sessionRow.patient_id) &&
      Boolean(sessionRow.doctor_id)

    const livekit = shouldRequestLivekit
      ? await requestLiveKitPayload(signalingUrl!, {
          consultationId: sessionRow.id,
          patientId: String(sessionRow.patient_id),
          doctorId: String(sessionRow.doctor_id),
        })
      : null

    return NextResponse.json({
      ok: true,
      data: {
        session: mapSession(sessionRow),
        participants: participantsRes.data ?? [],
        events: eventsRes.data ?? [],
        signaling: {
          room_id: sessionRow.room_id ?? '',
          server_url: getSignalingUrl(),
          ice_servers: ICE_SERVERS,
        },
        livekit,
      },
    })
  } catch (e) {
    logger.error('[Telemedicina] GET error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
