# Glosario Packages - Exports por Package

## 🎯 Propósito

Documentación de todos los exports públicos de cada package de Autamedica.

---

## @autamedica/types

**Ubicación**: `packages/types/src/index.ts`

```typescript
// Primitivos: Fechas
export type { ISODateString } from "./primitives/date";
export {
  toISODateString,
  fromISODateString,
  nowAsISODateString,
} from "./primitives/date";

// Primitivos: API
export type {
  APIResponse,
  APIError,
  APISuccessResponse,
  APIErrorResponse,
} from "./primitives/api";
export { createSuccessResponse, createErrorResponse } from "./primitives/api";

// Primitivos: IDs
export type {
  UUID,
  PatientId,
  DoctorId,
  CompanyId,
  AppointmentId,
  FacilityId,
  SpecialtyId,
} from "./primitives/id";
export {
  createUUID,
  createPatientId,
  createDoctorId,
  createCompanyId,
} from "./primitives/id";

// Auth
export type {
  UserRole,
  Portal,
  User,
  UserProfile,
  UserSession,
} from "./auth/user";
export { ROLE_TO_PORTALS, canAccessPortal } from "./auth/user";

// Entidades
export type {
  Patient,
  PatientAddress,
  EmergencyContact,
} from "./entities/patient";

export type {
  Doctor,
  DoctorEducation,
  DoctorExperience,
} from "./entities/doctor";

export type {
  Company,
  CompanySize,
  CompanyAddress,
  CompanyContact,
} from "./entities/company";

export type {
  Appointment,
} from "./entities/appointment";
```

---

## @autamedica/shared

**Ubicación**: `packages/shared/src/index.ts`

```typescript
// Utilidades de entorno
export {
  ensureEnv,
  ensureClientEnv,
  ensureServerEnv,
  validateEnvironment,
  validateEnvironmentSecurity,
  validateProductionEnvironment,
  validateStagingEnvironment,
  validateEnvironmentByType,
} from "./env";

// Validaciones
export { validateEmail, validatePhone } from "./validators";

// Tipos de entorno
export type { EnvironmentConfig, EnvironmentValidation } from "./env";

// Logger centralizado
export { logger } from "./services/logger.service";
export type { Logger, LogLevel } from "./services/logger.service";

// Role-based routing
export {
  BASE_URL_BY_ROLE,
  HOME_BY_ROLE,
  AUTH_URLS,
  PORTAL_TO_ROLE,
  getTargetUrlByRole,
  getCookieDomain,
  isValidRole,
  getPortalForRole,
  getRoleForPortal,
  getLoginUrl
} from "./role-routing";
```

---

## @autamedica/auth

**Ubicación**: `packages/auth/src/index.ts`

```typescript
// Tipos compartidos de autenticación
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
} from "./types";

export {
  ROLE_APP_MAPPING,
  APP_ALLOWED_ROLES,
  AuthError
} from "./types";

// Clientes Supabase
export {
  createBrowserClient,
  getSupabaseClient,
  signOutGlobally
} from "./client/supabase";
export {
  createServerClient,
  createMiddlewareClient,
  createRouteHandlerClient,
} from "./server";

// Manejo de sesiones
export {
  getSession,
  requireSession,
  requirePortalAccess,
  signOut,
  getCurrentUser,
  hasRole,
  hasPortalAccess,
} from "./session";

// Autenticación por email (Magic Links)
export {
  signInWithOtp,
  validateEmailForSignIn,
  getPortalRedirectUrl,
} from "./email";
export type { SignInWithOtpOptions, SignInWithOtpResult } from "./email";

// Middleware y hooks de aplicación
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useRequireRole
} from "./hooks/useAuth";

export {
  authMiddleware,
  createAppMiddleware
} from "./middleware/auth";

// Utilidades de configuración y redirección
export {
  getEnvironment,
  getDomainConfig,
  getSessionConfig,
  getSupabaseConfig,
  isSameOrigin,
  sanitizeReturnUrl
} from "./utils/config";

export {
  getRedirectUrl,
  buildAuthRedirectUrl,
  getCallbackUrl
} from "./utils/redirect";
```

---

## @autamedica/hooks

**Ubicación**: `packages/hooks/src/index.ts`

```typescript
// React hooks médicos y de utilidad
export { useAsync } from "./useAsync";
export { useDebounce } from "./useDebounce";
export { usePatients } from "./usePatients";
export { useAppointments } from "./useAppointments";
```

---

## @autamedica/ui

**Ubicación**: `packages/ui/src/index.ts`

```typescript
// Componentes compartidos de UI
export { Button } from "./components/Button";
export { Card } from "./components/Card";
export { Input } from "./components/Input";
export { Modal } from "./components/Modal";
```

---

## @autamedica/tailwind-config

**Ubicación**: `packages/tailwind-config/tailwind.config.ts`

```typescript
// Configuración compartida de Tailwind CSS
export { default } from "./tailwind.config";
```

---

**Última actualización**: 2025-10-04
**Mantenido por**: Sistema de validación automática (`pnpm docs:validate`)
