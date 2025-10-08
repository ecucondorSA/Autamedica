// Simple environment utilities for marketing app
export function getAppUrl(path: string = '', app?: 'patients' | 'doctors' | 'companies' | 'auth' | 'admin'): string {
  // For marketing app, use simple static URLs
  const baseUrls = {
    auth: 'https://auth.autamedica.com',
    doctors: 'https://doctors.autamedica.com',
    patients: 'https://patients.autamedica.com',
    companies: 'https://companies.autamedica.com',
    admin: 'https://admin.autamedica.com'
  }

  // If app is specified, use that directly
  if (app) {
    return baseUrls[app] + path
  }

  // Otherwise, Return the appropriate URL based on path
  for (const [route, url] of Object.entries({
    '/auth': baseUrls.auth,
    '/doctors': baseUrls.doctors,
    '/patients': baseUrls.patients,
    '/companies': baseUrls.companies
  })) {
    if (path.startsWith(route)) {
      return url + path
    }
  }

  // Default to current domain for other paths
  return path
}
