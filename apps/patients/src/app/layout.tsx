import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import '@livekit/components-styles'
import { PatientRootLayout } from '@/components/layout/PatientRootLayout'
import { SessionSync } from '@/components/SessionSync'

export const metadata: Metadata = {
  title: 'AutaMedica Patient Portal',
  description: 'Portal personal de pacientes AutaMedica con acceso a historial clínico, citas y documentación.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        {/* Skip link para accesibilidad - permite saltar al contenido principal */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-800 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Saltar al contenido principal
        </a>
        {/* Sincroniza sesión cuando tokens llegan por URL desde Auth Hub */}
        <SessionSync />
        <PatientRootLayout>{children}</PatientRootLayout>
      </body>
    </html>
  )
}
