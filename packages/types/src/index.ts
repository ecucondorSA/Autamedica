/**
 * @autamedica/types - Tipos centralizados para el ecosistema Autamedica
 *
 * Este package exporta todos los tipos fundamentales utilizados
 * en toda la plataforma médica de Autamedica.
 *
 * IMPORTANTE: Exports controlados - no usar export wildcard
 */

// ==========================================
// Tipos base y primitivos
// ==========================================

// Sistema de marcas (Brand Types)
export type {
  Brand,
  UUID,
  ISODateString,
  Id,
  PatientId,
  DoctorId,
  AppointmentId,
  FacilityId,
  PrescriptionId,
  MedicalHistoryId,
  CompanyId,
  OrganizationId,
  EmployeeId,
  TenantId,
  UserId,
} from './core/brand.types';

export {
  isISODateString,
  toISODateString,
  nowAsISODateString,
  createId,
  ID_VALIDATION_CONFIG,
  validateIdForScope,
  createValidatedId,
  generateUUID,
  generatePrefixedId,
  generatePatientId,
  generateDoctorId,
  generateAppointmentId,
} from './core/brand.types';

// Sistema de Perfiles Completos
export type {
  UserRole,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  DoctorProfile,
  DoctorInsert,
  DoctorWithProfile,
  PatientProfile,
  PatientInsert,
  PatientWithProfile,
  CompanyProfile,
  CompanyInsert,
  MedicalCertification,
  WeeklySchedule,
  DaySchedule,
  EmergencyContact,
  MedicalCondition,
  Allergy,
  Medication,
  InsuranceInfo,
  Gender,
} from './entities/profiles';

export {
  USER_ROLES,
  COMPANY_SIZES,
  GENDERS,
  isProfile,
  isValidRole,
  isProfileComplete,
} from './entities/profiles';

// Entidades base
export type {
  BaseEntity,
  CreateEntityInput,
  UpdateEntityInput,
  EntityFilters,
  PaginatedResponse,
  PaginationParams,
} from './core/base.types';

export {
  isEntityDeleted,
  isEntityActive,
  markEntityAsDeleted,
} from './core/base.types';

// Respuestas de API
export type {
  ApiErrorCode,
  ApiError,
  ApiResponse,
  MedicalApiResponse,
  MedicalAudit,
  ComplianceInfo,
} from './core/api.types';

export {
  ok,
  fail,
  failWithCode,
  isApiSuccess,
  isApiError,
  unwrapApiResponse,
  mapApiResponse,
  medicalOk,
  medicalFail,
} from './core/api.types';

// ==========================================
// Tipos utilitarios modernos
// ==========================================

// Utility types
export type {
  NonEmptyString,
  PositiveNumber,
  Percentage,
  JsonPrimitive,
  JsonValue,
  JsonObject,
  JsonArray,
  Nullable,
  Optional,
  Maybe,
  NonNullable,
  ReadonlyDeep,
  MutableDeep,
  NonEmptyArray,
  ArrayElement,
  KeysOf,
  ValuesOf,
  NonEmptyObject,
  VoidFunction,
  ThrowsFunction,
  AsyncFunction,
  Callback,
  Predicate,
  DiscriminateUnion,
  MapDiscriminatedUnion,
  LoadingState,
  DataLoadingState,
} from './core/utility.types';

// Location types
export type {
  CountryCode,
  StateCode,
  ZipCode,
  Coordinates,
  Address,
} from './core/location.types';

export {
  isCountryCode,
  isArgentinaStateCode,
  isValidCoordinates,
  isArgentinaZipCode,
  createBasicAddress,
  createMedicalAddress,
  toCountryCode,
  toArgentinaStateCode,
  toArgentinaZipCode,
  migrateToAddress,
  isCompleteAddress,
  formatAddressString,
} from './core/location.types';

// Phone types
export type {
  PhoneE164,
  NationalPhone,
} from './core/phone.types';

export {
  PHONE_VALIDATION_CONFIG,
  isPhoneE164,
  isValidPhoneForCountry,
  isArgentinaPhone,
  normalizePhoneNumber,
  toE164Format,
  toNationalFormat,
  formatPhoneForDisplay,
  extractCountryCode,
  isArgentinaMobile,
  getPhoneExamples,
  validatePhoneList,
} from './core/phone.types';

// ==========================================
// Medical types
// ==========================================

// Medical specialty types
export type {
  SpecialtyCode,
  MedicalLicenseNumber,
  SubspecialtyCode,
  CertificationId,
  MedicalSpecialty,
  MedicalSubspecialty,
  MedicalLicense,
} from './medical/specialty.types';

export {
  MEDICAL_SPECIALTIES,
  SUBSPECIALTIES,
  CERTIFICATION_TYPES,
  LICENSE_STATUS,
  isValidSpecialtyCode,
  isValidSubspecialtyCode,
  isValidMedicalLicense,
  isActiveLicense,
  isValidCertification,
  getSpecialtiesRequiring,
  getAvailableSubspecialties,
  formatMedicalLicense,
  extractProvinceFromLicense,
  calculateTotalTrainingYears,
  canPracticeSpecialty,
  getSpecialtiesByCategory,
  createBasicSpecialty,
  createMedicalLicense,
} from './medical/specialty.types';

// Doctor profile types (alternate definitions - solo tipos NO duplicados)
export type {
  TimeHHmm,
  ARS,
  LicenseProvinceCode,
  TimeSlot,
  ProfessionalInsurance,
  DoctorPublicProfile,
  DoctorPrivateData,
  DoctorLookupResult,
  DoctorAPIResponse,
  DoctorPublicAPIResponse,
  DoctorListAPIResponse,
} from './doctor/doctor.types';

export {
  isDoctorLicenseActive,
  isDoctorProfileComplete,
  canPracticeInArgentina,
  calculateYearsOfExperience,
  generateDisplayName,
  acceptsInsurancePlan,
  isAvailableOnDay,
  isValidTimeHHmm,
  isValidDNI,
  isValidEmail as isValidDoctorEmail,
  isValidURL as isValidDoctorURL,
  createPublicProfile,
  extractPrivateData,
} from './doctor/doctor.types';

// Patient profile types (alternate definitions - solo tipos NO duplicados)
export type {
  DNI,
  ICD10Code,
  MedicalRecordNumber,
  InsurancePolicyNumber,
  HeightCm,
  WeightKg,
  BMI,
  BloodType,
  AllergySeverity,
  VitalSigns,
  InsurancePlan,
  PatientPublicProfile,
  PatientMedicalView,
  PatientAdminView,
  PatientPrivateData,
  PatientAPIResponse,
  PatientMedicalAPIResponse,
  PatientListAPIResponse,
} from './patient/patient.types';

export {
  isValidBloodType,
  calculateBMI,
  calculateAge,
  calculateRiskLevel,
  hasActiveAllergies,
  isHighRiskPatient,
  requiresSpecializedCare,
  canReceiveTelemedicine,
  generateDisplayName as generatePatientDisplayName,
  ARGENTINA_INSURANCE_PROVIDERS,
  isPublicHealthcareEligible,
  isPAMIEligible,
  hasInsuranceCoverage,
  createPublicProfile as createPatientPublicProfile,
  createMedicalView,
  extractPrivateData as extractPatientPrivateData,
} from './patient/patient.types';

// Doctor rating system types
export type {
  RatingScore,
  PatientCount,
  ReviewId,
  Percent0to100,
  PatientReview,
  PatientVolumeMetrics,
  AutamedicaRecognition,
  DoctorPublicRating,
  DoctorRatingDisplay,
  DoctorRatingAPIResponse,
  ReviewSubmissionResult,
  RecognitionAPIResponse,
  ReviewListAPIResponse,
} from './doctor/rating.types';

export {
  REVIEW_WINDOW_DAYS,
  isValidRatingScore,
  canSubmitReview,
  calculatePatientReviewsScore,
  calculateReviewsBreakdown,
  calculateVolumeScore,
  calculateRecognitionScore,
  calculateOverallRating,
  calculateMonthsActive,
  isEligibleForRecognition,
  createRatingDisplay,
  getRecognitionBadgeText,
  calculateVolumePercentile,
} from './doctor/rating.types';

export {
  isNonEmptyString,
  isNonEmptyArray,
  isNonNullable,
  isNonEmptyObject,
  isPositiveNumber,
  isPercentage,
  matchDataLoadingState,
} from './core/utility.types';

// Loadable types para estados async
export type {
  Loadable,
  AsyncState,
  MedicalLoadable,
  AuthenticatedLoadable,
} from './core/loadable.types';

export {
  idle,
  loading,
  success,
  failure,
  unauthenticated,
  matchLoadable,
  matchAsyncState,
  matchAuthenticatedLoadable,
  isIdle,
  isLoading,
  isSuccess,
  isFailure,
  isUnauthenticated,
  mapLoadable,
  flatMapLoadable,
  combineLoadables,
  getLoadableValue,
  unwrapLoadable,
} from './core/loadable.types';

// ==========================================
// Re-exports de tipos de autenticación
// ==========================================

// Los tipos de roles se mantienen en @autamedica/auth
// pero se re-exportan aquí para conveniencia
// TODO: Quitar estos re-exports una vez que auth esté compilado
// export type { UserRole, Portal } from '@autamedica/auth';

// ==========================================
// TODO: Legacy types - migrar gradualmente
// ==========================================

// Auth legacy (deprecated - usar @autamedica/auth directamente)
export type {
  User,
  Portal,
  UserProfile,
  UserSession,
} from "./auth/user";

export { ROLE_TO_PORTALS, canAccessPortal } from "./auth/user";

// Patient types
export type {
  Patient,
  PatientAddress,
  EmergencyContact as LegacyEmergencyContact,
  PatientCareTeam,
  PatientCareTeamRole,
  PatientCareTeamInsert,
  PatientCareTeamUpdate,
  PatientCareTeamWithDetails,
  PatientUpdate
} from "./entities/patient";

export {
  isPatient,
  isPatientCareTeamRole,
  isPrimaryDoctor,
  mapDbPatientToPatient,
  mapDbPatientCareTeamToPatientCareTeam,
  mapPatientToDbInsert,
  mapPatientUpdateToDb
} from "./entities/patient";

// Doctor types
export type {
  Doctor,
  DoctorEducation,
  DoctorExperience,
  DoctorUpdate
} from "./entities/doctor";

export {
  isDoctor,
  isDoctorEducation
} from "./entities/doctor";

// Company types
export type {
  Company,
  CompanySize,
  CompanyAddress,
  CompanyContact,
  CompanyUpdate,
  CompanyWithMembers
} from "./entities/company";

// Appointment types
export type {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentWithDetails
} from "./entities/appointment";

export {
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUSES,
  isAppointment,
  isAppointmentType,
  isAppointmentStatus,
  isTerminalStatus,
  requiresMeetingUrl,
  requiresPhysicalLocation
} from "./entities/appointment";

// Audit Log types
export type {
  AuditLog,
  AuditAction,
  AuditResourceType,
  AuditLogInsert,
  MedicalActionMetadata,
  AuthActionMetadata,
  DataExportMetadata,
  AuditLogFilters,
  AuditLogPage
} from "./entities/audit-log";

export {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  isAuditLog,
  isAuditAction,
  isAuditResourceType,
  isCriticalAction,
  containsPHI,
  formatAuditDescription
} from "./entities/audit-log";

// Company Member types
export type {
  CompanyMember,
  CompanyMemberRole,
  CompanyMemberInsert,
  CompanyMemberUpdate,
  CompanyDepartment,
  CompanyMemberWithDetails,
  CompanyMemberFilters,
  CompanyMemberStats
} from "./entities/company-member";

export {
  COMPANY_MEMBER_ROLES,
  COMPANY_DEPARTMENTS,
  isCompanyMemberRole,
  isCompanyDepartment,
  hasAdminPermissions,
  canManageMembers,
  isActiveMember,
  getEmploymentDuration,
  getRoleDisplayName,
  getDepartmentDisplayName
} from "./entities/company-member";

// ==========================================
// Supabase Database Types
// ==========================================

// Core database interface and JSON type
export type { Database, Json } from './supabase/database.types';

// Import for internal use in helper types
import type { Database } from './supabase/database.types';

// Helper types for easier consumption (one source of truth)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Medical Record types
export type {
  MedicalRecord,
  MedicalRecordVisibility,
  MedicalRecordType,
  MedicalRecordInsert,
  MedicalRecordUpdate,
  MedicalRecordWithDetails
} from "./entities/medical-record";

export {
  MEDICAL_RECORD_VISIBILITIES,
  isMedicalRecordVisibility,
  canAccessRecord,
  isHighSensitivityRecord,
  isPermanentRecord
} from "./entities/medical-record";

// Supabase API Response types
export type {
  SupabaseApiResponse,
  SupabasePaginatedResponse
} from "./primitives/api-supabase";

export {
  isSupabaseApiResponse,
  isSupabaseError,
  isSupabaseSuccess,
  getSupabaseErrorMessage
} from "./primitives/api-supabase";

// Updated date types
export type { ISODateTime } from "./primitives/date";


// Convenient alias for timestamp fields (matches our generator)
// export type ISODateTime = string; // ISO 8601 DateTime (timestamptz) - Now imported from primitives

// Note: Only export what's actually available in database.types.ts
// The file is auto-generated and may not have all these exports yet

// ==========================================
// Reproductive Health Types (IVE/ILE - Ley 27.610)
// ==========================================

export type {
  ReproductiveHealthSpecialistId,
  SpecialistAvailabilityStatus,
  ReproductiveHealthSpecialtyType,
  ReproductiveHealthSpecialist,
  ReproductiveHealthSpecialistWithProfile,
  ReproductiveHealthSpecialistInsert,
  ReproductiveHealthAppointmentId,
  AppointmentConsultationType,
  AppointmentModalityType,
  AppointmentStatusType,
  ReproductiveHealthAppointment,
  ReproductiveHealthAppointmentInsert,
  ReproductiveHealthAppointmentUpdate,
  ReproductiveHealthAppointmentWithDetails,
  HealthCenterId,
  HealthCenterType,
  HealthCenter,
  OperatingHours,
  TimeRange,
  HealthCenterInsert,
  HealthCenterWithDistance,
  MedicalChatId,
  MedicalMessageId,
  MessageAuthorType,
  MessageContentType,
  ChatStatusType,
  MedicalChat,
  MedicalMessage,
  MedicalChatInsert,
  MedicalMessageInsert,
  MedicalChatWithLastMessage,
  GeolocationQuery,
  HealthCenterSearchFilters,
  ReproductiveHealthStats,
  SpecialistAvailability,
  AvailableSlot
} from './reproductive-health/reproductive-health.types';

export {
  isReproductiveHealthSpecialty,
  isAppointmentConsultationType,
  isHealthCenterType,
  isSpecialistAvailable,
  canAcceptEmergency,
  isChatActive,
  requiresUrgentAttention,
  calculateDistance,
  sortByDistance,
  formatDistance,
  estimateTravelTime,
  getSpecialtyDisplayName,
  getConsultationTypeDisplayName
} from './reproductive-health/reproductive-health.types';

// ==========================================
// Patient Portal Types (Anamnesis, Telemedicine, Community)
// ==========================================

// Anamnesis types
export type {
  AnamnesisId,
  AnamnesisSection,
  AnamnesisStatus,
  AnamnesisSectionStatus,
  Anamnesis,
  AnamnesisInsert,
  AnamnesisUpdate,
  PersonalDataSection,
  EmergencyContactSection,
  MedicalHistoryItem,
  FamilyHistoryItem,
  AllergyItem,
  CurrentMedicationItem,
  ChronicConditionItem,
  SurgicalHistoryItem,
  HospitalizationItem,
  GynecologicalHistorySection,
  LifestyleSection,
  MentalHealthSection,
  ConsentSection,
  AnamnesisSectionData,
  AnamnesisAPIResponse,
  AnamnesisProgressResponse,
} from './patient/anamnesis.types';

export {
  SECTION_ORDER,
  SECTION_DISPLAY_NAMES,
  isAnamnesisComplete,
  calculateSectionWeight,
  getNextPendingSection,
  canEditAnamnesis,
  requiresDoctorReview,
} from './patient/anamnesis.types';

// Telemedicine types
export type {
  TelemedicineSessionId,
  WebRTCPeerId,
  SignalingRoomId,
  SessionStatus,
  ConnectionQuality,
  ParticipantRole,
  TelemedicineSession,
  TelemedicineSessionMetadata,
  DeviceInfo,
  NetworkStats,
  VideoQualitySettings,
  AudioQualitySettings,
  SignalingMessage,
  SignalingMessageType,
  SignalingPayload,
  JoinPayload,
  LeavePayload,
  OfferPayload,
  AnswerPayload,
  ICECandidatePayload,
  RenegotiatePayload,
  MediaCapabilities,
  SessionParticipant,
  MediaState,
  RTCPeerConnectionState,
  SessionEvent,
  SessionEventType,
  TelemedicineQuickAction,
  QuickActionType,
  QuickActionData,
  WaitingRoomEntry,
  PreCallChecklist,
  TelemedicineSessionAPIResponse,
  StartSessionRequest,
  StartSessionResponse,
  TURNServerConfig,
  ICEServerConfig,
} from './patient/telemedicine.types';

export {
  isSessionActive,
  canJoinSession,
  getConnectionQualityScore,
  calculateSessionDuration,
  requiresRecordingConsent,
  getQualityRecommendation,
} from './patient/telemedicine.types';

// Community types
export type {
  CommunityGroupId,
  GroupMembershipId,
  PostId,
  CommentId,
  ReactionId,
  ReportId,
  CommunityNotificationId,
  CommunityGroup,
  GroupCategory,
  GroupRule,
  CommunityGroupInsert,
  GroupMembership,
  MemberRole,
  MembershipStatus,
  GroupMembershipInsert,
  CommunityPost,
  ModerationStatus,
  CommunityPostInsert,
  CommunityPostUpdate,
  PostComment,
  PostCommentInsert,
  PostCommentUpdate,
  PostReaction,
  ReactionType,
  PostReactionInsert,
  ContentReport,
  ReportReason,
  ReportStatus,
  ModerationAction,
  ContentReportInsert,
  CommunityNotification,
  CommunityNotificationType,
  UserReputation,
  ReputationBadge,
  CommunityFeedFilters,
  TrendingTopic,
  CommunityPostAPIResponse,
  CommunityFeedAPIResponse,
  CommunityGroupAPIResponse,
} from './patient/community.types';

export {
  GROUP_CATEGORIES_DISPLAY,
  REACTION_DISPLAY,
  canModerateContent,
  isContentApproved,
  requiresModerationReview,
  calculateReputationScore,
  canPostInGroup,
  anonymizeDisplayName,
  isHighRiskContent,
} from './patient/community.types';

// ==========================================
// Preventive Care Types (Medical Screenings)
// ==========================================

export type {
  PreventiveScreeningId,
  MedicalCaseId,
  ScreeningReminderNotificationId,
  GenderType,
  ScreeningCategoryType,
  ScreeningFrequencyType,
  RiskLevelType,
  ScreeningStatusType,
  PreventiveScreening,
  PatientScreening,
  RiskFactor,
  PatientRiskFactor,
  ScreeningReminderNotification,
  MedicalCase,
  MedicalCaseSection,
  PreventiveScreeningInsert,
  PatientScreeningInsert,
  PatientRiskFactorInsert,
  ScreeningReminderNotificationInsert,
  PatientScreeningWithDetails,
  PreventiveScreeningWithStats,
  AgeRange,
  ScreeningRecommendation,
  ScreeningCatalogKey
} from './preventive-care/preventive-care.types';

export {
  isScreeningApplicable,
  calculateNextDueDate,
  calculateAge as preventiveCareCalculateAge,
  calculateUrgency,
  SCREENING_CATALOG
} from './preventive-care/preventive-care.types';

// ==========================================
// Zod Validators (Runtime validation with boundary transformation)
// ==========================================

// Appointment validators
export {
  AppointmentSnakeSchema,
  AppointmentInsertSnakeSchema,
  AppointmentUpdateSnakeSchema,
  parseAppointmentForUI,
  safeParseAppointmentForUI,
  parseAppointmentsForUI,
  isValidAppointmentForDisplay,
  requiresMeetingUrl as appointmentRequiresMeetingUrl,
  requiresPhysicalLocation as appointmentRequiresPhysicalLocation,
  isTerminalStatus as appointmentIsTerminalStatus,
  isDurationConsistent as appointmentIsDurationConsistent,
  type AppointmentSnake,
  type AppointmentInsertSnake,
  type AppointmentUpdateSnake
} from './validators/appointment.schema';

// Patient validators
export {
  PatientProfileSnakeSchema,
  PatientInsertSnakeSchema,
  PatientUpdateSnakeSchema,
  parsePatientForUI,
  safeParsePatientForUI,
  parsePatientsForUI,
  calculateAge as patientCalculateAge,
  calculateBMI as patientCalculateBMI,
  isPatientProfileComplete as patientIsProfileComplete,
  isMinor as patientIsMinor,
  requiresGuardianConsent as patientRequiresGuardianConsent,
  hasValidEmergencyContact as patientHasValidEmergencyContact,
  getBMICategory as patientGetBMICategory,
  hasInsurance as patientHasInsurance,
  type PatientSnake,
  type PatientInsertSnake,
  type PatientUpdateSnake
} from './validators/patient.schema';

// Company Member validators
export {
  CompanyMemberSnakeSchema,
  CompanyMemberInsertSnakeSchema,
  CompanyMemberUpdateSnakeSchema,
  parseCompanyMemberForUI,
  safeParseCompanyMemberForUI,
  parseCompanyMembersForUI,
  getYearsOfService,
  isOnProbation,
  canApprovExpenses,
  hasAccessToSensitiveData,
  type CompanyMemberSnake,
  type CompanyMemberInsertSnake,
  type CompanyMemberUpdateSnake
} from './validators/company-member.schema';

// ==========================================
// Auta IA - Chat médico persistente
// ==========================================

export type {
  TAutaMessageRole,
  TAutaConversationStatus,
  TAutaIntent,
  TAutaMessage,
  TAutaConversation,
  TAutaAISettings,
  TAutaAIUsage,
  TAutaChatRequest,
  TAutaChatResponse,
  TPatientContext,
  TAutaConversationWithMessages,
} from './auta-ai';

export {
  AutaMessageRole,
  AutaConversationStatus,
  AutaIntent,
  AutaMessage,
  AutaConversation,
  AutaAISettings,
  AutaAIUsage,
  AutaChatRequest,
  AutaChatResponse,
  PatientContext,
  AutaConversationWithMessages,
} from './auta-ai';
