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

// ==========================================
// Mappers: Database (snake_case) → TypeScript (camelCase)
// ==========================================

/**
 * Convierte doctor de base de datos a interfaz TypeScript
 * Mapea snake_case (DB) → camelCase (TS)
 */
export function mapDbDoctorToDoctor(dbDoctor: {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  license_number: string;
  specialties: any | null;
  bio: string | null;
  education: any | null;
  experience: any | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}): Doctor {
  return {
    id: dbDoctor.id as DoctorId,
    userId: dbDoctor.user_id,
    firstName: dbDoctor.first_name || '',
    lastName: dbDoctor.last_name || '',
    email: dbDoctor.email || '',
    phone: dbDoctor.phone || undefined,
    licenseNumber: dbDoctor.license_number,
    specialties: (dbDoctor.specialties || []) as SpecialtyId[],
    bio: dbDoctor.bio || undefined,
    education: dbDoctor.education || undefined,
    experience: dbDoctor.experience || undefined,
    isActive: dbDoctor.is_active ?? true,
    createdAt: (dbDoctor.created_at || new Date().toISOString()) as ISODateString,
    updatedAt: (dbDoctor.updated_at || new Date().toISOString()) as ISODateString,
  };
}

/**
 * Convierte Doctor de TypeScript a formato de base de datos para INSERT
 */
export function mapDoctorToDbInsert(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    user_id: doctor.userId,
    first_name: doctor.firstName,
    last_name: doctor.lastName,
    email: doctor.email,
    phone: doctor.phone || null,
    license_number: doctor.licenseNumber,
    specialties: doctor.specialties || [],
    bio: doctor.bio || null,
    education: doctor.education || null,
    experience: doctor.experience || null,
    is_active: doctor.isActive,
  };
}

/**
 * Convierte DoctorUpdate de TypeScript a formato de base de datos para UPDATE
 */
export function mapDoctorUpdateToDb(update: DoctorUpdate) {
  const dbUpdate: Record<string, any> = {};

  if (update.firstName !== undefined) dbUpdate.first_name = update.firstName;
  if (update.lastName !== undefined) dbUpdate.last_name = update.lastName;
  if (update.phone !== undefined) dbUpdate.phone = update.phone;
  if (update.specialties !== undefined) dbUpdate.specialties = update.specialties;
  if (update.bio !== undefined) dbUpdate.bio = update.bio;
  if (update.education !== undefined) dbUpdate.education = update.education;
  if (update.experience !== undefined) dbUpdate.experience = update.experience;

  return dbUpdate;
}

export type { DoctorId };
