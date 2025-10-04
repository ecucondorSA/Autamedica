import { useMemo } from 'react';

export interface ScreeningData {
  id: string;
  title: string;
  status: 'overdue' | 'due_soon' | 'up_to_date';
  priority: 'high' | 'medium' | 'low';
  category: 'cardiovascular' | 'cancer' | 'metabolic' | 'general';
  last_done_date?: string;
  next_due_date: string;
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

/**
 * Hook para gestionar screenings preventivos y calcular logros
 */
export function usePatientScreenings(patientAge: number = 52, patientGender: 'male' | 'female' = 'male') {
  // Mock data de screenings - en producción vendría de API
  const screenings: ScreeningData[] = useMemo(() => {
    const baseScreenings: ScreeningData[] = [
      {
        id: 'blood-pressure',
        title: 'Presión Arterial',
        status: 'up_to_date',
        priority: 'high',
        category: 'cardiovascular',
        last_done_date: '2025-09-28',
        next_due_date: '2025-10-28',
      },
      {
        id: 'cholesterol',
        title: 'Colesterol',
        status: 'up_to_date',
        priority: 'high',
        category: 'cardiovascular',
        last_done_date: '2025-08-15',
        next_due_date: '2026-08-15',
      },
      {
        id: 'glucose',
        title: 'Glucosa en sangre',
        status: 'due_soon',
        priority: 'high',
        category: 'metabolic',
        last_done_date: '2025-04-10',
        next_due_date: '2025-10-10',
      },
    ];

    // Screenings específicos por edad y género
    if (patientAge >= 50) {
      baseScreenings.push({
        id: 'colorectal',
        title: 'Cáncer Colorrectal (Colonoscopia)',
        status: 'overdue',
        priority: 'high',
        category: 'cancer',
        last_done_date: '2020-05-20',
        next_due_date: '2025-05-20',
      });
    }

    if (patientAge >= 50 && patientGender === 'male') {
      baseScreenings.push({
        id: 'psa',
        title: 'PSA (Próstata)',
        status: 'due_soon',
        priority: 'medium',
        category: 'cancer',
        last_done_date: '2024-10-01',
        next_due_date: '2025-10-01',
      });
    }

    if (patientGender === 'female' && patientAge >= 40) {
      baseScreenings.push({
        id: 'mammography',
        title: 'Mamografía',
        status: 'up_to_date',
        priority: 'high',
        category: 'cancer',
        last_done_date: '2025-03-15',
        next_due_date: '2027-03-15',
      });
    }

    return baseScreenings;
  }, [patientAge, patientGender]);

  // Calcular estadísticas
  const stats = useMemo(() => {
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
      completionRate: Math.round((upToDate / total) * 100),
      cardiovascularScreenings,
      cancerScreenings,
    };
  }, [screenings]);

  // Calcular logros/badges basados en screenings
  const achievements: AchievementBadge[] = useMemo(() => {
    const badges: AchievementBadge[] = [];

    // Badge: Guerrero Cardiovascular
    const cvComplete = stats.cardiovascularScreenings.filter(s => s.status === 'up_to_date').length;
    const cvTotal = stats.cardiovascularScreenings.length;
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

    // Badge: Detección Temprana (Cáncer)
    const cancerComplete = stats.cancerScreenings.filter(s => s.status === 'up_to_date').length;
    const cancerTotal = stats.cancerScreenings.length;
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

    return badges.sort((a, b) => Number(b.earned) - Number(a.earned));
  }, [stats]);

  // Calcular metas semanales basadas en screenings
  const weeklyGoals: WeeklyGoal[] = useMemo(() => {
    return [
      {
        id: 'medications',
        label: 'Medicamentos',
        completed: 7,
        total: 7,
        category: 'adherence',
      },
      {
        id: 'blood-pressure',
        label: 'Registrar PA',
        completed: 5,
        total: 7,
        category: 'monitoring',
      },
      {
        id: 'exercise',
        label: 'Ejercicio 30min',
        completed: 3,
        total: 5,
        category: 'lifestyle',
      },
      {
        id: 'screenings-due',
        label: 'Agendar screenings',
        completed: stats.total - stats.overdue - stats.dueSoon,
        total: stats.total,
        category: 'preventive',
      },
    ];
  }, [stats]);

  return {
    screenings,
    stats,
    achievements,
    weeklyGoals,
  };
}
