'use client';

import type { Appointment } from '@autamedica/types';
import { Calendar, Clock, Video, MapPin, ExternalLink } from 'lucide-react';

interface AppointmentsTableProps {
  appointments: Appointment[];
}

const statusConfig = {
  scheduled: { label: 'Programada', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  confirmed: { label: 'Confirmada', color: 'bg-green-50 text-green-700 border-green-300' },
  'in-progress': { label: 'En curso', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  completed: { label: 'Completada', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  cancelled: { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-300' },
  no_show: { label: 'No asistió', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

const typeConfig = {
  consultation: { label: 'Consulta', icon: '🩺' },
  follow_up: { label: 'Seguimiento', icon: '🔄' },
  emergency: { label: 'Emergencia', icon: '🚨' },
  telemedicine: { label: 'Telemedicina', icon: '💻' },
  lab_test: { label: 'Laboratorio', icon: '🧪' },
  checkup: { label: 'Chequeo', icon: '✅' },
};

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const status = statusConfig[appointment.status];
        const type = typeConfig[appointment.appointment_type];

        return (
          <div
            key={appointment.id}
            className="bg-white border-2 border-stone-200 rounded-xl p-6 hover:border-stone-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{type.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    {type.label}
                  </h3>
                  <p className="text-sm text-stone-600">{appointment.reason}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${status.color}`}
              >
                {status.label}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <Calendar className="h-4 w-4 text-stone-500" />
                <span>{formatDate(appointment.start_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <Clock className="h-4 w-4 text-stone-500" />
                <span>
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </span>
              </div>
              {appointment.location && (
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <MapPin className="h-4 w-4 text-stone-500" />
                  <span>{appointment.location}</span>
                </div>
              )}
              {appointment.meeting_url && (
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <Video className="h-4 w-4 text-stone-500" />
                  <span>Videoconsulta</span>
                </div>
              )}
            </div>

            {appointment.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> {appointment.notes}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {appointment.meeting_url && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <a
                  href={appointment.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-ivory px-4 py-2 text-sm inline-flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Unirse a videollamada
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {appointment.status === 'scheduled' && (
                <button className="btn-secondary-ivory px-4 py-2 text-sm">
                  Reprogramar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
