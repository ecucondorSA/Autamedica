export type AppRole = 'patients' | 'doctors' | 'companies' | 'admin' | 'web-app';

export function getAppUrl(path: string = '/', portal?: AppRole): string {
  const baseUrl = getBaseUrlForRole(portal || 'web-app');
  return `${baseUrl}${path}`;
}

export function getBaseUrlForRole(portal: AppRole): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const urls: Record<AppRole, string> = {
      'patients': 'http://localhost:3002',
      'doctors': 'http://localhost:3001',
      'companies': 'http://localhost:3003',
      'admin': 'http://localhost:3005',
      'web-app': 'http://localhost:3000'
    };
    return urls[portal];
  }

  const urls: Record<AppRole, string> = {
    'patients': 'https://autamedica-patients.pages.dev',
    'doctors': 'https://autamedica-doctors.pages.dev',
    'companies': 'https://autamedica-companies.pages.dev',
    'admin': 'https://autamedica-admin.pages.dev',
    'web-app': 'https://autamedica-web-app.pages.dev'
  };

  return urls[portal];
}