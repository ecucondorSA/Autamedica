/**
 * useWeeklyGoals Hook
 *
 * Gestiona metas semanales personalizadas del paciente.
 * Reemplaza metas mockeadas con datos reales de la DB.
 *
 * @see /root/Autamedica/supabase/migrations/20251007_patient_weekly_goals.sql
 * @see /root/Autamedica/docs/audits/PATIENTS_PORTAL_AUDIT_UPDATE_20251007.md
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { logger } from '@autamedica/shared';

// ============================================================================
// TYPES
// ============================================================================

export interface WeeklyGoal {
  id: string;
  patientId: string;
  goalType: string;
  label: string;
  targetCount: number;
  currentCount: number;
  weekStartDate: string;
  weekEndDate: string;
  status: 'active' | 'completed' | 'abandoned';
  category: string;
  progressPercentage: number;
}

export type GoalType =
  | 'medication_adherence'
  | 'blood_pressure_monitoring'
  | 'exercise'
  | 'sleep'
  | 'hydration'
  | 'nutrition'
  | 'screening_scheduled'
  | 'weight_tracking';

// Mapeo de tipos de meta a labels legibles y categorías
const GOAL_CONFIG: Record<GoalType, { label: string; category: string }> = {
  medication_adherence: { label: 'Medicamentos', category: 'adherence' },
  blood_pressure_monitoring: { label: 'Registrar PA', category: 'monitoring' },
  exercise: { label: 'Ejercicio 30min', category: 'lifestyle' },
  sleep: { label: 'Dormir 7+ hrs', category: 'lifestyle' },
  hydration: { label: 'Hidratación', category: 'lifestyle' },
  nutrition: { label: 'Alimentación saludable', category: 'lifestyle' },
  screening_scheduled: { label: 'Agendar screenings', category: 'preventive' },
  weight_tracking: { label: 'Registrar peso', category: 'monitoring' },
};

// ============================================================================
// HOOK: useWeeklyGoals
// ============================================================================

/**
 * Hook para gestionar metas semanales del paciente
 *
 * Fetch goals from Supabase instead of using mock data
 */
export function useWeeklyGoals() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  /**
   * Get current week start date (Monday)
   */
  const getCurrentWeekStart = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().split('T')[0];
  };

  /**
   * Fetch weekly goals from database
   */
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get patient ID
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;
      if (!patient) throw new Error('Patient not found');

      // Fetch current week goals
      const weekStart = getCurrentWeekStart();
      const { data: goalsData, error: goalsError } = await supabase
        .from('patient_weekly_goals')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('week_start_date', weekStart)
        .in('status', ['active', 'completed'])
        .order('goal_type', { ascending: true });

      if (goalsError) throw goalsError;

      // Transform data to match interface
      const transformedGoals: WeeklyGoal[] = (goalsData || []).map((g) => {
        const config = GOAL_CONFIG[g.goal_type as GoalType] || {
          label: g.goal_type,
          category: 'general',
        };

        return {
          id: g.id,
          patientId: g.patient_id,
          goalType: g.goal_type,
          label: config.label,
          targetCount: g.target_count,
          currentCount: g.current_count,
          weekStartDate: g.week_start_date,
          weekEndDate: g.week_end_date,
          status: g.status,
          category: config.category,
          progressPercentage: Math.round((g.current_count / g.target_count) * 100),
        };
      });

      setGoals(transformedGoals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching goals';
      logger.error('useWeeklyGoals: Error fetching goals', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Increment goal progress
   */
  const incrementGoal = useCallback(async (goalType: GoalType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient not found');

      const weekStart = getCurrentWeekStart();

      // Call RPC function
      const { data, error } = await supabase.rpc('increment_weekly_goal', {
        p_patient_id: patient.id,
        p_goal_type: goalType,
        p_week_start: weekStart,
      });

      if (error) throw error;

      // Refresh goals
      await fetchGoals();

      return data;
    } catch (err) {
      logger.error('useWeeklyGoals: Error incrementing goal', { error: err });
      throw err;
    }
  }, [supabase, fetchGoals]);

  /**
   * Create a new weekly goal
   */
  const createGoal = useCallback(async (
    goalType: GoalType,
    targetCount: number,
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient not found');

      // Call RPC function
      const { data, error } = await supabase.rpc('create_weekly_goal', {
        p_patient_id: patient.id,
        p_goal_type: goalType,
        p_target_count: targetCount,
        p_week_start: null, // Will use current week
        p_goal_metadata: metadata,
      });

      if (error) throw error;

      // Refresh goals
      await fetchGoals();

      return data;
    } catch (err) {
      logger.error('useWeeklyGoals: Error creating goal', { error: err });
      throw err;
    }
  }, [supabase, fetchGoals]);

  // Fetch on mount
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    incrementGoal,
    createGoal,
    refetch: fetchGoals,
  };
}

/**
 * Helper hooks for common goal types
 */
export function useGoalIncrementers() {
  const { incrementGoal } = useWeeklyGoals();

  return {
    logMedication: () => incrementGoal('medication_adherence'),
    logBloodPressure: () => incrementGoal('blood_pressure_monitoring'),
    logExercise: () => incrementGoal('exercise'),
    logSleep: () => incrementGoal('sleep'),
    logHydration: () => incrementGoal('hydration'),
    logNutrition: () => incrementGoal('nutrition'),
    logScreeningScheduled: () => incrementGoal('screening_scheduled'),
    logWeightTracking: () => incrementGoal('weight_tracking'),
  };
}
