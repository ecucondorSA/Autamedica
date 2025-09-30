/**
 * Patient types - Sistema de pacientes
 *
 * Define todos los tipos relacionados con pacientes,
 * equipos de atención médica y DTOs para Supabase.
 */

import type { PatientId, DoctorId, UUID, UserId } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Patient Care Team Types
// ==========================================

export type PatientCareTeamRole =
  | "primary"
  | "specialist"
  | "consultant"
  | "emergency";

// ==========================================
// Core Patient Interface
// ==========================================

/**
 * Paciente de la plataforma
 */
export interface Patient {
  id: PatientId;
  userId: string; // Referencia al User de auth
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: ISODateString;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  address?: PatientAddress;
  emergencyContact?: EmergencyContact;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Dirección del paciente
 */
export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ==========================================
// Patient Care Team Interfaces
// ==========================================

/**
 * Relación doctor-paciente para control de acceso médico
 */
export interface PatientCareTeam {
  id: UUID;
  patientId: PatientId;
  doctorId: DoctorId;
  role: PatientCareTeamRole;
  isActive: boolean;
  assignedAt: ISODateString;
  assignedBy: DoctorId;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface PatientCareTeamInsert {
  patientId: PatientId;
  doctorId: DoctorId;
  role: PatientCareTeamRole;
  assignedBy: DoctorId;
}

export interface PatientCareTeamUpdate {
  role?: PatientCareTeamRole;
  isActive?: boolean;
}

export interface PatientCareTeamWithDetails extends PatientCareTeam {
  patient: {
    id: PatientId;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: ISODateString;
  };
  doctor: {
    id: DoctorId;
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
  };
  assignedByDoctor: {
    id: DoctorId;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export interface PatientUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: ISODateString;
  gender?: Patient['gender'];
  address?: PatientAddress;
  emergencyContact?: EmergencyContact;
}

// ==========================================
// Type Guards & Utilities
// ==========================================

export const isPatient = (v: unknown): v is Patient => {
  return !!v &&
    typeof v === 'object' &&
    'id' in v &&
    'userId' in v &&
    'firstName' in v &&
    'lastName' in v &&
    typeof (v as any).id === "string";
};

export const isPatientCareTeamRole = (v: unknown): v is PatientCareTeamRole => {
  const validRoles: PatientCareTeamRole[] = ["primary", "specialist", "consultant", "emergency"];
  return typeof v === 'string' && validRoles.includes(v as PatientCareTeamRole);
};

export const isPrimaryDoctor = (role: PatientCareTeamRole): boolean => {
  return role === "primary";
};

export type { PatientId };
