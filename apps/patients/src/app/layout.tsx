import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { PatientRootLayout } from '@/components/layout/PatientRootLayout'

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
      <body className="bg-slate-950 text-slate-100 antialiased">
        <PatientRootLayout>{children}</PatientRootLayout>
      </body>
    </html>
  )
}
