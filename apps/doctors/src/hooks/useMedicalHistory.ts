/**
 * Hook para manejar historial médico con integración Supabase
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
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
      const supabase = createClient()
      if (!supabase) {
        throw new Error('No se pudo inicializar el cliente de Supabase')
      }

      let query = supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      // Aplicar filtros
      if (filters.consultation_type) {
        query = query.eq('consultation_type', filters.consultation_type)
      }

      if (filters.date_from) {
        query = query.gte('consultation_date', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('consultation_date', filters.date_to)
      }

      if (filters.diagnosis_contains) {
        query = query.ilike('diagnosis', `%${filters.diagnosis_contains}%`)
      }

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const newRecords = data || []

      if (reset) {
        setRecords(newRecords)
      } else {
        setRecords(prev => [...prev, ...newRecords])
      }

      // Verificar si hay más páginas
      const totalLoaded = (page + 1) * pageSize
      setHasMore(newRecords.length === pageSize && (count === null || totalLoaded < count))
      setCurrentPage(page)

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