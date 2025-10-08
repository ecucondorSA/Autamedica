/**
 * Audit Log types - Sistema de auditoría HIPAA
 *
 * Define tipos para el sistema de auditoría agregado en los parches de seguridad.
 * Cumple con requisitos HIPAA de rastreo de acciones sensibles.
 *
 * Tabla creada en: /tmp/autamedica_schema_patches.sql (patch #14)
 */

import type { UUID, ISODateString } from "../core/brand.types";

// ==========================================
// Audit Action Types
// ==========================================

/**
 * Tipos de acciones auditadas
 * Basado en operaciones CRUD + acciones médicas específicas
 */
export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "access_denied"
  | "export_data"
  | "print"
  | "share"
  | "prescribe"
  | "diagnose";

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  "create",
  "read",
  "update",
  "delete",
  "login",
  "logout",
  "access_denied",
  "export_data",
  "print",
  "share",
  "prescribe",
  "diagnose"
] as const;

/**
 * Tipos de recursos auditables
 * Recursos médicos sensibles que requieren auditoría
 */
export type AuditResourceType =
  | "medical_record"
  | "appointment"
  | "prescription"
  | "patient"
  | "doctor"
  | "profile"
  | "company"
  | "user_session"
  | "phi_data"; // Protected Health Information

export const AUDIT_RESOURCE_TYPES: readonly AuditResourceType[] = [
  "medical_record",
  "appointment",
  "prescription",
  "patient",
  "doctor",
  "profile",
  "company",
  "user_session",
  "phi_data"
] as const;

// ==========================================
// Core AuditLog Interface
// ==========================================

/**
 * Registro de auditoría - Refleja esquema real de tabla audit_logs
 *
 * CAMPOS según BD real:
 * - id: BIGSERIAL (number en TypeScript)
 * - ip_address: INET (string representation)
 * - metadata: JSONB (objeto genérico)
 * - created_at: TIMESTAMPTZ (solo lectura, generado automáticamente)
 *
 * NOTA: No tiene updated_at ni deleted_at porque es append-only (immutable)
 */
export interface AuditLog {
  id: string; // BIGSERIAL se mapea a string para evitar overflow en JS
  user_id: UUID | null;
  action: string; // TEXT field, pero idealmente usa AuditAction
  resource_type: string; // TEXT field, pero idealmente usa AuditResourceType
  resource_id: string | null;
  ip_address: string | null; // INET type, stored as string
  user_agent: string | null;
  metadata: Record<string, unknown> | null; // JSONB - flexible object
  created_at: ISODateString; // NOT NULL, auto-generated
}

// ==========================================
// Supabase DTOs
// ==========================================

/**
 * DTO para crear registro de auditoría
 * Usado por la función log_audit_action() del servidor
 */
export interface AuditLogInsert {
  user_id?: UUID | null;
  action: string; // Idealmente AuditAction
  resource_type: string; // Idealmente AuditResourceType
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Metadata típica para acciones médicas
 * Estructura recomendada para el campo metadata JSONB
 */
export interface MedicalActionMetadata {
  patient_id?: UUID;
  doctor_id?: UUID;
  diagnosis?: string;
  medication?: string;
  dosage?: string;
  reason?: string;
  notes?: string;
  duration?: number;
  severity?: "low" | "medium" | "high" | "critical";
  [key: string]: unknown; // Permite campos adicionales
}

/**
 * Metadata para acciones de autenticación
 */
export interface AuthActionMetadata {
  email?: string;
  role?: string;
  portal?: string;
  failed_attempts?: number;
  lockout?: boolean;
  mfa_used?: boolean;
  device_fingerprint?: string;
  [key: string]: unknown;
}

/**
 * Metadata para acciones de exportación de datos
 */
export interface DataExportMetadata {
  format?: "pdf" | "csv" | "json" | "xml";
  records_count?: number;
  date_range_start?: ISODateString;
  date_range_end?: ISODateString;
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

// ==========================================
// Query Filters & Helpers
// ==========================================

/**
 * Filtros para consultar logs de auditoría
 */
export interface AuditLogFilters {
  user_id?: UUID;
  action?: AuditAction | string;
  resource_type?: AuditResourceType | string;
  resource_id?: string;
  date_from?: ISODateString;
  date_to?: ISODateString;
  ip_address?: string;
  limit?: number;
  offset?: number;
}

/**
 * Resultado paginado de logs de auditoría
 */
export interface AuditLogPage {
  logs: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// ==========================================
// Type Guards
// ==========================================

export const isAuditLog = (v: unknown): v is AuditLog => {
  return (
    !!v &&
    typeof v === "object" &&
    "id" in v &&
    "action" in v &&
    "resource_type" in v &&
    "created_at" in v
  );
};

export const isAuditAction = (v: unknown): v is AuditAction => {
  return typeof v === "string" && AUDIT_ACTIONS.includes(v as AuditAction);
};

export const isAuditResourceType = (v: unknown): v is AuditResourceType => {
  return typeof v === "string" && AUDIT_RESOURCE_TYPES.includes(v as AuditResourceType);
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * Verifica si una acción es considerada crítica para HIPAA
 */
export const isCriticalAction = (action: AuditAction | string): boolean => {
  const criticalActions: AuditAction[] = [
    "delete",
    "export_data",
    "prescribe",
    "diagnose",
    "share"
  ];
  return criticalActions.includes(action as AuditAction);
};

/**
 * Verifica si un recurso contiene PHI (Protected Health Information)
 */
export const containsPHI = (resourceType: AuditResourceType | string): boolean => {
  const phiResources: AuditResourceType[] = [
    "medical_record",
    "prescription",
    "patient",
    "phi_data"
  ];
  return phiResources.includes(resourceType as AuditResourceType);
};

/**
 * Genera descripción legible de una acción de auditoría
 */
export const formatAuditDescription = (log: AuditLog): string => {
  const actionVerbs: Record<string, string> = {
    create: "creó",
    read: "consultó",
    update: "modificó",
    delete: "eliminó",
    login: "inició sesión en",
    logout: "cerró sesión en",
    access_denied: "intentó acceder sin autorización a",
    export_data: "exportó datos de",
    print: "imprimió",
    share: "compartió",
    prescribe: "prescribió",
    diagnose: "diagnosticó"
  };

  const verb = actionVerbs[log.action] || log.action;
  const resource = log.resource_type.replace("_", " ");

  if (log.resource_id) {
    return `${verb} ${resource} (ID: ${log.resource_id})`;
  }

  return `${verb} ${resource}`;
};
