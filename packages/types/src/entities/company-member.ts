/**
 * Company Member types - Sistema de miembros de empresa
 *
 * Define tipos para la relación entre empresas y sus empleados/miembros.
 * Usado en el sistema de salud corporativa de AutaMedica.
 *
 * IMPORTANTE: Esta tabla usa 'profile_id' (no user_id) según esquema real.
 */

import type { UUID, ISODateString } from "../core/brand.types";

// ==========================================
// Company Member Role Types
// ==========================================

/**
 * Roles de miembro dentro de una empresa
 * Define permisos y nivel de acceso a funciones corporativas
 */
export type CompanyMemberRole =
  | "admin"        // Administrador de la empresa
  | "manager"      // Gerente de área/departamento
  | "member"       // Empleado estándar
  | "viewer";      // Solo lectura

export const COMPANY_MEMBER_ROLES: readonly CompanyMemberRole[] = [
  "admin",
  "manager",
  "member",
  "viewer"
] as const;

/**
 * Departamentos comunes en empresas
 */
export type CompanyDepartment =
  | "human_resources"
  | "finance"
  | "operations"
  | "sales"
  | "marketing"
  | "it"
  | "legal"
  | "other";

export const COMPANY_DEPARTMENTS: readonly CompanyDepartment[] = [
  "human_resources",
  "finance",
  "operations",
  "sales",
  "marketing",
  "it",
  "legal",
  "other"
] as const;

// ==========================================
// Core CompanyMember Interface
// ==========================================

/**
 * Miembro de empresa - Refleja esquema real de tabla company_members
 *
 * IMPORTANTE: Usa 'profile_id' (NO user_id) según RLS policies de BD
 *
 * CAMPOS según BD real:
 * - id: UUID (primary key)
 * - company_id: UUID (foreign key a companies)
 * - profile_id: UUID (foreign key a profiles) ⚠️ NOTA: NO es user_id
 * - role: TEXT (rol dentro de la empresa)
 * - position: TEXT (puesto/cargo)
 * - department: TEXT (departamento)
 * - employee_id: TEXT (ID interno de empleado)
 * - start_date: DATE (fecha de inicio)
 * - end_date: DATE (fecha de fin, si aplica)
 * - active: BOOLEAN (si está activo actualmente)
 * - created_at, updated_at, deleted_at: TIMESTAMPTZ
 */
export interface CompanyMember {
  id: UUID;
  company_id: UUID | null;
  profile_id: UUID | null; // ⚠️ IMPORTANTE: profile_id, NO user_id
  role: string | null; // Idealmente CompanyMemberRole
  position: string | null;
  department: string | null; // Idealmente CompanyDepartment
  employee_id: string | null;
  start_date: string | null; // DATE type, formato: YYYY-MM-DD
  end_date: string | null;   // DATE type, formato: YYYY-MM-DD
  active: boolean | null;
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
  deleted_at: ISODateString | null; // Soft delete
}

// ==========================================
// Supabase DTOs
// ==========================================

/**
 * DTO para crear nuevo miembro de empresa
 */
export interface CompanyMemberInsert {
  company_id: UUID;
  profile_id: UUID; // ⚠️ profile_id, NO user_id
  role?: string | null;
  position?: string | null;
  department?: string | null;
  employee_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active?: boolean | null;
}

/**
 * DTO para actualizar miembro existente
 */
export interface CompanyMemberUpdate {
  role?: string | null;
  position?: string | null;
  department?: string | null;
  employee_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active?: boolean | null;
  updated_at?: ISODateString;
  deleted_at?: ISODateString | null; // Para soft delete
}

/**
 * Miembro con datos completos de perfil y empresa
 */
export interface CompanyMemberWithDetails extends CompanyMember {
  profile: {
    user_id: UUID;
    email: string | null;
    role: string | null;
  } | null;
  company: {
    id: UUID;
    name: string;
    legal_name: string | null;
  } | null;
}

// ==========================================
// Query Filters & Helpers
// ==========================================

/**
 * Filtros para consultar miembros de empresa
 */
export interface CompanyMemberFilters {
  company_id?: UUID;
  profile_id?: UUID;
  role?: CompanyMemberRole | string;
  department?: CompanyDepartment | string;
  active?: boolean;
  start_date_from?: string;
  start_date_to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Estadísticas de miembros por empresa
 */
export interface CompanyMemberStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  by_role: Record<CompanyMemberRole, number>;
  by_department: Record<CompanyDepartment, number>;
}

// ==========================================
// Type Guards
// ==========================================

export const isCompanyMember = (v: unknown): v is CompanyMember => {
  return (
    !!v &&
    typeof v === "object" &&
    "id" in v &&
    "company_id" in v &&
    "profile_id" in v
  );
};

export const isCompanyMemberRole = (v: unknown): v is CompanyMemberRole => {
  return typeof v === "string" && COMPANY_MEMBER_ROLES.includes(v as CompanyMemberRole);
};

export const isCompanyDepartment = (v: unknown): v is CompanyDepartment => {
  return typeof v === "string" && COMPANY_DEPARTMENTS.includes(v as CompanyDepartment);
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * Verifica si el rol tiene permisos de administración
 */
export const hasAdminPermissions = (role: CompanyMemberRole | string | null): boolean => {
  return role === "admin";
};

/**
 * Verifica si el rol puede gestionar otros miembros
 */
export const canManageMembers = (role: CompanyMemberRole | string | null): boolean => {
  return role === "admin" || role === "manager";
};

/**
 * Verifica si el miembro está actualmente activo
 */
export const isActiveMember = (member: CompanyMember): boolean => {
  if (!member.active) return false;

  const now = new Date();

  // Verificar fecha de inicio
  if (member.start_date) {
    const startDate = new Date(member.start_date);
    if (startDate > now) return false;
  }

  // Verificar fecha de fin
  if (member.end_date) {
    const endDate = new Date(member.end_date);
    if (endDate < now) return false;
  }

  // Verificar soft delete
  if (member.deleted_at) return false;

  return true;
};

/**
 * Calcula duración del empleo en días
 */
export const getEmploymentDuration = (member: CompanyMember): number | null => {
  if (!member.start_date) return null;

  const startDate = new Date(member.start_date);
  const endDate = member.end_date ? new Date(member.end_date) : new Date();

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Genera nombre del rol en español
 */
export const getRoleDisplayName = (role: CompanyMemberRole | string | null): string => {
  const roleNames: Record<CompanyMemberRole, string> = {
    admin: "Administrador",
    manager: "Gerente",
    member: "Empleado",
    viewer: "Consultor"
  };

  return role ? (roleNames[role as CompanyMemberRole] || role) : "Sin rol";
};

/**
 * Genera nombre del departamento en español
 */
export const getDepartmentDisplayName = (department: CompanyDepartment | string | null): string => {
  const departmentNames: Record<CompanyDepartment, string> = {
    human_resources: "Recursos Humanos",
    finance: "Finanzas",
    operations: "Operaciones",
    sales: "Ventas",
    marketing: "Marketing",
    it: "Tecnología",
    legal: "Legal",
    other: "Otro"
  };

  return department ? (departmentNames[department as CompanyDepartment] || department) : "Sin departamento";
};
