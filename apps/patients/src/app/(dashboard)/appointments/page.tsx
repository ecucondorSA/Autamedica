'use client';

import { useState, useEffect } from 'react';
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { useRequireAuth } from '@autamedica/auth';
import { createBrowserClient } from '@/lib/supabase';
import type { Appointment } from '@autamedica/types';

export default function AppointmentsPage() {
  const { session, loading: authLoading } = useRequireAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user;

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const supabase = createBrowserClient();

        // Fetch appointments for current patient
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', user.id)
          .is('deleted_at', null)
          .order('start_time', { ascending: true });

        if (appointmentsError) throw appointmentsError;

        setAppointments((appointmentsData || []) as unknown as Appointment[]);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar citas');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const upcomingAppointments = appointments.filter(
    apt =>
      (apt.status === 'scheduled' || apt.status === 'confirmed') &&
      new Date(apt.start_time) > new Date()
  );

  const pastAppointments = appointments.filter(
    apt =>
      apt.status === 'completed' ||
      new Date(apt.start_time) < new Date()
  );

  const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-stone-900 mx-auto" />
          <p className="mt-4 text-stone-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">Error al cargar citas</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary-ivory px-4 py-2 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
            {confirmedCount}
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
