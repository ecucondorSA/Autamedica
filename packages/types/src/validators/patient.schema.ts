/**
 * Patient Zod Schemas
 *
 * Validadores runtime en snake_case (fiel al esquema BD)
 * con helpers para transformar a camelCase para UI
 */

import { z } from 'zod';
import { toCamel } from '../utils/casing';

// ==========================================
// DB Schema (snake_case) - Refleja tabla patients
// ==========================================

/**
 * Schema Zod para PatientProfile (snake_case - DB format)
 *
 * IMPORTANTE:
 * - medical_history, allergies, medications son TEXT (no JSONB)
 * - emergency_contact se divide en 2 campos: name y phone
 * - date_of_birth (NO birth_date)
 */
export const PatientProfileSnakeSchema = z.object({
  user_id: z.string().uuid(),
  date_of_birth: z.string().nullable(), // DATE format YYYY-MM-DD
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable(),
  height_cm: z.number().positive().nullable(),
  weight_kg: z.number().positive().nullable(),
  medical_history: z.string().nullable(), // TEXT field
  allergies: z.string().nullable(), // TEXT field
  medications: z.string().nullable(), // TEXT field
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  insurance_provider: z.string().nullable(),
  insurance_policy_number: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable()
});

/**
 * Schema para INSERT de patient
 */
export const PatientInsertSnakeSchema = PatientProfileSnakeSchema.omit({
  created_at: true,
  updated_at: true,
  deleted_at: true
});

/**
 * Schema para UPDATE de patient
 */
export const PatientUpdateSnakeSchema = PatientInsertSnakeSchema.partial().omit({
  user_id: true
});

// ==========================================
// Type Inference
// ==========================================

export type PatientSnake = z.infer<typeof PatientProfileSnakeSchema>;
export type PatientInsertSnake = z.infer<typeof PatientInsertSnakeSchema>;
export type PatientUpdateSnake = z.infer<typeof PatientUpdateSnakeSchema>;

// ==========================================
// UI Parsers (boundary)
// ==========================================

/**
 * Parser: BD → UI (snake_case → camelCase)
 */
export function parsePatientForUI<T = unknown>(raw: unknown): T {
  const validated = PatientProfileSnakeSchema.parse(raw);
  return toCamel<T>(validated);
}

/**
 * Parser seguro: BD → UI (retorna null si falla)
 */
export function safeParsePatientForUI<T = unknown>(raw: unknown): T | null {
  const result = PatientProfileSnakeSchema.safeParse(raw);
  if (!result.success) return null;
  return toCamel<T>(result.data);
}

/**
 * Parser de array: BD → UI
 */
export function parsePatientsForUI<T = unknown>(raw: unknown): T[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected array of patients');
  }
  return raw.map(item => parsePatientForUI<T>(item));
}

// ==========================================
// Validadores de Negocio
// ==========================================

/**
 * Calcula edad a partir de date_of_birth
 */
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calcula BMI (Body Mass Index)
 */
export function calculateBMI(
  heightCm: number | null,
  weightKg: number | null
): number | null {
  if (!heightCm || !weightKg) return null;

  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Valida que paciente tenga información mínima completa
 */
export function isPatientProfileComplete(patient: PatientSnake): boolean {
  return !!(
    patient.user_id &&
    patient.date_of_birth &&
    patient.gender &&
    patient.emergency_contact_name &&
    patient.emergency_contact_phone
  );
}

/**
 * Verifica si paciente es menor de edad
 */
export function isMinor(dateOfBirth: string | null): boolean {
  const age = calculateAge(dateOfBirth);
  return age !== null && age < 18;
}

/**
 * Verifica si paciente requiere autorización de tutor
 */
export function requiresGuardianConsent(patient: PatientSnake): boolean {
  return isMinor(patient.date_of_birth);
}

/**
 * Valida que emergency contact tenga ambos campos
 */
export function hasValidEmergencyContact(patient: PatientSnake): boolean {
  return !!(patient.emergency_contact_name && patient.emergency_contact_phone);
}

/**
 * Clasifica riesgo BMI según OMS
 */
export function getBMICategory(bmi: number | null): string | null {
  if (!bmi) return null;

  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_class_1';
  if (bmi < 40) return 'obese_class_2';
  return 'obese_class_3';
}

/**
 * Verifica si paciente tiene seguro médico
 */
export function hasInsurance(patient: PatientSnake): boolean {
  return !!(patient.insurance_provider && patient.insurance_policy_number);
}
