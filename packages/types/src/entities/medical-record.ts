/**
 * Medical Record types - Sistema de registros médicos
 *
 * Define todos los tipos relacionados con registros médicos,
 * visibilidad, auditoría y DTOs para Supabase.
 *
 * ACTUALIZADO para reflejar esquema real de BD:
 * - snake_case para campos de BD
 * - visibility con valor "normal" y "permanent" (para data retention)
 * - attachments JSONB agregado
 * - date_recorded agregado
 * - deleted_at agregado (soft delete)
 */

import type { UUID } from "../core/brand.types";
import type { ISODateString } from "../core/brand.types";

// ==========================================
// Medical Record Visibility & Constants
// ==========================================

/**
 * Visibilidad de registro médico
 * NOTA: "permanent" se usa en data retention para prevenir soft delete
 */
export type MedicalRecordVisibility =
  | "normal"        // Visibilidad estándar según RLS
  | "permanent"     // No se aplica data retention (crítico)
  | "private"       // Solo doctor que lo creó
  | "care_team"     // Equipo médico del paciente
  | "patient"       // Paciente puede ver
  | "emergency"     // Acceso en emergencias
  | "restricted";   // Solo con autorización explícita

export const MEDICAL_RECORD_VISIBILITIES: readonly MedicalRecordVisibility[] = [
  "normal",
  "permanent",
  "private",
  "care_team",
  "patient",
  "emergency",
  "restricted"
] as const;

export type MedicalRecordType =
  | "consultation"
  | "diagnosis"
  | "treatment"
  | "lab_result"
  | "prescription"
  | "imaging"
  | "procedure";

// ==========================================
// Core Medical Record Interface
// ==========================================

/**
 * Registro médico - Refleja esquema real de tabla medical_records
 *
 * CAMPOS según BD real:
 * - snake_case para coincidir con BD
 * - attachments: JSONB para archivos adjuntos
 * - date_recorded: cuándo ocurrió el evento médico
 * - visibility: incluye "normal" y "permanent" para data retention
 * - deleted_at: soft delete (agregado en parches)
 */
export interface MedicalRecord {
  id: UUID;
  patient_id: UUID | null;
  doctor_id: UUID | null;
  appointment_id: UUID | null;
  type: string; // MedicalRecordType - TEXT field en BD, NOT NULL
  title: string; // NOT NULL
  content: Record<string, unknown>; // JSONB NOT NULL
  attachments: Record<string, unknown>[] | null; // JSONB nullable
  visibility: string | null; // MedicalRecordVisibility - TEXT field
  date_recorded: ISODateString | null; // Cuando ocurrió el evento médico
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
  deleted_at: ISODateString | null; // Soft delete - agregado en parches
}

// ==========================================
// Supabase DTOs
// ==========================================

/**
 * DTO para crear nuevo registro médico
 * Campos mínimos requeridos: type, title, content (NOT NULL en BD)
 */
export interface MedicalRecordInsert {
  patient_id?: UUID | null;
  doctor_id?: UUID | null;
  appointment_id?: UUID | null;
  type: string; // REQUIRED - MedicalRecordType
  title: string; // REQUIRED
  content: Record<string, unknown>; // REQUIRED - JSONB
  attachments?: Record<string, unknown>[] | null;
  visibility?: string | null; // MedicalRecordVisibility
  date_recorded?: ISODateString | null;
}

/**
 * DTO para actualizar registro médico existente
 */
export interface MedicalRecordUpdate {
  patient_id?: UUID | null;
  doctor_id?: UUID | null;
  appointment_id?: UUID | null;
  type?: string;
  title?: string;
  content?: Record<string, unknown>; // Solo additive updates
  attachments?: Record<string, unknown>[] | null;
  visibility?: string | null;
  date_recorded?: ISODateString | null;
  updated_at?: ISODateString;
  deleted_at?: ISODateString | null; // Para soft delete
}

/**
 * Registro médico con detalles de paciente y doctor
 */
export interface MedicalRecordWithDetails extends MedicalRecord {
  patient: {
    id: UUID;
    email: string | null;
  } | null;
  doctor: {
    id: UUID;
    specialty: string | null;
    license_number: string;
  } | null;
  appointment: {
    id: UUID;
    start_time: ISODateString;
    type: string | null;
    status: string | null;
  } | null;
  access_log?: {
    id: string; // BIGSERIAL de audit_logs
    user_id: UUID | null;
    action: string;
    created_at: ISODateString;
  }[];
}

// ==========================================
// Type Guards & Utilities
// ==========================================

export const isMedicalRecordVisibility = (v: unknown): v is MedicalRecordVisibility => {
  return typeof v === 'string' && MEDICAL_RECORD_VISIBILITIES.includes(v as MedicalRecordVisibility);
};

export const canAccessRecord = (userRole: string, visibility: MedicalRecordVisibility): boolean => {
  if (userRole === 'patient') return visibility === 'patient';
  if (userRole === 'doctor') return visibility !== 'restricted';
  if (userRole === 'admin') return true;
  return false;
};

export const isHighSensitivityRecord = (recordType: MedicalRecordType): boolean => {
  return recordType === 'diagnosis' || recordType === 'treatment';
};

/**
 * Verifica si el registro es permanente (no aplica data retention)
 */
export const isPermanentRecord = (visibility: string | null): boolean => {
  return visibility === 'permanent';
};