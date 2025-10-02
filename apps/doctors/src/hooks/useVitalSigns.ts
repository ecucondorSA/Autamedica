/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() e insertRecord() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 */

import { useEffect, useState, useCallback } from 'react'
import { selectActive, insertRecord } from '@autamedica/shared'
import type {
  VitalSigns,
  UseVitalSignsResult,
  UUID
} from '@/types/medical'

// Tipo UI (camelCase) para VitalSigns
interface UiVitalSigns {
  id: string;
  patientId: string;
  recordedAt: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  temperature: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  deletedAt: string | null;
}

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
      // Sistema híbrido: selectActive() retorna camelCase automáticamente
      const allVitals = await selectActive<UiVitalSigns>('vital_signs', '*', {
        orderBy: { column: 'recorded_at', ascending: false }
      });

      // Filtrar por patient_id
      const filtered = allVitals.filter(v => v.patientId === patientId);

      setVitalSigns(filtered as unknown as VitalSigns[])
      setLatest(filtered.length > 0 ? (filtered[0] as unknown as VitalSigns) : null)

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
      // Calcular BMI si se proporcionan peso y altura
      let bmi = vitals.bmi
      if (vitals.weight && vitals.height && !bmi) {
        const heightInMeters = vitals.height / 100
        bmi = Number((vitals.weight / (heightInMeters * heightInMeters)).toFixed(1))
      }

      // Sistema híbrido: insertRecord() auto-transforma a snake_case
      const newVitals = await insertRecord<UiVitalSigns>('vital_signs', {
        ...vitals,
        patient_id: patientId,
        bmi
      } as any);

      // Agregar a la lista local
      setVitalSigns(prev => [newVitals as unknown as VitalSigns, ...prev])
      setLatest(newVitals as unknown as VitalSigns)

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