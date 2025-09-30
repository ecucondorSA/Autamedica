/**
 * Company types - Sistema empresarial
 *
 * Define todos los tipos relacionados con empresas,
 * miembros, roles y DTOs para Supabase.
 */

import type { CompanyId, UserId, UUID } from "../primitives/id";
import type { ISODateString } from "../primitives/date";

// ==========================================
// Company Member Roles & Constants
// ==========================================

export type CompanyMemberRole =
  | "owner"
  | "admin"
  | "hr_manager"
  | "member"
  | "viewer";

export const COMPANY_MEMBER_ROLES: readonly CompanyMemberRole[] = [
  "owner",
  "admin",
  "hr_manager",
  "member",
  "viewer"
] as const;

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
// Company Member Interfaces
// ==========================================

/**
 * Miembro de empresa - relación usuario-empresa
 */
export interface CompanyMember {
  id: UUID;
  userId: UserId;
  companyId: CompanyId;
  role: CompanyMemberRole;
  isActive: boolean;
  invitedAt: ISODateString;
  joinedAt?: ISODateString;
  invitedBy: UserId;
}

// ==========================================
// Supabase DTOs
// ==========================================

export interface CompanyMemberInsert {
  userId: UserId;
  companyId: CompanyId;
  role: CompanyMemberRole;
  invitedBy: UserId;
  // invitedAt: auto-generated
}

export interface CompanyMemberUpdate {
  role?: CompanyMemberRole;
  isActive?: boolean;
  // Audit: modifiedBy, modifiedAt auto-generated
}

export interface CompanyUpdate {
  name?: string;
  industry?: string;
  size?: CompanySize;
  address?: CompanyAddress;
  contact?: CompanyContact;
  // benefits_plan?: string;
}

export interface CompanyWithMembers extends Company {
  members: (CompanyMember & {
    user: {
      id: UserId;
      firstName: string;
      lastName: string;
      email: string;
    };
  })[];
  memberCount: number;
  activeMemberCount: number;
}

// ==========================================
// Type Guards & Utilities
// ==========================================

export const isCompanyMemberRole = (v: unknown): v is CompanyMemberRole => {
  return typeof v === 'string' && COMPANY_MEMBER_ROLES.includes(v as CompanyMemberRole);
};

export const canManageBilling = (role: CompanyMemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export const canInviteMembers = (role: CompanyMemberRole): boolean => {
  return role === "owner" || role === "admin" || role === "hr_manager";
};

export const canManageCompany = (role: CompanyMemberRole): boolean => {
  return role === "owner" || role === "admin";
};

export type { CompanyId };
