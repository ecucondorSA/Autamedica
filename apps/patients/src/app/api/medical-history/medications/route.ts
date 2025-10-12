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

  const medication_name = String(body?.medication_name || '').trim()
  if (!medication_name) return NextResponse.json({ error: 'medication_name requerido' }, { status: 400 })

  const dosage = body?.dosage ? String(body.dosage).trim() : null
  const frequency = body?.frequency ? String(body.frequency).trim() : null
  const route = body?.route ? String(body.route).trim() : 'oral'
  const reason = body?.reason ? String(body.reason).trim() : null
  const end_date = body?.end_date ? String(body.end_date).trim() : null

  const { data, error } = await supabase
    .from('medical_records')
    .insert([{
      patient_id: userId,
      record_type: 'prescription',
      title: medication_name,
      dosage,
      frequency,
      route,
      notes: reason,
      end_date,
      status: 'active',
      visibility: 'private'
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, data }, { status: 201 })
}

