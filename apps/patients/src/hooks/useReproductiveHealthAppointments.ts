import { useState, useEffect, useCallback } from 'react';
import type {
  ReproductiveHealthAppointmentInsert,
  ReproductiveHealthAppointmentUpdate,
  ReproductiveHealthAppointmentWithDetails,
  AppointmentStatusType
} from '@autamedica/types';
import { createClient } from '@/lib/supabase';
import { logger } from '@autamedica/shared';

interface UseAppointmentsOptions {
  patientId?: string;
  status?: AppointmentStatusType;
  upcoming?: boolean;
}

interface UseAppointmentsResult {
  appointments: ReproductiveHealthAppointmentWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAppointment: (data: ReproductiveHealthAppointmentInsert) => Promise<{ success: boolean; appointmentId?: string; error?: any }>;
  updateAppointment: (id: string, data: ReproductiveHealthAppointmentUpdate) => Promise<{ success: boolean; error?: any }>;
  cancelAppointment: (id: string) => Promise<{ success: boolean; error?: any }>;
}

export function useReproductiveHealthAppointments(
  options: UseAppointmentsOptions = {}
): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<ReproductiveHealthAppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build query
      let query = supabase
        .from('reproductive_health_appointments')
        .select(`
          *,
          specialist:reproductive_health_specialists!inner (
            id,
            specialty,
            doctor:doctors!inner (
              first_name,
              last_name
            )
          ),
          patient:patients!inner (
            first_name,
            last_name
          )
        `);

      // Apply filters
      if (options.patientId) {
        query = query.eq('patient_id', options.patientId);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.upcoming) {
        const now = new Date().toISOString();
        query = query
          .gte('scheduled_at', now)
          .in('status', ['scheduled', 'confirmed']);
      }

      // Order by scheduled date
      query = query.order('scheduled_at', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data
      const transformedData: ReproductiveHealthAppointmentWithDetails[] = (data || []).map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        specialist_id: item.specialist_id,
        consultation_type: item.consultation_type,
        modality: item.modality,
        status: item.status,
        scheduled_at: item.scheduled_at,
        duration_minutes: item.duration_minutes,
        meeting_url: item.meeting_url,
        notes_for_doctor: item.notes_for_doctor,
        is_first_consultation: item.is_first_consultation,
        requires_interpreter: item.requires_interpreter,
        preferred_language: item.preferred_language,
        created_at: item.created_at,
        updated_at: item.updated_at,
        specialist_name: `${item.specialist?.doctor?.first_name || ''} ${item.specialist?.doctor?.last_name || ''}`.trim(),
        specialist_specialty: item.specialist?.specialty || 'gynecology',
        patient_name: `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.trim()
      }));

      setAppointments(transformedData);
    } catch (err) {
      logger.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [options.patientId, options.status, options.upcoming]);

  const createAppointment = useCallback(async (data: ReproductiveHealthAppointmentInsert) => {
    try {
      const supabase = createClient();

      const insertData = {
        patient_id: data.patient_id,
        specialist_id: data.specialist_id,
        consultation_type: data.consultation_type,
        modality: data.modality,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes || 30,
        notes_for_doctor: data.notes_for_doctor || null,
        requires_interpreter: data.requires_interpreter || false,
        preferred_language: data.preferred_language || 'es',
        status: 'scheduled',
        is_first_consultation: true, // This would need logic to check
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error: insertError } = await supabase
        .from('reproductive_health_appointments')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Refetch to update list
      await fetchAppointments();

      return {
        success: true,
        appointmentId: result?.id
      };
    } catch (err) {
      logger.error('Error creating appointment:', err);
      return {
        success: false,
        error: err
      };
    }
  }, [fetchAppointments]);

  const updateAppointment = useCallback(async (
    id: string,
    data: ReproductiveHealthAppointmentUpdate
  ) => {
    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('reproductive_health_appointments')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Refetch to update list
      await fetchAppointments();

      return { success: true };
    } catch (err) {
      logger.error('Error updating appointment:', err);
      return {
        success: false,
        error: err
      };
    }
  }, [fetchAppointments]);

  const cancelAppointment = useCallback(async (id: string) => {
    return updateAppointment(id, { status: 'cancelled_by_patient' });
  }, [updateAppointment]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment
  };
}

// Hook para obtener slots disponibles de un especialista
export function useSpecialistAvailableSlots(specialistId: string | null) {
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!specialistId) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Implementar lógica para obtener slots disponibles
        // Por ahora, generar slots mock para los próximos 7 días
        const slots = generateMockSlots(new Date(), 7);
        setAvailableSlots(slots);
      } catch (err) {
        logger.error('Error fetching available slots:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [specialistId]);

  return { availableSlots, isLoading, error };
}

// Helper function to generate mock slots
function generateMockSlots(startDate: Date, days: number) {
  const slots = [];
  const workingHours = [
    { start: 9, end: 12 },   // Mañana
    { start: 14, end: 18 }   // Tarde
  ];

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const period of workingHours) {
      for (let hour = period.start; hour < period.end; hour += 0.5) {
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

        slots.push({
          start_time: slotDate.toISOString(),
          end_time: new Date(slotDate.getTime() + 30 * 60000).toISOString(),
          duration_minutes: 30,
          modality: 'video_call'
        });
      }
    }
  }

  return slots;
}
