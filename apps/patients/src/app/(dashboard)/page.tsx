'use client';

import { EnhancedVideoCall } from '@/components/telemedicine/EnhancedVideoCall';
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel';

export default function DashboardPage() {
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
              <h1 className="text-2xl font-bold text-stone-900">¡Hola, María! 👋</h1>
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
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-medium text-blue-700">Próxima cita: Hoy 3:00 PM</span>
              </div>
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
