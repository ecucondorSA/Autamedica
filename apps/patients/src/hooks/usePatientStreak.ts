/**
 * usePatientStreak Hook
 *
 * Gestiona la racha de actividad diaria del paciente.
 * Reemplaza el valor hardcodeado de 15 días con datos reales de la DB.
 *
 * @see /root/Autamedica/supabase/migrations/20251006_patient_activity_tracking.sql
 * @see /root/Autamedica/docs/audits/PATIENTS_PORTAL_MOCK_DATA_CLEANUP.md
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { logger } from '@autamedica/shared';

// ============================================================================
// TYPES
// ============================================================================

export interface StreakData {
  /** Racha actual en días consecutivos */
  currentStreak: number;
  /** Racha más larga alcanzada (récord) */
  longestStreak: number;
  /** Fecha de la última actividad registrada */
  lastActivityDate: string | null;
  /** Fecha de inicio de la racha actual */
  streakStartDate: string | null;
  /** Total de actividades registradas */
  totalActivities: number;
}

export interface ActivityLogResult {
  activityLogged: boolean;
  activityId?: string;
  streak?: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
    streak_broken: boolean;
  };
  reason?: string;
}

export type ActivityType =
  | 'medication_taken'
  | 'vital_sign_logged'
  | 'symptom_logged'
  | 'lab_result_uploaded'
  | 'appointment_attended'
  | 'screening_completed'
  | 'community_post'
  | 'health_goal_completed';

// ============================================================================
// HOOK
// ============================================================================

export function usePatientStreak() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  /**
   * Fetch current streak data from database
   */
  const fetchStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;
      if (!patient) throw new Error('Patient record not found');

      // Fetch streak data
      const { data: streak, error: streakError } = await supabase
        .from('patient_activity_streak')
        .select('*')
        .eq('patient_id', patient.id)
        .single();

      // PGRST116 = no rows returned (streak doesn't exist yet)
      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      // If no streak exists, create one with 0 days
      if (!streak) {
        const { data: newStreak, error: insertError } = await supabase
          .from('patient_activity_streak')
          .insert({
            patient_id: patient.id,
            current_streak_days: 0,
            longest_streak_days: 0,
            total_activities: 0,
          })
          .select()
          .single();

        if (insertError) {
          logger.warn('Failed to create initial streak, using defaults:', insertError);
          setStreakData({
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            streakStartDate: null,
            totalActivities: 0,
          });
        } else {
          setStreakData({
            currentStreak: newStreak.current_streak_days,
            longestStreak: newStreak.longest_streak_days,
            lastActivityDate: newStreak.last_activity_date,
            streakStartDate: newStreak.streak_start_date,
            totalActivities: newStreak.total_activities,
          });
        }
      } else {
        setStreakData({
          currentStreak: streak.current_streak_days,
          longestStreak: streak.longest_streak_days,
          lastActivityDate: streak.last_activity_date,
          streakStartDate: streak.streak_start_date,
          totalActivities: streak.total_activities,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching streak';
      logger.error('usePatientStreak error:', err);
      setError(errorMessage);

      // Set default values on error to prevent UI crashes
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        totalActivities: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Log a patient activity and update streak
   */
  const logActivity = useCallback(async (
    activityType: ActivityType,
    metadata: Record<string, unknown> = {}
  ): Promise<ActivityLogResult> => {
    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient record not found');

      // Call database function to log activity and update streak
      const { data, error: rpcError } = await supabase.rpc('log_patient_activity', {
        p_patient_id: patient.id,
        p_activity_type: activityType,
        p_metadata: metadata,
      });

      if (rpcError) throw rpcError;

      // Refresh streak data
      await fetchStreak();

      return data as ActivityLogResult;
    } catch (err) {
      logger.error('Error logging activity:', err);
      return {
        activityLogged: false,
        reason: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }, [fetchStreak]);

  // Initial fetch on mount
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    // Streak data
    streakDays: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    lastActivityDate: streakData?.lastActivityDate,
    streakStartDate: streakData?.streakStartDate,
    totalActivities: streakData?.totalActivities || 0,

    // Full data object
    streakData,

    // State
    loading,
    error,

    // Actions
    logActivity,
    refetch: fetchStreak,
  };
}

// ============================================================================
// HELPER HOOK: useActivityLogger
// Simplifica el logging de actividades específicas
// ============================================================================

/**
 * Hook especializado para loggear actividades específicas
 *
 * @example
 * const { logMedication, logVitalSign } = useActivityLogger();
 * await logMedication({ medication_id: '123', time: '08:00' });
 */
export function useActivityLogger() {
  const { logActivity } = usePatientStreak();

  return {
    logMedication: (metadata?: Record<string, unknown>) =>
      logActivity('medication_taken', metadata),

    logVitalSign: (metadata?: Record<string, unknown>) =>
      logActivity('vital_sign_logged', metadata),

    logSymptom: (metadata?: Record<string, unknown>) =>
      logActivity('symptom_logged', metadata),

    logLabResult: (metadata?: Record<string, unknown>) =>
      logActivity('lab_result_uploaded', metadata),

    logAppointment: (metadata?: Record<string, unknown>) =>
      logActivity('appointment_attended', metadata),

    logScreening: (metadata?: Record<string, unknown>) =>
      logActivity('screening_completed', metadata),

    logCommunityPost: (metadata?: Record<string, unknown>) =>
      logActivity('community_post', metadata),

    logHealthGoal: (metadata?: Record<string, unknown>) =>
      logActivity('health_goal_completed', metadata),
  };
}
