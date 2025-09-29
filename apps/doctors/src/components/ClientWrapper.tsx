'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@autamedica/auth'
import { useRouter } from 'next/navigation'

interface ClientWrapperProps {
  children: ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const router = useRouter()

  const handleAuthStateChange = (event: string, session: any) => {
    if (event === 'SIGNED_OUT') {
      router.push('/auth/login?portal=medico')
    }
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('🔐 Doctor authenticated:', session.user.email)
    }
  }

  return (
    <AuthProvider onAuthStateChange={handleAuthStateChange}>
      {children}
    </AuthProvider>
  )
}
