/**
 * @fileoverview Role-based routing utilities for AutaMedica
 *
 * Centralizes role-to-portal mapping and role-based navigation logic
 */

import type { UserRole } from '@autamedica/types';

// ==========================================
// Portal Configuration
// ==========================================

/**
 * Mapping from roles to their corresponding portal URLs
 */
export const roleToPortal: Record<UserRole, string> = {
  doctor: 'https://doctors.autamedica.com',
  patient: 'https://patients.autamedica.com',
  company_admin: 'https://companies.autamedica.com',
  organization_admin: 'https://admin.autamedica.com',
  platform_admin: 'https://admin.autamedica.com'
} as const;

/**
 * Development URLs for local development
 */
export const roleToPortalDev: Record<UserRole, string> = {
  doctor: 'http://localhost:3001',
  patient: 'http://localhost:3002',
  company_admin: 'http://localhost:3003',
  organization_admin: 'http://localhost:3004',
  platform_admin: 'http://localhost:3004'
} as const;

// ==========================================
// Role Navigation Functions
// ==========================================

/**
 * Get the correct portal URL for a user role
 * @param role - User role
 * @param isDev - Whether to use development URLs (default: auto-detect)
 * @returns Portal URL for the role
 */
export function getPortalForRole(
  role: UserRole,
  isDev: boolean = typeof window !== 'undefined' && window.location.hostname === 'localhost'
): string {
  const portals = isDev ? roleToPortalDev : roleToPortal;
  return portals[role];
}

/**
 * Get the default redirect URL after role selection
 * @param role - Selected user role
 * @param isDev - Whether to use development URLs
 * @returns URL to redirect to after role selection
 */
export function getDefaultRedirectUrl(role: UserRole, isDev?: boolean): string {
  return getPortalForRole(role, isDev);
}

/**
 * Check if a role has access to admin features
 * @param role - User role to check
 * @returns True if role has admin access
 */
export function hasAdminAccess(role: UserRole): boolean {
  return ['organization_admin', 'platform_admin'].includes(role);
}

/**
 * Check if a role can manage organizations
 * @param role - User role to check
 * @returns True if role can manage organizations
 */
export function canManageOrganizations(role: UserRole): boolean {
  return ['organization_admin', 'platform_admin'].includes(role);
}

/**
 * Check if a role can access medical features
 * @param role - User role to check
 * @returns True if role can access medical features
 */
export function canAccessMedicalFeatures(role: UserRole): boolean {
  return ['doctor', 'patient'].includes(role);
}

/**
 * Get user-friendly role display name
 * @param role - User role
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    doctor: 'Médico',
    patient: 'Paciente',
    company_admin: 'Administrador de Empresa',
    organization_admin: 'Administrador de Organización',
    platform_admin: 'Administrador de Plataforma'
  };

  return roleNames[role];
}

/**
 * Get role description for role selection
 * @param role - User role
 * @returns Description of what the role can do
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    doctor: 'Consulta pacientes, gestiona historias clínicas y realiza teleconsultas',
    patient: 'Accede a tu historial médico, agenda citas y consulta con médicos',
    company_admin: 'Administra empleados de tu empresa y gestiona planes de salud corporativos',
    organization_admin: 'Gestiona múltiples organizaciones y supervisa operaciones',
    platform_admin: 'Control total de la plataforma y todas sus funcionalidades'
  };

  return descriptions[role];
}

// ==========================================
// Type Guards
// ==========================================

/**
 * Type guard to check if a string is a valid UserRole
 * @param role - String to check
 * @returns True if the string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return ['doctor', 'patient', 'company_admin', 'organization_admin', 'platform_admin'].includes(role);
}

// ==========================================
// Constants
// ==========================================

/**
 * All available roles for role selection
 */
export const AVAILABLE_ROLES: readonly UserRole[] = [
  'doctor',
  'patient',
  'company_admin',
  'organization_admin',
  'platform_admin'
] as const;

/**
 * Roles that require additional verification
 */
export const VERIFIED_ROLES: readonly UserRole[] = [
  'doctor',
  'organization_admin',
  'platform_admin'
] as const;

/**
 * Check if role requires verification
 * @param role - User role to check
 * @returns True if role requires additional verification
 */
export function requiresVerification(role: UserRole): boolean {
  return VERIFIED_ROLES.includes(role);
}