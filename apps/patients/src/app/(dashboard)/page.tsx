'use client';

// Disable SSG for this page since it uses auth and client-side data fetching
export const dynamic = 'force-dynamic';

import { EnhancedVideoCall } from '@/components/telemedicine/EnhancedVideoCall';
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel';
import { useRequireAuth } from '@autamedica/auth';
import { createBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { session, loading } = useRequireAuth();
  const [nextAppointment, setNextAppointment] = useState<string | null>(null);

  const user = session?.user;

  useEffect(() => {
    const fetchNextAppointment = async () => {
      if (!user) return;

      const supabase = createBrowserClient();

      const { data } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .eq('patient_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();

      if (data?.scheduled_at) {
        const date = new Date(data.scheduled_at);
        const formattedDate = date.toLocaleDateString('es-ES', {
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });
        setNextAppointment(formattedDate);
      }
    };

    fetchNextAppointment();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

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
        <div className="flex-1 overflow-auto p-6">
          <div className="h-full flex items-center justify-center">
            <EnhancedVideoCall
              roomId="patient-room-default"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Panel Derecho Dinámico (30%) */}
      <DynamicRightPanel context="dashboard" />
    </div>
  );
}
