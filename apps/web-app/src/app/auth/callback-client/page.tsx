'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Procesando autenticación...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      
      if (!code) {
        setError('No se encontró código de autorización')
        setTimeout(() => router.push('/auth/login?error=no_code'), 2000)
        return
      }

      const supabase = createClient()
      
      if (!supabase) {
        setError('Error de configuración de Supabase')
        setTimeout(() => router.push('/auth/login?error=config_error'), 2000)
        return
      }

      try {
        setStatus('Intercambiando código por sesión...')
        
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (authError) {
          console.error('Auth callback error:', authError)
          setError('Error al procesar autenticación: ' + authError.message)
          setTimeout(() => router.push('/auth/login?error=auth_callback_error'), 2000)
          return
        }

        if (data.user) {
          const userRole = data.user.user_metadata?.role
          
          console.log('Auth callback - User:', data.user.email, 'Role:', userRole)
          setStatus('Redirigiendo según rol...')

          // Definir URLs de redirección por rol - dinámicas según ambiente
          const getPortalUrl = (role: string) => {
            // En desarrollo usar localhost con puertos específicos
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
              const portMap: Record<string, string> = {
                'patient': 'http://localhost:3002',
                'doctor': 'http://localhost:3001',
                'company_admin': 'http://localhost:3003',
                'company': 'http://localhost:3003',
                'platform_admin': '/admin',
                'admin': '/admin'
              }
              return portMap[role] || '/'
            }
            
            // En producción usar URLs de Cloudflare Pages
            const prodMap: Record<string, string> = {
              'patient': 'https://autamedica-patients.pages.dev',
              'doctor': 'https://autamedica-doctors.pages.dev',
              'company_admin': 'https://autamedica-companies.pages.dev',
              'company': 'https://autamedica-companies.pages.dev',
              'platform_admin': '/admin',
              'admin': '/admin'
            }
            return prodMap[role] || '/'
          }

          // Redireccionar según el rol
          if (userRole) {
            const redirectUrl = getPortalUrl(userRole)
            if (redirectUrl) {
              console.log('Redirecting to:', redirectUrl)
              setStatus(`Redirigiendo a ${userRole}...`)
              
              // Pequeño delay para mostrar el mensaje
              setTimeout(() => {
                if (redirectUrl.startsWith('/')) {
                  router.push(redirectUrl)
                } else {
                  window.location.href = redirectUrl
                }
              }, 1000)
              return
            }
          }

          // Si no tiene rol, redirigir a selección de rol
          console.log('No role found, redirecting to role selection')
          setStatus('Configurando perfil...')
          setTimeout(() => router.push('/auth/select-role'), 1000)
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        setError('Error inesperado durante autenticación')
        setTimeout(() => router.push('/auth/login?error=callback_exception'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-autamedica-negro via-autamedica-secondary to-autamedica-negro flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-autamedica-negro/50 backdrop-blur-lg rounded-2xl p-8 border border-autamedica-secondary/30 text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autamedica-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-autamedica-blanco mb-2">
              AutaMedica
            </h1>
            <p className="text-white text-sm">Desarrollado por E.M Medicina - UBA</p>
          </div>

          <div className="space-y-4">
            <p className="text-autamedica-blanco">{status}</p>
            
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-red-300 text-xs mt-2">Redirigiendo al login...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CallbackClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-autamedica-negro via-autamedica-secondary to-autamedica-negro flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-autamedica-negro/50 backdrop-blur-lg rounded-2xl p-8 border border-autamedica-secondary/30 text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autamedica-primary mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-autamedica-blanco mb-2">AutaMedica</h1>
              <p className="text-white text-sm">Desarrollado por E.M Medicina - UBA</p>
            </div>
            <p className="text-autamedica-blanco">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}