'use client'

import { useEffect, useState } from 'react'
import { PreventiveHealthHub } from '@/components/medical/PreventiveHealthHub'
import { createClient } from '@/lib/supabase'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel'

export default function PreventiveHealthPage() {
  const [patientId, setPatientId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setPatientId(user.id)
        }
      } catch (error) {
        console.error('Error fetching patient ID:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatientId()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!patientId) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-100">
        <div className="text-center">
          <p className="text-stone-900 font-semibold mb-2">No se pudo cargar tu perfil</p>
          <p className="text-stone-600 text-sm">Por favor, inicia sesión nuevamente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CompactSidebar />

      <main className="flex flex-1 overflow-y-auto">
        <PreventiveHealthHub patientId={patientId} />
      </main>

      <DynamicRightPanel context="dashboard" />
    </div>
  )
}
