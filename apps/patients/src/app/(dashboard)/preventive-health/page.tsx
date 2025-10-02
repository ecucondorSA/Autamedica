'use client';

import { PreventiveScreenings } from '@/components/preventive/PreventiveScreenings';
import {
  mockPreventiveScreenings,
  getScreeningsByStatus,
  getOverdueScreenings
} from '../../../../mocks/preventive-screenings';
import { Heart, AlertCircle } from 'lucide-react';

export default function PreventiveHealthPage() {
  const overdueScreenings = getOverdueScreenings();
  const dueSoonScreenings = getScreeningsByStatus('due_soon');
  const upToDateScreenings = getScreeningsByStatus('up_to_date');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-1 flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-rose-600" />
          Salud Preventiva
        </h1>
        <p className="text-stone-600">
          Mantén al día tus controles de salud preventivos
        </p>
      </div>

      {/* Alert for overdue */}
      {overdueScreenings.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">
                Tienes {overdueScreenings.length} control(es) atrasado(s)
              </h3>
              <p className="text-sm text-red-800 mb-3">
                Es importante que realices estos controles para mantener tu salud al día.
              </p>
              <button className="btn-primary-ivory px-4 py-2 text-sm">
                Agendar controles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Atrasados</p>
          <p className="text-3xl font-bold text-red-600">
            {overdueScreenings.length}
          </p>
        </div>
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Próximos</p>
          <p className="text-3xl font-bold text-amber-600">
            {dueSoonScreenings.length}
          </p>
        </div>
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Al día</p>
          <p className="text-3xl font-bold text-green-600">
            {upToDateScreenings.length}
          </p>
        </div>
      </div>

      {/* All screenings */}
      <div>
        <h2 className="heading-2 mb-6">Todos los Controles Preventivos</h2>
        <PreventiveScreenings screenings={mockPreventiveScreenings} />
      </div>
    </div>
  );
}
