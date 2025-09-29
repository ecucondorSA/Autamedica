import { CallPageClient } from './CallPageClient'

export const dynamicParams = false

export function generateStaticParams() {
  return [{ roomId: 'test123' }]
}

export default function DoctorCallPage({ params }: { params: { roomId: string } }) {
  return <CallPageClient roomId={params.roomId} />
}
