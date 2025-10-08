/**
 * @file Anamnesis Zod Validators
 * @description Runtime validation schemas for Anamnesis entities
 * @module @autamedica/types/validators/anamnesis
 *
 * IMPORTANT: These schemas validate snake_case (DB format)
 * Types in patient/anamnesis.types.ts also use snake_case
 */

import { z } from 'zod';
import type {
  Anamnesis,
  AnamnesisInsert,
  AnamnesisUpdate,
  AnamnesisSectionData,
  AnamnesisStatus,
  AnamnesisSection,
  AnamnesisSectionStatus,
} from '../patient/anamnesis.types';

// ================================================================
// ENUM SCHEMAS
// ================================================================

export const AnamnesisStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'under_review',
  'approved',
]);

export const AnamnesisSectionSchema = z.enum([
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
]);

export const AnamnesisSectionStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'requires_attention',
]);

// ================================================================
// SECTION DATA SCHEMAS
// ================================================================

export const PersonalDataSectionSchema = z.object({
  full_name: z.string().min(1),
  date_of_birth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  blood_type: z.string().optional(),
  dni: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    province: z.string(),
    zip_code: z.string(),
    country: z.string(),
  }),
  occupation: z.string().optional(),
  education_level: z.string().optional(),
  marital_status: z.string().optional(),
});

export const EmergencyContactSectionSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(1),
  alternative_phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const MedicalHistoryItemSchema = z.object({
  condition: z.string().min(1),
  icd10_code: z.string().optional(),
  diagnosed_date: z.string().datetime().optional(),
  status: z.enum(['active', 'resolved', 'chronic']),
  notes: z.string().optional(),
});

export const FamilyHistoryItemSchema = z.object({
  relationship: z.string().min(1),
  condition: z.string().min(1),
  age_of_onset: z.number().int().positive().optional(),
  deceased: z.boolean().optional(),
  notes: z.string().optional(),
});

export const AllergyItemSchema = z.object({
  allergen: z.string().min(1),
  type: z.enum(['medication', 'food', 'environmental', 'other']),
  severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']),
  reaction: z.string().min(1),
  diagnosed_date: z.string().datetime().optional(),
});

export const CurrentMedicationItemSchema = z.object({
  medication_name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().min(1),
  start_date: z.string().datetime(),
  prescribing_doctor: z.string().optional(),
  reason: z.string().min(1),
});

export const ChronicConditionItemSchema = z.object({
  condition: z.string().min(1),
  icd10_code: z.string().optional(),
  diagnosed_date: z.string().datetime(),
  treatment_plan: z.string().optional(),
  controlled: z.boolean(),
  monitoring_required: z.boolean(),
});

export const SurgicalHistoryItemSchema = z.object({
  surgery_type: z.string().min(1),
  date: z.string().datetime(),
  surgeon: z.string().optional(),
  hospital: z.string().optional(),
  complications: z.string().optional(),
  notes: z.string().optional(),
});

export const HospitalizationItemSchema = z.object({
  reason: z.string().min(1),
  admission_date: z.string().datetime(),
  discharge_date: z.string().datetime(),
  hospital: z.string().min(1),
  treating_doctor: z.string().optional(),
  outcome: z.string().optional(),
});

export const GynecologicalHistorySectionSchema = z.object({
  menarche_age: z.number().int().positive().optional(),
  menopause_age: z.number().int().positive().optional(),
  menstrual_cycle_regular: z.boolean(),
  pregnancies: z.number().int().min(0).optional(),
  births: z.number().int().min(0).optional(),
  miscarriages: z.number().int().min(0).optional(),
  cesareans: z.number().int().min(0).optional(),
  last_pap_smear: z.string().datetime().optional(),
  last_mammogram: z.string().datetime().optional(),
  contraceptive_method: z.string().optional(),
});

export const LifestyleSectionSchema = z.object({
  smoking_status: z.enum(['never', 'former', 'current']),
  smoking_packs_per_day: z.number().min(0).optional(),
  smoking_years: z.number().int().min(0).optional(),
  alcohol_consumption: z.enum(['never', 'occasional', 'moderate', 'heavy']),
  alcohol_drinks_per_week: z.number().int().min(0).optional(),
  recreational_drugs: z.boolean(),
  recreational_drugs_details: z.string().optional(),
  exercise_frequency: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  exercise_type: z.string().optional(),
  diet_type: z.string().optional(),
  sleep_hours_per_night: z.number().min(0).max(24).optional(),
  sleep_quality: z.enum(['poor', 'fair', 'good', 'excellent']),
  stress_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

export const MentalHealthSectionSchema = z.object({
  anxiety_diagnosed: z.boolean(),
  depression_diagnosed: z.boolean(),
  other_mental_health_conditions: z.array(z.string()).optional(),
  currently_seeing_therapist: z.boolean(),
  psychiatric_medications: z.array(z.string()).optional(),
  history_of_self_harm: z.boolean(),
  suicidal_ideation_history: z.boolean(),
  support_system_quality: z.enum(['poor', 'fair', 'good', 'excellent']),
});

export const ConsentSectionSchema = z.object({
  data_sharing_consent: z.boolean(),
  research_participation_consent: z.boolean(),
  telemedicine_consent: z.boolean(),
  privacy_policy_accepted: z.boolean(),
  privacy_policy_accepted_date: z.string().datetime(),
  terms_of_service_accepted: z.boolean(),
  terms_of_service_accepted_date: z.string().datetime(),
  can_revoke_consent: z.boolean(),
});

// ================================================================
// MAIN ANAMNESIS SCHEMA (DB format - snake_case)
// ================================================================

export const AnamnesisSnakeSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  status: AnamnesisStatusSchema,
  completion_percentage: z.number().int().min(0).max(100),
  last_updated_section: AnamnesisSectionSchema.nullable(),
  sections_status: z.record(AnamnesisSectionSchema, AnamnesisSectionStatusSchema),
  approved_by_doctor_id: z.string().uuid().nullable(),
  approved_at: z.string().datetime().nullable(),
  locked: z.boolean(),
  privacy_accepted: z.boolean(),
  terms_accepted: z.boolean(),
  data_export_requested: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export const AnamnesisInsertSnakeSchema = z.object({
  patient_id: z.string().uuid(),
  status: AnamnesisStatusSchema.default('not_started'),
  completion_percentage: z.number().int().min(0).max(100).default(0),
  last_updated_section: AnamnesisSectionSchema.nullable().optional(),
  sections_status: z.record(AnamnesisSectionSchema, AnamnesisSectionStatusSchema).default({}),
  privacy_accepted: z.boolean().default(false),
  terms_accepted: z.boolean().default(false),
});

export const AnamnesisUpdateSnakeSchema = AnamnesisSnakeSchema.omit({
  id: true,
  patient_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();

// ================================================================
// SECTION DATA SCHEMA
// ================================================================

export const AnamnesisSectionDataSchema = z.object({
  anamnesis_id: z.string().uuid(),
  section: AnamnesisSectionSchema,
  data: z.union([
    PersonalDataSectionSchema,
    z.array(EmergencyContactSectionSchema),
    z.array(MedicalHistoryItemSchema),
    z.array(FamilyHistoryItemSchema),
    z.array(AllergyItemSchema),
    z.array(CurrentMedicationItemSchema),
    z.array(ChronicConditionItemSchema),
    z.array(SurgicalHistoryItemSchema),
    z.array(HospitalizationItemSchema),
    GynecologicalHistorySectionSchema,
    LifestyleSectionSchema,
    MentalHealthSectionSchema,
    ConsentSectionSchema,
  ]),
  completed: z.boolean(),
  last_modified: z.string().datetime(),
  validation_errors: z.array(z.string()).optional(),
});

// ================================================================
// TYPE EXPORTS (inferred from schemas)
// ================================================================

export type AnamnesisSnake = z.infer<typeof AnamnesisSnakeSchema>;
export type AnamnesisInsertSnake = z.infer<typeof AnamnesisInsertSnakeSchema>;
export type AnamnesisUpdateSnake = z.infer<typeof AnamnesisUpdateSnakeSchema>;
export type AnamnesisSectionDataSnake = z.infer<typeof AnamnesisSectionDataSchema>;

// ================================================================
// PARSER FUNCTIONS (DB → TypeScript)
// ================================================================

/**
 * Parse anamnesis from DB format (already snake_case)
 * No transformation needed since types already use snake_case
 */
export function parseAnamnesisForUI(dbAnamnesis: AnamnesisSnake): Anamnesis {
  const parsed = AnamnesisSnakeSchema.parse(dbAnamnesis);
  return parsed as Anamnesis;
}

/**
 * Safe parse with error handling
 */
export function safeParseAnamnesisForUI(
  dbAnamnesis: unknown
): { success: true; data: Anamnesis } | { success: false; error: z.ZodError } {
  const result = AnamnesisSnakeSchema.safeParse(dbAnamnesis);
  if (result.success) {
    return { success: true, data: result.data as Anamnesis };
  }
  return { success: false, error: result.error };
}

/**
 * Parse array of anamnesis records
 */
export function parseAnamnesesForUI(dbAnamneses: AnamnesisSnake[]): Anamnesis[] {
  return dbAnamneses.map(parseAnamnesisForUI);
}

// ================================================================
// BUSINESS LOGIC VALIDATORS
// ================================================================

/**
 * Check if anamnesis is complete (100% and status completed)
 */
export function isAnamnesisComplete(anamnesis: Anamnesis): boolean {
  return anamnesis.completion_percentage === 100 && anamnesis.status === 'completed';
}

/**
 * Check if patient can edit (not locked and not approved)
 */
export function canPatientEditAnamnesis(anamnesis: Anamnesis): boolean {
  return !anamnesis.locked && anamnesis.status !== 'approved';
}

/**
 * Check if anamnesis requires doctor review
 */
export function requiresDoctorReview(anamnesis: Anamnesis): boolean {
  return anamnesis.status === 'completed' && !anamnesis.approved_by_doctor_id;
}

/**
 * Check if anamnesis is approved by doctor
 */
export function isApprovedByDoctor(anamnesis: Anamnesis): boolean {
  return anamnesis.status === 'approved' && !!anamnesis.approved_by_doctor_id;
}

/**
 * Check if patient has accepted privacy terms
 */
export function hasAcceptedTerms(anamnesis: Anamnesis): boolean {
  return anamnesis.privacy_accepted && anamnesis.terms_accepted;
}

/**
 * Get next pending section
 */
export function getNextPendingSection(anamnesis: Anamnesis): AnamnesisSection | null {
  const sectionOrder: AnamnesisSection[] = [
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

  for (const section of sectionOrder) {
    if (anamnesis.sections_status[section] !== 'completed') {
      return section;
    }
  }
  return null;
}

/**
 * Calculate section completion weight
 */
export function getSectionWeight(section: AnamnesisSection): number {
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

/**
 * Validate section data based on section type
 */
export function validateSectionData(
  section: AnamnesisSection,
  data: unknown
): { valid: boolean; errors?: string[] } {
  const schemaMap: Record<AnamnesisSection, z.ZodSchema> = {
    personal_data: PersonalDataSectionSchema,
    emergency_contacts: z.array(EmergencyContactSectionSchema),
    medical_history: z.array(MedicalHistoryItemSchema),
    family_history: z.array(FamilyHistoryItemSchema),
    allergies: z.array(AllergyItemSchema),
    current_medications: z.array(CurrentMedicationItemSchema),
    chronic_conditions: z.array(ChronicConditionItemSchema),
    surgical_history: z.array(SurgicalHistoryItemSchema),
    hospitalizations: z.array(HospitalizationItemSchema),
    gynecological_history: GynecologicalHistorySectionSchema,
    lifestyle: LifestyleSectionSchema,
    mental_health: MentalHealthSectionSchema,
    consent: ConsentSectionSchema,
  };

  const schema = schemaMap[section];
  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
  };
}
