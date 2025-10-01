'use client'

import { useSearchParams } from 'next/navigation'
import SimplePatientVideoCall from '../../components/dev/SimplePatientVideoCall'

export default function DevCallPageContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || 'demo-room'

  return <SimplePatientVideoCall roomId={roomId} patientName="Juan Pérez" />
}
