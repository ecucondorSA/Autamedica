'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SimplePatientVideoCall from '../../components/dev/SimplePatientVideoCall'

function DevCallContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || 'demo-room'

  return <SimplePatientVideoCall roomId={roomId} patientName="Juan Pérez" />
}

export default function DevCallPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
      <DevCallContent />
    </Suspense>
  )
}