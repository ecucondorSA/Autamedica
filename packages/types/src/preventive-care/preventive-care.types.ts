// =====================================================
// TIPOS: Sistema de Atención Médica Preventiva
// Descripción: Screenings obligatorios, prevención por edad
// =====================================================

import type { UUID } from '../primitives/id';
import type { ISODateString } from '../primitives/date';
import type { PatientId } from '../patient/patient.types';

// =====================================================
// Branded Types
// =====================================================

export type PreventiveScreeningId = UUID & { readonly __brand: 'PreventiveScreeningId' };
export type MedicalCaseId = UUID & { readonly __brand: 'MedicalCaseId' };
export type ScreeningReminderNotificationId = UUID & { readonly __brand: 'ScreeningReminderNotificationId' };

// =====================================================
// Enums y Tipos Literales
// =====================================================

export type GenderType = 'male' | 'female' | 'all';

export type ScreeningCategoryType =
  | 'cancer_screening'
  | 'cardiovascular'
  | 'metabolic'
  | 'immunization'
  | 'vision_hearing'
  | 'bone_health'
  | 'mental_health'
  | 'reproductive_health'
  | 'dental';

export type ScreeningFrequencyType =
  | 'one_time'
  | 'monthly'
  | 'every_3_months'
  | 'every_6_months'
  | 'annually'
  | 'every_2_years'
  | 'every_3_years'
  | 'every_5_years'
  | 'every_10_years';

export type RiskLevelType = 'low' | 'medium' | 'high' | 'very_high';

export type ScreeningStatusType = 'not_started' | 'scheduled' | 'completed' | 'overdue' | 'not_applicable';

// =====================================================
// Interfaces Principales
// =====================================================

/**
 * Definición de screening preventivo
 * Ejemplo: Mamografía, Colonoscopía, PSA, etc.
 */
export interface PreventiveScreening {
  readonly id: PreventiveScreeningId;
  readonly name: string;
  readonly category: ScreeningCategoryType;
  readonly description: string;
  readonly target_gender: GenderType;
  readonly min_age: number | null; // null = sin mínimo
  readonly max_age: number | null; // null = sin máximo
  readonly recommended_frequency: ScreeningFrequencyType;
  readonly is_mandatory: boolean;
  readonly estimated_cost_ars: number | null;
  readonly covered_by_public_health: boolean;
  readonly requires_specialist: boolean;
  readonly preparation_instructions: string | null;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

/**
 * Screening asignado a un paciente específico
 */
export interface PatientScreening {
  readonly id: UUID;
  readonly patient_id: PatientId;
  readonly screening_id: PreventiveScreeningId;
  readonly status: ScreeningStatusType;
  readonly scheduled_date: ISODateString | null;
  readonly completed_date: ISODateString | null;
  readonly next_due_date: ISODateString | null;
  readonly assigned_doctor_id: UUID | null;
  readonly notes: string | null;
  readonly result_summary: string | null;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

/**
 * Condiciones de riesgo que modifican recomendaciones
 */
export interface RiskFactor {
  readonly id: UUID;
  readonly name: string;
  readonly description: string;
  readonly category: ScreeningCategoryType;
  readonly increases_risk_for: string[]; // IDs de screenings afectados
  readonly recommended_age_adjustment: number; // Ejemplo: -10 años para comenzar antes
  readonly frequency_adjustment: ScreeningFrequencyType | null; // Más frecuente si aplica
}

/**
 * Factores de riesgo del paciente
 */
export interface PatientRiskFactor {
  readonly id: UUID;
  readonly patient_id: PatientId;
  readonly risk_factor_id: UUID;
  readonly severity: RiskLevelType;
  readonly diagnosed_date: ISODateString;
  readonly notes: string | null;
  readonly created_at: ISODateString;
}

/**
 * Recordatorios automáticos
 */
export interface ScreeningReminderNotification {
  readonly id: ScreeningReminderNotificationId;
  readonly patient_screening_id: UUID;
  readonly patient_id: PatientId;
  readonly reminder_date: ISODateString;
  readonly sent_at: ISODateString | null;
  readonly message: string;
  readonly notification_channel: 'email' | 'sms' | 'push' | 'in_app';
  readonly is_read: boolean;
  readonly created_at: ISODateString;
}

/**
 * Caso médico educativo
 * Ejemplo: Guía sobre prevención de cáncer de mama
 */
export interface MedicalCase {
  readonly id: MedicalCaseId;
  readonly title: string;
  readonly category: ScreeningCategoryType;
  readonly description: string;
  readonly target_gender: GenderType;
  readonly target_age_min: number | null;
  readonly target_age_max: number | null;
  readonly content_sections: MedicalCaseSection[];
  readonly related_screenings: PreventiveScreeningId[];
  readonly related_specialists: string[]; // Specialty names
  readonly is_published: boolean;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

export interface MedicalCaseSection {
  readonly heading: string;
  readonly content: string;
  readonly order: number;
  readonly media_url?: string;
}

// =====================================================
// Tipos de Inserción (para crear nuevos registros)
// =====================================================

export type PreventiveScreeningInsert = Omit<PreventiveScreening, 'id' | 'created_at' | 'updated_at'>;
export type PatientScreeningInsert = Omit<PatientScreening, 'id' | 'created_at' | 'updated_at'>;
export type PatientRiskFactorInsert = Omit<PatientRiskFactor, 'id' | 'created_at'>;
export type ScreeningReminderNotificationInsert = Omit<ScreeningReminderNotification, 'id' | 'created_at'>;

// =====================================================
// Tipos con Joins (para queries con relaciones)
// =====================================================

export interface PatientScreeningWithDetails extends PatientScreening {
  readonly screening: PreventiveScreening;
  readonly assigned_doctor: {
    readonly id: UUID;
    readonly first_name: string;
    readonly last_name: string;
    readonly specialty: string;
  } | null;
}

export interface PreventiveScreeningWithStats extends PreventiveScreening {
  readonly total_patients_assigned: number;
  readonly completion_rate: number;
  readonly average_completion_days: number;
}

// =====================================================
// Helper Types
// =====================================================

export interface AgeRange {
  readonly min: number | null;
  readonly max: number | null;
}

export interface ScreeningRecommendation {
  readonly screening: PreventiveScreening;
  readonly is_due: boolean;
  readonly urgency: 'low' | 'medium' | 'high';
  readonly reason: string;
  readonly next_due_date: ISODateString | null;
}

// =====================================================
// Funciones Helper
// =====================================================

/**
 * Determina si un screening aplica para un paciente
 */
export function isScreeningApplicable(
  screening: PreventiveScreening,
  patientAge: number,
  patientGender: 'male' | 'female'
): boolean {
  // Verificar género
  if (screening.target_gender !== 'all' && screening.target_gender !== patientGender) {
    return false;
  }

  // Verificar edad mínima
  if (screening.min_age !== null && patientAge < screening.min_age) {
    return false;
  }

  // Verificar edad máxima
  if (screening.max_age !== null && patientAge > screening.max_age) {
    return false;
  }

  return true;
}

/**
 * Calcula próxima fecha de screening basada en frecuencia
 */
export function calculateNextDueDate(
  lastCompletedDate: Date,
  frequency: ScreeningFrequencyType
): Date {
  const nextDate = new Date(lastCompletedDate);

  switch (frequency) {
    case 'one_time':
      return new Date(0); // No hay próxima fecha
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'every_3_months':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'every_6_months':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'annually':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'every_2_years':
      nextDate.setFullYear(nextDate.getFullYear() + 2);
      break;
    case 'every_3_years':
      nextDate.setFullYear(nextDate.getFullYear() + 3);
      break;
    case 'every_5_years':
      nextDate.setFullYear(nextDate.getFullYear() + 5);
      break;
    case 'every_10_years':
      nextDate.setFullYear(nextDate.getFullYear() + 10);
      break;
  }

  return nextDate;
}

/**
 * Calcula edad del paciente
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Determina nivel de urgencia basado en días de retraso
 */
export function calculateUrgency(daysOverdue: number): 'low' | 'medium' | 'high' {
  if (daysOverdue <= 0) return 'low';
  if (daysOverdue <= 30) return 'low';
  if (daysOverdue <= 90) return 'medium';
  return 'high';
}

// =====================================================
// Catálogo de Screenings (Constantes)
// =====================================================

export const SCREENING_CATALOG = {
  // Cáncer
  MAMMOGRAPHY: 'mammography',
  PAP_SMEAR: 'pap_smear',
  HPV_TEST: 'hpv_test',
  COLONOSCOPY: 'colonoscopy',
  PROSTATE_PSA: 'prostate_psa',
  LUNG_CT: 'lung_ct_scan',
  SKIN_EXAM: 'skin_cancer_screening',

  // Cardiovascular
  BLOOD_PRESSURE: 'blood_pressure',
  CHOLESTEROL: 'cholesterol',
  EKG: 'electrocardiogram',

  // Metabólico
  DIABETES: 'diabetes_screening',
  THYROID: 'thyroid_function',

  // Inmunizaciones
  FLU_VACCINE: 'flu_vaccine',
  PNEUMONIA_VACCINE: 'pneumonia_vaccine',
  SHINGLES_VACCINE: 'shingles_vaccine',
  COVID_VACCINE: 'covid_vaccine',

  // Otros
  BONE_DENSITY: 'bone_density',
  VISION_TEST: 'vision_screening',
  HEARING_TEST: 'hearing_screening',
  DENTAL_CHECKUP: 'dental_checkup'
} as const;

export type ScreeningCatalogKey = typeof SCREENING_CATALOG[keyof typeof SCREENING_CATALOG];
