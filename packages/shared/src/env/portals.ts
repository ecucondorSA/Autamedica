// Portal system utilities
export function getPortalForRole(role: string): string {
  const portals: Record<string, string> = {
    patient: 'patients',
    doctor: 'doctors',
    company_admin: 'companies',
    company: 'companies',
    platform_admin: 'admin',
    admin: 'admin'
  };
  return portals[role] || 'web-app';
}

export function getPortalUrlWithPath(portal: string, path: string): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const portMap: Record<string, string> = {
      patients: 'http://localhost:3002',
      doctors: 'http://localhost:3001',
      companies: 'http://localhost:3003',
      admin: 'http://localhost:3005'
    };
    const baseUrl = portMap[portal] || 'http://localhost:3000';
    return baseUrl + path;
  }

  const prodMap: Record<string, string> = {
    patients: 'https://autamedica-patients.pages.dev',
    doctors: 'https://autamedica-doctors.pages.dev',
    companies: 'https://autamedica-companies.pages.dev',
    admin: 'https://autamedica-admin.pages.dev'
  };

  const baseUrl = prodMap[portal] || 'https://autamedica-web-app.pages.dev';
  return baseUrl + path;
}

export function isCorrectPortal(currentPortal: string, requiredPortal: string): boolean {
  return currentPortal === requiredPortal;
}

export function getRoleForPortal(portal: string): string {
  const roleMap: Record<string, string> = {
    patients: 'patient',
    doctors: 'doctor',
    companies: 'company_admin',
    admin: 'platform_admin'
  };
  return roleMap[portal] || 'patient';
}