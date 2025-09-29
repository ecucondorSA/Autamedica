/**
 * Get application URL for role-based routing
 * Uses environment variables for Cloudflare Pages deployment
 */

export type AppRole = 'patients' | 'doctors' | 'companies' | 'admin' | 'web-app';

export function getAppUrl(path: string = '/', role: AppRole = 'patients'): string {
  const urlMap: Record<AppRole, string | undefined> = {
    patients: process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
    doctors: process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
    companies: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
    admin: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
    'web-app': process.env.NEXT_PUBLIC_BASE_URL_WEB_APP,
  };

  const baseUrl = urlMap[role];
  if (!baseUrl) {
    throw new Error(`Base URL not set for role "${role}". Define NEXT_PUBLIC_BASE_URL_${role.toUpperCase().replace('-', '_')}`);
  }

  const cleanPath = path?.startsWith('/') ? path : `/${path ?? ''}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get base URL for a specific role (without path)
 */
export function getBaseUrlForRole(role: AppRole): string {
  return getAppUrl('/', role).replace(/\/$/, '');
}