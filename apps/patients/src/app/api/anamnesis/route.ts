import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ensureClientEnv, ensureServerEnv, logger } from '@autamedica/shared'
import { getUserIdFromRequest } from '@/lib/server/auth'

export const runtime = 'nodejs'

const TOTAL_SECTIONS = 13
const KNOWN_SECTIONS = [
  'personal_data',
  'emergency_contact',
  'medical_history',
  'family_history',
  'allergies',
  'current_medications',
  'chronic_conditions',
  'surgical_history',
  'hospitalizations',
  'gynecological_history',
  'lifestyle',
  'mental_health',
  'consent',
]

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    if (v === 'true') return true
    if (v === 'false') return false
  }
  return fallback
}

function buildSupabaseAdmin() {
  const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = ensureServerEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey)
}

async function ensureAnamnesisRecord(admin: ReturnType<typeof buildSupabaseAdmin>, patientId: string) {
  const existing = await admin
    .from('anamnesis')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing.data) {
    return existing.data
  }

  const insert = await admin
    .from('anamnesis')
    .insert({ patient_id: patientId, status: 'in_progress' })
    .select('*')
    .single()

  if (insert.error) throw insert.error
  return insert.data
}

function computeProgress(sections: any[]) {
  const completed = sections.filter((s) => toBoolean(s.completed))
  const completedIds = completed.map((s) => s.section)
  const pending = KNOWN_SECTIONS.filter((section) => !completedIds.includes(section))
  const completion = TOTAL_SECTIONS > 0 ? Math.round((completed.length / TOTAL_SECTIONS) * 100) : 0

  return {
    completion_percentage: completion,
    completed_sections: completedIds,
    pending_sections: pending,
    total_sections: TOTAL_SECTIONS,
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const admin = buildSupabaseAdmin()
    const anamnesis = await ensureAnamnesisRecord(admin, userId)

    const sectionsRes = await admin
      .from('anamnesis_sections')
      .select('*')
      .eq('anamnesis_id', anamnesis.id)
      .order('updated_at', { ascending: true })

    if (sectionsRes.error) throw sectionsRes.error

    const sections = sectionsRes.data ?? []
    const progress = computeProgress(sections)

    // ensure completion percentage stays in sync
    if (anamnesis.completion_percentage !== progress.completion_percentage) {
      await admin
        .from('anamnesis')
        .update({ completion_percentage: progress.completion_percentage, sections_status: { completed: progress.completed_sections } })
        .eq('id', anamnesis.id)
    }

    return NextResponse.json({ ok: true, data: { anamnesis: { ...anamnesis, completion_percentage: progress.completion_percentage }, sections, progress } })
  } catch (e) {
    logger.error('[Anamnesis] GET error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const section = typeof body?.stepId === 'string' ? body.stepId : null
    const data = body?.data ?? {}
    const markCompleted = toBoolean(body?.completed, false)

    if (!section) {
      return NextResponse.json({ ok: false, error: 'missing_step' }, { status: 400 })
    }

    const admin = buildSupabaseAdmin()
    const anamnesis = await ensureAnamnesisRecord(admin, userId)

    const upsert = await admin
      .from('anamnesis_sections')
      .upsert(
        {
          anamnesis_id: anamnesis.id,
          section,
          data,
          completed: markCompleted,
          completed_at: markCompleted ? new Date().toISOString() : null,
        },
        { onConflict: 'anamnesis_id,section' }
      )
      .select('*')
      .single()

    if (upsert.error) throw upsert.error

    const sectionsRes = await admin
      .from('anamnesis_sections')
      .select('*')
      .eq('anamnesis_id', anamnesis.id)
      .order('updated_at', { ascending: true })

    if (sectionsRes.error) throw sectionsRes.error

    const sections = sectionsRes.data ?? []
    const progress = computeProgress(sections)

    await admin
      .from('anamnesis')
      .update({ completion_percentage: progress.completion_percentage, sections_status: { completed: progress.completed_sections } })
      .eq('id', anamnesis.id)

    return NextResponse.json({ ok: true, data: { section: upsert.data, progress } })
  } catch (e) {
    logger.error('[Anamnesis] POST error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const updates: Record<string, unknown> = {}

    if (typeof body?.status === 'string') {
      updates.status = body.status
      if (body.status === 'completed' && !body.completed_at) {
        updates.completed_at = new Date().toISOString()
      }
    }

    if (typeof body?.completion_percentage === 'number') {
      updates.completion_percentage = Math.min(100, Math.max(0, Math.round(body.completion_percentage)))
    }

    if (body?.completed_at) {
      updates.completed_at = body.completed_at
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'no_updates' }, { status: 400 })
    }

    const admin = buildSupabaseAdmin()
    const anamnesis = await ensureAnamnesisRecord(admin, userId)

    const updateRes = await admin
      .from('anamnesis')
      .update(updates)
      .eq('id', anamnesis.id)
      .select('*')
      .single()

    if (updateRes.error) throw updateRes.error

    return NextResponse.json({ ok: true, data: updateRes.data })
  } catch (e) {
    logger.error('[Anamnesis] PATCH error', e)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}

