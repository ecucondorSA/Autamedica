export const sessionCookieOptions = {
  name: 'am_session',
  domain: '.autamedica.com',
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 8, // 8 hours
};

export const PORTAL_MAPPING = {
  doctors: 'https://doctors.autamedica.com',
  patients: 'https://patients.autamedica.com',
  companies: 'https://companies.autamedica.com',
  admin: 'https://admin.autamedica.com'
} as const;

export const ALLOWED_PORTALS = new Set(Object.keys(PORTAL_MAPPING));

// Allowed redirect domains for security
export const ALLOWED_REDIRECT_DOMAINS = [
  'autamedica.com',
  '*.autamedica.com',
  'localhost:3000',      // Development only
  'localhost:3001',      // Development only
  'localhost:3002',      // Development only
  'localhost:3003',      // Development only
  'localhost:3004',      // Development only
  'localhost:3005',      // Development only - Auth Hub
];

export function validateRedirectUrl(returnTo: string): boolean {
  try {
    const url = new URL(returnTo);
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      domain.startsWith('*')
        ? url.hostname.endsWith(domain.slice(2))
        : url.hostname === domain || url.hostname === `${domain.split(':')[0]}`
    );
  } catch {
    return false;
  }
}

export function resolvePortalUrl(portal?: string, returnTo?: string): string {
  // 1. Validate returnTo if present
  if (returnTo && validateRedirectUrl(returnTo)) {
    return returnTo;
  }

  // 2. Resolve valid portal
  const validPortal = portal && ALLOWED_PORTALS.has(portal) ? portal : 'patients';
  return PORTAL_MAPPING[validPortal as keyof typeof PORTAL_MAPPING];
}