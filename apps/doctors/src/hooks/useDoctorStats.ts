'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@autamedica/auth/client'
import { logger } from '@autamedica/shared'

interface AppointmentStats {
  activeCount: number
  todayCount: number
  nextAppointment: {
    time: string
    patientName: string
  } | null
}

interface UseDoctorStatsReturn {
  stats: AppointmentStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener estadísticas de consultas del doctor autenticado
 *
 * - Consultas activas
 * - Consultas del día
 * - Próxima consulta
 */
export function useDoctorStats(doctorId?: string): UseDoctorStatsReturn {
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const supabase = isClient ? createBrowserClient() : null

  const fetchStats = async () => {
    if (!supabase || !doctorId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()
      const now = new Date().toISOString()

      // Query appointments for this doctor
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          status,
          patient:patients!inner(
            profile:profiles!inner(
              full_name,
              first_name,
              last_name
            )
          )
        `)
        .eq('doctor_id', doctorId)
        .gte('scheduled_at', startOfDay)
        .order('scheduled_at', { ascending: true })

      if (apptError) {
        throw apptError
      }

      // Calculate stats
      const activeAppointments = appointments?.filter(apt =>
        apt.status === 'scheduled' || apt.status === 'in_progress'
      ) || []

      const todayAppointments = appointments?.filter(apt =>
        apt.scheduled_at >= startOfDay && apt.scheduled_at <= endOfDay
      ) || []

      // Find next appointment
      const nextAppt = appointments?.find(apt =>
        apt.scheduled_at >= now &&
        (apt.status === 'scheduled' || apt.status === 'confirmed')
      )

      const nextAppointment = nextAppt ? {
        time: new Date(nextAppt.scheduled_at).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        patientName: nextAppt.patient?.profile?.full_name ||
                    `${nextAppt.patient?.profile?.first_name || ''} ${nextAppt.patient?.profile?.last_name || ''}`.trim() ||
                    'Paciente'
      } : null

      setStats({
        activeCount: activeAppointments.length,
        todayCount: todayAppointments.length,
        nextAppointment
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading stats'
      setError(errorMessage)
      logger.error('Error in useDoctorStats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase || !doctorId) return

    fetchStats()

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000)

    return () => clearInterval(interval)
  }, [supabase, doctorId])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}
