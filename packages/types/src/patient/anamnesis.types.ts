/**
 * @autamedica/types - Anamnesis (Historia Clínica Digital)
 *
 * Tipos para el sistema de anamnesis digital del paciente.
 * Cumple con normativas HIPAA y regulaciones argentinas de historias clínicas.
 */

import type { Brand } from '../core/brand.types';
import type { PatientId } from '../core/brand.types';
import type { ISODateString } from '../core/brand.types';
import type { BaseEntity } from '../core/base.types';

// ==========================================
// Branded IDs
// ==========================================

export type AnamnesisId = Brand<string, 'AnamnesisId'>;
export type AnamnesisSection =
  | 'personal_data'
  | 'emergency_contacts'
  | 'medical_history'
  | 'family_history'
  | 'allergies'
  | 'current_medications'
  | 'chronic_conditions'
  | 'surgical_history'
  | 'hospitalizations'
  | 'gynecological_history'
  | 'lifestyle'
  | 'mental_health'
  | 'consent';

// ==========================================
// Anamnesis Status
// ==========================================

export type AnamnesisStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'under_review'
  | 'approved';

export type AnamnesisSectionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'requires_attention';

// ==========================================
// Anamnesis Entity
// ==========================================

export interface Anamnesis extends BaseEntity {
  id: AnamnesisId;
  patient_id: PatientId;
  status: AnamnesisStatus;
  completion_percentage: number; // 0-100
  last_updated_section: AnamnesisSection | null;
  sections_status: Record<AnamnesisSection, AnamnesisSectionStatus>;
  approved_by_doctor_id: string | null;
  approved_at: ISODateString | null;
  locked: boolean; // true when approved, prevents edits
  privacy_accepted: boolean;
  terms_accepted: boolean;
  data_export_requested: boolean;
}

export interface AnamnesisInsert {
  patient_id: PatientId;
  status?: AnamnesisStatus;
  completion_percentage?: number;
  last_updated_section?: AnamnesisSection | null;
  sections_status?: Record<AnamnesisSection, AnamnesisSectionStatus>;
  privacy_accepted?: boolean;
  terms_accepted?: boolean;
}

export interface AnamnesisUpdate {
  status?: AnamnesisStatus;
  completion_percentage?: number;
  last_updated_section?: AnamnesisSection | null;
  sections_status?: Record<AnamnesisSection, AnamnesisSectionStatus>;
  approved_by_doctor_id?: string | null;
  approved_at?: ISODateString | null;
  locked?: boolean;
  privacy_accepted?: boolean;
  terms_accepted?: boolean;
  data_export_requested?: boolean;
}

// ==========================================
// Section Data Types
// ==========================================

export interface PersonalDataSection {
  full_name: string;
  date_of_birth: ISODateString;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  blood_type?: string;
  dni: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    province: string;
    zip_code: string;
    country: string;
  };
  occupation?: string;
  education_level?: string;
  marital_status?: string;
}

export interface EmergencyContactSection {
  name: string;
  relationship: string;
  phone: string;
  alternative_phone?: string;
  email?: string;
  address?: string;
}

export interface MedicalHistoryItem {
  condition: string;
  icd10_code?: string;
  diagnosed_date?: ISODateString;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface FamilyHistoryItem {
  relationship: string; // padre, madre, hermano, etc.
  condition: string;
  age_of_onset?: number;
  deceased?: boolean;
  notes?: string;
}

export interface AllergyItem {
  allergen: string;
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  reaction: string;
  diagnosed_date?: ISODateString;
}

export interface CurrentMedicationItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string; // oral, topical, injection, etc.
  start_date: ISODateString;
  prescribing_doctor?: string;
  reason: string;
}

export interface ChronicConditionItem {
  condition: string;
  icd10_code?: string;
  diagnosed_date: ISODateString;
  treatment_plan?: string;
  controlled: boolean;
  monitoring_required: boolean;
}

export interface SurgicalHistoryItem {
  surgery_type: string;
  date: ISODateString;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  notes?: string;
}

export interface HospitalizationItem {
  reason: string;
  admission_date: ISODateString;
  discharge_date: ISODateString;
  hospital: string;
  treating_doctor?: string;
  outcome?: string;
}

export interface GynecologicalHistorySection {
  menarche_age?: number;
  menopause_age?: number;
  menstrual_cycle_regular: boolean;
  pregnancies?: number;
  births?: number;
  miscarriages?: number;
  cesareans?: number;
  last_pap_smear?: ISODateString;
  last_mammogram?: ISODateString;
  contraceptive_method?: string;
}

export interface LifestyleSection {
  smoking_status: 'never' | 'former' | 'current';
  smoking_packs_per_day?: number;
  smoking_years?: number;
  alcohol_consumption: 'never' | 'occasional' | 'moderate' | 'heavy';
  alcohol_drinks_per_week?: number;
  recreational_drugs: boolean;
  recreational_drugs_details?: string;
  exercise_frequency: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  exercise_type?: string;
  diet_type?: string;
  sleep_hours_per_night?: number;
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent';
  stress_level: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = high
}

export interface MentalHealthSection {
  anxiety_diagnosed: boolean;
  depression_diagnosed: boolean;
  other_mental_health_conditions?: string[];
  currently_seeing_therapist: boolean;
  psychiatric_medications?: string[];
  history_of_self_harm: boolean;
  suicidal_ideation_history: boolean;
  support_system_quality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface ConsentSection {
  data_sharing_consent: boolean;
  research_participation_consent: boolean;
  telemedicine_consent: boolean;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_date: ISODateString;
  terms_of_service_accepted: boolean;
  terms_of_service_accepted_date: ISODateString;
  can_revoke_consent: boolean;
}

// ==========================================
// Anamnesis Section Data (Complete)
// ==========================================

export interface AnamnesisSectionData {
  anamnesis_id: AnamnesisId;
  section: AnamnesisSection;
  data:
    | PersonalDataSection
    | EmergencyContactSection[]
    | MedicalHistoryItem[]
    | FamilyHistoryItem[]
    | AllergyItem[]
    | CurrentMedicationItem[]
    | ChronicConditionItem[]
    | SurgicalHistoryItem[]
    | HospitalizationItem[]
    | GynecologicalHistorySection
    | LifestyleSection
    | MentalHealthSection
    | ConsentSection;
  completed: boolean;
  last_modified: ISODateString;
  validation_errors?: string[];
}

// ==========================================
// API Responses
// ==========================================

export interface AnamnesisAPIResponse {
  anamnesis: Anamnesis;
  sections: AnamnesisSectionData[];
}

export interface AnamnesisProgressResponse {
  anamnesis_id: AnamnesisId;
  completion_percentage: number;
  completed_sections: AnamnesisSection[];
  pending_sections: AnamnesisSection[];
  total_sections: number;
  estimated_time_remaining_minutes: number;
}

// ==========================================
// Utility Functions
// ==========================================

export const SECTION_ORDER: AnamnesisSection[] = [
  'personal_data',
  'emergency_contacts',
  'medical_history',
  'family_history',
  'allergies',
  'current_medications',
  'chronic_conditions',
  'surgical_history',
  'hospitalizations',
  'gynecological_history',
  'lifestyle',
  'mental_health',
  'consent',
];

export const SECTION_DISPLAY_NAMES: Record<AnamnesisSection, string> = {
  personal_data: 'Datos Personales',
  emergency_contacts: 'Contactos de Emergencia',
  medical_history: 'Historia Médica',
  family_history: 'Antecedentes Familiares',
  allergies: 'Alergias',
  current_medications: 'Medicamentos Actuales',
  chronic_conditions: 'Condiciones Crónicas',
  surgical_history: 'Historia Quirúrgica',
  hospitalizations: 'Hospitalizaciones',
  gynecological_history: 'Historia Ginecológica',
  lifestyle: 'Estilo de Vida',
  mental_health: 'Salud Mental',
  consent: 'Consentimientos',
};

export function isAnamnesisComplete(anamnesis: Anamnesis): boolean {
  return anamnesis.completion_percentage === 100 && anamnesis.status === 'completed';
}

export function calculateSectionWeight(section: AnamnesisSection): number {
  // Different sections have different weights for completion
  const weights: Record<AnamnesisSection, number> = {
    personal_data: 15,
    emergency_contacts: 10,
    medical_history: 12,
    family_history: 8,
    allergies: 10,
    current_medications: 10,
    chronic_conditions: 10,
    surgical_history: 7,
    hospitalizations: 5,
    gynecological_history: 5,
    lifestyle: 8,
    mental_health: 5,
    consent: 5,
  };
  return weights[section] || 5;
}

export function getNextPendingSection(anamnesis: Anamnesis): AnamnesisSection | null {
  for (const section of SECTION_ORDER) {
    if (anamnesis.sections_status[section] !== 'completed') {
      return section;
    }
  }
  return null;
}

export function canEditAnamnesis(anamnesis: Anamnesis): boolean {
  return !anamnesis.locked && anamnesis.status !== 'approved';
}

export function requiresDoctorReview(anamnesis: Anamnesis): boolean {
  return anamnesis.status === 'completed' && !anamnesis.approved_by_doctor_id;
}
