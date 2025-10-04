/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() e insertRecord() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 */

import { useEffect, useState, useCallback } from 'react'
import { selectActive, insertRecord, updateRecord } from '@autamedica/shared'
import type {
  Prescription,
  UsePrescriptionsResult,
  UUID,
  PrescriptionFilters
} from '@/types/medical'

interface UsePrescriptionsOptions {
  filters?: PrescriptionFilters
}

// Tipo UI (camelCase) para Prescription
interface UiPrescription {
  id: string;
import { logger } from '@autamedica/shared';
  patientId: string;
  doctorId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  startDate: string;
  endDate: string | null;
  status: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
      // Sistema híbrido: selectActive() retorna camelCase automáticamente
      const allPrescriptions = await selectActive<UiPrescription>('prescriptions', '*', {
        orderBy: { column: 'prescribed_date', ascending: false }
      });

      // Filtrar por patient_id
      let filtered = allPrescriptions.filter(p => p.patientId === patientId);

      // Aplicar filtros
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }

      if (filters.medication_name) {
        filtered = filtered.filter(p =>
          p.medicationName.toLowerCase().includes(filters.medication_name!.toLowerCase())
        );
      }

      if (filters.active_only) {
        const today = new Date().toISOString();
        filtered = filtered.filter(p =>
          p.status === 'activa' &&
          p.startDate <= today &&
          (!p.endDate || p.endDate >= today)
        );
      }

      setPrescriptions(filtered as unknown as Prescription[])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar prescripciones: ${errorMessage}`)
      logger.error('[usePrescriptions] Error:', err)
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
      // Sistema híbrido: insertRecord() auto-transforma a snake_case
      await insertRecord<UiPrescription>('prescriptions', {
        ...prescription,
        patient_id: patientId
      } as any);

      // Refrescar la lista
      await fetchPrescriptions()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al agregar prescripción: ${errorMessage}`)
      logger.error('[usePrescriptions] addPrescription error:', err)
      throw err
    }
  }, [patientId, fetchPrescriptions])

  const updatePrescriptionFn = useCallback(async (
    id: UUID,
    updates: Partial<Prescription>
  ): Promise<void> => {
    try {
      // Sistema híbrido: updateRecord() auto-transforma a snake_case
      await updateRecord<UiPrescription>('prescriptions', id, updates as any);

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
      logger.error('[usePrescriptions] updatePrescription error:', err)
      throw err
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchPrescriptions()
  }, [fetchPrescriptions])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  return {
    prescriptions,
    loading,
    error,
    addPrescription,
    updatePrescription: updatePrescriptionFn
  }
}