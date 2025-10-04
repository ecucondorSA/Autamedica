/**
 * Hook para manejar datos de pacientes con integración Supabase
 */

import { useEffect, useState } from 'react'
import type { PatientProfile, UUID } from '@autamedica/types'

// TODO: Define this interface
interface UsePatientDataResult {
  patient: PatientProfile | null;
import { logger } from '@autamedica/shared';
  loading: boolean;
  error: string | null;
  refresh?: () => void;
}

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
      // TODO: Implement Supabase client integration
      // For now, return null to avoid errors
      const supabase = null as any

      // TODO: Replace with actual Supabase call
      const { data, error: fetchError } = { data: null, error: null } as any

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (data) {
        const typedData = data as any;
        const patientProfile = {
          id: typedData.id,
          firstName: typedData.first_name,
          lastName: typedData.last_name,
          first_name: typedData.first_name, // legacy support
          last_name: typedData.last_name, // legacy support
          date_of_birth: typedData.date_of_birth,
          gender: typedData.gender,
          phone: typedData.phone,
          email: typedData.email,
          address: typedData.address,
          emergency_contact_name: typedData.emergency_contact_name,
          emergency_contact_phone: typedData.emergency_contact_phone,
          blood_type: typedData.blood_type,
          allergies: typedData.allergies,
          chronic_conditions: typedData.chronic_conditions,
          insurance_provider: typedData.insurance_provider,
          insurance_number: typedData.insurance_number,
          created_at: typedData.created_at,
          updated_at: typedData.updated_at,
          age: calculateAge(typedData.date_of_birth),
          full_name: `${typedData.first_name} ${typedData.last_name}`,
          avatar_url: typedData.avatar_url || undefined
        } as any
        setPatient(patientProfile)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar datos del paciente: ${errorMessage}`)
      logger.error('[usePatientData] Error:', err)

      // TODO: Handle demo patient case if needed
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