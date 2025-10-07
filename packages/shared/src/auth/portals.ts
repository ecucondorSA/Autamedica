/**
 * Portal routing utilities for role-based redirection
 */

// Import UserRole from @autamedica/types (source of truth for roles)
export type { UserRole } from '@autamedica/types';

/**
 * Get the portal URL for a given role
 */
export function getPortalForRole(role: import('@autamedica/types').UserRole | undefined): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default to patient if no role
  const actualRole = role || 'patient';

  if (isDevelopment) {
    // In development, use different ports
    switch (actualRole) {
      case 'doctor':
        return process.env.NEXT_PUBLIC_PORTAL_DOCTORS || 'http://localhost:3001';
      case 'patient':
        return process.env.NEXT_PUBLIC_PORTAL_PATIENTS || 'http://localhost:3002';
      case 'company_admin':
        return process.env.NEXT_PUBLIC_PORTAL_COMPANIES || 'http://localhost:3003';
      case 'organization_admin':
      case 'platform_admin':
        return process.env.NEXT_PUBLIC_PORTAL_ADMIN || 'http://localhost:3004';
      default:
        return process.env.NEXT_PUBLIC_PORTAL_PATIENTS || 'http://localhost:3002';
    }
  }

  // In production, use subdomains
  switch (actualRole) {
    case 'doctor':
      return process.env.NEXT_PUBLIC_BASE_URL_DOCTORS || 'https://autamedica-doctors.pages.dev';
    case 'patient':
      return process.env.NEXT_PUBLIC_BASE_URL_PATIENTS || 'https://autamedica-patients.pages.dev';
    case 'company_admin':
      return process.env.NEXT_PUBLIC_BASE_URL_COMPANIES || 'https://autamedica-companies.pages.dev';
    case 'organization_admin':
    case 'platform_admin':
      return process.env.NEXT_PUBLIC_BASE_URL_ADMIN || 'https://autamedica-admin.pages.dev';
    default:
      return process.env.NEXT_PUBLIC_BASE_URL_PATIENTS || 'https://autamedica-patients.pages.dev';
  }
}

/**
 * Validate and sanitize redirect URLs
 * Prevents open redirect vulnerabilities
 */
export function safeRedirectOrFallback(
  returnTo: string | null | undefined,
  fallbackUrl: string
): string {
  if (!returnTo) {
    return fallbackUrl;
  }

  // Allow relative paths (start with /)
  if (returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    return returnTo;
  }

  // Parse and validate absolute URLs
  try {
    const url = new URL(returnTo);
    const allowedHosts = (process.env.NEXT_PUBLIC_ALLOWED_REDIRECTS || '')
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      allowedHosts.push('localhost', '127.0.0.1', '0.0.0.0');
    }

    // Check if the host is in the allowed list
    const isAllowed = allowedHosts.some(allowed => {
      // Support wildcards like *.autamedica.com
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return url.hostname.endsWith(domain) || url.hostname === domain.slice(1);
      }
      return url.hostname === allowed;
    });

    if (isAllowed) {
      return returnTo;
    }
  } catch {
    // Invalid URL, fall through to fallback
  }

  return fallbackUrl;
}