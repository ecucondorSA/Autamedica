/**
 * usePatientScreenings Hook (REFACTORED)
 *
 * Gestiona screenings preventivos personalizados del paciente.
 * Reemplaza datos mockeados con datos reales de la DB.
 *
 * @see /root/Autamedica/supabase/migrations/20251007_patient_screenings.sql
 * @see /root/Autamedica/docs/audits/PATIENTS_PORTAL_AUDIT_UPDATE_20251007.md
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { logger } from '@autamedica/shared';

// ============================================================================
// TYPES
// ============================================================================

export interface ScreeningData {
  id: string;
  patientId: string;
  screeningType: string;
  title: string;
  status: 'overdue' | 'due_soon' | 'up_to_date';
  priority: 'high' | 'medium' | 'low';
  category: 'cardiovascular' | 'cancer' | 'metabolic' | 'general' | 'reproductive';
  lastDoneDate?: string;
  nextDueDate: string;
  resultSummary?: Record<string, unknown>;
  providerNotes?: string;
}

export interface AchievementBadge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  level: 'gold' | 'silver' | 'bronze';
  earned: boolean;
  progress: number;
  maxProgress: number;
}

export interface WeeklyGoal {
  id: string;
  label: string;
  completed: number;
  total: number;
  category: string;
}

export interface ScreeningStats {
  total: number;
  upToDate: number;
  dueSoon: number;
  overdue: number;
  completionRate: number;
  cardiovascularScreenings: ScreeningData[];
  cancerScreenings: ScreeningData[];
}

// Mapeo de tipos de screening a títulos legibles
const SCREENING_TITLES: Record<string, string> = {
  blood_pressure: 'Presión Arterial',
  cholesterol: 'Colesterol',
  glucose: 'Glucosa en sangre',
  colorectal_screening: 'Cáncer Colorrectal (Colonoscopia)',
  psa: 'PSA (Próstata)',
  mammography: 'Mamografía',
  pap_smear: 'Papanicolaou',
  bone_density: 'Densitometría Ósea',
  vision_exam: 'Examen de Vista',
  dental_checkup: 'Chequeo Dental',
  general_checkup: 'Chequeo General',
};

// ============================================================================
// HOOK: usePatientScreenings
// ============================================================================

/**
 * Hook para gestionar screenings preventivos del paciente
 *
 * Fetch screening data from Supabase instead of using mock data
 */
export function usePatientScreenings() {
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  /**
   * Fetch screenings from database
   */
  const fetchScreenings = useCallback(async () => {
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

      // Fetch screenings
      const { data: screeningsData, error: screeningsError } = await supabase
        .from('patient_screenings')
        .select('*')
        .eq('patient_id', patient.id)
        .order('next_due_date', { ascending: true });

      if (screeningsError) throw screeningsError;

      // Transform data to match interface
      const transformedScreenings: ScreeningData[] = (screeningsData || []).map((s) => ({
        id: s.id,
        patientId: s.patient_id,
        screeningType: s.screening_type,
        title: SCREENING_TITLES[s.screening_type] || s.screening_type,
        status: s.status,
        priority: s.priority,
        category: s.category,
        lastDoneDate: s.last_done_date,
        nextDueDate: s.next_due_date,
        resultSummary: s.result_summary,
        providerNotes: s.provider_notes,
      }));

      setScreenings(transformedScreenings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching screenings';
      logger.error('usePatientScreenings: Error fetching screenings', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Log screening result
   */
  const logScreeningResult = useCallback(async (
    screeningType: string,
    resultSummary: Record<string, unknown> = {},
    providerNotes?: string,
    intervalMonths: number = 12
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
      const { data, error } = await supabase.rpc('log_screening_result', {
        p_patient_id: patient.id,
        p_screening_type: screeningType,
        p_result_summary: resultSummary,
        p_provider_notes: providerNotes || null,
        p_provider_id: null,
        p_interval_months: intervalMonths,
      });

      if (error) throw error;

      // Refresh screenings
      await fetchScreenings();

      return data;
    } catch (err) {
      logger.error('usePatientScreenings: Error logging screening result', { error: err });
      throw err;
    }
  }, [supabase, fetchScreenings]);

  // Fetch on mount
  useEffect(() => {
    fetchScreenings();
  }, [fetchScreenings]);

  // Calculate stats
  const stats: ScreeningStats = useMemo(() => {
    const total = screenings.length;
    const upToDate = screenings.filter(s => s.status === 'up_to_date').length;
    const dueSoon = screenings.filter(s => s.status === 'due_soon').length;
    const overdue = screenings.filter(s => s.status === 'overdue').length;
    const cardiovascularScreenings = screenings.filter(s => s.category === 'cardiovascular');
    const cancerScreenings = screenings.filter(s => s.category === 'cancer');

    return {
      total,
      upToDate,
      dueSoon,
      overdue,
      completionRate: total > 0 ? Math.round((upToDate / total) * 100) : 0,
      cardiovascularScreenings,
      cancerScreenings,
    };
  }, [screenings]);

  // Calculate achievements/badges based on screenings
  const achievements: AchievementBadge[] = useMemo(() => {
    const badges: AchievementBadge[] = [];

    // Badge: Guerrero Cardiovascular
    const cvComplete = stats.cardiovascularScreenings.filter(s => s.status === 'up_to_date').length;
    const cvTotal = stats.cardiovascularScreenings.length;
    if (cvTotal > 0) {
      badges.push({
        id: 'cardiovascular-warrior',
        emoji: '🥇',
        title: 'Guerrero CV',
        description: 'Todos los controles cardiovasculares al día',
        level: cvComplete === cvTotal ? 'gold' : 'silver',
        earned: cvComplete === cvTotal,
        progress: cvComplete,
        maxProgress: cvTotal,
      });
    }

    // Badge: Detección Temprana (Cáncer)
    const cancerComplete = stats.cancerScreenings.filter(s => s.status === 'up_to_date').length;
    const cancerTotal = stats.cancerScreenings.length;
    if (cancerTotal > 0) {
      badges.push({
        id: 'early-detection',
        emoji: '🎗️',
        title: 'Detección Temprana',
        description: 'Screenings de cáncer completados',
        level: cancerComplete === cancerTotal ? 'gold' : cancerComplete > 0 ? 'silver' : 'bronze',
        earned: cancerComplete > 0,
        progress: cancerComplete,
        maxProgress: cancerTotal,
      });
    }

    // Badge: Adherencia
    const adherenceRate = stats.completionRate;
    badges.push({
      id: 'adherence',
      emoji: '🥈',
      title: 'Adherencia',
      description: `${adherenceRate}% de controles al día`,
      level: adherenceRate >= 80 ? 'gold' : adherenceRate >= 60 ? 'silver' : 'bronze',
      earned: adherenceRate >= 60,
      progress: stats.upToDate,
      maxProgress: stats.total,
    });

    // Badge: Sin Retrasos
    if (stats.total > 0) {
      badges.push({
        id: 'no-delays',
        emoji: '⏰',
        title: 'Sin Retrasos',
        description: 'Ningún screening atrasado',
        level: 'gold',
        earned: stats.overdue === 0,
        progress: stats.total - stats.overdue,
        maxProgress: stats.total,
      });
    }

    return badges.sort((a, b) => Number(b.earned) - Number(a.earned));
  }, [stats]);

  // Weekly goals will be replaced by useWeeklyGoals hook (Phase 3)
  // For now, return empty array to avoid mock data
  const weeklyGoals: WeeklyGoal[] = useMemo(() => {
    // TODO: Replace with useWeeklyGoals hook after Phase 3 migration
    return [];
  }, []);

  return {
    screenings,
    stats,
    achievements,
    weeklyGoals,
    loading,
    error,
    logScreeningResult,
    refetch: fetchScreenings,
  };
}
