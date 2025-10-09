'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedVideoCall } from '@autamedica/telemedicine'
import { AuthProvider, useAuth } from '@autamedica/auth/react'
import { getClientEnvOrDefault, logger } from '@autamedica/shared'

interface CallPageClientProps {
  roomId: string
}

const REQUIRE_AUTH = getClientEnvOrDefault('NEXT_PUBLIC_REQUIRE_AUTH', 'false') === 'true'

export function CallPageClient({ roomId }: CallPageClientProps) {
  return (
    <AuthProvider>
      <PatientCallContent roomId={roomId} />
    </AuthProvider>
  )
}

function PatientCallContent({ roomId }: { roomId: string }) {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!session) {
      if (REQUIRE_AUTH) {
        router.push('/auth/login?redirect=/call/' + roomId)
      } else {
        logger.warn('[UnifiedVideoCall][patient] sin sesión; usando identidad de desarrollo')
        setIsReady(true)
      }
      return
    }

    if (session.user.role !== 'patient') {
      router.push('/')
      return
    }

    setIsReady(true)
  }, [session, loading, router, roomId])

  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-[#161b22] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4fd1c5] mx-auto mb-4"></div>
          <p className="text-white">Preparando videollamada...</p>
        </div>
      </div>
    )
  }

  const handleCallEnd = () => {
    router.push('/appointments')
  }

  const handleCallStart = () => {
    // logger.info('[UnifiedVideoCall][patient] start')
  }

  const handleStatusChange = (status: string) => {
    // logger.info('[UnifiedVideoCall][patient] status:', status)
  }

  const handleError = (error: unknown) => {
    logger.error('[UnifiedVideoCall][patient] error:', error)
  }

  const { userId, userName } = useMemo(() => {
    if (session) {
      return {
        userId: session.user.id,
        userName: session.user.email || 'Paciente'
      }
    }

    return {
      userId: `dev-patient-${roomId}`,
      userName: 'Paciente de prueba'
    }
  }, [session, roomId])

  return (
    <div className="min-h-screen bg-[#161b22] overflow-hidden">
      <UnifiedVideoCall
        roomId={roomId}
        userId={userId}
        userType="patient"
        userName={userName}
        theme="patient"
        onCallEnd={handleCallEnd}
        onCallStart={handleCallStart}
        onStatusChange={handleStatusChange}
        onError={handleError}
        className="h-screen"
      />
    </div>
  )
}
