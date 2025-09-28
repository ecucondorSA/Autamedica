/**
 * Hook para manejar datos de pacientes con integración Supabase
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { PatientProfile, UsePatientDataResult, UUID } from '@/types/medical'
import { DEMO_PATIENT, DEMO_PATIENT_ID } from '@/data/demoData'

export function usePatientData(patientId: UUID | null): UsePatientDataResult {
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateAge = (dateOfBirth: string): number => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const fetchPatient = async () => {
    if (!patientId) {
      setPatient(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Si es el paciente de invitado, usar datos locales
      if (patientId === DEMO_PATIENT_ID) {
        setPatient(DEMO_PATIENT)
        setLoading(false)
        return
      }

      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (data) {
        const patientProfile: PatientProfile = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          blood_type: data.blood_type,
          allergies: data.allergies,
          chronic_conditions: data.chronic_conditions,
          insurance_provider: data.insurance_provider,
          insurance_number: data.insurance_number,
          created_at: data.created_at,
          updated_at: data.updated_at,
          age: calculateAge(data.date_of_birth),
          full_name: `${data.first_name} ${data.last_name}`,
          avatar_url: data.avatar_url || undefined
        }
        setPatient(patientProfile)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar datos del paciente: ${errorMessage}`)
      console.error('[usePatientData] Error:', err)

      // Fallback a datos de invitado en caso de error
      if (patientId === DEMO_PATIENT_ID) {
        setPatient(DEMO_PATIENT)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await fetchPatient()
  }

  useEffect(() => {
    fetchPatient()
  }, [patientId])

  return {
    patient,
    loading,
    error,
    refresh
  }
}