/**
 * @fileoverview Main entry point for @autamedica/auth package
 * Centralized authentication for AutaMedica platform
 */

// Export types
export type {
  UserRole,
  AppName,
  UserProfile,
  AuthState,
  Environment,
  DomainConfig,
  RedirectConfig,
  SessionConfig,
  AuthErrorType
} from './types'

export {
  ROLE_APP_MAPPING,
  APP_ALLOWED_ROLES,
  AuthError
} from './types'

// Export client utilities
export {
  createBrowserClient,
  getSupabaseClient,
  signOutGlobally
} from './client/supabase'

// Export hooks and context
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useRequireRole
} from './hooks/useAuth'

// Export middleware
export {
  authMiddleware,
  createAppMiddleware
} from './middleware/auth'

// Export configuration utilities
export {
  getEnvironment,
  getDomainConfig,
  getSessionConfig,
  getSupabaseConfig,
  isSameOrigin,
  sanitizeReturnUrl
} from './utils/config'

// Export redirect utilities
export {
  getRedirectUrl,
  getDefaultRedirectUrl,
  getLoginUrl,
  isCorrectAppForRole,
  getCorrectAppUrl,
  storeLastPath,
  getLastPath,
  clearLastPath
} from './utils/redirect'