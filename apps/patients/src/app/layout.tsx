import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { PatientRootLayout } from '@/components/layout/PatientRootLayout'
import { AuthProvider } from '@autamedica/auth'

export const metadata: Metadata = {
  title: 'AutaMedica Patient Portal',
  description: 'Portal personal de pacientes AutaMedica con acceso a historial clínico, citas y documentación.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  // Nota: La protección de rutas se maneja en middleware.ts
  // Este layout solo proporciona el contexto de autenticación

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <PatientRootLayout>{children}</PatientRootLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
