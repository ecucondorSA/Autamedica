/**
 * Zod Validators Index
 *
 * Centraliza todos los schemas y parsers Zod
 * Schemas en snake_case (DB), parsers retornan camelCase (UI)
 */

// Appointment validators
export {
  AppointmentSnakeSchema,
  AppointmentInsertSnakeSchema,
  AppointmentUpdateSnakeSchema,
  parseAppointmentForUI,
  safeParseAppointmentForUI,
  parseAppointmentsForUI,
  isValidAppointmentForDisplay,
  requiresMeetingUrl,
  requiresPhysicalLocation,
  isTerminalStatus,
  isDurationConsistent,
  type AppointmentSnake,
  type AppointmentInsertSnake,
  type AppointmentUpdateSnake
} from './appointment.schema';

// Patient validators
export {
  PatientProfileSnakeSchema,
  PatientInsertSnakeSchema,
  PatientUpdateSnakeSchema,
  parsePatientForUI,
  safeParsePatientForUI,
  parsePatientsForUI,
  calculateAge,
  calculateBMI,
  isPatientProfileComplete,
  isMinor,
  requiresGuardianConsent,
  hasValidEmergencyContact,
  getBMICategory,
  hasInsurance,
  type PatientSnake,
  type PatientInsertSnake,
  type PatientUpdateSnake
} from './patient.schema';

// Company Member validators
export {
  CompanyMemberSnakeSchema,
  CompanyMemberInsertSnakeSchema,
  CompanyMemberUpdateSnakeSchema,
  parseCompanyMemberForUI,
  safeParseCompanyMemberForUI,
  parseCompanyMembersForUI,
  hasAdminPermissions as hasCompanyAdminPermissions,
  canManageMembers as canManageCompanyMembers,
  isActiveMember as isActiveCompanyMember,
  getEmploymentDuration,
  getYearsOfService,
  isOnProbation,
  getRoleDisplayName as getCompanyRoleDisplayName,
  getDepartmentDisplayName,
  isProfileComplete as isCompanyMemberProfileComplete,
  canApprovExpenses,
  hasAccessToSensitiveData,
  type CompanyMemberSnake,
  type CompanyMemberInsertSnake,
  type CompanyMemberUpdateSnake
} from './company-member.schema';
