'use client'

import { useSearchParams } from 'next/navigation'
import SimpleDoctorVideoCall from '../../components/dev/SimpleDoctorVideoCall'

export default function DevCallPage() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || 'demo-room'

  return <SimpleDoctorVideoCall roomId={roomId} patientName="Juan Pérez" />
}