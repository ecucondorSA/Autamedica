/**
 * Doctor types - Sistema de médicos
 *
 * Define todos los tipos relacionados con doctores,
 * educación, experiencia y DTOs para Supabase.
 */

import type { DoctorId, SpecialtyId } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Core Doctor Interface
// ==========================================

/**
 * Doctor de la plataforma
 */
export interface Doctor {
  id: DoctorId;
  userId: string; // Referencia al User de auth
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  specialties: SpecialtyId[];
  bio?: string;
  education?: DoctorEducation[];
  experience?: DoctorExperience[];
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Educación del doctor
 */
export interface DoctorEducation {
  institution: string;
  degree: string;
  year: number;
  specialization?: string;
}

/**
 * Experiencia del doctor
 */
export interface DoctorExperience {
  institution: string;
  position: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  description?: string;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface DoctorUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialties?: SpecialtyId[];
  bio?: string;
  education?: DoctorEducation[];
  experience?: DoctorExperience[];
  consultationFee?: number;
  telemedicineEnabled?: boolean;
}

// ==========================================
// Type Guards & Utilities
// ==========================================

export const isDoctor = (v: unknown): v is Doctor => {
  return !!v &&
    typeof v === 'object' &&
    'id' in v &&
    'licenseNumber' in v &&
    'specialties' in v &&
    typeof (v as any).id === "string" &&
    typeof (v as any).licenseNumber === "string";
};

export const isDoctorEducation = (v: unknown): v is DoctorEducation => {
  return !!v &&
    typeof v === 'object' &&
    'institution' in v &&
    'degree' in v &&
    'year' in v &&
    typeof (v as any).institution === "string" &&
    typeof (v as any).degree === "string" &&
    typeof (v as any).year === "number";
};

export type { DoctorId };
