/**
 * @fileoverview Configuración centralizada de enrutamiento por roles
 * @module shared/role-routing
 *
 * Este módulo centraliza toda la lógica de routing basada en roles de usuario,
 * permitiendo un sistema de autenticación de dominio único con redirección
 * automática a los portales correspondientes.
 */
import { ensureServerEnv } from './env';
// Definir ROLES localmente para evitar dependencia circular con auth
const ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    COMPANY: 'company',
    COMPANY_ADMIN: 'company_admin',
    ORGANIZATION_ADMIN: 'organization_admin',
    ADMIN: 'admin',
    PLATFORM_ADMIN: 'platform_admin',
};
/**
 * URLs base para cada aplicación por entorno
 * CONFIGURACIÓN: URLs de deployment de Cloudflare Pages para producción
 * SEGURIDAD: Cada rol solo tiene acceso a su aplicación específica
 */
export const BASE_URL_BY_ROLE = {
    'patient': 'https://patients.autamedica.com',
    'doctor': 'https://doctors.autamedica.com',
    'company': 'https://companies.autamedica.com',
    'company_admin': 'https://companies.autamedica.com',
    'organization_admin': 'https://admin.autamedica.com',
    'admin': 'https://admin.autamedica.com',
    'platform_admin': 'https://www.autamedica.com',
};
/**
 * Rutas home por defecto dentro de cada aplicación
 */
export const HOME_BY_ROLE = {
    'patient': '/',
    'doctor': '/',
    'company': '/',
    'company_admin': '/',
    'organization_admin': '/',
    'admin': '/',
    'platform_admin': '/',
};
/**
 * Genera la URL completa de destino para un rol específico
 * @param role - Rol del usuario
 * @param path - Ruta específica (opcional, usa home por defecto)
 * @returns URL completa de destino
 */
export function getTargetUrlByRole(role, path) {
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
export function getCookieDomain() {
    try {
        const authDomain = ensureServerEnv('AUTH_COOKIE_DOMAIN');
        return authDomain;
    }
    catch {
        // Fallback si AUTH_COOKIE_DOMAIN no está definido
        try {
            const nodeEnv = ensureServerEnv('NODE_ENV');
            return nodeEnv === 'production' ? '.autamedica.com' : 'localhost';
        }
        catch {
            return 'localhost';
        }
    }
}
/**
 * Valida si un rol es válido
 * @param role - Rol a validar
 * @returns true si el rol es válido
 */
export function isValidRole(role) {
    return Object.keys(BASE_URL_BY_ROLE).includes(role);
}
/**
 * Obtiene el portal recomendado para un rol específico
 * Útil para configurar parámetros de redirección
 */
export function getPortalForRole(role) {
    const portalMap = {
        'patient': 'patients',
        'doctor': 'doctors',
        'company': 'companies',
        'company_admin': 'companies',
        'organization_admin': 'admin',
        'admin': 'admin',
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
export const PORTAL_TO_ROLE = {
    patients: 'patient',
    doctors: 'doctor',
    companies: 'organization_admin',
    admin: 'platform_admin',
};
/**
 * Obtiene el rol basado en el portal
 * @param portal - Nombre del portal
 * @returns Rol correspondiente o undefined si no es válido
 */
export function getRoleForPortal(portal) {
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
};
/**
 * Genera URL de login con parámetros de redirección
 * @param returnTo - URL de retorno después del login
 * @param portal - Portal específico (opcional)
 * @returns URL de login completa
 */
export function getLoginUrl(returnTo, portal) {
    let webAppUrl;
    try {
        webAppUrl = ensureServerEnv('NEXT_PUBLIC_APP_URL');
    }
    catch {
        webAppUrl = BASE_URL_BY_ROLE[ROLES.PLATFORM_ADMIN];
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
