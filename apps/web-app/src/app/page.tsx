'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ResponsiveExperience from '@/components/experience/ResponsiveExperience'
import { Suspense } from 'react'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Detectar si hay un código OAuth o tokens en la URL raíz
    const code = searchParams?.get('code')
    const hash = window.location.hash

    // Check for OAuth code (PKCE flow)
    if (code) {
      console.log('OAuth code detected on root page, redirecting to callback')
      window.location.href = '/auth/callback' + window.location.search
      return
    }
    
    // Check for OAuth tokens in hash (implicit flow)
    if (hash?.includes('access_token')) {
      console.log('🚨 OAuth tokens detected in root URL - redirecting to callback')
      // Redirect to callback with both query params and hash
      window.location.href = '/auth/callback' + window.location.search + hash
      return
    }
    
    // Check for OAuth errors
    const error = searchParams?.get('error')
    if (error && hash?.includes('state=')) {
      console.log('OAuth error with state in hash - redirecting to callback')
      window.location.href = '/auth/callback' + window.location.search + hash
      return
    }
  }, [searchParams, router])

  return <ResponsiveExperience />
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  )
}