/**
 * Medical Record types - Sistema de registros médicos
 *
 * Define todos los tipos relacionados con registros médicos,
 * visibilidad, auditoría y DTOs para Supabase.
 */

import type { UUID, PatientId, DoctorId, AppointmentId } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Medical Record Visibility & Constants
// ==========================================

export type MedicalRecordVisibility =
  | "private"
  | "care_team"
  | "patient"
  | "emergency"
  | "restricted";

export const MEDICAL_RECORD_VISIBILITIES: readonly MedicalRecordVisibility[] = [
  "private",      // Solo doctor que lo creó
  "care_team",    // Equipo médico del paciente
  "patient",      // Paciente puede ver
  "emergency",    // Acceso en emergencias
  "restricted"    // Solo con autorización explícita
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
 * Registro médico con auditoría completa y control de acceso
 */
export interface MedicalRecord {
  id: UUID;
  patientId: PatientId;
  doctorId: DoctorId;
  appointmentId?: AppointmentId;
  recordType: MedicalRecordType;
  title: string;
  content: Record<string, any>; // JSON content
  visibility: MedicalRecordVisibility;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface MedicalRecordInsert {
  patientId: PatientId;
  doctorId: DoctorId;
  appointmentId?: AppointmentId;
  recordType: MedicalRecordType;
  title: string;
  content: Record<string, any>;
  visibility?: MedicalRecordVisibility; // Default: 'care_team'
}

export interface MedicalRecordUpdate {
  title?: string;
  content?: Record<string, any>; // Solo additive updates
  visibility?: MedicalRecordVisibility;
  // Original content preserved for audit
}

export interface MedicalRecordWithDetails extends MedicalRecord {
  patient: {
    id: PatientId;
    firstName: string;
    lastName: string;
    dateOfBirth: ISODateString;
  };
  doctor: {
    id: DoctorId;
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
  };
  appointment?: {
    id: AppointmentId;
    startTime: ISODateString;
    type: string;
    status: string;
  };
  accessLog?: {
    id: UUID;
    accessedBy: UUID;
    accessedAt: ISODateString;
    action: string;
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