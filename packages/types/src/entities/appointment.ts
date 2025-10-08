/**
 * Appointment types - Sistema de citas médicas
 *
 * Define todos los tipos relacionados con citas médicas,
 * estados, tipos y DTOs para Supabase.
 *
 * ACTUALIZADO para reflejar esquema real de BD con campos corregidos:
 * - end_time (no calculado desde duration)
 * - location, meeting_url, created_by (campos nuevos)
 * - deleted_at (soft delete)
 */

import type { UUID } from "../core/brand.types";
import type { ISODateString } from "../core/brand.types";

// ==========================================
// Appointment Types & Constants
// ==========================================

/**
 * Tipos de cita médica
 * CORREGIDO según mejores prácticas médicas:
 * - "follow_up" con underscore (no guión)
 * - "lab_test" y "checkup" agregados
 * - "procedure" y "screening" removidos (poco comunes en telemedicina)
 */
export type AppointmentType =
  | "consultation"
  | "follow_up"      // CORREGIDO: era "follow-up"
  | "emergency"
  | "telemedicine"
  | "lab_test"       // NUEVO
  | "checkup";       // NUEVO

export const APPOINTMENT_TYPES: readonly AppointmentType[] = [
  "consultation",
  "follow_up",
  "emergency",
  "telemedicine",
  "lab_test",
  "checkup"
] as const;

/**
 * Estados de cita médica
 * CORREGIDO según esquema real de BD:
 * - "confirmed" agregado (existe en BD)
 * - "rescheduled" removido (no es un estado final en BD)
 */
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"      // NUEVO
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no_show";       // CORREGIDO: con underscore

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
  "no_show"
] as const;

// ==========================================
// Core Appointment Interface
// ==========================================

/**
 * Cita médica - Refleja esquema real de tabla appointments
 *
 * CAMPOS CORREGIDOS según BD real:
 * - snake_case para coincidir con BD
 * - end_time agregado (campo real en BD)
 * - location, meeting_url, created_by agregados
 * - deleted_at agregado (soft delete)
 * - duration_minutes (no duration)
 *
 * NOTA: Los campos patient_id y doctor_id son nullable en BD
 * porque pueden existir appointments sin asignación aún.
 */
export interface Appointment {
  id: UUID;
  patient_id: UUID | null;
  doctor_id: UUID | null;
  start_time: ISODateString;
  end_time: ISODateString | null; // NUEVO: campo real en BD (no calculado)
  duration_minutes: number | null; // CORREGIDO: era "duration"
  type: AppointmentType | null;
  status: AppointmentStatus | null;
  notes: string | null;
  location: string | null;        // NUEVO: ubicación física o "online"
  meeting_url: string | null;     // NUEVO: URL para telemedicina
  created_by: UUID | null;        // NUEVO: quién creó la cita
  created_at: ISODateString;      // CORREGIDO: snake_case
  updated_at: ISODateString;      // CORREGIDO: snake_case
  deleted_at: ISODateString | null; // NUEVO: soft delete
}

// ==========================================
// Supabase DTOs
// ==========================================

/**
 * DTO para crear nueva cita
 * Campos requeridos mínimos según BD
 */
export interface AppointmentInsert {
  patient_id?: UUID | null;
  doctor_id?: UUID | null;
  start_time: ISODateString; // ÚNICO campo NOT NULL
  end_time?: ISODateString | null;
  duration_minutes?: number | null;
  type?: AppointmentType | null;
  status?: AppointmentStatus | null; // Default: 'scheduled'
  notes?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  created_by?: UUID | null;
}

/**
 * DTO para actualizar cita existente
 */
export interface AppointmentUpdate {
  patient_id?: UUID | null;
  doctor_id?: UUID | null;
  start_time?: ISODateString;
  end_time?: ISODateString | null;
  duration_minutes?: number | null;
  type?: AppointmentType | null;
  status?: AppointmentStatus | null;
  notes?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  updated_at?: ISODateString;
  deleted_at?: ISODateString | null; // Para soft delete
}

/**
 * Cita con detalles de paciente y doctor
 * NOTA: Pendiente de actualización cuando Profile sea corregido
 */
export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: UUID;
    email: string | null;
  } | null;
  doctor: {
    id: UUID;
    specialty: string | null;
    license_number: string;
  } | null;
}

// ==========================================
// Type Guards
// ==========================================

/**
 * Type guard para verificar si un objeto es un Appointment válido
 * ACTUALIZADO para usar nombres de campos reales (snake_case)
 */
export const isAppointment = (v: unknown): v is Appointment => {
  return !!v &&
    typeof v === 'object' &&
    'id' in v &&
    'start_time' in v &&  // CORREGIDO: era startTime
    typeof (v as any).id === "string";
};

export const isAppointmentType = (v: unknown): v is AppointmentType => {
  return typeof v === 'string' && APPOINTMENT_TYPES.includes(v as AppointmentType);
};

export const isAppointmentStatus = (v: unknown): v is AppointmentStatus => {
  return typeof v === 'string' && APPOINTMENT_STATUSES.includes(v as AppointmentStatus);
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * Verifica si el estado es terminal (no permite más cambios)
 * ACTUALIZADO con status corregido (no_show con underscore)
 */
export const isTerminalStatus = (status: AppointmentStatus): boolean => {
  return status === "completed" || status === "cancelled" || status === "no_show";
};

/**
 * Verifica si el tipo de cita requiere URL de reunión
 */
export const requiresMeetingUrl = (type: AppointmentType): boolean => {
  return type === "telemedicine";
};

/**
 * Verifica si el tipo de cita requiere ubicación física
 */
export const requiresPhysicalLocation = (type: AppointmentType): boolean => {
  return type === "lab_test" || type === "checkup" || type === "emergency";
};
