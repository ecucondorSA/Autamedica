import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { patientsEnv } from '@/lib/env'
import type {
  MedicalHistoryTimeline,
  MedicalHistorySummary,
  PatientId
} from '@autamedica/types'

const supabase = createClient(
  patientsEnv.supabase.url,
  patientsEnv.supabase.anonKey,
)

export function useMedicalHistory(patientId?: PatientId) {
  const [summary, setSummary] = useState<MedicalHistorySummary | null>(null)
  const [timeline, setTimeline] = useState<MedicalHistoryTimeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) {
      // If no patient ID, create empty structure
      setSummary({
        patient_id: 'current-user' as PatientId,
        active_conditions_count: 0,
        active_medications_count: 0,
        known_allergies_count: 0,
        last_encounter_date: new Date().toISOString(),
        chronic_conditions: [],
        critical_allergies: [],
        current_medications: []
      })

      setTimeline({
        patient_id: 'current-user' as PatientId,
        sections: {
          conditions: [],
          allergies: [],
          medications: [],
          procedures: [],
          encounters: [],
          immunizations: []
        }
      })

      setLoading(false)
      return
    }

    fetchMedicalHistory()
  }, [patientId])

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session to access their medical data
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No authenticated user found')
      }

      // For now, create empty structure since we don't have medical tables yet
      // TODO: Replace with actual queries when medical tables are implemented

      const mockSummary: MedicalHistorySummary = {
        patient_id: user.id as PatientId,
        active_conditions_count: 0,
        active_medications_count: 0,
        known_allergies_count: 0,
        last_encounter_date: new Date().toISOString(),
        chronic_conditions: [],
        critical_allergies: [],
        current_medications: []
      }

      const mockTimeline: MedicalHistoryTimeline = {
        patient_id: user.id as PatientId,
        sections: {
          conditions: [],
          allergies: [],
          medications: [],
          procedures: [],
          encounters: [],
          immunizations: []
        }
      }

      setSummary(mockSummary)
      setTimeline(mockTimeline)

    } catch (err) {
      console.error('Error fetching medical history:', err)
      setError(err instanceof Error ? err.message : 'Error loading medical history')
    } finally {
      setLoading(false)
    }
  }

  const addCondition = async (condition: any) => {
    try {
      // TODO: Implement when medical tables are ready
      // const { data, error } = await supabase
      //   .from('medical_conditions')
      //   .insert([condition])

      console.log('TODO: Add condition to database:', condition)

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      console.error('Error adding condition:', error)
      setError('Error adding medical condition')
    }
  }

  const addMedication = async (medication: any) => {
    try {
      // TODO: Implement when medical tables are ready
      console.log('TODO: Add medication to database:', medication)

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      console.error('Error adding medication:', error)
      setError('Error adding medication')
    }
  }

  const addAllergy = async (allergy: any) => {
    try {
      // TODO: Implement when medical tables are ready
      console.log('TODO: Add allergy to database:', allergy)

      // Refresh data
      await fetchMedicalHistory()
    } catch (error) {
      console.error('Error adding allergy:', error)
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
