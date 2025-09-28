import { CallPageClient } from './CallPageClient'

export const dynamicParams = false

export function generateStaticParams() {
  return [{ roomId: 'test123' }]
}

interface DoctorCallPageProps {
  params: { roomId: string }
}

export default function DoctorCallPage({ params }: DoctorCallPageProps) {
  return <CallPageClient roomId={params.roomId} />
}
