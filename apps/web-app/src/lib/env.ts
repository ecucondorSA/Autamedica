// Simple environment utilities for marketing app
export function getAppUrl(path: string = ''): string {
  // For marketing app, use simple static URLs
  const baseUrls = {
    '/auth': 'https://auth.autamedica.com',
    '/doctors': 'https://doctors.autamedica.com',
    '/patients': 'https://patients.autamedica.com',
    '/companies': 'https://companies.autamedica.com'
  }

  // Return the appropriate URL based on path
  for (const [route, url] of Object.entries(baseUrls)) {
    if (path.startsWith(route)) {
      return url + path
    }
  }

  // Default to current domain for other paths
  return path
}
