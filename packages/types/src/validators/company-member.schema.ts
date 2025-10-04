/**
 * Company Member Zod Schemas
 *
 * Validadores runtime en snake_case (fiel al esquema BD)
 * IMPORTANTE: Usa profile_id (NO user_id)
 */

import { z } from 'zod';
import { toCamel } from '../utils/casing';

// ==========================================
// DB Schema (snake_case) - Refleja tabla company_members
// ==========================================

/**
 * Schema Zod para CompanyMember (snake_case - DB format)
 *
 * ⚠️ CRÍTICO: profile_id, NO user_id (según RLS policies)
 */
export const CompanyMemberSnakeSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid().nullable(),
  profile_id: z.string().uuid().nullable(), // ⚠️ NOTA: profile_id, NO user_id
  role: z.enum(['admin', 'manager', 'member', 'viewer']).nullable(),
  position: z.string().nullable(),
  department: z.enum([
    'human_resources',
    'finance',
    'operations',
    'sales',
    'marketing',
    'it',
    'legal',
    'other'
  ]).nullable(),
  employee_id: z.string().nullable(),
  start_date: z.string().nullable(), // DATE format YYYY-MM-DD
  end_date: z.string().nullable(), // DATE format YYYY-MM-DD
  active: z.boolean().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable()
});

/**
 * Schema para INSERT de company member
 */
export const CompanyMemberInsertSnakeSchema = CompanyMemberSnakeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
}).extend({
  company_id: z.string().uuid(), // REQUIRED
  profile_id: z.string().uuid()  // REQUIRED
});

/**
 * Schema para UPDATE de company member
 */
export const CompanyMemberUpdateSnakeSchema = CompanyMemberSnakeSchema.partial().omit({
  id: true,
  company_id: true,
  profile_id: true,
  created_at: true
});

// ==========================================
// Type Inference
// ==========================================

export type CompanyMemberSnake = z.infer<typeof CompanyMemberSnakeSchema>;
export type CompanyMemberInsertSnake = z.infer<typeof CompanyMemberInsertSnakeSchema>;
export type CompanyMemberUpdateSnake = z.infer<typeof CompanyMemberUpdateSnakeSchema>;

// ==========================================
// UI Parsers (boundary)
// ==========================================

/**
 * Parser: BD → UI (snake_case → camelCase)
 */
export function parseCompanyMemberForUI<T = unknown>(raw: unknown): T {
  const validated = CompanyMemberSnakeSchema.parse(raw);
  return toCamel<T>(validated);
}

/**
 * Parser seguro: BD → UI (retorna null si falla)
 */
export function safeParseCompanyMemberForUI<T = unknown>(raw: unknown): T | null {
  const result = CompanyMemberSnakeSchema.safeParse(raw);
  if (!result.success) return null;
  return toCamel<T>(result.data);
}

/**
 * Parser de array: BD → UI
 */
export function parseCompanyMembersForUI<T = unknown>(raw: unknown): T[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected array of company members');
  }
  return raw.map(item => parseCompanyMemberForUI<T>(item));
}

// ==========================================
// Validadores de Negocio
// ==========================================

/**
 * Verifica si miembro tiene permisos de administración
 */
export function hasAdminPermissions(role: CompanyMemberSnake['role']): boolean {
  return role === 'admin';
}

/**
 * Verifica si miembro puede gestionar otros miembros
 */
export function canManageMembers(role: CompanyMemberSnake['role']): boolean {
  return role === 'admin' || role === 'manager';
}

/**
 * Verifica si miembro está actualmente activo
 *
 * Considera:
 * - Campo active === true
 * - start_date <= hoy
 * - end_date >= hoy (o null)
 * - deleted_at === null
 */
export function isActiveMember(member: CompanyMemberSnake): boolean {
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
}

/**
 * Calcula duración del empleo en días
 */
export function getEmploymentDuration(member: CompanyMemberSnake): number | null {
  if (!member.start_date) return null;

  const startDate = new Date(member.start_date);
  const endDate = member.end_date ? new Date(member.end_date) : new Date();

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calcula años de antigüedad
 */
export function getYearsOfService(member: CompanyMemberSnake): number | null {
  const days = getEmploymentDuration(member);
  if (!days) return null;
  return Math.floor(days / 365);
}

/**
 * Verifica si está en periodo de prueba (primeros 90 días)
 */
export function isOnProbation(member: CompanyMemberSnake): boolean {
  const days = getEmploymentDuration(member);
  return days !== null && days <= 90;
}

/**
 * Genera nombre de rol en español
 */
export function getRoleDisplayName(role: CompanyMemberSnake['role']): string {
  const roleNames: Record<NonNullable<CompanyMemberSnake['role']>, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    member: 'Empleado',
    viewer: 'Consultor'
  };

  return role ? (roleNames[role] || role) : 'Sin rol';
}

/**
 * Genera nombre de departamento en español
 */
export function getDepartmentDisplayName(department: CompanyMemberSnake['department']): string {
  const departmentNames: Record<NonNullable<CompanyMemberSnake['department']>, string> = {
    human_resources: 'Recursos Humanos',
    finance: 'Finanzas',
    operations: 'Operaciones',
    sales: 'Ventas',
    marketing: 'Marketing',
    it: 'Tecnología',
    legal: 'Legal',
    other: 'Otro'
  };

  return department ? (departmentNames[department] || department) : 'Sin departamento';
}

/**
 * Valida que miembro tenga información completa para reportes
 */
export function isProfileComplete(member: CompanyMemberSnake): boolean {
  return !!(
    member.company_id &&
    member.profile_id &&
    member.role &&
    member.position &&
    member.department &&
    member.start_date
  );
}

/**
 * Verifica si puede aprobar gastos según rol
 */
export function canApprovExpenses(role: CompanyMemberSnake['role']): boolean {
  return role === 'admin' || role === 'manager';
}

/**
 * Verifica si tiene acceso a datos sensibles
 */
export function hasAccessToSensitiveData(
  role: CompanyMemberSnake['role'],
  department: CompanyMemberSnake['department']
): boolean {
  // Admins siempre tienen acceso
  if (role === 'admin') return true;

  // HR y Finance también
  const sensitiveDepartments: Array<NonNullable<CompanyMemberSnake['department']>> = [
    'human_resources',
    'finance',
    'legal'
  ];

  return department ? sensitiveDepartments.includes(department) : false;
}
