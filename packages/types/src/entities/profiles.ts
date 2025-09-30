/**
 * Sistema de Perfiles AutaMedica - Tipos para BD Real
 *
 * Estos tipos reflejan exactamente el esquema de Supabase
 * implementado en las migraciones SQL.
 */

import type { UUID, ISODateString } from '../core/brand.types';

// ==========================================
// ROLES DEL SISTEMA - Simplified Single Role Per User
// ==========================================

export type UserRole =
  | 'doctor'
  | 'patient'
  | 'company_admin'
  | 'organization_admin'
  | 'platform_admin';

export const USER_ROLES: readonly UserRole[] = [
  'doctor',
  'patient',
  'company_admin',
  'organization_admin',
  'platform_admin'
] as const;

// ==========================================
// PERFIL BASE (tabla profiles)
// ==========================================

/**
 * Perfil base de usuario - source of truth para roles
 * Corresponde exactamente a la tabla public.profiles
 */
export interface Profile {
  user_id: UUID;
  email: string;
  role: UserRole | null; // null until role is selected
  external_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
  numeric_id: number; // Auto-generated sequential ID
}

/**
 * Datos para insertar nuevo perfil
 */
export interface ProfileInsert {
  user_id: UUID;
  email: string;
  role?: UserRole | null; // optional, null by default until role selection
  external_id?: string; // Auto-generated si no se provee
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  active?: boolean;
}

/**
 * Datos para actualizar perfil existente
 */
export interface ProfileUpdate {
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  active?: boolean;
  updated_at?: ISODateString;
}

// ==========================================
// PERFIL MÉDICO (tabla doctors)
// ==========================================

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export const COMPANY_SIZES: readonly CompanySize[] = [
  'startup', 'small', 'medium', 'large', 'enterprise'
] as const;

export const GENDERS: readonly Gender[] = [
  'male', 'female', 'other', 'prefer_not_to_say'
] as const;

/**
 * Educación médica
 */
export interface DoctorEducation {
  institution: string;
  degree: string;
  year: number;
  specialization?: string;
}

/**
 * Certificaciones médicas
 */
export interface MedicalCertification {
  name: string;
  issuer: string;
  date_issued: ISODateString;
  expiry_date?: ISODateString;
  certificate_number?: string;
}

/**
 * Horario de disponibilidad
 */
export interface DaySchedule {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  breaks?: Array<{ start: string; end: string }>;
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/**
 * Perfil completo de doctor - corresponde a tabla doctors
 */
export interface DoctorProfile {
  id: UUID;
  user_id: UUID;
  license_number: string;
  specialty: string;
  subspecialty: string | null;
  years_experience: number;
  education: DoctorEducation[] | null;
  certifications: MedicalCertification[] | null;
  schedule: WeeklySchedule | null;
  consultation_fee: number | null;
  accepted_insurance: string[] | null; // JSON array of insurance names
  bio: string | null;
  languages: string[]; // Default: ["Spanish"]
  active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Datos para crear perfil de doctor
 */
export interface DoctorInsert {
  user_id: UUID;
  license_number: string;
  specialty: string;
  subspecialty?: string | null;
  years_experience?: number;
  education?: DoctorEducation[] | null;
  certifications?: MedicalCertification[] | null;
  schedule?: WeeklySchedule | null;
  consultation_fee?: number | null;
  accepted_insurance?: string[] | null;
  bio?: string | null;
  languages?: string[];
  active?: boolean;
}

/**
 * Perfil de doctor con datos de usuario
 */
export interface DoctorWithProfile extends DoctorProfile {
  profile: Profile;
}

// ==========================================
// PERFIL PACIENTE (tabla patients)
// ==========================================

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

/**
 * Condición médica
 */
export interface MedicalCondition {
  name: string;
  diagnosed_date?: ISODateString;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

/**
 * Alergia
 */
export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  notes?: string;
}

/**
 * Medicación
 */
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribed_by?: string;
  start_date?: ISODateString;
  end_date?: ISODateString;
  notes?: string;
}

/**
 * Información de seguro médico
 */
export interface InsuranceInfo {
  provider: string;
  plan_name: string;
  policy_number: string;
  group_number?: string;
  effective_date?: ISODateString;
  expiry_date?: ISODateString;
}

/**
 * Perfil completo de paciente - corresponde a tabla patients
 */
export interface PatientProfile {
  id: UUID;
  user_id: UUID;
  dni: string | null;
  birth_date: string | null; // Date type in DB
  gender: Gender | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  emergency_contact: EmergencyContact | null;
  medical_history: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
  insurance_info: InsuranceInfo | null;
  company_id: UUID | null;
  active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Datos para crear perfil de paciente
 */
export interface PatientInsert {
  user_id: UUID;
  dni?: string | null;
  birth_date?: string | null;
  gender?: Gender | null;
  blood_type?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  emergency_contact?: EmergencyContact | null;
  medical_history?: MedicalCondition[];
  allergies?: Allergy[];
  medications?: Medication[];
  insurance_info?: InsuranceInfo | null;
  company_id?: UUID | null;
  active?: boolean;
}

/**
 * Perfil de paciente con datos de usuario
 */
export interface PatientWithProfile extends PatientProfile {
  profile: Profile;
}

// ==========================================
// PERFIL EMPRESA (tabla companies)
// ==========================================

/**
 * Dirección de empresa
 */
export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

/**
 * Perfil de empresa - corresponde a tabla companies
 */
export interface CompanyProfile {
  id: UUID;
  name: string;
  legal_name: string | null;
  cuit: string | null;
  industry: string | null;
  size: CompanySize | null;
  address: CompanyAddress | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  owner_profile_id: UUID | null;
  active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Datos para crear perfil de empresa
 */
export interface CompanyInsert {
  name: string;
  legal_name?: string | null;
  cuit?: string | null;
  industry?: string | null;
  size?: CompanySize | null;
  address?: CompanyAddress | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  owner_profile_id?: UUID | null;
  active?: boolean;
}

// ==========================================
// UTILIDADES Y TYPE GUARDS
// ==========================================

/**
 * Type guard para verificar si un objeto es un Profile válido
 */
export function isProfile(obj: unknown): obj is Profile {
  return typeof obj === 'object' && obj !== null &&
    'user_id' in obj && 'email' in obj && 'role' in obj;
}

/**
 * Type guard para verificar rol de usuario
 */
export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

/**
 * Generar nombre completo desde perfil
 */
export function generateDisplayName(profile: Profile): string {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  if (profile.first_name) {
    return profile.first_name;
  }
  return profile.email?.split('@')[0] ?? 'Usuario';
}

/**
 * Verificar si perfil está completo según rol
 */
export function isProfileComplete(profile: Profile): boolean {
  return !!(profile.first_name && profile.last_name && profile.phone);
}