import { useState, useEffect, useMemo } from 'react'

interface PatientSession {
  sessionId: string
  doctorId: string
  doctorName: string
  appointmentType: 'consulta' | 'control' | 'emergencia' | 'telemedicina'
  startTime: string
  duration?: number
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

interface PatientSessionState {
  currentSession: PatientSession | null
  sessionHistory: PatientSession[]
  isLoading: boolean
  error: string | null
}

export function usePatientSession() {
  const [state, setState] = useState<PatientSessionState>({
    currentSession: null,
    sessionHistory: [],
    isLoading: false,
    error: null
  })

  // Simular datos de sesión para desarrollo
  const mockCurrentSession: PatientSession = useMemo(() => ({
    sessionId: 'session-' + Date.now(),
    doctorId: 'dr-garcia-001',
    doctorName: 'Dr. García López',
    appointmentType: 'telemedicina',
    startTime: new Date().toISOString(),
    status: 'active'
  }), [])

  useEffect(() => {
    // Simular carga inicial de sesión
    setState(prev => ({
      ...prev,
      isLoading: true
    }))

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentSession: mockCurrentSession,
        sessionHistory: [
          {
            sessionId: 'session-001',
            doctorId: 'dr-garcia-001',
            doctorName: 'Dr. García López',
            appointmentType: 'consulta',
            startTime: '2024-01-15T10:00:00Z',
            duration: 30,
            status: 'completed'
          },
          {
            sessionId: 'session-002',
            doctorId: 'dr-martinez-002',
            doctorName: 'Dr. Martínez Silva',
            appointmentType: 'control',
            startTime: '2024-01-10T14:30:00Z',
            duration: 20,
            status: 'completed'
          }
        ],
        isLoading: false,
        error: null
      }))
    }, 1000)
  }, [mockCurrentSession])

  const startSession = async (sessionId: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      // Simular inicio de sesión
      await new Promise(resolve => setTimeout(resolve, 500))

      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          status: 'active',
          startTime: new Date().toISOString()
        } : null,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al iniciar la sesión',
        isLoading: false
      }))
    }
  }

  const endSession = async () => {
    if (!state.currentSession) return

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      // Simular finalización de sesión
      await new Promise(resolve => setTimeout(resolve, 500))

      const completedSession = {
        ...state.currentSession,
        status: 'completed' as const,
        duration: Math.floor((Date.now() - new Date(state.currentSession.startTime).getTime()) / 1000 / 60)
      }

      setState(prev => ({
        ...prev,
        currentSession: null,
        sessionHistory: [completedSession, ...prev.sessionHistory],
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al finalizar la sesión',
        isLoading: false
      }))
    }
  }

  const getSessionDuration = () => {
    if (!state.currentSession || state.currentSession.status !== 'active') return 0

    const startTime = new Date(state.currentSession.startTime).getTime()
    const currentTime = Date.now()
    return Math.floor((currentTime - startTime) / 1000) // en segundos
  }

  const formatSessionDuration = (durationInSeconds?: number) => {
    const duration = durationInSeconds ?? getSessionDuration()
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const hasActiveSession = () => {
    return state.currentSession?.status === 'active'
  }

  const canStartSession = () => {
    return state.currentSession && state.currentSession.status === 'scheduled'
  }

  return {
    ...state,
    startSession,
    endSession,
    getSessionDuration,
    formatSessionDuration,
    hasActiveSession,
    canStartSession,
    formattedDuration: formatSessionDuration()
  }
}