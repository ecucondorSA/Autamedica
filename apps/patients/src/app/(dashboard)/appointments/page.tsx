'use client';

import { AppointmentsTable } from '@/components/appointments/AppointmentsTable';
import { mockAppointments, getAppointmentsByStatus } from '../../../../mocks/appointments';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const upcomingAppointments = mockAppointments.filter(
    apt => apt.status !== 'completed' && apt.status !== 'cancelled'
  );
  const pastAppointments = getAppointmentsByStatus('completed');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="heading-1 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-stone-700" />
            Mis Citas Médicas
          </h1>
          <button className="btn-primary-ivory px-6 py-3 text-sm inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agendar nueva cita
          </button>
        </div>
        <p className="text-stone-600">
          Gestiona tus citas médicas y videoconsultas
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Próximas citas</p>
          <p className="text-3xl font-bold text-stone-900">
            {upcomingAppointments.length}
          </p>
        </div>
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Confirmadas</p>
          <p className="text-3xl font-bold text-green-600">
            {getAppointmentsByStatus('confirmed').length}
          </p>
        </div>
        <div className="card-ivory p-6">
          <p className="text-label text-stone-600 mb-1">Completadas</p>
          <p className="text-3xl font-bold text-stone-600">
            {pastAppointments.length}
          </p>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="mb-12">
        <h2 className="heading-2 mb-4">Próximas Citas</h2>
        {upcomingAppointments.length > 0 ? (
          <AppointmentsTable appointments={upcomingAppointments} />
        ) : (
          <div className="card-ivory p-12 text-center">
            <Calendar className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600">No tienes citas programadas</p>
            <button className="mt-4 btn-primary-ivory px-6 py-2 text-sm">
              Agendar cita
            </button>
          </div>
        )}
      </div>

      {/* Past appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="heading-2 mb-4">Historial de Citas</h2>
          <AppointmentsTable appointments={pastAppointments} />
        </div>
      )}
    </div>
  );
}
