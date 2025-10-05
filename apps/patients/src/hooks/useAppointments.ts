/**
 * Hook para gestión de citas médicas del paciente
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Appointment,
  AppointmentWithDoctor,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/types/appointment';

interface UseAppointmentsResult {
  appointments: AppointmentWithDoctor[];
  loading: boolean;
  error: string | null;
  createAppointment: (data: CreateAppointmentInput) => Promise<AppointmentWithDoctor | null>;
  updateAppointment: (id: string, data: UpdateAppointmentInput) => Promise<AppointmentWithDoctor | null>;
  cancelAppointment: (id: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
}

export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todas las citas del paciente
   */
  const refreshAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments');

      if (!response.ok) {
        throw new Error('Error al cargar las citas');
      }

      const result = await response.json();

      if (result.success) {
        setAppointments(result.data || []);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las citas';
      setError(message);
      console.error('[useAppointments] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una nueva cita
   */
  const createAppointment = useCallback(async (
    data: CreateAppointmentInput
  ): Promise<AppointmentWithDoctor | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la cita');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Agregar la nueva cita al estado
        setAppointments(prev => [result.data, ...prev]);
        return result.data;
      }

      throw new Error('Error al crear la cita');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la cita';
      setError(message);
      console.error('[useAppointments] Create error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar una cita existente
   */
  const updateAppointment = useCallback(async (
    id: string,
    data: UpdateAppointmentInput
  ): Promise<AppointmentWithDoctor | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la cita');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Actualizar la cita en el estado
        setAppointments(prev =>
          prev.map(apt => (apt.id === id ? result.data : apt))
        );
        return result.data;
      }

      throw new Error('Error al actualizar la cita');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la cita';
      setError(message);
      console.error('[useAppointments] Update error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar una cita
   */
  const cancelAppointment = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cancelar la cita');
      }

      const result = await response.json();

      if (result.success) {
        // Actualizar estado local
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
          )
        );
        return true;
      }

      throw new Error('Error al cancelar la cita');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la cita';
      setError(message);
      console.error('[useAppointments] Cancel error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar citas al montar el componente
  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshAppointments,
  };
}
