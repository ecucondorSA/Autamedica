import { PreventiveHealthHub } from '@/components/medical/PreventiveHealthHub';

export const metadata = {
  title: 'Salud Preventiva | AutaMedica',
  description: 'Screenings médicos recomendados según tu edad y perfil de salud'
};

export default function PreventiveHealthPage() {
  // TODO: Obtener patientId desde session
  // const session = await getSession();
  // const patientId = session.user.patientId;

  // Mock patientId para desarrollo
  const patientId = 'patient-uuid-from-session';

  return (
    <div className="min-h-screen bg-gray-50">
      <PreventiveHealthHub patientId={patientId} />
    </div>
  );
}
