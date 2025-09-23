/**
 * Hook para manejar signos vitales con integración Supabase
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type {
  VitalSigns,
  UseVitalSignsResult,
  UUID
} from '@/types/medical'

export function useVitalSigns(patientId: UUID | null): UseVitalSignsResult {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latest, setLatest] = useState<VitalSigns | null>(null)

  const fetchVitalSigns = useCallback(async () => {
    if (!patientId) {
      setVitalSigns([])
      setLatest(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      const { data, error: fetchError } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const vitals = data || []
      setVitalSigns(vitals)
      setLatest(vitals.length > 0 ? vitals[0] : null)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar signos vitales: ${errorMessage}`)
      console.error('[useVitalSigns] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const addVitalSigns = useCallback(async (
    vitals: Omit<VitalSigns, 'id' | 'created_at'>
  ): Promise<void> => {
    if (!patientId) {
      throw new Error('ID de paciente requerido')
    }

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      // Calcular BMI si se proporcionan peso y altura
      let bmi = vitals.bmi
      if (vitals.weight && vitals.height && !bmi) {
        const heightInMeters = vitals.height / 100
        bmi = Number((vitals.weight / (heightInMeters * heightInMeters)).toFixed(1))
      }

      const newVitals = {
        ...vitals,
        patient_id: patientId,
        bmi,
        created_at: new Date().toISOString()
      }

      const { data, error: insertError } = await supabase
        .from('vital_signs')
        .insert(newVitals)
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Agregar a la lista local
      if (data) {
        setVitalSigns(prev => [data, ...prev])
        setLatest(data)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al agregar signos vitales: ${errorMessage}`)
      console.error('[useVitalSigns] addVitalSigns error:', err)
      throw err
    }
  }, [patientId])

  const refresh = useCallback(async () => {
    await fetchVitalSigns()
  }, [fetchVitalSigns])

  useEffect(() => {
    fetchVitalSigns()
  }, [fetchVitalSigns])

  return {
    vitalSigns,
    loading,
    error,
    addVitalSigns,
    latest
  }
}