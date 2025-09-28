import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'
import './globals.css'
import { DoctorsPortalShell } from '@/components/layout/DoctorsPortalShell'
// import { MedicalQueryProvider } from '@autamedica/hooks'
import { ClientWrapper } from '@/components/ClientWrapper'

export const metadata: Metadata = {
  title: 'AutaMedica Doctor Portal',
  description: 'Portal profesional para médicos AutaMedica con experiencia de videollamadas y herramientas clínicas.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <ClientWrapper>
          <DoctorsPortalShell>{children}</DoctorsPortalShell>
        </ClientWrapper>
      </body>
    </html>
  )
}
