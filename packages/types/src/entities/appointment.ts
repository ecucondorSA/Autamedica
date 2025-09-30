/**
 * Appointment types - Sistema de citas médicas
 *
 * Define todos los tipos relacionados con citas médicas,
 * estados, tipos y DTOs para Supabase.
 */

import type { AppointmentId, PatientId, DoctorId } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Appointment Types & Constants
// ==========================================

export type AppointmentType =
  | "consultation"
  | "follow-up"
  | "emergency"
  | "telemedicine"
  | "procedure"
  | "screening";

export const APPOINTMENT_TYPES: readonly AppointmentType[] = [
  "consultation",
  "follow-up",
  "emergency",
  "telemedicine",
  "procedure",
  "screening"
] as const;

export type AppointmentStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show"
  | "rescheduled";

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
  "no-show",
  "rescheduled"
] as const;

// ==========================================
// Core Appointment Interface
// ==========================================

/**
 * Cita médica
 */
export interface Appointment {
  id: AppointmentId;
  patientId: PatientId;
  doctorId: DoctorId;
  startTime: ISODateString;
  duration: number; // minutos
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface AppointmentInsert {
  patientId: PatientId;
  doctorId: DoctorId;
  startTime: ISODateString;
  duration: number;
  type: AppointmentType;
  status?: AppointmentStatus; // Default: 'scheduled'
  notes?: string;
}

export interface AppointmentUpdate {
  startTime?: ISODateString;
  duration?: number;
  status?: AppointmentStatus;
  notes?: string;
  cancellation_reason?: string; // Required if status === 'cancelled'
}

export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: PatientId;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctor: {
    id: DoctorId;
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
  };
}

// ==========================================
// Type Guards
// ==========================================

export const isAppointment = (v: unknown): v is Appointment => {
  return !!v &&
    typeof v === 'object' &&
    'id' in v &&
    'patientId' in v &&
    'doctorId' in v &&
    'startTime' in v &&
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

export const isTerminalStatus = (status: AppointmentStatus): boolean => {
  return status === "completed" || status === "cancelled" || status === "no-show";
};

export const requiresEquipment = (type: AppointmentType): boolean => {
  return type === "procedure" || type === "emergency";
};

export type { AppointmentId };
