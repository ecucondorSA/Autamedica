import { CallPageClient } from './CallPageClient'

export const dynamicParams = false

export function generateStaticParams() {
  return [{ roomId: 'test123' }]
}

interface PatientCallPageProps {
  params: { roomId: string }
}

export default function PatientCallPage({ params }: PatientCallPageProps) {
  return <CallPageClient roomId={params.roomId} />
}
