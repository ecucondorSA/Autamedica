/**
 * Doctor Zod Schemas
 *
 * Validadores runtime en snake_case (fiel al esquema BD)
 * con helpers para transformar a camelCase para UI
 */

import { z } from 'zod';
import { toCamel } from '../utils/casing';

// ==========================================
// DB Schema (snake_case) - Refleja tabla doctors
// ==========================================

/**
 * Schema Zod para Doctor Education (JSONB structure)
 */
export const DoctorEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.number().int().positive(),
  specialization: z.string().optional()
});

/**
 * Schema Zod para Doctor Experience (JSONB structure)
 */
export const DoctorExperienceSchema = z.object({
  institution: z.string(),
  position: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional()
});

/**
 * Schema Zod para Doctor (snake_case - DB format)
 *
 * ACTUALIZADO con TypeScript-aligned fields:
 * - first_name, last_name, email, phone (campos agregados 2025-10-08)
 * - specialties como array de strings (JSONB)
 * - education y experience como arrays de objetos (JSONB)
 */
export const DoctorProfileSnakeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  license_number: z.string().min(1),
  specialties: z.array(z.string()).default([]),
  bio: z.string().nullable(),
  education: z.array(DoctorEducationSchema).nullable(),
  experience: z.array(DoctorExperienceSchema).nullable(),
  consultation_fee: z.number().positive().nullable(),
  telemedicine_enabled: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable()
});

/**
 * Schema para INSERT de doctor
 */
export const DoctorInsertSnakeSchema = DoctorProfileSnakeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
});

/**
 * Schema para UPDATE de doctor
 */
export const DoctorUpdateSnakeSchema = DoctorInsertSnakeSchema.partial().omit({
  user_id: true,
  license_number: true // License number no debe cambiar
});

// ==========================================
// Type Inference
// ==========================================

export type DoctorSnake = z.infer<typeof DoctorProfileSnakeSchema>;
export type DoctorInsertSnake = z.infer<typeof DoctorInsertSnakeSchema>;
export type DoctorUpdateSnake = z.infer<typeof DoctorUpdateSnakeSchema>;
export type DoctorEducation = z.infer<typeof DoctorEducationSchema>;
export type DoctorExperience = z.infer<typeof DoctorExperienceSchema>;

// ==========================================
// UI Parsers (boundary)
// ==========================================

/**
 * Parser: BD → UI (snake_case → camelCase)
 */
export function parseDoctorForUI<T = unknown>(raw: unknown): T {
  const validated = DoctorProfileSnakeSchema.parse(raw);
  return toCamel<T>(validated);
}

/**
 * Parser seguro: BD → UI (retorna null si falla)
 */
export function safeParseDoctorForUI<T = unknown>(raw: unknown): T | null {
  const result = DoctorProfileSnakeSchema.safeParse(raw);
  if (!result.success) return null;
  return toCamel<T>(result.data);
}

/**
 * Parser de array: BD → UI
 */
export function parseDoctorsForUI<T = unknown>(raw: unknown): T[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected array of doctors');
  }
  return raw.map(item => parseDoctorForUI<T>(item));
}

// ==========================================
// Validadores de Negocio
// ==========================================

/**
 * Valida que doctor tenga información mínima completa
 */
export function isDoctorProfileComplete(doctor: DoctorSnake): boolean {
  return !!(
    doctor.user_id &&
    doctor.first_name &&
    doctor.last_name &&
    doctor.email &&
    doctor.license_number &&
    doctor.specialties.length > 0
  );
}

/**
 * Verifica si doctor está activo y puede recibir pacientes
 */
export function isAvailableForConsultations(doctor: DoctorSnake): boolean {
  return doctor.is_active && doctor.license_number.length > 0;
}

/**
 * Verifica si doctor tiene telemedicina habilitada
 */
export function canProvideTelemedicine(doctor: DoctorSnake): boolean {
  return doctor.is_active && doctor.telemedicine_enabled;
}

/**
 * Calcula años de experiencia basado en historial
 */
export function calculateYearsOfExperience(doctor: DoctorSnake): number | null {
  if (!doctor.experience || doctor.experience.length === 0) return null;

  let totalMonths = 0;
  const now = new Date();

  for (const exp of doctor.experience) {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : now;

    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth());

    totalMonths += months;
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Verifica si doctor tiene especialidad específica
 */
export function hasSpecialty(doctor: DoctorSnake, specialty: string): boolean {
  return doctor.specialties.includes(specialty);
}

/**
 * Obtiene título académico más reciente
 */
export function getLatestDegree(doctor: DoctorSnake): string | null {
  if (!doctor.education || doctor.education.length === 0) return null;

  const sorted = [...doctor.education].sort((a, b) => b.year - a.year);
  return sorted[0]?.degree ?? null;
}

/**
 * Verifica si doctor tiene educación médica válida
 */
export function hasValidMedicalEducation(doctor: DoctorSnake): boolean {
  if (!doctor.education || doctor.education.length === 0) return false;

  const medicalDegrees = ['MD', 'DO', 'MBBS', 'MBChB'];
  return doctor.education.some(edu =>
    medicalDegrees.some(degree => edu.degree.toUpperCase().includes(degree))
  );
}

/**
 * Obtiene posición actual del doctor
 */
export function getCurrentPosition(doctor: DoctorSnake): string | null {
  if (!doctor.experience || doctor.experience.length === 0) return null;

  const current = doctor.experience.find(exp => !exp.endDate);
  return current?.position || null;
}

/**
 * Calcula tarifa promedio si hay consulta definida
 */
export function getConsultationFeeDisplay(doctor: DoctorSnake): string {
  if (!doctor.consultation_fee) return 'Consultar';
  return `$${doctor.consultation_fee.toFixed(2)}`;
}

/**
 * Verifica si doctor requiere actualización de perfil
 */
export function needsProfileUpdate(doctor: DoctorSnake): boolean {
  return !doctor.bio ||
         !doctor.education ||
         doctor.education.length === 0 ||
         !doctor.experience ||
         doctor.experience.length === 0;
}
