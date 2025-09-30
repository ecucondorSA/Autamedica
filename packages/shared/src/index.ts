// Utilidades de entorno
export {
  ensureEnv,
  ensureClientEnv,
  ensureServerEnv,
  getOptionalClientEnv,
  getClientEnvOrDefault,
  getServerEnvOrDefault,
  validateEnvironment,
  validateEnvironmentSecurity,
  validateProductionEnvironment,
  validateStagingEnvironment,
  validateEnvironmentByType
} from "./env";

// Tipos de entorno
export type { EnvironmentConfig, EnvironmentValidation } from "./env";

// Validaciones
export { validateEmail, validatePhone } from "./validators";

// Logger Service
export { logger } from "./services/logger.service";
export type { Logger, LogLevel } from "./services/logger.service";

// Role-based routing (deprecated - use portal system)
export {
  BASE_URL_BY_ROLE,
  HOME_BY_ROLE,
  getTargetUrlByRole,
  getCookieDomain,
  isValidRole,
  PORTAL_TO_ROLE,
  AUTH_URLS,
  getLoginUrl
} from "./role-routing";

// Unified portal routing system
export {
  getPortalForRole,
  getPortalUrlWithPath,
  isCorrectPortal,
  getRoleForPortal
} from "./env/portals";

// Security helpers
export {
  isAllowedRedirect,
  safeRedirectOrFallback,
  buildSafeLoginUrl
} from "./security/redirects";

// Auth session helpers
export {
  getSession,
  hasRole,
  type Session,
  type SessionRole
} from "./auth/session";

// App URL helpers (deprecated - use portal system)
export { getAppUrl, getBaseUrlForRole } from "./env/getAppUrl";
export type { AppRole } from "./env/getAppUrl";

// WebRTC diagnostics and media utils
export { WebRTCDiagnostics, ICE_SERVERS } from "./webrtc-diagnostics";

// Tenant-based roles and permissions
export * from "./tenant/roles";

// Simplified role system utilities
export {
  roleToPortal,
  roleToPortalDev,
  getPortalForRole as getPortalForRoleSimplified,
  getDefaultRedirectUrl,
  hasAdminAccess,
  canManageOrganizations,
  canAccessMedicalFeatures,
  getRoleDisplayName,
  getRoleDescription,
  isValidUserRole,
  requiresVerification,
  AVAILABLE_ROLES,
  VERIFIED_ROLES,
} from './roles';