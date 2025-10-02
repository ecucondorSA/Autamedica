/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 * - Implementa paginación con fetch manual
 */

import { useEffect, useState, useCallback } from 'react'
import { selectActive } from '@autamedica/shared'
import type {
  MedicalRecord,
  UseMedicalHistoryResult,
  UUID,
  MedicalRecordFilters
} from '@/types/medical'

interface UseMedicalHistoryOptions {
  pageSize?: number
  filters?: MedicalRecordFilters
}

// Tipo UI (camelCase) para MedicalRecord
interface UiMedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  consultationType: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  attachments: Record<string, unknown> | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export function useMedicalHistory(
  patientId: UUID | null,
  options: UseMedicalHistoryOptions = {}
): UseMedicalHistoryResult {
  const { pageSize = 10, filters = {} } = options

  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const fetchRecords = useCallback(async (page: number = 0, reset: boolean = true) => {
    if (!patientId) {
      if (reset) {
        setRecords([])
        setHasMore(false)
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Sistema híbrido: selectActive() retorna camelCase automáticamente
      const allRecords = await selectActive<UiMedicalRecord>('medical_records', '*', {
        orderBy: { column: 'consultation_date', ascending: false }
      });

      // Filtrar por patient_id
      let filtered = allRecords.filter(r => r.patientId === patientId);

      // Aplicar filtros adicionales
      if (filters.consultation_type) {
        filtered = filtered.filter(r => r.consultationType === filters.consultation_type);
      }

      if (filters.date_from) {
        filtered = filtered.filter(r => r.consultationDate >= filters.date_from!);
      }

      if (filters.date_to) {
        filtered = filtered.filter(r => r.consultationDate <= filters.date_to!);
      }

      if (filters.diagnosis_contains) {
        filtered = filtered.filter(r =>
          r.diagnosis?.toLowerCase().includes(filters.diagnosis_contains!.toLowerCase())
        );
      }

      // Paginación manual
      const startIdx = page * pageSize;
      const endIdx = (page + 1) * pageSize;
      const newRecords = filtered.slice(startIdx, endIdx);

      if (reset) {
        setRecords(newRecords as unknown as MedicalRecord[]);
      } else {
        setRecords(prev => [...prev, ...(newRecords as unknown as MedicalRecord[])]);
      }

      // Verificar si hay más páginas
      setHasMore(endIdx < filtered.length);
      setCurrentPage(page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar historial médico: ${errorMessage}`)
      console.error('[useMedicalHistory] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [patientId, pageSize, filters])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchRecords(currentPage + 1, false)
  }, [fetchRecords, currentPage, hasMore, loading])

  const refresh = useCallback(async () => {
    await fetchRecords(0, true)
  }, [fetchRecords])

  useEffect(() => {
    fetchRecords(0, true)
  }, [fetchRecords])

  return {
    records,
    loading,
    error,
    loadMore,
    hasMore
  }
}