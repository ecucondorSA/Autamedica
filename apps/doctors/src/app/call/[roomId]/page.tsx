import { CallPageClient } from './CallPageClient'

// Deshabilitar SSG para esta ruta - requiere runtime dinámico
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function DoctorCallPage({ params }: { params: { roomId: string } }) {
  return <CallPageClient roomId={params.roomId} />
}
