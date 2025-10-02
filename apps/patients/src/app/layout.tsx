import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { PatientRootLayout } from '@/components/layout/PatientRootLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { fetchSessionData } from '@/lib/session-sync'

export const metadata: Metadata = {
  title: 'AutaMedica Patient Portal',
  description: 'Portal personal de pacientes AutaMedica con acceso a historial clínico, citas y documentación.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<JSX.Element> {
  // SSR session sync
  const sessionData = await fetchSessionData()

  // Always allow access - no redirects

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider initialSession={sessionData}>
          <PatientRootLayout>{children}</PatientRootLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
