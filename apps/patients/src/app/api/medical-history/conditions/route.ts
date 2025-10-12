import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@autamedica/auth/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = session.user.id
  const body = await request.json().catch(() => ({}))
  const condition = String(body?.condition || '').trim()
  const icd10_code = body?.icd10_code ? String(body.icd10_code).trim() : null
  const notes = body?.notes ? String(body.notes).trim() : null

  if (!condition) return NextResponse.json({ error: 'condition requerido' }, { status: 400 })

  const { data, error } = await supabase
    .from('medical_records')
    .insert([{
      patient_id: userId,
      record_type: 'diagnosis',
      title: condition,
      icd10_code,
      notes,
      status: 'active',
      visibility: 'private'
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, data }, { status: 201 })
}

