# Autamedica - Glosario Maestro de Contratos

## 🎯 Objetivo

Este glosario define el **lenguaje común** de Autamedica. Cada tipo exportado debe estar documentado aquí antes de ser implementado.

**Regla de oro**: Solo se exporta lo que está en este glosario.

## 📋 Contratos Core

### Identificadores Únicos

```typescript
export type UUID = string & { readonly brand: "UUID" };
export type PatientId = UUID & { readonly brand: "PatientId" };
export type DoctorId = UUID & { readonly brand: "DoctorId" };
export type AppointmentId = UUID & { readonly brand: "AppointmentId" };
export type FacilityId = UUID & { readonly brand: "FacilityId" };
export type SpecialtyId = UUID & { readonly brand: "SpecialtyId" };
```

### Escalares

```typescript
export type ISODateString = string & { readonly brand: "ISODateString" };
```

### Utilidades de Fechas ISO

```typescript
// Validators de fechas ISO
export const isISODateString: (value: string) => value is ISODateString;
export const toISODateString: (date: Date) => ISODateString;
export const nowAsISODateString: () => ISODateString;
```

### Sistema de Generación de IDs

```typescript
// Factory para crear IDs únicos
export const createId: () => UUID;
export const generateUUID: () => UUID;

// Configuración de validación
export interface ID_VALIDATION_CONFIG {
  readonly minLength: number;
  readonly maxLength: number;
  readonly allowedPrefixes: readonly string[];
}

// Validadores y factories con contexto
export const validateIdForScope: (id: string, scope: string) => boolean;
export const createValidatedId: (scope: string) => UUID;

// Generadores con prefijo
export const generatePrefixedId: (prefix: string) => UUID;
export const generatePatientId: () => PatientId;
export const generateDoctorId: () => DoctorId;
export const generateAppointmentId: () => AppointmentId;
```

### Estado de Entidades

```typescript
// Utilidades para manejo de estado soft-delete
export const isEntityDeleted: (entity: { deletedAt?: ISODateString | null }) => boolean;
export const isEntityActive: (entity: { deletedAt?: ISODateString | null }) => boolean;
export const markEntityAsDeleted: <T extends { deletedAt?: ISODateString | null }>(entity: T) => T & { deletedAt: ISODateString };
```

### Sistema de Geografía y Direcciones

```typescript
// Validators geográficos
export const isCountryCode: (value: string) => boolean;
export const isArgentinaStateCode: (value: string) => boolean;
export const isValidCoordinates: (lat: number, lng: number) => boolean;
export const isArgentinaZipCode: (value: string) => boolean;

// Constructores de direcciones
export const createBasicAddress: (street: string, city: string, state: string, country: string) => Address;
export const createMedicalAddress: (address: Address, facilityType: string) => MedicalAddress;

// Converters geográficos
export const toCountryCode: (countryName: string) => string;
export const toArgentinaStateCode: (stateName: string) => string;
export const toArgentinaZipCode: (zipCode: string) => string;

// Utilidades de direcciones
export const migrateToAddress: (oldAddress: LegacyAddress) => Address;
export const isCompleteAddress: (address: Partial<Address>) => address is Address;
export const formatAddressString: (address: Address) => string;
```

### Sistema de Teléfonos

```typescript
// Configuración de validación telefónica
export interface PHONE_VALIDATION_CONFIG {
  readonly countryCode: string;
  readonly minLength: number;
  readonly maxLength: number;
  readonly patterns: readonly RegExp[];
}

// Validators telefónicos
export const isPhoneE164: (phone: string) => boolean;
export const isValidPhoneForCountry: (phone: string, countryCode: string) => boolean;
export const isArgentinaPhone: (phone: string) => boolean;
export const isArgentinaMobile: (phone: string) => boolean;

// Formatters telefónicos
export const normalizePhoneNumber: (phone: string) => string;
export const toE164Format: (phone: string, countryCode: string) => string;
export const toNationalFormat: (phoneE164: string) => string;
export const formatPhoneForDisplay: (phone: string) => string;

// Utilidades telefónicas
export const extractCountryCode: (phoneE164: string) => string;
export const getPhoneExamples: (countryCode: string) => string[];
export const validatePhoneList: (phones: string[]) => ValidationResult[];
```

### Sistema de Especialidades Médicas

```typescript
// Catálogos de especialidades y certificaciones
export const MEDICAL_SPECIALTIES: readonly MedicalSpecialty[];
export const SUBSPECIALTIES: readonly MedicalSubspecialty[];
export const CERTIFICATION_TYPES: readonly CertificationType[];

// Estados de licencias médicas
export const LICENSE_STATUS: readonly LicenseStatus[];

// Validators de especialidades
export const isValidSpecialtyCode: (code: string) => boolean;
export const isValidSubspecialtyCode: (code: string) => boolean;

// Validators de licencias médicas
export const isValidMedicalLicense: (license: string) => boolean;
export const isActiveLicense: (license: MedicalLicense) => boolean;
export const isValidCertification: (cert: Certification) => boolean;

// Utilidades de especialidades
export const getSpecialtiesRequiring: (requirement: string) => MedicalSpecialty[];
export const getAvailableSubspecialties: (specialtyCode: string) => MedicalSubspecialty[];
export const getSpecialtiesByCategory: (category: string) => MedicalSpecialty[];
export const createBasicSpecialty: (code: string, name: string) => MedicalSpecialty;

// Utilidades de licencias médicas
export const formatMedicalLicense: (license: string) => string;
export const extractProvinceFromLicense: (license: string) => string;
export const createMedicalLicense: (province: string, number: string) => MedicalLicense;

// Validaciones de práctica médica
export const canPracticeSpecialty: (doctor: Doctor, specialty: string) => boolean;
export const canPracticeInArgentina: (license: MedicalLicense) => boolean;
export const isDoctorLicenseActive: (doctor: Doctor) => boolean;
export const isDoctorProfileComplete: (doctor: Doctor) => boolean;

// Cálculos médicos
export const calculateTotalTrainingYears: (doctor: Doctor) => number;
export const calculateYearsOfExperience: (doctor: Doctor) => number;

// Utilidades de perfiles
export const generateDisplayName: (firstName: string, lastName: string) => string;
```

### Validaciones Médicas y Profesionales

```typescript
// Validaciones de práctica médica
export const acceptsInsurancePlan: (doctor: Doctor, planId: string) => boolean;
export const isAvailableOnDay: (doctor: Doctor, date: ISODateString) => boolean;

// Validaciones de datos médicos
export const isValidTimeHHmm: (time: string) => boolean;
export const isValidDNI: (dni: string) => boolean;
export const isValidDoctorEmail: (email: string) => boolean;
export const isValidDoctorURL: (url: string) => boolean;
export const isValidBloodType: (bloodType: string) => boolean;

// Utilidades de perfiles médicos
export const createPublicProfile: (doctor: Doctor) => DoctorPublicProfile;
export const extractPrivateData: (doctor: Doctor) => DoctorPrivateData;
```

### Sistema de Seguros Argentinos

```typescript
// Catálogo de obras sociales y seguros
export const ARGENTINA_INSURANCE_PROVIDERS: readonly InsuranceProvider[];

// Validaciones de cobertura
export const isPublicHealthcareEligible: (patient: Patient) => boolean;
export const isPAMIEligible: (patient: Patient) => boolean;
export const hasInsuranceCoverage: (patient: Patient, treatment: string) => boolean;
```

### Cálculos de Salud y Riesgo

```typescript
// Cálculos médicos básicos
export const calculateBMI: (heightCm: number, weightKg: number) => number;
export const calculateAge: (birthDate: ISODateString) => number;

// Evaluación de riesgo médico
export const calculateRiskLevel: (patient: Patient) => RiskLevel;
export const hasActiveAllergies: (patient: Patient) => boolean;
export const isHighRiskPatient: (patient: Patient) => boolean;
export const requiresSpecializedCare: (patient: Patient) => boolean;

// Elegibilidad de servicios
export const canReceiveTelemedicine: (patient: Patient) => boolean;

// Utilidades de perfiles de pacientes
export const generatePatientDisplayName: (patient: Patient) => string;
export const createPatientPublicProfile: (patient: Patient) => PatientPublicProfile;
export const createMedicalView: (patient: Patient) => PatientMedicalView;
export const extractPatientPrivateData: (patient: Patient) => PatientPrivateData;
```

### Sistema de Reviews y Ratings

```typescript
// Constantes de configuración de reviews
export const REVIEW_WINDOW_DAYS: number;

// Validaciones de ratings
export const isValidRatingScore: (score: number) => boolean;
export const canSubmitReview: (patient: Patient, doctor: Doctor) => boolean;

// Cálculos de métricas de reviews
export const calculatePatientReviewsScore: (reviews: Review[]) => number;
export const calculateReviewsBreakdown: (reviews: Review[]) => ReviewBreakdown;
export const calculateVolumeScore: (doctor: Doctor) => number;
export const calculateRecognitionScore: (doctor: Doctor) => number;
export const calculateOverallRating: (doctor: Doctor) => number;
export const calculateMonthsActive: (doctor: Doctor) => number;
export const calculateVolumePercentile: (doctor: Doctor) => number;

// Utilidades de reconocimiento
export const isEligibleForRecognition: (doctor: Doctor) => boolean;
export const createRatingDisplay: (rating: number) => RatingDisplay;
export const getRecognitionBadgeText: (level: RecognitionLevel) => string;
```

### Type Guards y Utilidades de Validación

```typescript
// Type guards básicos
export const isNonEmptyString: (value: string) => value is NonEmptyString;
export const isNonEmptyArray: <T>(arr: T[]) => arr is NonEmptyArray<T>;
export const isNonNullable: <T>(value: T | null | undefined) => value is T;
export const isNonEmptyObject: (obj: object) => obj is NonEmptyObject;
export const isPositiveNumber: (num: number) => num is PositiveNumber;
export const isPercentage: (num: number) => num is Percentage;
```

### Sistema de Estados Async/Loadable

```typescript
// Constructores de estados
export const idle: <T>() => Loadable<T>;
export const loading: <T>() => Loadable<T>;
export const success: <T>(data: T) => Loadable<T>;
export const failure: <T>(error: Error) => Loadable<T>;
export const unauthenticated: <T>() => AuthenticatedLoadable<T>;

// Pattern matching para estados
export const matchDataLoadingState: <T, R>(
  state: DataLoadingState<T>,
  patterns: DataLoadingStatePatterns<T, R>
) => R;

export const matchLoadable: <T, R>(
  loadable: Loadable<T>,
  patterns: LoadablePatterns<T, R>
) => R;

export const matchAsyncState: <T, R>(
  state: AsyncState<T>,
  patterns: AsyncStatePatterns<T, R>
) => R;

export const matchAuthenticatedLoadable: <T, R>(
  loadable: AuthenticatedLoadable<T>,
  patterns: AuthenticatedLoadablePatterns<T, R>
) => R;

// Type guards para estados
export const isIdle: <T>(loadable: Loadable<T>) => boolean;
```

### Usuario Base

```typescript
export interface User {
  id: UUID;
  email: string;
  role: "admin" | "staff" | "doctor" | "patient";
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Paciente

```typescript
export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: ISODateString;
  medicalRecordNumber: string;
  emergencyContact?: EmergencyContact;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}
```

### Doctor

```typescript
export interface Doctor {
  id: DoctorId;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Cita Médica

```typescript
export interface Appointment {
  id: AppointmentId;
  patientId: PatientId;
  doctorId: DoctorId;
  startTime: ISODateString;
  duration: number; // minutos
  type: "consultation" | "follow-up" | "emergency";
  status:
    | "scheduled"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show"
    | "rescheduled";
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Respuestas API

```typescript
// Factory functions para construir respuestas API
export const ok: <T>(data: T) => APISuccess<T>;
export const fail: (error: APIError) => APIFailure;
export const failWithCode: (code: string, message: string) => APIFailure;

// Type guards para respuestas API
export const isApiSuccess: <T>(response: APIResponse<T>) => response is APISuccess<T>;
export const isApiError: <T>(response: APIResponse<T>) => response is APIFailure;

// Utilidades para manejo de respuestas
export const unwrapApiResponse: <T>(response: APIResponse<T>) => T;
export const mapApiResponse: <T, U>(response: APIResponse<T>, mapper: (data: T) => U) => APIResponse<U>;

// Factories específicos para contexto médico
export const medicalOk: <T>(data: T, metadata?: MedicalMetadata) => MedicalAPISuccess<T>;
export const medicalFail: (error: MedicalAPIError) => MedicalAPIFailure;
```

```typescript
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    timestamp: ISODateString;
    requestId?: string;
    version?: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: APIError;
  meta?: {
    timestamp: ISODateString;
    requestId?: string;
    version?: string;
  };
}

export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;
```

## 📖 Exports por Package

### @autamedica/types

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

### @autamedica/shared

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

### @autamedica/auth

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
  getDefaultRedirectUrl,
  getLoginUrl,
  isCorrectAppForRole,
  getCorrectAppUrl,
  storeLastPath,
  getLastPath,
  clearLastPath
} from "./utils/redirect";
```

### @autamedica/hooks

**Ubicación**: `packages/hooks/src/index.ts`

```typescript
// Hooks médicos
export { usePatients, useAppointments } from "./medical";

// Hooks de utilidad
export { useAsync, useDebounce } from "./utils";
```

## 🚨 Reglas de Breaking Changes

1. **Cambio de tipo**: Requiere PR + revisión
2. **Eliminación de export**: Requiere deprecation period
3. **Rename de interface**: Requiere alias temporal

## 🌍 Variables de Entorno

### Contratos de Variables (Cliente - NEXT*PUBLIC*\*)

Variables que pueden ser expuestas al cliente (bundle JavaScript):

```typescript
// URLs y configuración pública
NEXT_PUBLIC_API_URL: string;              // URL base de la API
NEXT_PUBLIC_APP_URL: string;              // URL base de la aplicación web
NEXT_PUBLIC_SITE_URL: string;           // URL pública principal
NEXT_PUBLIC_DOCTORS_URL: string;          // URL de aplicación médicos
NEXT_PUBLIC_PATIENTS_URL: string;         // URL de aplicación pacientes
NEXT_PUBLIC_COMPANIES_URL: string;        // URL de aplicación empresas

// Supabase (cliente)
NEXT_PUBLIC_SUPABASE_URL: string;         // URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY: string;    // Clave anónima de Supabase

// Monitoring y errores (cliente)
NEXT_PUBLIC_SENTRY_DSN: string;           // Sentry DSN para errores cliente

// reCAPTCHA (cliente)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY: string;           // reCAPTCHA site key web
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_WEB: string;       // reCAPTCHA site key web
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_IOS?: string;      // reCAPTCHA site key iOS
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_ANDROID?: string;  // reCAPTCHA site key Android

// Maps y geolocalización (cliente)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;  // Google Maps API key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?: string; // Mapbox access token

// WebRTC y telemedicina (cliente)
NEXT_PUBLIC_ICE_SERVERS: string;          // Servidores ICE (JSON string)
NEXT_PUBLIC_STUN_SERVER: string;          // Servidor STUN
NEXT_PUBLIC_WEBRTC_SIGNALING_URL: string; // URL de señalización WebRTC
NEXT_PUBLIC_MEDIASOUP_URL: string;        // URL de MediaSoup

// IA (cliente) - ⚠️ CUIDADO: Evaluar si es necesario exponer
NEXT_PUBLIC_OPENAI_API_KEY?: string;      // OpenAI API key (⚠️ SENSIBLE)

// Feature flags (cliente)
NEXT_PUBLIC_AI_PREDICTOR_ENABLED: string;              // AI predictor
NEXT_PUBLIC_PATIENT_CRYSTAL_BALL_ENABLED: string;     // Crystal ball
NEXT_PUBLIC_DIGITAL_PRESCRIPTION_ENABLED: string;     // Recetas digitales
NEXT_PUBLIC_AI_ASSISTANT_ENABLED: string;             // Asistente IA
NEXT_PUBLIC_MARKETPLACE_ENABLED: string;              // Marketplace
NEXT_PUBLIC_HOSPITAL_REDISTRIBUTION_ENABLED: string;  // Redistribución
NEXT_PUBLIC_WHATSAPP_BUSINESS_ENABLED: string;        // WhatsApp Business
NEXT_PUBLIC_IOT_SENSORS_ENABLED: string;              // Sensores IoT
NEXT_PUBLIC_HOSPITAL_API_ENABLED: string;             // API hospitales
NEXT_PUBLIC_ADMIN_PANEL_ENABLED: string;              // Panel admin
NEXT_PUBLIC_PROMETHEUS_ENABLED: string;               // Prometheus
NEXT_PUBLIC_HIPAA_AUDIT_ENABLED: string;              // Auditoría HIPAA
NEXT_PUBLIC_DATABASE_ADMIN_ENABLED: string;           // Admin DB
NEXT_PUBLIC_AUDIT_LOGS_ENABLED: string;               // Logs auditoría
```

### Contratos de Variables (Servidor - Server-only)

Variables que solo pueden ser usadas en server actions/API routes:

```typescript
// JWT y autenticación (servidor)
JWT_SECRET: string;                    // Secreto para firmar JWT tokens
JWT_REFRESH_SECRET: string;            // Secreto para refresh tokens
ENCRYPTION_KEY: string;                // Clave maestra de encriptación
SESSION_SECRET: string;                // Secreto para sesiones
NEXTAUTH_SECRET: string;               // NextAuth.js secret

// Supabase (servidor)
SUPABASE_SERVICE_ROLE_KEY: string;     // Service role key de Supabase
DATABASE_URL: string;                  // URL completa de PostgreSQL

// Cache y Redis (servidor)
REDIS_URL: string;                     // URL de Upstash Redis
UPSTASH_REDIS_REST_URL: string;        // URL REST de Upstash
UPSTASH_REDIS_REST_TOKEN: string;      // Token REST de Upstash

// Monitoring (servidor)
SENTRY_ORG: string;                    // Organización Sentry
SENTRY_PROJECT: string;                // Proyecto Sentry
SENTRY_AUTH_TOKEN: string;             // Token auth Sentry

// Pagos MercadoPago (servidor)
MERCADOPAGO_ACCESS_TOKEN: string;      // Access token producción
MERCADOPAGO_WEBHOOK_SECRET: string;    // Secret para webhooks
MERCADOPAGO_TEST_ACCESS_TOKEN?: string; // Access token test

// IA y servicios externos (servidor)
OPENAI_API_KEY: string;                // OpenAI API key
ANTHROPIC_API_KEY: string;             // Anthropic Claude API key

// WebRTC y telemedicina (servidor)
TURN_USERNAME: string;                 // Usuario TURN server
TURN_PASSWORD: string;                 // Password TURN server
TURN_SECRET: string;                   // Secret TURN server
TURN_REALM: string;                    // Realm TURN server

// Email y comunicaciones (servidor)
SMTP_HOST: string;                     // Host SMTP
SMTP_PORT: string;                     // Puerto SMTP
SMTP_USER: string;                     // Usuario SMTP
SMTP_PASS: string;                     // Contraseña SMTP
WHATSAPP_BUSINESS_TOKEN?: string;      // Token WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID?: string;     // ID número WhatsApp
WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string; // Token verificación webhook

// reCAPTCHA (servidor)
RECAPTCHA_SECRET_KEY: string;          // reCAPTCHA secret key

// Compliance y auditoría (servidor)
AUDIT_HASH_CHAIN_ENABLED: string;     // Cadena hash auditoría
ENCRYPTION_KEY_ROTATION_DAYS: string; // Días rotación claves
DATA_RETENTION_DAYS: string;          // Días retención datos
AUDIT_LOG_RETENTION_DAYS: string;     // Días retención logs

// URLs internas (servidor)
DOMAIN: string;                        // Dominio principal
NEXTAUTH_URL: string;                  // URL NextAuth
ALLOWED_ORIGINS: string;               // Origins CORS permitidos
MERCADOPAGO_WEBHOOK_URL: string;       // URL webhook MercadoPago

// Configuración sistema (servidor)
NODE_ENV: string;                      // Entorno (production/development)
PORT?: string;                         // Puerto aplicación
LOG_LEVEL: string;                     // Nivel de logs
LOG_FORMAT: string;                    // Formato logs
```

### Validación de Variables

**Ubicación**: `packages/shared/src/env.ts`

```typescript
// Cliente - variables públicas accesibles en browser
export function ensureClientEnv(name: string): string;

// Servidor - variables privadas solo en server-side
export function ensureServerEnv(name: string): string;

// Genérica - para compatibilidad hacia atrás
export function ensureEnv(name: string): string;

// Validación de configuración completa
export function validateEnvironment(): EnvironmentConfig;
```

## 🚀 Deployment y Validaciones

### Validación de Configuración Cloudflare Pages

**Comandos recomendados**:

```bash
pnpm pre-deploy         # Validación general antes de desplegar
wrangler pages project list
wrangler pages project settings autamedica-web-app
```

**Checklist previo al deploy**:

- Variables de entorno configuradas en Cloudflare Pages
- Build local (`pnpm build:cloudflare`) sin errores
- DNS y certificates activos (ver `DOMAIN_CONFIGURATION.md`)

### Scripts de Automatización

**Ubicación**: `scripts/`

```typescript
// Health check completo del monorepo
pnpm health             // scripts/health-check.mjs

// Validaciones de seguridad
pnpm security:check     // scripts/security-check.mjs
pnpm security:full      // security:check + pnpm audit

// Validación de exports vs documentación
pnpm docs:validate      // scripts/validate-exports.mjs

// Diagnóstico de deployment
wrangler pages deploy .open-next/dist --project-name autamedica-web-app --branch main  # Deploy manual
```

## ✅ Validación Automática

Script en `scripts/validate-exports.mjs` verifica que:

- Todo export tiene documentación en este glosario
- No hay exports no documentados
- Versiones semánticas son respetadas

**Validación de deployment** (manual):

- `wrangler pages deployments list <proyecto>` sin estados `error`
- `pnpm check:all` exitoso antes de publicar
- Confirmar que `.open-next/dist` contiene artefactos generados

## 🎨 Contratos UI (@autamedica/ui)

### Componentes React Básicos

```typescript
// Componentes
export const Button: React.FC<ButtonProps>;
export const Card: React.FC<CardProps>;
export const Input: React.FC<InputProps>;
export const FooterLink: React.FC<FooterLinkProps>;

// Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  target?: '_blank' | '_self';
  className?: string;
}
```

## 🛠️ Contratos Utils (@autamedica/utils)

### Funciones Utilitarias

```typescript
// Utilidades de clases CSS
export function cn(...classes: (string | undefined | null | boolean)[]): string;

// Type Guards
export function isString(value: unknown): value is string;
export function isNumber(value: unknown): value is number;
export function isBoolean(value: unknown): value is boolean;

// Utilidades de tiempo
export function delay(ms: number): Promise<void>;
```

## 🔐 Contratos Auth Adicionales (@autamedica/auth)

### Estados de Autenticación

```typescript
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

export interface AuthUser extends User {
  // Campos específicos de autenticación si se necesitan
}
```

### Opciones de Autenticación

```typescript
export interface SignInWithOtpOptions {
  email: string;
  options?: {
    redirectTo?: string;
    shouldCreateUser?: boolean;
  };
}

export interface SignInWithOtpResult {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}
```

## 📊 Contratos Shared Adicionales (@autamedica/shared)

### Logger Service

```typescript
export interface Logger {
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const logger: Logger;
```

## 🎯 Batch 8: Exports Críticos Finales (23 tipos) - Hacia 0 Errores

### Sistema Avanzado de Estados Loadable

```typescript
// Predicates adicionales para estados loadable
export const isLoading: <T>(loadable: Loadable<T>) => boolean;
export const isSuccess: <T>(loadable: Loadable<T>) => boolean;
export const isFailure: <T>(loadable: Loadable<T>) => boolean;
export const isUnauthenticated: <T>(loadable: AuthenticatedLoadable<T>) => boolean;

// Transformadores avanzados de loadable
export const mapLoadable: <T, U>(
  loadable: Loadable<T>,
  fn: (value: T) => U
) => Loadable<U>;

export const flatMapLoadable: <T, U>(
  loadable: Loadable<T>,
  fn: (value: T) => Loadable<U>
) => Loadable<U>;

export const combineLoadables: <T>(
  loadables: Loadable<T>[]
) => Loadable<T[]>;

// Extractores de valor de loadable
export const getLoadableValue: <T>(
  loadable: Loadable<T>
) => T | undefined;

export const unwrapLoadable: <T>(
  loadable: Loadable<T>,
  fallback: T
) => T;
```

### Sistema de Autenticación y Roles (Auth Legacy)

```typescript
// Mapeo de roles a portales disponibles
export const ROLE_TO_PORTALS: Record<UserRole, Portal[]>;

// Control de acceso por portal
export const canAccessPortal: (
  userRole: UserRole,
  portal: Portal
) => boolean;
```

### Type Guards del Sistema Supabase

```typescript
// Guards para entidades principales del sistema
export const isProfile: (obj: unknown) => obj is SupabaseProfile;
export const isDoctor: (obj: unknown) => obj is SupabaseDoctor;
export const isPatient: (obj: unknown) => obj is SupabasePatient;
export const isAppointment: (obj: unknown) => obj is SupabaseAppointment;
```

### Constantes del Sistema de Base de Datos

```typescript
// Enumeraciones de roles de usuario
export const USER_ROLES: readonly UserRole[];

// Tamaños de empresa disponibles
export const COMPANY_SIZES: readonly CompanySize[];

// Géneros disponibles en el sistema
export const GENDERS: readonly Gender[];

// Tipos de cita médica
export const APPOINTMENT_TYPES: readonly AppointmentType[];

// Estados de cita médica
export const APPOINTMENT_STATUSES: readonly AppointmentStatus[];

// Niveles de visibilidad de registros médicos
export const MEDICAL_RECORD_VISIBILITIES: readonly MedicalRecordVisibility[];

// Roles de miembros en empresas
export const COMPANY_MEMBER_ROLES: readonly CompanyMemberRole[];

// Proveedores de seguros médicos de Argentina
export const ARGENTINA_INSURANCE_PROVIDERS: readonly InsuranceProvider[];
export const LOG_LEVELS: LogLevel;
```

<!-- AUTOGEN_PACKAGES:START -->

## 📋 Exports Auto-generados

### APPOINTMENT_STATUSES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para appointment statuses.
- **Contrato:** Pendiente de documentación detallada

### APPOINTMENT_TYPES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para appointment types.
- **Contrato:** Pendiente de documentación detallada

### ARGENTINA_INSURANCE_PROVIDERS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para argentina insurance providers.
- **Contrato:** Pendiente de documentación detallada

### CERTIFICATION_TYPES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para certification types.
- **Contrato:** Pendiente de documentación detallada

### COMPANY_MEMBER_ROLES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para company member roles.
- **Contrato:** Pendiente de documentación detallada

### COMPANY_SIZES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para company sizes.
- **Contrato:** Pendiente de documentación detallada

### GENDERS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para genders.
- **Contrato:** Pendiente de documentación detallada

### ID_VALIDATION_CONFIG
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para id validation config.
- **Contrato:** Pendiente de documentación detallada

### LICENSE_STATUS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para license status.
- **Contrato:** Pendiente de documentación detallada

### MEDICAL_RECORD_VISIBILITIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para medical record visibilities.
- **Contrato:** Pendiente de documentación detallada

### MEDICAL_SPECIALTIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para medical specialties.
- **Contrato:** Pendiente de documentación detallada

### PHONE_VALIDATION_CONFIG
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para phone validation config.
- **Contrato:** Pendiente de documentación detallada

### REVIEW_WINDOW_DAYS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para review window days.
- **Contrato:** Pendiente de documentación detallada

### ROLE_TO_PORTALS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para role to portals.
- **Contrato:** Pendiente de documentación detallada

### SUBSPECIALTIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para subspecialties.
- **Contrato:** Pendiente de documentación detallada

### USER_ROLES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para user roles.
- **Contrato:** Pendiente de documentación detallada

### acceptsInsurancePlan
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para acceptsinsuranceplan.
- **Contrato:** Pendiente de documentación detallada

### calculateAge
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateage.
- **Contrato:** Pendiente de documentación detallada

### calculateBMI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatebmi.
- **Contrato:** Pendiente de documentación detallada

### calculateMonthsActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatemonthsactive.
- **Contrato:** Pendiente de documentación detallada

### calculateOverallRating
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateoverallrating.
- **Contrato:** Pendiente de documentación detallada

### calculatePatientReviewsScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatepatientreviewsscore.
- **Contrato:** Pendiente de documentación detallada

### calculateRecognitionScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculaterecognitionscore.
- **Contrato:** Pendiente de documentación detallada

### calculateReviewsBreakdown
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatereviewsbreakdown.
- **Contrato:** Pendiente de documentación detallada

### calculateRiskLevel
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculaterisklevel.
- **Contrato:** Pendiente de documentación detallada

### calculateTotalTrainingYears
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatetotaltrainingyears.
- **Contrato:** Pendiente de documentación detallada

### calculateVolumePercentile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatevolumepercentile.
- **Contrato:** Pendiente de documentación detallada

### calculateVolumeScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatevolumescore.
- **Contrato:** Pendiente de documentación detallada

### calculateYearsOfExperience
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateyearsofexperience.
- **Contrato:** Pendiente de documentación detallada

### canAccessPortal
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canaccessportal.
- **Contrato:** Pendiente de documentación detallada

### canPracticeInArgentina
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canpracticeinargentina.
- **Contrato:** Pendiente de documentación detallada

### canPracticeSpecialty
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canpracticespecialty.
- **Contrato:** Pendiente de documentación detallada

### canReceiveTelemedicine
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canreceivetelemedicine.
- **Contrato:** Pendiente de documentación detallada

### canSubmitReview
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para cansubmitreview.
- **Contrato:** Pendiente de documentación detallada

### combineLoadables
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para combineloadables.
- **Contrato:** Pendiente de documentación detallada

### createBasicAddress
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createbasicaddress en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createBasicSpecialty
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createbasicspecialty en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para create en el sistema.
- **Contrato:** Pendiente de documentación detallada

### createMedicalAddress
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicaladdress en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createMedicalLicense
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicallicense en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createMedicalView
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicalview en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createPublicProfile
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createpublicprofile en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createRatingDisplay
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createratingdisplay en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createValidatedId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para createvalidated en el sistema.
- **Contrato:** Pendiente de documentación detallada

### extractCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractcountrycode.
- **Contrato:** Pendiente de documentación detallada

### extractPrivateData
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractprivatedata.
- **Contrato:** Pendiente de documentación detallada

### extractProvinceFromLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractprovincefromlicense.
- **Contrato:** Pendiente de documentación detallada

### fail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para fail.
- **Contrato:** Pendiente de documentación detallada

### failWithCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para failwithcode.
- **Contrato:** Pendiente de documentación detallada

### failure
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para failure.
- **Contrato:** Pendiente de documentación detallada

### flatMapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para flatmaploadable.
- **Contrato:** Pendiente de documentación detallada

### formatAddressString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formataddressstring.
- **Contrato:** Pendiente de documentación detallada

### formatMedicalLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatmedicallicense.
- **Contrato:** Pendiente de documentación detallada

### formatPhoneForDisplay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatphonefordisplay.
- **Contrato:** Pendiente de documentación detallada

### generateAppointmentId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateappointment en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generateDisplayName
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para generatedisplayname.
- **Contrato:** Pendiente de documentación detallada

### generateDoctorId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generatedoctor en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generatePatientId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generatepatient en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generatePrefixedId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateprefixed en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generateUUID
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateuu en el sistema.
- **Contrato:** Pendiente de documentación detallada

### getAvailableSubspecialties
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getavailablesubspecialties en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoadableValue
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getloadablevalue en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPhoneExamples
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getphoneexamples en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRecognitionBadgeText
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getrecognitionbadgetext en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSpecialtiesByCategory
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getspecialtiesbycategory en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSpecialtiesRequiring
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getspecialtiesrequiring en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### hasActiveAllergies
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasactiveallergies.
- **Contrato:** Pendiente de documentación detallada

### hasInsuranceCoverage
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasinsurancecoverage.
- **Contrato:** Pendiente de documentación detallada

### idle
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para idle.
- **Contrato:** Pendiente de documentación detallada

### isActiveLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isactivelicense.
- **Contrato:** Pendiente de documentación detallada

### isApiError
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isapierror.
- **Contrato:** Pendiente de documentación detallada

### isApiSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isapisuccess.
- **Contrato:** Pendiente de documentación detallada

### isAppointment
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isappointment.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaMobile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinamobile.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaPhone
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinaphone.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaStateCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinastatecode.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaZipCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinazipcode.
- **Contrato:** Pendiente de documentación detallada

### isAvailableOnDay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isavailableonday.
- **Contrato:** Pendiente de documentación detallada

### isCompleteAddress
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscompleteaddress.
- **Contrato:** Pendiente de documentación detallada

### isCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscountrycode.
- **Contrato:** Pendiente de documentación detallada

### isDoctor
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctor.
- **Contrato:** Pendiente de documentación detallada

### isDoctorLicenseActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctorlicenseactive.
- **Contrato:** Pendiente de documentación detallada

### isDoctorProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctorprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### isEligibleForRecognition
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iseligibleforrecognition.
- **Contrato:** Pendiente de documentación detallada

### isEntityActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isentityactive.
- **Contrato:** Pendiente de documentación detallada

### isEntityDeleted
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isentitydeleted.
- **Contrato:** Pendiente de documentación detallada

### isFailure
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isfailure.
- **Contrato:** Pendiente de documentación detallada

### isHighRiskPatient
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishighriskpatient.
- **Contrato:** Pendiente de documentación detallada

### isISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isisodatestring.
- **Contrato:** Pendiente de documentación detallada

### isIdle
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isidle.
- **Contrato:** Pendiente de documentación detallada

### isLoading
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isloading.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyArray
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptyarray.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyObject
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptyobject.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptystring.
- **Contrato:** Pendiente de documentación detallada

### isNonNullable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonnullable.
- **Contrato:** Pendiente de documentación detallada

### isPAMIEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispamieligible.
- **Contrato:** Pendiente de documentación detallada

### isPatient
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispatient.
- **Contrato:** Pendiente de documentación detallada

### isPercentage
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispercentage.
- **Contrato:** Pendiente de documentación detallada

### isPhoneE164
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isphonee164.
- **Contrato:** Pendiente de documentación detallada

### isPositiveNumber
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispositivenumber.
- **Contrato:** Pendiente de documentación detallada

### isProfile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprofile.
- **Contrato:** Pendiente de documentación detallada

### isPublicHealthcareEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispublichealthcareeligible.
- **Contrato:** Pendiente de documentación detallada

### isSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issuccess.
- **Contrato:** Pendiente de documentación detallada

### isUnauthenticated
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isunauthenticated.
- **Contrato:** Pendiente de documentación detallada

### isValidBloodType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidbloodtype.
- **Contrato:** Pendiente de documentación detallada

### isValidCertification
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidcertification.
- **Contrato:** Pendiente de documentación detallada

### isValidCoordinates
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidcoordinates.
- **Contrato:** Pendiente de documentación detallada

### isValidDNI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvaliddni.
- **Contrato:** Pendiente de documentación detallada

### isValidEmail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidemail.
- **Contrato:** Pendiente de documentación detallada

### isValidMedicalLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidmedicallicense.
- **Contrato:** Pendiente de documentación detallada

### isValidPhoneForCountry
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidphoneforcountry.
- **Contrato:** Pendiente de documentación detallada

### isValidRatingScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidratingscore.
- **Contrato:** Pendiente de documentación detallada

### isValidSpecialtyCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidspecialtycode.
- **Contrato:** Pendiente de documentación detallada

### isValidSubspecialtyCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidsubspecialtycode.
- **Contrato:** Pendiente de documentación detallada

### isValidTimeHHmm
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidtimehhmm.
- **Contrato:** Pendiente de documentación detallada

### isValidURL
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidurl.
- **Contrato:** Pendiente de documentación detallada

### loading
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para loading.
- **Contrato:** Pendiente de documentación detallada

### mapApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de mapapi.
- **Contrato:** Pendiente de documentación detallada

### mapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para maploadable.
- **Contrato:** Pendiente de documentación detallada

### markEntityAsDeleted
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para markentityasdeleted.
- **Contrato:** Pendiente de documentación detallada

### matchAsyncState
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para matchasync en el sistema.
- **Contrato:** Pendiente de documentación detallada

### matchAuthenticatedLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para matchauthenticatedloadable.
- **Contrato:** Pendiente de documentación detallada

### matchDataLoadingState
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para matchdataloading en el sistema.
- **Contrato:** Pendiente de documentación detallada

### matchLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para matchloadable.
- **Contrato:** Pendiente de documentación detallada

### medicalFail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para medicalfail.
- **Contrato:** Pendiente de documentación detallada

### medicalOk
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para medicalok.
- **Contrato:** Pendiente de documentación detallada

### migrateToAddress
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para migratetoaddress.
- **Contrato:** Pendiente de documentación detallada

### normalizePhoneNumber
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para normalizephonenumber.
- **Contrato:** Pendiente de documentación detallada

### nowAsISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para nowasisodatestring.
- **Contrato:** Pendiente de documentación detallada

### ok
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ok.
- **Contrato:** Pendiente de documentación detallada

### requiresSpecializedCare
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresspecializedcare.
- **Contrato:** Pendiente de documentación detallada

### success
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para success.
- **Contrato:** Pendiente de documentación detallada

### toArgentinaStateCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toargentinastatecode.
- **Contrato:** Pendiente de documentación detallada

### toArgentinaZipCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toargentinazipcode.
- **Contrato:** Pendiente de documentación detallada

### toCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tocountrycode.
- **Contrato:** Pendiente de documentación detallada

### toE164Format
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toe164format.
- **Contrato:** Pendiente de documentación detallada

### toISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toisodatestring.
- **Contrato:** Pendiente de documentación detallada

### toNationalFormat
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tonationalformat.
- **Contrato:** Pendiente de documentación detallada

### unauthenticated
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para unauthenticated.
- **Contrato:** Pendiente de documentación detallada

### unwrapApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de unwrapapi.
- **Contrato:** Pendiente de documentación detallada

### unwrapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para unwraploadable.
- **Contrato:** Pendiente de documentación detallada

### validateIdForScope
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para validateidforscope en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validatePhoneList
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para validatephonelist en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### AUTH_URLS
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para auth urls.
- **Contrato:** Pendiente de documentación detallada

### BASE_URL_BY_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para base url by role.
- **Contrato:** Pendiente de documentación detallada

### HOME_BY_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para home by role.
- **Contrato:** Pendiente de documentación detallada

### PORTAL_TO_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para portal to role.
- **Contrato:** Pendiente de documentación detallada

### ensureClientEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureclientenv.
- **Contrato:** Pendiente de documentación detallada

### ensureEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureenv.
- **Contrato:** Pendiente de documentación detallada

### ensureServerEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureserverenv.
- **Contrato:** Pendiente de documentación detallada

### getCookieDomain
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getcookiedomain en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoginUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getloginurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPortalForRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getportalforrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleForPortal
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroleforportal en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getTargetUrlByRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para gettargeturlbyrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### isValidRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isvalidrole.
- **Contrato:** Pendiente de documentación detallada

### logger
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para logger.
- **Contrato:** Pendiente de documentación detallada

### validateEmail
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para validateemail.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironmentByType
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironmentbytype en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironmentSecurity
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironmentsecurity en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validatePhone
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para validatephone.
- **Contrato:** Pendiente de documentación detallada

### validateProductionEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateproductionenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateStagingEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validatestagingenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### APP_ALLOWED_ROLES
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para app_allowed_roles.
- **Contrato:** Pendiente de documentación detallada

### AuthError
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para autherror.
- **Contrato:** Pendiente de documentación detallada

### AuthProvider
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para authprovider.
- **Contrato:** Pendiente de documentación detallada

### ROLE_APP_MAPPING
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para role_app_mapping.
- **Contrato:** Pendiente de documentación detallada

### authMiddleware
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para authmiddleware.
- **Contrato:** Pendiente de documentación detallada

### clearLastPath
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para clearlastpath.
- **Contrato:** Pendiente de documentación detallada

### createAppMiddleware
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para createappmiddleware en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createBrowserClient
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para createbrowserclient.
- **Contrato:** Pendiente de documentación detallada

### getCorrectAppUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getcorrectappurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDefaultRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getdefaultredirecturl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDomainConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getdomain del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### getEnvironment
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLastPath
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getlastpath en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoginUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getloginurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getredirecturl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSessionConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getsession del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseClient
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getsupabaseclient en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getsupabase del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### isCorrectAppForRole
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para iscorrectappforrole.
- **Contrato:** Pendiente de documentación detallada

### isSameOrigin
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para issameorigin.
- **Contrato:** Pendiente de documentación detallada

### sanitizeReturnUrl
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para sanitizereturnurl.
- **Contrato:** Pendiente de documentación detallada

### signOutGlobally
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para signoutglobally.
- **Contrato:** Pendiente de documentación detallada

### storeLastPath
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para storelastpath.
- **Contrato:** Pendiente de documentación detallada

### useAuth
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de auth en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useRequireAuth
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de requireauth en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useRequireRole
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de requirerole en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useAppointments
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de appointments en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useAsync
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de async en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useDebounce
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de debounce en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### usePatients
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de patients en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada


## 📊 Database Schema

**Última actualización**: 2025-09-28
**Archivo fuente**: `database/schema.sql`
**Types generados**: `packages/types/src/supabase/database.types.ts`

### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario### 📋 Estructura de Base de Datos

- **Total de tablas**: 16
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

```bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
```

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con `@autamedica/types`
- ✅ Documentación automática en este glosario


## 📋 Exports Auto-generados

### ISODateTime
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Interfaz de datos para isodatetime en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### Tables
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Interfaz de datos para tables en el sistema médico.
- **Contrato:** Pendiente de documentación detallada

### TablesInsert
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tablesinsert.
- **Contrato:** Pendiente de documentación detallada

### TablesUpdate
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tablesupdate.
- **Contrato:** Pendiente de documentación detallada

### isProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### ICE_SERVERS
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para ice servers.
- **Contrato:** Pendiente de documentación detallada

### MemberRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para memberrole.
- **Contrato:** Pendiente de documentación detallada

### WebRTCDiagnostics
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para webrtcdiagnostics.
- **Contrato:** Pendiente de documentación detallada

### buildSafeLoginUrl
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para buildsafeloginurl.
- **Contrato:** Pendiente de documentación detallada

### canInviteMembers
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para caninvitemembers.
- **Contrato:** Pendiente de documentación detallada

### canManageBilling
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanagebilling.
- **Contrato:** Pendiente de documentación detallada

### canManageCompany
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanagecompany.
- **Contrato:** Pendiente de documentación detallada

### getAppUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getappurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getBaseUrlForRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getbaseurlforrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getClientEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getclientenvordefault en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getOptionalClientEnv
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getoptionalclientenv en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPortalUrlWithPath
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getportalurlwithpath en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getServerEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getserverenvordefault en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSession
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getsession en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### hasRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para hasrole.
- **Contrato:** Pendiente de documentación detallada

### isAllowedRedirect
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isallowedredirect.
- **Contrato:** Pendiente de documentación detallada

### isCorrectPortal
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para iscorrectportal.
- **Contrato:** Pendiente de documentación detallada

### safeRedirectOrFallback
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para saferedirectorfallback.
- **Contrato:** Pendiente de documentación detallada

### type Session
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type session.
- **Contrato:** Pendiente de documentación detallada

### type SessionRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type sessionrole.
- **Contrato:** Pendiente de documentación detallada

## 📋 Exports Auto-generados

### canAccessRecord
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canaccessrecord.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseErrorMessage
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getsupabaseerrormessage en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### isAppointmentStatus
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para isappointment en el sistema.
- **Contrato:** Pendiente de documentación detallada

### isAppointmentType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isappointmenttype.
- **Contrato:** Pendiente de documentación detallada

### isCompanyMemberRole
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscompanymemberrole.
- **Contrato:** Pendiente de documentación detallada

### isDoctorEducation
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctoreducation.
- **Contrato:** Pendiente de documentación detallada

### isHighSensitivityRecord
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishighsensitivityrecord.
- **Contrato:** Pendiente de documentación detallada

### isMedicalRecordVisibility
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ismedicalrecordvisibility.
- **Contrato:** Pendiente de documentación detallada

### isPatientCareTeamRole
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispatientcareteamrole.
- **Contrato:** Pendiente de documentación detallada

### isPrimaryDoctor
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprimarydoctor.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de issupabaseapi.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseError
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issupabaseerror.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issupabasesuccess.
- **Contrato:** Pendiente de documentación detallada

### isTerminalStatus
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para isterminal en el sistema.
- **Contrato:** Pendiente de documentación detallada

### requiresEquipment
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresequipment.
- **Contrato:** Pendiente de documentación detallada

<!-- MANUAL_DOCS_HIGH_PRIORITY:START -->

## 📚 **Documentación Detallada - Alta Prioridad**

### OrganizationId

**Paquete:** @autamedica/types
**Tipo/Función:** Type
**Estado:** ✅ Documentado

#### Descripción
Identificador único y opaco de **organización** (no secuencial, no predecible) usado en RLS y ownership.

#### Definición (TypeScript)
```ts
export type OrganizationId = UUID & { readonly __entity: "Organization" };
```

#### Reglas y Validaciones
* Debe ser un UUID válido con brand "Organization".
* Es **opaco** (no inferir significado del sufijo).
* Se usa como clave foránea en tablas con RLS por organización.

#### Relaciones
* Referenciado por: `CompanyProfile.organizationId`, membresías, registros médicos corporativos.

#### Ejemplos
```ts
const id: OrganizationId = createOrganizationId('01J9ZQ5F3YB4F2QG6ZP8T3M7');
```

### CompanyProfile

**Paquete:** @autamedica/types
**Tipo/Función:** Type
**Estado:** ✅ Documentado

#### Descripción
Perfil canónico de **empresa/cliente** dentro de una organización: datos legales, facturación y estado.

#### Definición (TypeScript)
```ts
export interface CompanyProfile {
  id: CompanyId;
  organizationId: OrganizationId;
  legalName: string;
  taxId?: string;             // CUIT/RUC/… según país
  countryCode: string;        // ISO-3166-1 alpha-2
  billingEmail?: string;
  active: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

#### Reglas y Validaciones
* `organizationId` obligatorio y válido.
* `countryCode` ISO-3166-1 (AR, EC, …).
* Si `taxId` existe → validar formato local (pendiente: validadores por país).

#### Relaciones
* `InsuranceInfo` puede asociarse a una `CompanyProfile`.
* RLS: acceso restringido por `organizationId`.

#### Ejemplos
```ts
const acme: CompanyProfile = {
  id: createCompanyId('e15b...'),
  organizationId: createOrganizationId('01J9ZQ5...'),
  legalName: 'ACME Salud S.A.',
  countryCode: 'AR',
  active: true,
  createdAt: '2025-09-20T12:00:00-03:00' as ISODateTime,
  updatedAt: '2025-09-28T09:10:00-03:00' as ISODateTime
};
```

### InsuranceInfo

**Paquete:** @autamedica/types
**Tipo/Función:** Type
**Estado:** ✅ Documentado

#### Descripción
Cobertura/plan de seguro médico asociado a un paciente o convenio empresa.

#### Definición (TypeScript)
```ts
export interface InsuranceInfo {
  provider: string;           // p.ej. "OSDE", "Swiss Medical"
  plan?: string;              // p.ej. "310"
  memberId?: string;          // credencial/afiliado
  validFrom?: ISODateTime;
  validTo?: ISODateTime;
}
```

#### Reglas y Validaciones
* Periodo válido: si hay `validTo`, debe ser >= `validFrom`.
* `provider` requerido.

#### Relaciones
* Usado en ficha de paciente y contratos empresa.

#### Ejemplos
```ts
const coverage: InsuranceInfo = {
  provider: 'OSDE',
  plan: '310',
  memberId: 'A1234567'
};
```

### ISODateTime

**Paquete:** @autamedica/types
**Tipo/Función:** Type
**Estado:** ✅ Documentado

#### Descripción
Timestamp ISO 8601 **con zona horaria**. Se usa en auditoría, agendas y RLS temporal.

#### Definición (TypeScript)
```ts
export type ISODateTime = string & { readonly __brand: "ISODateTime" };
```

#### Reglas y Validaciones
* Debe incluir offset (`-03:00`, `Z`, etc.).
* Recomendado: almacenar en UTC y renderizar con TZ del usuario.

#### Ejemplos
```ts
const when: ISODateTime = '2025-09-29T14:32:10-03:00' as ISODateTime;
```

### isValidRole

**Paquete:** @autamedica/types
**Tipo/Función:** Guard
**Estado:** ✅ Documentado

#### Descripción
Valida que un string pertenezca al set de **roles soportados**.

#### Definición (TypeScript)
```ts
export type UserRole = 'organization_admin' | 'company_admin' | 'company' | 'doctor' | 'patient';

export function isValidRole(x: unknown): x is UserRole;
```

#### Reglas y Validaciones
* Solo valores del union `UserRole`.
* Usar antes de rutear o conceder permisos.

#### Ejemplos
```ts
if (isValidRole(input)) { /* seguro */ } else { /* 400 Bad Request */ }
```

### isProfileComplete

**Paquete:** @autamedica/types
**Tipo/Función:** Validador
**Estado:** ✅ Documentado

#### Descripción
Chequea **completitud mínima** del perfil (según rol) para operar en producción.

#### Definición (TypeScript)
```ts
export interface Profile {
  user_id: UserId;
  email: string;
  role: UserRole;
}
export function isProfileComplete(p: Profile): boolean;
```

#### Reglas y Validaciones
* `doctor` → matrícula, especialidad y verificación documental.
* `patient` → datos personales mínimos + consentimiento.
* `company` → razón social + responsable legal.

#### Ejemplos
```ts
isProfileComplete(profile) // true/false según requisitos del rol
```

### canManageBilling

**Paquete:** @autamedica/types
**Tipo/Función:** Util/Permisos
**Estado:** ✅ Documentado

#### Descripción
Determina si el rol puede **gestionar facturación** (plan, cobros, medios de pago).

#### Definición (TypeScript)
```ts
export function canManageBilling(role: CompanyMemberRole): boolean;
```

#### Reglas
* `owner` y `admin` → `true`.
* Otros roles → `false`.

#### Ejemplos
```ts
if (!canManageBilling(role)) return res.status(403).end();
```

### canManageCompany

**Paquete:** @autamedica/types
**Tipo/Función:** Util/Permisos
**Estado:** ✅ Documentado

#### Descripción
Permite acciones administrativas sobre la **empresa** (invitaciones, roles, estado).

#### Definición (TypeScript)
```ts
export function canManageCompany(role: CompanyMemberRole): boolean;
```

#### Reglas
* `owner` y `admin` → `true`.

#### Ejemplos
```ts
if (!canManageCompany(userRole)) throw new Error('Insufficient permissions');
```

### getSession

**Paquete:** @autamedica/shared
**Tipo/Función:** Auth
**Estado:** ✅ Documentado

#### Descripción
Obtiene la **sesión actual** desde la cookie `am_session` (SSO), con tipado consistente para server/client.

#### Definición (TypeScript)
```ts
export interface TypedSession {
  userId: UserId;
  role: UserRole;
  issuedAt: ISODateTime;
}
export async function getSession(req: Request | NextRequest): Promise<TypedSession | null>;
```

#### Reglas
* Debe validar firma y caducidad.
* Nunca exponer secretos en cliente.

#### Ejemplos
```ts
const sess = await getSession(req);
if (!sess) return NextResponse.redirect('/login');
```

### hasRole

**Paquete:** @autamedica/shared
**Tipo/Función:** Auth/Permisos
**Estado:** ✅ Documentado

#### Descripción
Atajo para verificar si la sesión posee un **rol** requerido (o conjunto).

#### Definición (TypeScript)
```ts
export function hasRole(s: TypedSession | null, required: UserRole | UserRole[]): boolean;
```

#### Reglas
* `null` → `false`.
* Acepta uno o varios roles.

#### Ejemplos
```ts
if (!hasRole(sess, ['organization_admin','company_admin'])) return 403;
```

<!-- MANUAL_DOCS_HIGH_PRIORITY:END -->

## Índice de símbolos por paquete (auto)

- auth: `APP_ALLOWED_ROLES`, `AppName`, `AuthError`, `AuthErrorType`, `AuthProvider`, `AuthState`, `DomainConfig`, `Environment`, `ROLE_APP_MAPPING`, `RedirectConfig`, `SessionConfig`, `UserProfile`, `UserRole`, `authMiddleware`, `clearLastPath`, `createAppMiddleware`, `createBrowserClient`, `getCorrectAppUrl`, `getDefaultRedirectUrl`, `getDomainConfig`, `getEnvironment`, `getLastPath`, `getLoginUrl`, `getRedirectUrl`, `getSessionConfig`, `getSupabaseClient`, `getSupabaseConfig`, `isCorrectAppForRole`, `isSameOrigin`, `sanitizeReturnUrl`, `signOutGlobally`, `storeLastPath`, `useAuth`, `useRequireAuth`, `useRequireRole`
- hooks: `useAppointments`, `useAsync`, `useDebounce`, `usePatients`
- shared: `AppRole`, `AUTH_URLS`, `AVAILABLE_ROLES`, `BASE_URL_BY_ROLE`, `buildSafeLoginUrl`, `canAccessMedicalFeatures`, `canManageCompany`, `canManageOrganizations`, `EnvironmentConfig`, `EnvironmentValidation`, `HOME_BY_ROLE`, `ICE_SERVERS`, `LogLevel`, `Logger`, `PORTAL_TO_ROLE`, `requiresVerification`, `roleToPortal`, `roleToPortalDev`, `ensureClientEnv`, `safeRedirectOrFallback`, `ensureEnv`, `ensureServerEnv`, `getAppUrl`, `getBaseUrlForRole`, `getClientEnvOrDefault`, `getCookieDomain`, `getDefaultRedirectUrl`, `getOptionalClientEnv`, `getPortalUrlWithPath`, `getRoleDescription`, `getRoleDisplayName`, `getServerEnvOrDefault`, `getSession`, `getLoginUrl`, `getPortalForRole`, `getRoleForPortal`, `getTargetUrlByRole`, `hasAdminAccess`, `hasRole`, `isAllowedRedirect`, `isCorrectPortal`, `isValidRole`, `isValidUserRole`, `logger`, `validateEmail`, `validateEnvironment`, `validateEnvironmentByType`, `validateEnvironmentSecurity`, `validatePhone`, `typeSession`, `typeSessionRole`, `VERIFIED_ROLES`, `validateProductionEnvironment`, `WebRTCDiagnostics`, `validateStagingEnvironment`
- telemedicine: `HttpWebRTCClient`, `IceServerConfig`, `MediaControlsHook`, `RtcStatsData`, `RtcStatsHook`, `Signal`, `SignalKind`, `SignalingConfig`, `SignalingImplementation`, `SignalingTransport`, `TelemedicineClientHook`, `UnifiedVideoCall`, `UnifiedVideoCallProps`, `WebRTCClient`, `WebRTCConfig`, `WebRTCEvents`, `createSignalingTransport`, `createSignalingTransportFromEnv`, `getIceServersConfig`, `isSignal`, `useMediaControls`, `useRtcStats`, `useTelemedicineClient`, `validateIceServersConfig`
- types: `APPOINTMENT_STATUSES`, `APPOINTMENT_TYPES`, `ARGENTINA_INSURANCE_PROVIDERS`, `ARS`, `Address`, `Allergy`, `AllergySeverity`, `ApiError`, `ApiErrorCode`, `ApiResponse`, `Appointment`, `AppointmentId`, `AppointmentInsert`, `AppointmentStatus`, `AppointmentType`, `AppointmentUpdate`, `AppointmentWithDetails`, `ArrayElement`, `AsyncFunction`, `AsyncState`, `AutamedicaRecognition`, `AuthenticatedLoadable`, `BMI`, `BaseEntity`, `BloodType`, `Brand`, `CERTIFICATION_TYPES`, `COMPANY_MEMBER_ROLES`, `COMPANY_SIZES`, `Callback`, `CertificationId`, `Company`, `CompanyAddress`, `CompanyContact`, `CompanyId`, `CompanyInsert`, `CompanyMember`, `CompanyMemberInsert`, `CompanyMemberRole`, `CompanyMemberUpdate`, `CompanySize`, `CompanyUpdate`, `CompanyProfile`, `CompanyWithMembers`, `ComplianceInfo`, `Coordinates`, `CountryCode`, `CreateEntityInput`, `DNI`, `DataLoadingState`, `Database`, `DaySchedule`, `DiscriminateUnion`, `Doctor`, `DoctorAPIResponse`, `DoctorEducation`, `DoctorExperience`, `DoctorId`, `DoctorInsert`, `DoctorListAPIResponse`, `DoctorLookupResult`, `DoctorPrivateData`, `DoctorProfile`, `DoctorPublicAPIResponse`, `DoctorPublicProfile`, `DoctorPublicRating`, `DoctorRatingAPIResponse`, `DoctorRatingDisplay`, `DoctorUpdate`, `DoctorWithProfile`, `EmergencyContact`, `EmployeeId`, `EntityFilters`, `FacilityId`, `GENDERS`, `Gender`, `HeightCm`, `ICD10Code`, `ID_VALIDATION_CONFIG`, `ISODateTime`, `ISODateString`, `Id`, `InsurancePlan`, `InsuranceInfo`, `InsurancePolicyNumber`, `Json`, `JsonArray`, `JsonObject`, `JsonPrimitive`, `JsonValue`, `KeysOf`, `LICENSE_STATUS`, `LicenseProvinceCode`, `Loadable`, `LoadingState`, `MEDICAL_RECORD_VISIBILITIES`, `MEDICAL_SPECIALTIES`, `MapDiscriminatedUnion`, `Maybe`, `MedicalApiResponse`, `MedicalAudit`, `MedicalCertification`, `MedicalCondition`, `MedicalHistoryId`, `MedicalLicense`, `MedicalLicenseNumber`, `MedicalLoadable`, `MedicalRecord`, `MedicalRecordInsert`, `MedicalRecordNumber`, `MedicalRecordUpdate`, `MedicalRecordVisibility`, `MedicalRecordWithDetails`, `MedicalSpecialty`, `MedicalSubspecialty`, `Medication`, `MutableDeep`, `NationalPhone`, `NonEmptyArray`, `NonEmptyObject`, `NonEmptyString`, `NonNullable`, `Nullable`, `OrganizationId`, `Optional`, `PHONE_VALIDATION_CONFIG`, `PaginatedResponse`, `PaginationParams`, `Patient`, `PatientAPIResponse`, `PatientAddress`, `PatientAdminView`, `PatientCareTeam`, `PatientCareTeamInsert`, `PatientCareTeamUpdate`, `PatientCareTeamWithDetails`, `PatientCount`, `PatientId`, `PatientInsert`, `PatientListAPIResponse`, `PatientMedicalAPIResponse`, `PatientMedicalView`, `PatientPrivateData`, `PatientProfile`, `PatientPublicProfile`, `PatientReview`, `PatientUpdate`, `PatientVolumeMetrics`, `PatientCareTeamRole`, `PatientWithProfile`, `Percent0to100`, `Percentage`, `PhoneE164`, `Portal`, `PositiveNumber`, `Predicate`, `PrescriptionId`, `ProfessionalInsurance`, `Profile`, `ProfileInsert`, `ProfileUpdate`, `REVIEW_WINDOW_DAYS`, `ROLE_TO_PORTALS`, `RatingScore`, `ReadonlyDeep`, `RecognitionAPIResponse`, `ReviewId`, `ReviewListAPIResponse`, `ReviewSubmissionResult`, `SUBSPECIALTIES`, `SpecialtyCode`, `StateCode`, `SubspecialtyCode`, `SupabaseApiResponse`, `SupabasePaginatedResponse`, `Tables`, `TablesInsert`, `TablesUpdate`, `TenantId`, `ThrowsFunction`, `TimeHHmm`, `TimeSlot`, `USER_ROLES`, `UUID`, `UpdateEntityInput`, `User`, `UserId`, `UserProfile`, `UserRole`, `UserSession`, `ValuesOf`, `VitalSigns`, `VoidFunction`, `WeeklySchedule`, `WeightKg`, `ZipCode`, `acceptsInsurancePlan`, `canAccessRecord`, `canInviteMembers`, `canManageBilling`, `canManageCompany`, `calculateAge`, `calculateBMI`, `calculateMonthsActive`, `calculateOverallRating`, `calculatePatientReviewsScore`, `calculateRecognitionScore`, `calculateReviewsBreakdown`, `calculateRiskLevel`, `calculateTotalTrainingYears`, `calculateVolumePercentile`, `calculateVolumeScore`, `calculateYearsOfExperience`, `canAccessPortal`, `canPracticeInArgentina`, `canPracticeSpecialty`, `canReceiveTelemedicine`, `canSubmitReview`, `combineLoadables`, `createBasicAddress`, `createBasicSpecialty`, `createId`, `createMedicalAddress`, `createMedicalLicense`, `createMedicalView`, `createPublicProfile`, `createRatingDisplay`, `createValidatedId`, `extractCountryCode`, `extractPrivateData`, `extractProvinceFromLicense`, `fail`, `failWithCode`, `failure`, `flatMapLoadable`, `formatAddressString`, `formatMedicalLicense`, `formatPhoneForDisplay`, `generateAppointmentId`, `generateDisplayName`, `generateDoctorId`, `generatePatientId`, `generatePrefixedId`, `generateUUID`, `getAvailableSubspecialties`, `getLoadableValue`, `getPhoneExamples`, `getSupabaseErrorMessage`, `getRecognitionBadgeText`, `getSpecialtiesByCategory`, `getSpecialtiesRequiring`, `hasActiveAllergies`, `hasInsuranceCoverage`, `idle`, `isActiveLicense`, `isApiError`, `isApiSuccess`, `isAppointmentStatus`, `isAppointmentType`, `isAppointment`, `isArgentinaMobile`, `isArgentinaPhone`, `isArgentinaStateCode`, `isCompanyMemberRole`, `isArgentinaZipCode`, `isAvailableOnDay`, `isCompleteAddress`, `isCountryCode`, `isDoctor`, `isDoctorLicenseActive`, `isDoctorEducation`, `isDoctorProfileComplete`, `isEligibleForRecognition`, `isEntityActive`, `isEntityDeleted`, `isFailure`, `isHighRiskPatient`, `isHighSensitivityRecord`, `isISODateString`, `isTerminalStatus`, `isIdle`, `isLoading`, `isNonEmptyArray`, `isNonEmptyObject`, `isNonEmptyString`, `isNonNullable`, `isPrimaryDoctor`, `isPAMIEligible`, `isPatient`, `isPatientCareTeamRole`, `isMedicalRecordVisibility`, `isPercentage`, `isPhoneE164`, `isPositiveNumber`, `isProfileComplete`, `isProfile`, `isPublicHealthcareEligible`, `isSupabaseApiResponse`, `isSupabaseError`, `isSupabaseSuccess`, `isSuccess`, `isUnauthenticated`, `isValidBloodType`, `isValidCertification`, `isValidCoordinates`, `isValidDNI`, `isValidEmail`, `isValidMedicalLicense`, `isValidPhoneForCountry`, `isValidRatingScore`, `isValidSpecialtyCode`, `isValidRole`, `isValidSubspecialtyCode`, `isValidTimeHHmm`, `isValidURL`, `loading`, `mapApiResponse`, `mapLoadable`, `markEntityAsDeleted`, `matchAsyncState`, `matchAuthenticatedLoadable`, `matchDataLoadingState`, `matchLoadable`, `medicalFail`, `medicalOk`, `migrateToAddress`, `normalizePhoneNumber`, `nowAsISODateString`, `requiresEquipment`, `ok`, `requiresSpecializedCare`, `success`, `toArgentinaStateCode`, `toArgentinaZipCode`, `toCountryCode`, `toE164Format`, `toISODateString`, `toNationalFormat`, `unauthenticated`, `unwrapApiResponse`, `unwrapLoadable`, `validateIdForScope`, `validatePhoneList`
- ui: `Button`, `ButtonProps`, `Card`, `CardProps`, `FooterLink`, `FooterLinkProps`, `Input`, `InputProps`
- utils: (sin símbolos)



<!-- AUTOGEN_PACKAGES:END -->

## 📋 Exports Auto-generados

### //
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //.
- **Contrato:** Pendiente de documentación detallada

### //   ARGENTINA_INSURANCE_PROVIDERS
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   argentina_insurance_providers.
- **Contrato:** Pendiente de documentación detallada

### //   acceptsInsurancePlan
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   acceptsinsuranceplan.
- **Contrato:** Pendiente de documentación detallada

### //   calculateAge
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   calculateage.
- **Contrato:** Pendiente de documentación detallada

### //   calculateBMI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   calculatebmi.
- **Contrato:** Pendiente de documentación detallada

### //   calculateRiskLevel
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   calculaterisklevel.
- **Contrato:** Pendiente de documentación detallada

### //   calculateYearsOfExperience
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   calculateyearsofexperience.
- **Contrato:** Pendiente de documentación detallada

### //   canPracticeInArgentina
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   canpracticeinargentina.
- **Contrato:** Pendiente de documentación detallada

### //   canReceiveTelemedicine
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   canreceivetelemedicine.
- **Contrato:** Pendiente de documentación detallada

### //   createMedicalView
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   createmedicalview.
- **Contrato:** Pendiente de documentación detallada

### //   createPublicProfile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   createpublicprofile.
- **Contrato:** Pendiente de documentación detallada

### //   extractPrivateData
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   extractprivatedata.
- **Contrato:** Pendiente de documentación detallada

### //   generateDisplayName
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   generatedisplayname.
- **Contrato:** Pendiente de documentación detallada

### //   hasActiveAllergies
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   hasactiveallergies.
- **Contrato:** Pendiente de documentación detallada

### //   hasInsuranceCoverage
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   hasinsurancecoverage.
- **Contrato:** Pendiente de documentación detallada

### //   isAvailableOnDay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isavailableonday.
- **Contrato:** Pendiente de documentación detallada

### //   isDoctorLicenseActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isdoctorlicenseactive.
- **Contrato:** Pendiente de documentación detallada

### //   isDoctorProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isdoctorprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### //   isHighRiskPatient
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   ishighriskpatient.
- **Contrato:** Pendiente de documentación detallada

### //   isPAMIEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   ispamieligible.
- **Contrato:** Pendiente de documentación detallada

### //   isPublicHealthcareEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   ispublichealthcareeligible.
- **Contrato:** Pendiente de documentación detallada

### //   isValidBloodType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isvalidbloodtype.
- **Contrato:** Pendiente de documentación detallada

### //   isValidDNI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isvaliddni.
- **Contrato:** Pendiente de documentación detallada

### //   isValidEmail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isvalidemail.
- **Contrato:** Pendiente de documentación detallada

### //   isValidTimeHHmm
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isvalidtimehhmm.
- **Contrato:** Pendiente de documentación detallada

### //   isValidURL
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   isvalidurl.
- **Contrato:** Pendiente de documentación detallada

### //   requiresSpecializedCare
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para //   requiresspecializedcare.
- **Contrato:** Pendiente de documentación detallada

### AVAILABLE_ROLES
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para available roles.
- **Contrato:** Pendiente de documentación detallada

### VERIFIED_ROLES
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para verified roles.
- **Contrato:** Pendiente de documentación detallada

### canAccessMedicalFeatures
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canaccessmedicalfeatures.
- **Contrato:** Pendiente de documentación detallada

### canManageOrganizations
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanageorganizations.
- **Contrato:** Pendiente de documentación detallada

### getRoleDescription
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroledescription en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleDisplayName
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroledisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### hasAdminAccess
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para hasadminaccess.
- **Contrato:** Pendiente de documentación detallada

### isValidUserRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isvaliduserrole.
- **Contrato:** Pendiente de documentación detallada

### requiresVerification
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para requiresverification.
- **Contrato:** Pendiente de documentación detallada

### roleToPortal
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para roletoportal.
- **Contrato:** Pendiente de documentación detallada

### roleToPortalDev
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para roletoportaldev.
- **Contrato:** Pendiente de documentación detallada

### OrganizationId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único para organizaciones/empresas
- **Contrato:** UUID branded type para organization

### CompanyProfile
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Perfil completo de empresa en el sistema
- **Contrato:** Interface con datos de empresa

### InsuranceInfo
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Información de seguro médico
- **Contrato:** Interface con detalles de cobertura

### isValidRole
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida si un rol es válido en el sistema
- **Contrato:** Type guard para roles

### isProfileComplete
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica si un perfil está completo
- **Contrato:** Validador de completitud de perfil

### PatientCareTeamRole
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Roles del equipo de cuidado de pacientes
- **Contrato:** Union type de roles médicos

### isPatientCareTeamRole
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida si es un rol de equipo de cuidado
- **Contrato:** Type guard para roles de care team

### isPrimaryDoctor
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica si es el médico primario
- **Contrato:** Validador de rol de médico primario

### isDoctorEducation
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida educación médica
- **Contrato:** Type guard para educación

### isCompanyMemberRole
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida roles de miembros de empresa
- **Contrato:** Type guard para roles empresariales

### canManageBilling
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica permisos de gestión de facturación
- **Contrato:** Validador de permisos de billing

### canInviteMembers
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica permisos para invitar miembros
- **Contrato:** Validador de permisos de invitación

### canManageCompany
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica permisos de gestión de empresa
- **Contrato:** Validador de permisos administrativos

### isAppointmentType
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida tipos de cita médica
- **Contrato:** Type guard para appointment types

### isAppointmentStatus
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida estados de cita
- **Contrato:** Type guard para appointment status

### isTerminalStatus
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica si es un estado terminal
- **Contrato:** Validador de estados finales

### requiresEquipment
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica si requiere equipamiento
- **Contrato:** Validador de requerimientos de equipo

### isMedicalRecordVisibility
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida visibilidad de registros médicos
- **Contrato:** Type guard para visibility levels

### canAccessRecord
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica acceso a registros médicos
- **Contrato:** Validador de permisos de acceso

### isHighSensitivityRecord
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Verifica si es registro de alta sensibilidad
- **Contrato:** Validador de sensibilidad HIPAA

### isSupabaseApiResponse
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida respuestas de API Supabase
- **Contrato:** Type guard para Supabase responses

### isSupabaseError
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida errores de Supabase
- **Contrato:** Type guard para Supabase errors

### isSupabaseSuccess
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Valida éxito de operación Supabase
- **Contrato:** Type guard para success responses

### getSupabaseErrorMessage
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Extrae mensaje de error de Supabase
- **Contrato:** Helper para error messages

### ISODateTime
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Fecha y hora en formato ISO
- **Contrato:** Branded string type para ISO datetime

### getOptionalClientEnv
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene variable de entorno opcional del cliente
- **Contrato:** Helper para env vars opcionales

### getClientEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene env var del cliente con valor default
- **Contrato:** Helper con fallback

### getServerEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene env var del servidor con default
- **Contrato:** Helper server-side con fallback

### getPortalUrlWithPath
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Construye URL de portal con path
- **Contrato:** URL builder para portales

### isCorrectPortal
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Verifica si está en el portal correcto
- **Contrato:** Validador de portal actual

### isAllowedRedirect
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Valida si redirect es permitido
- **Contrato:** Security helper para redirects

### safeRedirectOrFallback
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Redirect seguro con fallback
- **Contrato:** Safe redirect helper

### buildSafeLoginUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Construye URL de login segura
- **Contrato:** Login URL builder

### getSession
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene sesión de usuario actual
- **Contrato:** Session accessor

### hasRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Verifica si usuario tiene rol
- **Contrato:** Role checker

### typeSession
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Type guard para sesión
- **Contrato:** Session type guard

### typeSessionRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Type guard para rol de sesión
- **Contrato:** Session role type guard

### getAppUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene URL de aplicación
- **Contrato:** App URL resolver

### getBaseUrlForRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene URL base según rol
- **Contrato:** Role-based URL resolver

### AppRole
- **Tipo:** type
- **Package:** @autamedica/shared
- **Descripción:** Roles de aplicación disponibles
- **Contrato:** Union type de app roles

### WebRTCDiagnostics
- **Tipo:** interface
- **Package:** @autamedica/shared
- **Descripción:** Diagnósticos de WebRTC
- **Contrato:** Interface para diagnósticos de video

### ICE_SERVERS
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Configuración de servidores ICE
- **Contrato:** Constante de configuración WebRTC

### getDefaultRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Obtiene URL de redirect por defecto
- **Contrato:** Default redirect resolver

## 🔗 Base de Datos
Ver glosario actualizado: [`docs/database/schema.md`](../docs/database/schema.md)
