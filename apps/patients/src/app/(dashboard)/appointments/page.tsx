'use client';

import { useState, useMemo } from 'react';
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable';
import { CreateAppointmentModal } from '@/components/appointments/CreateAppointmentModal';
import { useAppointments } from '@/hooks/useAppointments';
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import type { CreateAppointmentInput } from '@/types/appointment';

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    appointments,
    loading,
    error,
    createAppointment,
    refreshAppointments,
  } = useAppointments();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const upcoming = appointments.filter(
      (apt) => apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;

    const completed = appointments.filter(
      (apt) => apt.status === 'completed'
    ).length;

    const cancelled = appointments.filter(
      (apt) => apt.status === 'cancelled'
    ).length;

    return { upcoming, completed, cancelled };
  }, [appointments]);

  const handleCreateAppointment = async (data: CreateAppointmentInput) => {
    // Convertir a ISO string si es necesario
    const appointmentData = {
      ...data,
      scheduled_at: data.scheduled_at
        ? new Date(data.scheduled_at).toISOString()
        : new Date().toISOString(),
    };

    const newAppointment = await createAppointment(appointmentData);

    if (newAppointment) {
      // Cerrar modal y refrescar
      setIsModalOpen(false);
      await refreshAppointments();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Mis Citas</h1>
          <p className="text-stone-600 mt-2">
            Gestiona tus citas médicas programadas
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Crear una nueva cita médica"
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Nueva Cita
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Estadísticas de citas">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg" aria-hidden="true">
              <Calendar className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Próximas Citas</p>
              <p className="text-2xl font-bold text-stone-900">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg" aria-hidden="true">
              <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Completadas</p>
              <p className="text-2xl font-bold text-stone-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-50 rounded-lg" aria-hidden="true">
              <Clock className="h-6 w-6 text-stone-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Canceladas</p>
              <p className="text-2xl font-bold text-stone-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-lg border border-stone-200">
        {loading && appointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
            <p className="mt-4 text-stone-600">Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              No tienes citas programadas
            </h3>
            <p className="text-stone-600 mb-6">
              Comienza agendando tu primera cita médica
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Crear Primera Cita
            </button>
          </div>
        ) : (
          <AppointmentsTable appointments={appointments} />
        )}
      </div>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAppointment}
      />
    </div>
  );
}
