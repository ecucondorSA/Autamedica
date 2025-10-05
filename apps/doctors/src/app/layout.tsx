import type { Metadata } from 'next'
import type { JSX } from 'react'
import './globals.css'
import '@livekit/components-styles'
import { DoctorsPortalShell } from '@/components/layout/DoctorsPortalShell'
// import { MedicalQueryProvider } from '@autamedica/hooks'
import { ClientWrapper } from '@/components/ClientWrapper'
import { AuthProvider } from '@/contexts/AuthContext'
import { fetchSessionData } from '@/lib/session-sync'
import { SessionSync } from '@/components/SessionSync'

export const metadata: Metadata = {
  title: 'AutaMedica Doctor Portal',
  description: 'Portal profesional para médicos AutaMedica con experiencia de videollamadas y herramientas clínicas.',
}

interface RootLayoutProps {
  children: React.ReactNode;
  params?: any;
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<JSX.Element> {
  // SSR session sync - Trust the middleware for auth protection
  // Middleware already handles redirects, so we just fetch session data if available
  let sessionData = null
  try {
    sessionData = await fetchSessionData()
  } catch (error) {
    // If session fetch fails, middleware will handle redirect on next navigation
    console.error('Session sync error:', error)
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
        <SessionSync />
        <AuthProvider initialSession={sessionData}>
          <ClientWrapper>
            <DoctorsPortalShell>{children as any}</DoctorsPortalShell>
          </ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
