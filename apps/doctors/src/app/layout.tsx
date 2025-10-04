import type { Metadata } from 'next'
import type { JSX } from 'react'
import './globals.css'
import { DoctorsPortalShell } from '@/components/layout/DoctorsPortalShell'
// import { MedicalQueryProvider } from '@autamedica/hooks'
import { ClientWrapper } from '@/components/ClientWrapper'
import { AuthProvider } from '@/contexts/AuthContext'
import { doctorsEnv, loginUrlBuilder } from '@/lib/env'
import { fetchSessionData } from '@/lib/session-sync'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'AutaMedica Doctor Portal',
  description: 'Portal profesional para médicos AutaMedica con experiencia de videollamadas y herramientas clínicas.',
}

interface RootLayoutProps {
  children: React.ReactNode;
  params?: any;
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<JSX.Element> {
  // SSR session sync
  const sessionData = await fetchSessionData()

  if (!sessionData) {
    // No session - redirect to Auth Hub
    redirect(loginUrlBuilder.build(doctorsEnv.appOrigin))
  }
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
        <AuthProvider initialSession={sessionData}>
          <ClientWrapper>
            <DoctorsPortalShell>{children as any}</DoctorsPortalShell>
          </ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
