'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SimpleDoctorVideoCall from '../../components/dev/SimpleDoctorVideoCall'

function DevCallContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || 'demo-room'

  return <SimpleDoctorVideoCall roomId={roomId} patientName="Juan Pérez" />
}

export default function DevCallPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DevCallContent />
    </Suspense>
  )
}