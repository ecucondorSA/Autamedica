/**
 * Unified portal routing system
 * Single source of truth for role-based routing
 */

import type { SessionRole } from '../auth/session';

/**
 * Get portal URL map from environment variables
 */
function getPortalUrls() {
  return {
    patients: process.env.NEXT_PUBLIC_BASE_URL_PATIENTS!,
    doctors: process.env.NEXT_PUBLIC_BASE_URL_DOCTORS!,
    companies: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES!,
    admin: process.env.NEXT_PUBLIC_BASE_URL_ADMIN || process.env.NEXT_PUBLIC_BASE_URL_COMPANIES!,
    webApp: process.env.NEXT_PUBLIC_BASE_URL_WEB_APP!,
  };
}

/**
 * Get portal URL for a given role
 * @param role - User role
 * @returns Portal URL for the role
 */
export function getPortalForRole(role?: SessionRole | string): string {
  const urls = getPortalUrls();

  const roleToPortal: Record<string, string> = {
    patient: urls.patients,
    doctor: urls.doctors,
    company: urls.companies,
    company_admin: urls.companies,
    organization_admin: urls.admin,
    platform_admin: urls.admin,
  };

  const baseUrl = roleToPortal[role || 'patient'] || urls.patients;

  if (!baseUrl) {
    console.error(`Portal URL not configured for role: ${role}`);
    return urls.webApp || 'http://localhost:3000';
  }

  if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
    throw new Error(`Invalid base URL configuration: ${baseUrl}`);
  }

  return baseUrl;
}

/**
 * Get portal URL with path
 * @param role - User role
 * @param path - Path to append
 * @returns Full URL with path
 */
export function getPortalUrlWithPath(
  role?: SessionRole | string,
  path: string = '/'
): string {
  const baseUrl = getPortalForRole(role);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`.replace(/\/+$/, ''); // Remove trailing slashes
}

/**
 * Check if current origin matches expected portal for role
 * @param origin - Current request origin
 * @param role - User role
 * @returns True if origin matches expected portal
 */
export function isCorrectPortal(origin: string, role?: SessionRole | string): boolean {
  const expectedPortal = getPortalForRole(role);
  return origin.startsWith(expectedPortal);
}

/**
 * Get role expected for a portal URL
 * Inverse of getPortalForRole
 */
export function getRoleForPortal(portalUrl: string): SessionRole[] {
  const urls = getPortalUrls();

  if (portalUrl.startsWith(urls.patients)) {
    return ['patient'];
  }
  if (portalUrl.startsWith(urls.doctors)) {
    return ['doctor'];
  }
  if (portalUrl.startsWith(urls.companies)) {
    return ['company', 'company_admin'];
  }
  if (portalUrl.startsWith(urls.admin)) {
    return ['organization_admin', 'platform_admin'];
  }

  // Default - allow any role for web-app
  return ['patient', 'doctor', 'company', 'company_admin', 'organization_admin', 'platform_admin'];
}