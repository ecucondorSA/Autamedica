/**
 * @fileoverview Configuración centralizada de enrutamiento por roles
 * @module shared/role-routing
 *
 * Este módulo centraliza toda la lógica de routing basada en roles de usuario,
 * permitiendo un sistema de autenticación de dominio único con redirección
 * automática a los portales correspondientes.
 */

// Importar UserRole desde auth/portals para evitar dependencia circular
import type { UserRole } from './auth/portals';
import { ensureServerEnv } from './env';

// Definir ROLES localmente para evitar dependencia circular con auth
const ROLES = {
  PATIENT: 'patient' as UserRole,
  DOCTOR: 'doctor' as UserRole,
  COMPANY_ADMIN: 'company_admin' as UserRole,
  ORGANIZATION_ADMIN: 'organization_admin' as UserRole,
  PLATFORM_ADMIN: 'platform_admin' as UserRole,
};

/**
 * URLs base para cada aplicación por entorno
 * CONFIGURACIÓN: URLs de deployment de Cloudflare Pages para producción
 * SEGURIDAD: Cada rol solo tiene acceso a su aplicación específica
 */
function getBaseUrlByRole(): Record<UserRole, string> {
  const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      'patient': 'https://patients.autamedica.com',
      'doctor': 'https://doctors.autamedica.com',
      'company': 'https://companies.autamedica.com',
      'company_admin': 'https://companies.autamedica.com',
      'organization_admin': 'https://admin.autamedica.com',
      'platform_admin': 'https://www.autamedica.com',
    };
  }

  // Development: localhost con puertos específicos
  return {
    'patient': 'http://localhost:3002',
    'doctor': 'http://localhost:3001',
    'company': 'http://localhost:3003',
    'company_admin': 'http://localhost:3003',
    'organization_admin': 'http://localhost:3004',
    'platform_admin': 'http://localhost:3000',
  };
}

export const BASE_URL_BY_ROLE: Record<UserRole, string> = getBaseUrlByRole();

/**
 * Rutas home por defecto dentro de cada aplicación
 */
export const HOME_BY_ROLE: Record<UserRole, string> = {
  'patient': '/',
  'doctor': '/',
  'company': '/',
  'company_admin': '/',
  'organization_admin': '/',
  'platform_admin': '/',
};

/**
 * Genera la URL completa de destino para un rol específico
 * @param role - Rol del usuario
 * @param path - Ruta específica (opcional, usa home por defecto)
 * @returns URL completa de destino
 */
export function getTargetUrlByRole(role: UserRole, path?: string): string {
  const baseUrl = BASE_URL_BY_ROLE[role];
  if (!baseUrl) {
    throw new Error(`No base URL configured for role: ${role}`);
  }

  const targetPath = path || HOME_BY_ROLE[role];
  if (!targetPath) {
    throw new Error(`No home path configured for role: ${role}`);
  }

  return new URL(targetPath, baseUrl).toString();
}

/**
 * Obtiene la configuración de dominio para cookies compartidas
 * Solo funciona en servidor (acceso a ensureServerEnv)
 */
export function getCookieDomain(): string {
  try {
    const authDomain = ensureServerEnv('AUTH_COOKIE_DOMAIN');
    return authDomain;
  } catch {
    // Fallback si AUTH_COOKIE_DOMAIN no está definido
    try {
      const nodeEnv = ensureServerEnv('NODE_ENV');
      return nodeEnv === 'production' ? '.autamedica.com' : 'localhost';
    } catch {
      return 'localhost';
    }
  }
}

/**
 * Valida si un rol es válido
 * @param role - Rol a validar
 * @returns true si el rol es válido
 */
export function isValidRole(role: string): role is UserRole {
  return Object.keys(BASE_URL_BY_ROLE).includes(role);
}

/**
 * Obtiene el portal recomendado para un rol específico
 * Útil para configurar parámetros de redirección
 */
export function getPortalForRole(role: UserRole): string {
  const portalMap: Record<UserRole, string> = {
    'patient': 'patients',
    'doctor': 'doctors',
    'company': 'companies',
    'company_admin': 'companies',
    'organization_admin': 'admin',
    'platform_admin': 'admin',
  };

  const portal = portalMap[role];
  if (!portal) {
    throw new Error(`No portal configured for role: ${role}`);
  }

  return portal;
}

/**
 * Mapeo de portales a roles (inverso de getPortalForRole)
 */
export const PORTAL_TO_ROLE: Record<string, UserRole> = {
  patients: 'patient',
  doctors: 'doctor',
  companies: 'company_admin',
  admin: 'organization_admin',
};

/**
 * Obtiene el rol basado en el portal
 * @param portal - Nombre del portal
 * @returns Rol correspondiente o undefined si no es válido
 */
export function getRoleForPortal(portal: string): UserRole | undefined {
  return PORTAL_TO_ROLE[portal];
}

/**
 * Configuración de URLs de autenticación centralizadas
 */
export const AUTH_URLS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CALLBACK: '/auth/callback',
  SELECT_ROLE: '/auth/select-role',
  FORGOT_PASSWORD: '/auth/forgot-password',
} as const;

/**
 * Genera URL de login con parámetros de redirección
 * @param returnTo - URL de retorno después del login
 * @param portal - Portal específico (opcional)
 * @returns URL de login completa
 */
export function getLoginUrl(returnTo?: string, portal?: string): string {
  let webAppUrl: string;
  try {
    webAppUrl = ensureServerEnv('NEXT_PUBLIC_APP_URL');
  } catch {
    webAppUrl = BASE_URL_BY_ROLE[ROLES.PLATFORM_ADMIN]!; // Safe: all roles are defined
  }
  const loginUrl = new URL(AUTH_URLS.LOGIN, webAppUrl);

  if (returnTo) {
    loginUrl.searchParams.set('returnTo', returnTo);
  }

  if (portal) {
    loginUrl.searchParams.set('portal', portal);
  }

  return loginUrl.toString();
}
