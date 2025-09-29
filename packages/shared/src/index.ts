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

// Role-based routing
export {
  BASE_URL_BY_ROLE,
  HOME_BY_ROLE,
  getTargetUrlByRole,
  getCookieDomain,
  isValidRole,
  getPortalForRole,
  PORTAL_TO_ROLE,
  getRoleForPortal,
  AUTH_URLS,
  getLoginUrl
} from "./role-routing";