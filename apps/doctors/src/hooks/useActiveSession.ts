/**
 * Hook para manejar la sesión activa de consulta médica
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { UUID } from '@/types/medical'
import { DEMO_PATIENT_ID } from '@/data/demoData'

export interface ActiveSessionData {
  patientId: UUID | null
  sessionId: UUID | null
  sessionType: 'general' | 'seguimiento' | 'urgencia' | 'especialidad'
  startTime: string | null
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada'
}

export interface UseActiveSessionResult {
  session: ActiveSessionData | null
  loading: boolean
  error: string | null
  startSession: (patientId: UUID, sessionType: ActiveSessionData['sessionType']) => Promise<void>
  endSession: () => Promise<void>
}

export function useActiveSession(): UseActiveSessionResult {
  const [session, setSession] = useState<ActiveSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveSession = async () => {
    setLoading(true)
    setError(null)

    try {
      // Para pruebas, usar datos de invitado con UUIDs válidos
      // En producción, esto consultaría la base de datos real
      await createGuestSession()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar sesión activa: ${errorMessage}`)
      console.error('[useActiveSession] Error:', err)

      // Fallback a sesión de invitado
      await createGuestSession()
    } finally {
      setLoading(false)
    }
  }

  const createGuestSession = async () => {
    // Usar datos de invitado con UUID válido predefinido
    const guestSessionId = crypto.randomUUID()

    setSession({
      patientId: DEMO_PATIENT_ID,
      sessionId: guestSessionId,
      sessionType: 'general',
      startTime: new Date().toISOString(),
      status: 'en_progreso'
    })
  }

  const startSession = async (patientId: UUID, sessionType: ActiveSessionData['sessionType']) => {
    try {
      const sessionId = crypto.randomUUID()
      const startTime = new Date().toISOString()

      setSession({
        patientId,
        sessionId,
        sessionType,
        startTime,
        status: 'en_progreso'
      })

      // En producción, esto insertaría en la base de datos real
      console.log('Sesión iniciada:', { patientId, sessionType })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al iniciar sesión: ${errorMessage}`)
      throw err
    }
  }

  const endSession = async () => {
    if (!session) return

    try {
      setSession(null)

      // En producción, esto actualizaría la base de datos real
      console.log('Sesión finalizada')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al finalizar sesión: ${errorMessage}`)
      throw err
    }
  }

  useEffect(() => {
    fetchActiveSession()
  }, [])

  return {
    session,
    loading,
    error,
    startSession,
    endSession
  }
}