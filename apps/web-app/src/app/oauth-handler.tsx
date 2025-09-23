'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OAuthHandler() {
  const router = useRouter()

  useEffect(() => {
    // Check if we have OAuth tokens in the hash
    const hash = window.location.hash
    
    if (hash?.includes('access_token')) {
      console.log('🚨 OAuth tokens detected in root URL - redirecting to callback')
      
      // Redirect to callback with the full hash
      const callbackUrl = `/auth/callback${window.location.search}${hash}`
      console.log('Redirecting to:', callbackUrl)
      
      // Use replace to avoid adding to history
      window.location.replace(callbackUrl)
    }
  }, [router])

  return null
}