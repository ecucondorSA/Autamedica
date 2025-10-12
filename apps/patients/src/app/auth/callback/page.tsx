'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionSync } from '@/components/SessionSync'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Después de sincronizar la sesión, redirigir al inicio
    const t = setTimeout(() => router.replace('/'), 600)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-stone-300">
      <SessionSync />
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-300" />
        <span>Sincronizando sesión…</span>
      </div>
    </div>
  )
}

