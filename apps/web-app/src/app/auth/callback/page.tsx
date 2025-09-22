'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔐 OAuth Callback Page - Processing OAuth callback...')
      
      const supabase = createClient()
      
      if (!supabase) {
        console.error('Failed to create Supabase client')
        router.push('/auth/login?error=client_failed')
        return
      }
      
      // Check for code in URL params (PKCE flow)
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      
      if (code) {
        console.log('📦 PKCE flow detected - exchanging code for session...')
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Failed to exchange code:', exchangeError)
            router.push(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
            return
          }
          
          console.log('✅ Session established successfully')
          
          // Get user data to determine portal
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const role = user.user_metadata?.role
            console.log('User role:', role)
            
            // Redirect to external portal URLs based on role
            switch(role) {
              case 'doctor':
                window.location.href = 'https://autamedica-doctors.pages.dev'
                break
              case 'patient':
                window.location.href = 'https://autamedica-patients.pages.dev'
                break
              case 'company':
                window.location.href = 'https://autamedica-companies.pages.dev'
                break
              default:
                router.push('/auth/select-role')
            }
          } else {
            router.push('/auth/select-role')
          }
          return
        } catch (error) {
          console.error('Unexpected error during code exchange:', error)
          router.push('/auth/login?error=exchange_failed')
          return
        }
      }
      
      // Fallback to token flow (for implicit flow)
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const error = params.get('error')
      const errorDescription = params.get('error_description')
      
      if (error) {
        console.error('OAuth error:', error, errorDescription)
        router.push(`/auth/login?error=${encodeURIComponent(error)}`)
        return
      }
      
      if (accessToken) {
        console.log('✅ Tokens found, setting session...')
        console.log('Access token length:', accessToken.length)
        console.log('Refresh token:', refreshToken ? 'present' : 'missing')
        
        const supabase = createClient()
        
        if (!supabase) {
          console.error('Failed to create Supabase client')
          router.push('/auth/login?error=client_failed')
          return
        }
        
        try {
          // First, try to get the user with the token
          const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
          
          if (userError) {
            console.error('Token validation failed:', userError)
            
            // If refresh token is missing, we can't proceed
            if (!refreshToken) {
              console.error('No refresh token available')
              router.push('/auth/login?error=missing_refresh_token')
              return
            }
          }
          
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (sessionError) {
            console.error('Failed to set session:', sessionError)
            console.error('Session error details:', {
              message: sessionError.message,
              status: sessionError.status,
              code: sessionError.code
            })
            router.push('/auth/login?error=session_failed')
            return
          }
        } catch (error) {
          console.error('Unexpected error during session setup:', error)
          router.push('/auth/login?error=unexpected_error')
          return
        }
        
        console.log('✅ Session set successfully')
        
        // Get user data to determine portal
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check user metadata for role
          const role = user.user_metadata?.role
          console.log('User role:', role)
          
          // Redirect based on role
          switch(role) {
            case 'doctor':
              router.push('/doctors')
              break
            case 'patient':
              router.push('/patients')
              break
            case 'company':
              router.push('/companies')
              break
            default:
              router.push('/auth/select-role')
          }
        } else {
          router.push('/auth/select-role')
        }
      } else {
        console.error('No tokens found in URL')
        router.push('/auth/login?error=no_tokens')
      }
    }
    
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-lg">Procesando autenticación...</div>
      </div>
    </div>
  )
}