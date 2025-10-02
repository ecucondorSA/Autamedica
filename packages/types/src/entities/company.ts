/**
 * Company types - Sistema empresarial
 *
 * Define todos los tipos relacionados con empresas,
 * miembros, roles y DTOs para Supabase.
 */

import type { CompanyId, UserId, UUID } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Company Size
// ==========================================

/**
 * Tamaño de la empresa
 */
export type CompanySize =
  | "startup"
  | "small" // 1-50 empleados
  | "medium" // 51-250 empleados
  | "large" // 251-1000 empleados
  | "enterprise"; // 1000+ empleados

// ==========================================
// Core Interfaces
// ==========================================

/**
 * Empresa/Compañía de la plataforma
 */
export interface Company {
  id: CompanyId;
  name: string;
  taxId: string; // RUT, EIN, etc.
  industry?: string;
  size?: CompanySize;
  address?: CompanyAddress;
  contact: CompanyContact;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Dirección de la empresa
 */
export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Contacto de la empresa
 */
export interface CompanyContact {
  name: string;
  email: string;
  phone: string;
  position?: string;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface CompanyUpdate {
  name?: string;
  industry?: string;
  size?: CompanySize;
  address?: CompanyAddress;
  contact?: CompanyContact;
  // benefits_plan?: string;
}

export interface CompanyWithMembers extends Company {
  members: {
    id: UUID;
    userId: UserId;
    companyId: CompanyId;
    role: string;
    isActive: boolean;
    invitedAt: ISODateString;
    joinedAt?: ISODateString;
    invitedBy: UserId;
    user: {
      id: UserId;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  memberCount: number;
  activeMemberCount: number;
}

export type { CompanyId };
