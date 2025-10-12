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

  const allergen = String(body?.allergen || '').trim()
  if (!allergen) return NextResponse.json({ error: 'allergen requerido' }, { status: 400 })

  const type = body?.type ? String(body.type).trim() : null
  const severity = body?.severity ? String(body.severity).trim() : null
  const reaction = body?.reaction ? String(body.reaction).trim() : null
  const notes = body?.notes ? String(body.notes).trim() : null

  const { data, error } = await supabase
    .from('medical_records')
    .insert([{
      patient_id: userId,
      record_type: 'note',
      title: `Alergia: ${allergen}`,
      notes: `Tipo: ${type ?? 'N/D'}, Severidad: ${severity ?? 'N/D'}, Reacción: ${reaction ?? 'N/D'}${notes ? `, Notas: ${notes}` : ''}`,
      status: 'active',
      visibility: 'shared'
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, data }, { status: 201 })
}

