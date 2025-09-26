/**
 * Hook para manejar prescripciones con integración Supabase
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type {
  Prescription,
  UsePrescriptionsResult,
  UUID,
  PrescriptionFilters
} from '@/types/medical'

interface UsePrescriptionsOptions {
  filters?: PrescriptionFilters
}

export function usePrescriptions(
  patientId: UUID | null,
  options: UsePrescriptionsOptions = {}
): UsePrescriptionsResult {
  const { filters = {} } = options

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) {
      setPrescriptions([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      let query = supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('prescribed_date', { ascending: false })

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.medication_name) {
        query = query.ilike('medication_name', `%${filters.medication_name}%`)
      }

      if (filters.active_only) {
        const today = new Date().toISOString()
        query = query
          .eq('status', 'activa')
          .lte('start_date', today)
          .or(`end_date.is.null,end_date.gte.${today}`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setPrescriptions(data || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar prescripciones: ${errorMessage}`)
      console.error('[usePrescriptions] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [patientId, filters])

  const addPrescription = useCallback(async (
    prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> => {
    if (!patientId) {
      throw new Error('ID de paciente requerido')
    }

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      const { error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          ...prescription,
          patient_id: patientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Refrescar la lista
      await fetchPrescriptions()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al agregar prescripción: ${errorMessage}`)
      console.error('[usePrescriptions] addPrescription error:', err)
      throw err
    }
  }, [patientId, fetchPrescriptions])

  const updatePrescription = useCallback(async (
    id: UUID,
    updates: Partial<Prescription>
  ): Promise<void> => {
    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      const { error: updateError } = await supabase
        .from('prescriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Actualizar la lista local
      setPrescriptions(prev =>
        prev.map(prescription =>
          prescription.id === id
            ? { ...prescription, ...updates, updated_at: new Date().toISOString() }
            : prescription
        )
      )

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al actualizar prescripción: ${errorMessage}`)
      console.error('[usePrescriptions] updatePrescription error:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  return {
    prescriptions,
    loading,
    error,
    addPrescription,
    updatePrescription
  }
}
