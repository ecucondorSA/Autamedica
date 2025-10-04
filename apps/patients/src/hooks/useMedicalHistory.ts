import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@autamedica/auth'
import { logger } from '@autamedica/shared'
import type {
  MedicalHistoryTimeline,
  MedicalHistorySummary,
  PatientId
} from '@autamedica/types'

export function useMedicalHistory(patientId?: PatientId) {
  const [summary, setSummary] = useState<MedicalHistorySummary | null>(null)
  const [timeline, setTimeline] = useState<MedicalHistoryTimeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicalHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createBrowserClient()

      // Get current user session
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No authenticated user found')
      }

      const userId = patientId || (user.id as PatientId)

      // Fetch medical records
      const { data: medicalRecords, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError

      // Fetch from anamnesis table for chronic conditions and allergies
      const { data: anamnesisData } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('patient_id', userId)
        .single()

      // Build summary from data
      const activeMedications = medicalRecords?.filter(r =>
        r.record_type === 'prescription' && r.status === 'active'
      ) || []

      const recentDiagnoses = medicalRecords?.filter(r =>
        r.record_type === 'diagnosis'
      ) || []

      const summaryData: MedicalHistorySummary = {
        patient_id: userId,
        active_conditions_count: recentDiagnoses.length,
        active_medications_count: activeMedications.length,
        known_allergies_count: 0, // Will be populated from anamnesis if available
        last_encounter_date: medicalRecords?.[0]?.created_at || new Date().toISOString(),
        chronic_conditions: recentDiagnoses.map(d => ({
          condition: d.title,
          diagnosed_date: d.created_at,
          icd10_code: d.icd10_code || undefined,
          status: 'active' as const
        })),
        critical_allergies: [],
        current_medications: activeMedications.map(m => ({
          medication_name: m.title,
          dosage: m.dosage || 'No especificado',
          frequency: m.frequency || 'Según indicación médica',
          start_date: m.created_at,
          route: m.route || 'oral'
        }))
      }

      // Build timeline
      const timelineData: MedicalHistoryTimeline = {
        patient_id: userId,
        sections: {
          conditions: recentDiagnoses.map(r => ({
            id: r.id,
            condition: r.title,
            diagnosed_date: r.created_at,
            icd10_code: r.icd10_code || undefined,
            status: 'active' as const,
            notes: r.notes || undefined
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
            reason: m.notes || 'No especificado'
          })),
          procedures: medicalRecords?.filter(r => r.record_type === 'procedure').map(p => ({
            id: p.id,
            procedure_name: p.title,
            date: p.created_at,
            provider: p.doctor_id || undefined,
            facility: p.facility || undefined,
            outcome: p.outcome || undefined
          })) || [],
          encounters: medicalRecords?.filter(r => r.record_type === 'encounter' || r.record_type === 'note').map(e => ({
            id: e.id,
            date: e.created_at,
            type: 'consultation' as const,
            provider: e.doctor_id || undefined,
            reason: e.title,
            diagnosis: e.diagnosis || undefined,
            notes: e.notes || undefined
          })) || [],
          immunizations: []
        }
      }

      setSummary(summaryData)
      setTimeline(timelineData)

    } catch (err) {
      logger.error('Error fetching medical history:', err)
      setError(err instanceof Error ? err.message : 'Error loading medical history')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchMedicalHistory()
  }, [fetchMedicalHistory])

  const addCondition = async (condition: any) => {
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error: insertError } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: user.id,
          record_type: 'diagnosis',
          title: condition.condition,
          icd10_code: condition.icd10_code,
          notes: condition.notes,
          status: 'active',
          visibility: 'private'
        }])

      if (insertError) throw insertError

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      logger.error('Error adding condition:', error)
      setError('Error adding medical condition')
    }
  }

  const addMedication = async (medication: any) => {
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error: insertError } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: user.id,
          record_type: 'prescription',
          title: medication.medication_name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          route: medication.route,
          notes: medication.reason,
          status: 'active',
          visibility: 'private'
        }])

      if (insertError) throw insertError

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      logger.error('Error adding medication:', error)
      setError('Error adding medication')
    }
  }

  const addAllergy = async (allergy: any) => {
    try {
      // Allergies are stored in anamnesis, not medical_records
      // For now, we'll add a note in medical_records
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error: insertError } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: user.id,
          record_type: 'note',
          title: `Alergia: ${allergy.allergen}`,
          notes: `Tipo: ${allergy.type}, Severidad: ${allergy.severity}, Reacción: ${allergy.reaction}`,
          status: 'active',
          visibility: 'shared'
        }])

      if (insertError) throw insertError

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      logger.error('Error adding allergy:', error)
      setError('Error adding allergy')
    }
  }

  return {
    summary,
    timeline,
    loading,
    error,
    refresh: fetchMedicalHistory,
    addCondition,
    addMedication,
    addAllergy
  }
}
