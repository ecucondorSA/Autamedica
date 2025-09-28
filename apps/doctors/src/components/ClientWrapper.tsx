'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@autamedica/auth'

interface ClientWrapperProps {
  children: ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <AuthProvider onAuthStateChange={() => {}}>{children}</AuthProvider>
}
