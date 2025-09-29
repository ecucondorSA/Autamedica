/**
 * Sistema de roles para Autamedica
 *
 * Define los roles disponibles en el sistema usando literales de cadena
 * para mejor tree-shaking, interoperabilidad runtime y performance.
 */

/**
 * Roles disponibles en el sistema Autamedica
 *
 * Cada rol tiene acceso a diferentes portales y funcionalidades:
 * - patient: Portal de pacientes, gestión de citas y historial médico
 * - doctor: Portal médico, consultas, prescripciones y telemedicina
 * - company: Personal corporativo sin permisos de administración
 * - company_admin: Alias legado (redirigido a organization_admin)
 * - organization_admin: Gestión de organizaciones, staff y facturación
 * - admin: Operaciones internas / soporte
 * - platform_admin: Administración completa de la plataforma
 */
export const ROLES = {
  /** Paciente - acceso a portal de pacientes */
  PATIENT: 'patient',

  /** Médico - acceso a portal médico y herramientas clínicas */
  DOCTOR: 'doctor',

  /** Personal corporativo sin permisos de administración */
  COMPANY: 'company',

  /** Alias legado para company_admin (se normaliza a organization_admin) */
  COMPANY_ADMIN: 'company_admin',

  /** Administrador de organización - gestión multiusuario */
  ORGANIZATION_ADMIN: 'organization_admin',

  /** Administrador interno - soporte / operaciones */
  ADMIN: 'admin',

  /** Administrador de plataforma - acceso completo al sistema */
  PLATFORM_ADMIN: 'platform_admin',
} as const;

/**
 * Tipo de rol de usuario derivado de los valores de ROLES
 */
export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Array de todos los roles disponibles para iteración
 */
export const ALL_ROLES: UserRole[] = Object.values(ROLES);

/**
 * Portales disponibles en el sistema
 * Cada portal corresponde típicamente a un rol específico
 */
export const PORTALS = {
  /** Portal para pacientes */
  PATIENTS: 'patients',

  /** Portal para médicos */
  DOCTORS: 'doctors',

  /** Portal para empresas */
  COMPANIES: 'companies',

  /** Portal de administración */
  ADMIN: 'admin',
} as const;

/**
 * Tipo de portal derivado de los valores de PORTALS
 */
export type Portal = typeof PORTALS[keyof typeof PORTALS];

/**
 * Mapeo de roles a sus portales correspondientes
 */
export const ROLE_TO_PORTAL: Record<UserRole, Portal> = {
  [ROLES.PATIENT]: PORTALS.PATIENTS,
  [ROLES.DOCTOR]: PORTALS.DOCTORS,
  [ROLES.COMPANY]: PORTALS.COMPANIES,
  [ROLES.COMPANY_ADMIN]: PORTALS.COMPANIES,
  [ROLES.ORGANIZATION_ADMIN]: PORTALS.ADMIN,
  [ROLES.ADMIN]: PORTALS.ADMIN,
  [ROLES.PLATFORM_ADMIN]: PORTALS.ADMIN,
} as const;

/**
 * Mapeo inverso de portales a roles
 */
export const PORTAL_TO_ROLE: Record<Portal, UserRole> = {
  [PORTALS.PATIENTS]: ROLES.PATIENT,
  [PORTALS.DOCTORS]: ROLES.DOCTOR,
  [PORTALS.COMPANIES]: ROLES.ORGANIZATION_ADMIN,
  [PORTALS.ADMIN]: ROLES.PLATFORM_ADMIN,
} as const;

// ==========================================
// Guards y validadores runtime
// ==========================================

/**
 * Type guard para verificar si un string es un rol válido
 *
 * @param value - Valor a verificar
 * @returns true si es un rol válido
 */
export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && ALL_ROLES.includes(value as UserRole);
};

/**
 * Type guard para verificar si un string es un portal válido
 *
 * @param value - Valor a verificar
 * @returns true si es un portal válido
 */
export const isPortal = (value: unknown): value is Portal => {
  return typeof value === 'string' &&
         Object.values(PORTALS).includes(value as Portal);
};

/**
 * Obtiene el portal correspondiente a un rol
 *
 * @param role - Rol del usuario
 * @returns Portal correspondiente al rol
 */
export const getPortalForRole = (role: UserRole): Portal => {
  return ROLE_TO_PORTAL[role];
};

/**
 * Obtiene el rol correspondiente a un portal
 *
 * @param portal - Portal solicitado
 * @returns Rol correspondiente al portal
 */
export const getRoleForPortal = (portal: Portal): UserRole => {
  return PORTAL_TO_ROLE[portal];
};

// ==========================================
// Utilidades de autorización
// ==========================================

/**
 * Verifica si un rol tiene acceso administrativo
 *
 * @param role - Rol a verificar
 * @returns true si el rol tiene permisos administrativos
 */
export const isAdminRole = (role: UserRole): boolean => {
  return (
    role === ROLES.ORGANIZATION_ADMIN ||
    role === ROLES.COMPANY_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.PLATFORM_ADMIN
  );
};

/**
 * Verifica si un rol tiene acceso médico
 *
 * @param role - Rol a verificar
 * @returns true si el rol tiene permisos médicos
 */
export const isMedicalRole = (role: UserRole): boolean => {
  return role === ROLES.DOCTOR || role === ROLES.PLATFORM_ADMIN;
};

/**
 * Verifica si un rol puede acceder a datos de pacientes
 *
 * @param role - Rol a verificar
 * @returns true si puede acceder a datos de pacientes
 */
export const canAccessPatientData = (role: UserRole): boolean => {
  return (
    role === ROLES.DOCTOR ||
    role === ROLES.ORGANIZATION_ADMIN ||
    role === ROLES.COMPANY_ADMIN ||
    role === ROLES.PLATFORM_ADMIN
  );
};

/**
 * Verifica si un rol puede gestionar la plataforma
 *
 * @param role - Rol a verificar
 * @returns true si puede gestionar la plataforma
 */
export const canManagePlatform = (role: UserRole): boolean => {
  return role === ROLES.PLATFORM_ADMIN;
};

/**
 * Obtiene los permisos base para un rol
 *
 * @param role - Rol del usuario
 * @returns Array de permisos base
 */
export const getBasePermissions = (role: UserRole): string[] => {
  const basePermissions: Record<UserRole, string[]> = {
    [ROLES.PATIENT]: [
      'read:own_profile',
      'update:own_profile',
      'read:own_appointments',
      'create:appointments',
      'read:own_medical_history',
    ],
    [ROLES.DOCTOR]: [
      'read:own_profile',
      'update:own_profile',
      'read:patients',
      'read:appointments',
      'create:appointments',
      'update:appointments',
      'create:prescriptions',
      'read:medical_history',
      'create:medical_records',
    ],
    [ROLES.COMPANY]: [
      'read:own_profile',
      'update:own_profile',
      'read:organization_announcements',
    ],
    [ROLES.COMPANY_ADMIN]: [
      'read:own_company',
      'update:own_company',
      'read:employees',
      'create:employees',
      'update:employees',
      'read:company_reports',
      'read:billing',
    ],
    [ROLES.ORGANIZATION_ADMIN]: [
      'read:own_company',
      'update:own_company',
      'manage:organization_members',
      'read:employees',
      'update:employees',
      'read:company_reports',
      'read:billing',
      'manage:role_assignments',
    ],
    [ROLES.ADMIN]: [
      'read:all',
      'update:all',
      'manage:organizations',
      'manage:billing',
    ],
    [ROLES.PLATFORM_ADMIN]: [
      'read:all',
      'create:all',
      'update:all',
      'delete:all',
      'manage:platform',
      'read:system_logs',
    ],
  };

  return basePermissions[role] || [];
};

/**
 * Verifica si un rol tiene un permiso específico
 *
 * @param role - Rol del usuario
 * @param permission - Permiso a verificar
 * @returns true si el rol tiene el permiso
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = getBasePermissions(role);

  // Platform admin tiene todos los permisos
  if (role === ROLES.PLATFORM_ADMIN) {
    return true;
  }

  return permissions.includes(permission);
};

/**
 * Verifica si un rol puede acceder a un portal específico
 *
 * @param role - Rol del usuario
 * @param portal - Portal al que quiere acceder
 * @returns true si el rol puede acceder al portal
 */
export const canAccessPortal = (role: UserRole, portal: Portal): boolean => {
  // Platform admin puede acceder a todos los portales
  if (role === ROLES.PLATFORM_ADMIN) {
    return true;
  }

  // Verificar acceso directo (rol corresponde al portal)
  const primaryPortal = getPortalForRole(role);
  if (primaryPortal === portal) {
    return true;
  }

  // Accesos cruzados específicos
  switch (role) {
    case ROLES.DOCTOR:
      // Los médicos pueden acceder al portal de administración para configuración
      return portal === PORTALS.ADMIN || portal === PORTALS.DOCTORS;

    case ROLES.COMPANY:
      return portal === PORTALS.COMPANIES;

    case ROLES.COMPANY_ADMIN:
      // Alias legacy, mismo comportamiento que organization_admin
      return portal === PORTALS.COMPANIES || portal === PORTALS.ADMIN;

    case ROLES.ORGANIZATION_ADMIN:
      return portal === PORTALS.COMPANIES || portal === PORTALS.ADMIN;

    case ROLES.ADMIN:
      return portal === PORTALS.ADMIN;

    case ROLES.PATIENT:
      // Los pacientes solo pueden acceder a su portal
      return portal === PORTALS.PATIENTS;

    default:
      return false;
  }
};
