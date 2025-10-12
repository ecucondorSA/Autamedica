/**
 * API – Historial Médico del Paciente
 * GET /api/medical-history → Resumen y timeline del historial del paciente autenticado
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@autamedica/auth/server'
import { logger } from '@autamedica/shared'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const userId = session.user.id

    // Cargar registros médicos visibles del paciente
    const { data: medicalRecords, error: recordsError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    // Si la tabla no existe o RLS impide leer, devolvemos vacío pero no 500
    if (recordsError) {
      logger.warn('[GET /api/medical-history] recordsError (devolviendo vacío)', recordsError)
    }

    // Opcional: anamnesis
    const { data: anamnesisData } = await supabase
      .from('anamnesis')
      .select('*')
      .eq('patient_id', userId)
      .maybeSingle()

    const recs = medicalRecords || []
    const activeMedications = recs.filter(r => r.record_type === 'prescription' && r.status === 'active')
    const recentDiagnoses = recs.filter(r => r.record_type === 'diagnosis')

    const summary = {
      patient_id: userId,
      active_conditions_count: recentDiagnoses.length,
      active_medications_count: activeMedications.length,
      known_allergies_count: 0,
      last_encounter_date: recs?.[0]?.created_at || new Date().toISOString(),
      chronic_conditions: recentDiagnoses.map(d => ({
        condition: d.title,
        diagnosed_date: d.created_at,
        icd10_code: d.icd10_code || undefined,
        status: 'active' as const,
      })),
      critical_allergies: [],
      current_medications: activeMedications.map(m => ({
        medication_name: m.title,
        dosage: m.dosage || 'No especificado',
        frequency: m.frequency || 'Según indicación médica',
        start_date: m.created_at,
        route: m.route || 'oral',
      })),
    }

    const timeline = {
      patient_id: userId,
      sections: {
        conditions: recentDiagnoses.map(r => ({
          id: r.id,
          condition: r.title,
          diagnosed_date: r.created_at,
          icd10_code: r.icd10_code || undefined,
          status: 'active' as const,
          notes: r.notes || undefined,
        })),
        allergies: [],
        medications: activeMedications.map(m => ({
          id: m.id,
          medication_name: m.title,
          dosage: m.dosage || 'No especificado',
          frequency: m.frequency || 'Según indicación médica',
          route: m.route || 'oral',
          start_date: m.created_at,
          end_date: m.end_date || null,
          prescribing_doctor: m.doctor_id || undefined,
          reason: m.notes || 'No especificado',
        })),
        procedures: recs
          .filter(r => r.record_type === 'procedure')
          .map(p => ({
            id: p.id,
            procedure_name: p.title,
            date: p.created_at,
            provider: p.doctor_id || undefined,
            facility: p.facility || undefined,
            outcome: p.outcome || undefined,
          })),
        encounters: recs
          .filter(r => r.record_type === 'encounter' || r.record_type === 'note')
          .map(e => ({
            id: e.id,
            date: e.created_at,
            type: 'consultation' as const,
            provider: e.doctor_id || undefined,
            reason: e.title,
            diagnosis: e.diagnosis || undefined,
            notes: e.notes || undefined,
          })),
        immunizations: [],
      },
    }

    return NextResponse.json({ success: true, data: { summary, timeline, anamnesis: anamnesisData || null } })
  } catch (error) {
    logger.error('[GET /api/medical-history] Unexpected error (devolviendo vacío)', error as Error)
    return NextResponse.json({ success: true, data: { summary: null, timeline: null, anamnesis: null } })
  }
}
