/**
 * Appointment Zod Schemas
 *
 * Validadores runtime en snake_case (fiel al esquema BD)
 * con helpers para transformar a camelCase para UI
 *
 * REGLA: Schemas en snake_case, parsers retornan camelCase para UI
 */

import { z } from 'zod';
import { toCamel } from '../utils/casing';

// ==========================================
// DB Schema (snake_case) - Refleja tabla appointments
// ==========================================

/**
 * Schema Zod para Appointment (snake_case - DB format)
 *
 * Refleja EXACTAMENTE el esquema de tabla appointments en Supabase
 */
export const AppointmentSnakeSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid().nullable(),
  doctor_id: z.string().uuid().nullable(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().nullable(),
  duration_minutes: z.number().int().positive().nullable(),
  type: z.enum([
    'consultation',
    'follow_up',
    'emergency',
    'telemedicine',
    'lab_test',
    'checkup'
  ]).nullable(),
  status: z.enum([
    'scheduled',
    'confirmed',
    'in-progress',
    'completed',
    'cancelled',
    'no_show'
  ]).nullable(),
  notes: z.string().nullable(),
  location: z.string().nullable(),
  meeting_url: z.string().url().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable()
});

/**
 * Schema para INSERT de appointment (snake_case)
 */
export const AppointmentInsertSnakeSchema = AppointmentSnakeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
});

/**
 * Schema para UPDATE de appointment (snake_case)
 */
export const AppointmentUpdateSnakeSchema = AppointmentInsertSnakeSchema.partial();

// ==========================================
// Type Inference
// ==========================================

export type AppointmentSnake = z.infer<typeof AppointmentSnakeSchema>;
export type AppointmentInsertSnake = z.infer<typeof AppointmentInsertSnakeSchema>;
export type AppointmentUpdateSnake = z.infer<typeof AppointmentUpdateSnakeSchema>;

// ==========================================
// UI Parsers (boundary - retorna camelCase)
// ==========================================

/**
 * Parser: BD → UI (snake_case → camelCase)
 *
 * USAR: Cuando datos vienen de Supabase y van a UI
 *
 * @param raw - Datos raw de BD (snake_case)
 * @returns Datos validados y transformados a camelCase
 * @throws Si validación falla
 *
 * @example
 * ```ts
 * const dbData = await supabase.from('appointments').select('*').single();
 * const uiAppointment = parseAppointmentForUI(dbData.data);
 * // uiAppointment.patientId, uiAppointment.startTime (camelCase)
 * ```
 */
export function parseAppointmentForUI<T = unknown>(raw: unknown): T {
  const validated = AppointmentSnakeSchema.parse(raw);
  return toCamel<T>(validated);
}

/**
 * Parser seguro: BD → UI (retorna null si falla)
 *
 * USAR: Cuando datos pueden ser inválidos y prefieres null vs throw
 */
export function safeParseAppointmentForUI<T = unknown>(raw: unknown): T | null {
  const result = AppointmentSnakeSchema.safeParse(raw);
  if (!result.success) return null;
  return toCamel<T>(result.data);
}

/**
 * Parser de array: BD → UI
 *
 * @example
 * ```ts
 * const dbData = await supabase.from('appointments').select('*');
 * const uiAppointments = parseAppointmentsForUI(dbData.data);
 * ```
 */
export function parseAppointmentsForUI<T = unknown>(raw: unknown): T[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected array of appointments');
  }
  return raw.map(item => parseAppointmentForUI<T>(item));
}

// ==========================================
// Validadores de Negocio
// ==========================================

/**
 * Valida que appointment tenga campos mínimos requeridos para UI
 */
export function isValidAppointmentForDisplay(apt: unknown): boolean {
  const result = z.object({
    id: z.string().uuid(),
    patient_id: z.string().uuid(),
    doctor_id: z.string().uuid(),
    start_time: z.string().datetime(),
    status: z.string()
  }).safeParse(apt);

  return result.success;
}

/**
 * Valida que appointment de tipo telemedicina tenga meeting_url
 */
export function requiresMeetingUrl(apt: AppointmentSnake): boolean {
  return apt.type === 'telemedicine' && !apt.meeting_url;
}

/**
 * Valida que appointment de tipo presencial tenga location
 */
export function requiresPhysicalLocation(apt: AppointmentSnake): boolean {
  const physicalTypes: AppointmentSnake['type'][] = [
    'consultation',
    'lab_test',
    'checkup',
    'emergency'
  ];

  return physicalTypes.includes(apt.type) && !apt.location;
}

/**
 * Valida que appointment esté en estado terminal (no editable)
 */
export function isTerminalStatus(status: AppointmentSnake['status']): boolean {
  const terminalStatuses: AppointmentSnake['status'][] = [
    'completed',
    'cancelled',
    'no_show'
  ];

  return terminalStatuses.includes(status);
}

/**
 * Valida que duración sea consistente con start_time y end_time
 */
export function isDurationConsistent(apt: AppointmentSnake): boolean {
  if (!apt.end_time || !apt.duration_minutes) return true;

  const start = new Date(apt.start_time);
  const end = new Date(apt.end_time);
  const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

  return Math.abs(diffMinutes - apt.duration_minutes) <= 1; // tolerance 1 min
}
