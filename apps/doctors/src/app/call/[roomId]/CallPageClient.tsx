'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnifiedVideoCall } from '@autamedica/telemedicine'
import { AuthProvider, useAuth } from '@autamedica/auth-hooks'
import { ensureClientEnv } from '@autamedica/shared'

interface CallPageClientProps {
  roomId: string
}

const REQUIRE_AUTH = ensureClientEnv('NEXT_PUBLIC_REQUIRE_AUTH') === 'true'

export function CallPageClient({ roomId }: CallPageClientProps) {
  return (
    <AuthProvider>
      <DoctorCallContent roomId={roomId} />
    </AuthProvider>
  )
}

function DoctorCallContent({ roomId }: { roomId: string }) {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!session) {
      if (REQUIRE_AUTH) {
        router.push('/auth/login?redirect=/call/' + roomId)
      } else {
        console.warn('[UnifiedVideoCall][doctor] sin sesión; usando identidad de desarrollo')
        setIsReady(true)
      }
      return
    }

    if (session.user.role !== 'doctor') {
      router.push('/')
      return
    }

    setIsReady(true)
  }, [session, loading, router, roomId])

  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-[#101d32] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ee58a6] mx-auto mb-4"></div>
          <p className="text-white">Preparando videollamada...</p>
        </div>
      </div>
    )
  }

  const handleCallEnd = () => {
    router.push('/schedule')
  }

  const handleCallStart = () => {
    console.log('[UnifiedVideoCall][doctor] start')
  }

  const handleStatusChange = (status: string) => {
    console.log('[UnifiedVideoCall][doctor] status:', status)
  }

  const handleError = (error: unknown) => {
    console.error('[UnifiedVideoCall][doctor] error:', error)
  }

  const { userId, userName } = useMemo(() => {
    if (session) {
      return {
        userId: session.user.id,
        userName: session.user.email || 'Doctor'
      }
    }

    return {
      userId: `dev-doctor-${roomId}`,
      userName: 'Doctor de prueba'
    }
  }, [session, roomId])

  return (
    <div className="min-h-screen bg-[#101d32] overflow-hidden">
      <UnifiedVideoCall
        roomId={roomId}
        userId={userId}
        userType="doctor"
        userName={userName}
        theme="doctor"
        onCallEnd={handleCallEnd}
        onCallStart={handleCallStart}
        onStatusChange={handleStatusChange}
        onError={handleError}
        className="h-screen"
      />
    </div>
  )
}
