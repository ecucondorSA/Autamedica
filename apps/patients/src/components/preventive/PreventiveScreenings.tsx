'use client';

import type { PreventiveScreening } from '../../../mocks/preventive-screenings';
import { AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';

interface PreventiveScreeningsProps {
  screenings: PreventiveScreening[];
}

const statusConfig = {
  overdue: {
    label: 'Atrasado',
    color: 'bg-red-50 border-red-300',
    textColor: 'text-red-900',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  due_soon: {
    label: 'Próximo',
    color: 'bg-amber-50 border-amber-300',
    textColor: 'text-amber-900',
    icon: Clock,
    iconColor: 'text-amber-600',
  },
  up_to_date: {
    label: 'Al día',
    color: 'bg-green-50 border-green-300',
    textColor: 'text-green-900',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
};

const priorityConfig = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export function PreventiveScreenings({ screenings }: PreventiveScreeningsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {screenings.map((screening) => {
        const status = statusConfig[screening.status];
        const Icon = status.icon;

        return (
          <div
            key={screening.id}
            className={`border-2 rounded-xl p-6 ${status.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${status.iconColor}`} />
                <div>
                  <h3 className={`text-lg font-bold ${status.textColor}`}>
                    {screening.title}
                  </h3>
                  <p className={`text-sm ${status.textColor} opacity-80`}>
                    {screening.description}
                  </p>
                </div>
              </div>
            </div>

            <div className={`space-y-2 text-sm ${status.textColor}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Frecuencia:</span>
                <span>{screening.recommended_frequency}</span>
              </div>
              {screening.last_done_date && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Último control:</span>
                  <span>{formatDate(screening.last_done_date)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium">Próximo control:</span>
                <span className="font-semibold">{formatDate(screening.next_due_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Prioridad:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    screening.priority === 'high'
                      ? 'bg-red-200 text-red-900'
                      : screening.priority === 'medium'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-stone-200 text-stone-900'
                  }`}
                >
                  {priorityConfig[screening.priority]}
                </span>
              </div>
            </div>

            <button className="mt-4 w-full btn-primary-ivory px-4 py-2 text-sm inline-flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendar control
            </button>
          </div>
        );
      })}
    </div>
  );
}
