import { useState, useEffect, useCallback } from 'react';
import type {
  PreventiveScreening,
  PatientScreening,
  PatientScreeningWithDetails,
  ScreeningRecommendation,
  ScreeningStatusType,
  PatientScreeningInsert
} from '@autamedica/types';
import { createClient } from '@/lib/supabase';

interface UsePreventiveScreeningsOptions {
  patientId?: string;
  status?: ScreeningStatusType[];
  categoryFilter?: string;
  includeCompleted?: boolean;
}

interface UsePreventiveScreeningsResult {
  // Screenings del paciente
  myScreenings: PatientScreeningWithDetails[];

  // Recomendaciones personalizadas
  recommendations: ScreeningRecommendation[];

  // Estados de carga
  isLoading: boolean;
  isLoadingRecommendations: boolean;
  error: string | null;

  // Acciones
  scheduleScreening: (screeningId: string, scheduledDate: Date) => Promise<{ success: boolean; error?: any }>;
  markAsCompleted: (patientScreeningId: string, resultSummary?: string) => Promise<{ success: boolean; error?: any }>;
  cancelScreening: (patientScreeningId: string) => Promise<{ success: boolean; error?: any }>;
  refetch: () => Promise<void>;
}

export function usePreventiveScreenings(
  options: UsePreventiveScreeningsOptions = {}
): UsePreventiveScreeningsResult {
  const [myScreenings, setMyScreenings] = useState<PatientScreeningWithDetails[]>([]);
  const [recommendations, setRecommendations] = useState<ScreeningRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch screenings del paciente
  const fetchMyScreenings = useCallback(async () => {
    if (!options.patientId) {
      setMyScreenings([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build query
      let query = supabase
        .from('patient_screenings')
        .select(`
          *,
          screening:preventive_screenings!inner (
            id,
            name,
            category,
            description,
            target_gender,
            min_age,
            max_age,
            recommended_frequency,
            is_mandatory,
            estimated_cost_ars,
            covered_by_public_health,
            requires_specialist,
            preparation_instructions
          ),
          assigned_doctor:doctors (
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', options.patientId);

      // Apply filters
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      if (options.categoryFilter) {
        query = query.eq('screening.category', options.categoryFilter);
      }

      if (!options.includeCompleted) {
        query = query.neq('status', 'completed');
      }

      // Order by urgency
      query = query.order('next_due_date', { ascending: true, nullsFirst: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data
      const transformedData: PatientScreeningWithDetails[] = (data || []).map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        screening_id: item.screening_id,
        status: item.status,
        scheduled_date: item.scheduled_date,
        completed_date: item.completed_date,
        next_due_date: item.next_due_date,
        assigned_doctor_id: item.assigned_doctor_id,
        notes: item.notes,
        result_summary: item.result_summary,
        created_at: item.created_at,
        updated_at: item.updated_at,
        screening: item.screening,
        assigned_doctor: item.assigned_doctor ? {
          id: item.assigned_doctor.id,
          first_name: item.assigned_doctor.first_name,
          last_name: item.assigned_doctor.last_name,
          specialty: '' // TODO: Add specialty when available
        } : null
      }));

      setMyScreenings(transformedData);
    } catch (err) {
      console.error('Error fetching patient screenings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [options.patientId, options.status, options.categoryFilter, options.includeCompleted]);

  // Fetch recommendations usando función SQL
  const fetchRecommendations = useCallback(async () => {
    if (!options.patientId) {
      setRecommendations([]);
      setIsLoadingRecommendations(false);
      return;
    }

    try {
      setIsLoadingRecommendations(true);

      const supabase = createClient();

      // Llamar función SQL que calcula recomendaciones
      const { data, error: rpcError } = await supabase.rpc('get_recommended_screenings', {
        patient_id_param: options.patientId,
        include_overdue: true
      });

      if (rpcError) throw rpcError;

      // Transform to ScreeningRecommendation format
      const transformedRecommendations: ScreeningRecommendation[] = await Promise.all(
        (data || []).map(async (item: any) => {
          // Fetch full screening details
          const { data: screeningData } = await supabase
            .from('preventive_screenings')
            .select('*')
            .eq('id', item.screening_id)
            .single();

          return {
            screening: screeningData as PreventiveScreening,
            is_due: item.status === 'overdue' || item.status === 'not_started',
            urgency: item.urgency as 'low' | 'medium' | 'high',
            reason: item.reason,
            next_due_date: item.next_due_date
          };
        })
      );

      setRecommendations(transformedRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      // No setear error aquí para no bloquear el resto de la UI
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [options.patientId]);

  // Schedule a screening
  const scheduleScreening = useCallback(async (
    screeningId: string,
    scheduledDate: Date
  ) => {
    if (!options.patientId) {
      return { success: false, error: 'Patient ID required' };
    }

    try {
      const supabase = createClient();

      // Check if patient_screening already exists
      const { data: existing } = await supabase
        .from('patient_screenings')
        .select('id')
        .eq('patient_id', options.patientId)
        .eq('screening_id', screeningId)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('patient_screenings')
          .update({
            status: 'scheduled',
            scheduled_date: scheduledDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new
        const insertData: PatientScreeningInsert = {
          patient_id: options.patientId,
          screening_id: screeningId,
          status: 'scheduled',
          scheduled_date: scheduledDate.toISOString(),
          completed_date: null,
          next_due_date: null,
          assigned_doctor_id: null,
          notes: null,
          result_summary: null
        };

        const { error: insertError } = await supabase
          .from('patient_screenings')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      // Refetch data
      await fetchMyScreenings();
      await fetchRecommendations();

      return { success: true };
    } catch (err) {
      console.error('Error scheduling screening:', err);
      return { success: false, error: err };
    }
  }, [options.patientId, fetchMyScreenings, fetchRecommendations]);

  // Mark screening as completed
  const markAsCompleted = useCallback(async (
    patientScreeningId: string,
    resultSummary?: string
  ) => {
    try {
      const supabase = createClient();

      // Get screening details to calculate next due date
      const { data: screening } = await supabase
        .from('patient_screenings')
        .select('screening:preventive_screenings!inner(recommended_frequency)')
        .eq('id', patientScreeningId)
        .single();

      const completedDate = new Date();
      let nextDueDate: Date | null = null;

      // Calculate next due date based on frequency
      if (screening?.screening?.recommended_frequency) {
        const freq = screening.screening.recommended_frequency;
        nextDueDate = new Date(completedDate);

        switch (freq) {
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
          case 'every_3_months':
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
            break;
          case 'every_6_months':
            nextDueDate.setMonth(nextDueDate.getMonth() + 6);
            break;
          case 'annually':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
          case 'every_2_years':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 2);
            break;
          case 'every_3_years':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 3);
            break;
          case 'every_5_years':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 5);
            break;
          case 'every_10_years':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 10);
            break;
          case 'one_time':
            nextDueDate = null; // No hay próxima fecha
            break;
        }
      }

      const { error: updateError } = await supabase
        .from('patient_screenings')
        .update({
          status: 'completed',
          completed_date: completedDate.toISOString(),
          next_due_date: nextDueDate?.toISOString() || null,
          result_summary: resultSummary || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientScreeningId);

      if (updateError) throw updateError;

      // Refetch data
      await fetchMyScreenings();
      await fetchRecommendations();

      return { success: true };
    } catch (err) {
      console.error('Error marking screening as completed:', err);
      return { success: false, error: err };
    }
  }, [fetchMyScreenings, fetchRecommendations]);

  // Cancel screening
  const cancelScreening = useCallback(async (patientScreeningId: string) => {
    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('patient_screenings')
        .update({
          status: 'not_started',
          scheduled_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientScreeningId);

      if (updateError) throw updateError;

      // Refetch data
      await fetchMyScreenings();
      await fetchRecommendations();

      return { success: true };
    } catch (err) {
      console.error('Error cancelling screening:', err);
      return { success: false, error: err };
    }
  }, [fetchMyScreenings, fetchRecommendations]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchMyScreenings(),
      fetchRecommendations()
    ]);
  }, [fetchMyScreenings, fetchRecommendations]);

  // Initial fetch
  useEffect(() => {
    fetchMyScreenings();
  }, [fetchMyScreenings]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    myScreenings,
    recommendations,
    isLoading,
    isLoadingRecommendations,
    error,
    scheduleScreening,
    markAsCompleted,
    cancelScreening,
    refetch
  };
}
