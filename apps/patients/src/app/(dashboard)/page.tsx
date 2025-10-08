'use client';

import dynamic from 'next/dynamic';
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel';
import { usePatientSession } from '@/hooks/usePatientSession';

// Lazy load video call component (no SSR needed for WebRTC)
const RealVideoCall = dynamic(
  () => import('@/components/telemedicine/RealVideoCall').then(mod => ({ default: mod.RealVideoCall })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-stone-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  // Obtener datos de la sesión del paciente
  const { user, profile, patient } = usePatientSession();

  // TODO: Implementar lógica para obtener próxima cita desde Supabase
  const nextAppointment = null;
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  // Room ID único para esta sesión
  const roomId = `patient-room-${user?.id || 'demo'}`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory-base">
      {/*
        Layout de 3 columnas:
        - Sidebar: 12% (ya está en DashboardLayout)
        - Centro (Video): 58%
        - Panel dinámico: 30%
      */}

      {/* Centro: Área de Video (58%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header superior */}
        <div className="bg-white border-b border-stone-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">¡Hola, {userName}! 👋</h1>
              <p className="text-sm text-stone-600 mt-1">
                Tu centro de telemedicina está listo
              </p>
            </div>

            {/* Quick status badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-green-700">Disponible</span>
              </div>
              {nextAppointment && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-xs font-medium text-blue-700">Próxima cita: {nextAppointment}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área central de video - protagonista */}
        <div className="flex-1 overflow-hidden">
          <RealVideoCall
            roomId={roomId}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Panel Derecho Dinámico (30%) */}
      <DynamicRightPanel context="dashboard" />
    </div>
  );
}
