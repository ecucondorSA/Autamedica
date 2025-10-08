/**
 * Patient types - Sistema de pacientes
 *
 * Define todos los tipos relacionados con pacientes,
 * equipos de atención médica y DTOs para Supabase.
 */

import type { PatientId, DoctorId, UUID } from "../primitives/id";
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

// ==========================================
// Mappers: Database (snake_case) → TypeScript (camelCase)
// ==========================================

/**
 * Convierte paciente de base de datos a interfaz TypeScript
 * Mapea snake_case (DB) → camelCase (TS)
 */
export function mapDbPatientToPatient(dbPatient: {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: any | null;
  emergency_contact: any | null;
  created_at: string | null;
  updated_at: string | null;
}): Patient {
  return {
    id: dbPatient.id as PatientId,
    userId: dbPatient.user_id,
    firstName: dbPatient.first_name || '',
    lastName: dbPatient.last_name || '',
    email: dbPatient.email || '',
    phone: dbPatient.phone || undefined,
    dateOfBirth: (dbPatient.date_of_birth as ISODateString) || undefined,
    gender: dbPatient.gender as Patient['gender'] || undefined,
    address: dbPatient.address || undefined,
    emergencyContact: dbPatient.emergency_contact || undefined,
    createdAt: (dbPatient.created_at || new Date().toISOString()) as ISODateString,
    updatedAt: (dbPatient.updated_at || new Date().toISOString()) as ISODateString,
  };
}

/**
 * Convierte patient care team de base de datos a interfaz TypeScript
 */
export function mapDbPatientCareTeamToPatientCareTeam(dbCareTeam: {
  id: string;
  patient_id: string;
  doctor_id: string;
  role: string | null;
  active: boolean | null;
  assigned_at: string | null;
  assigned_by: string | null;
}): PatientCareTeam {
  return {
    id: dbCareTeam.id as UUID,
    patientId: dbCareTeam.patient_id as PatientId,
    doctorId: dbCareTeam.doctor_id as DoctorId,
    role: (dbCareTeam.role as PatientCareTeamRole) || 'primary',
    isActive: dbCareTeam.active ?? true,
    assignedAt: (dbCareTeam.assigned_at || new Date().toISOString()) as ISODateString,
    assignedBy: dbCareTeam.assigned_by as DoctorId,
  };
}

/**
 * Convierte Patient de TypeScript a formato de base de datos para INSERT
 */
export function mapPatientToDbInsert(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    user_id: patient.userId,
    first_name: patient.firstName,
    last_name: patient.lastName,
    email: patient.email,
    phone: patient.phone || null,
    date_of_birth: patient.dateOfBirth || null,
    gender: patient.gender || null,
    address: patient.address || null,
    emergency_contact: patient.emergencyContact || null,
  };
}

/**
 * Convierte PatientUpdate de TypeScript a formato de base de datos para UPDATE
 */
export function mapPatientUpdateToDb(update: PatientUpdate) {
  const dbUpdate: Record<string, any> = {};

  if (update.firstName !== undefined) dbUpdate.first_name = update.firstName;
  if (update.lastName !== undefined) dbUpdate.last_name = update.lastName;
  if (update.phone !== undefined) dbUpdate.phone = update.phone;
  if (update.dateOfBirth !== undefined) dbUpdate.date_of_birth = update.dateOfBirth;
  if (update.gender !== undefined) dbUpdate.gender = update.gender;
  if (update.address !== undefined) dbUpdate.address = update.address;
  if (update.emergencyContact !== undefined) dbUpdate.emergency_contact = update.emergencyContact;

  return dbUpdate;
}

export type { PatientId };
