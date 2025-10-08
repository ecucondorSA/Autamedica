/**
 * Tipos y validadores para Auta IA - Chat médico persistente
 * @package @autamedica/types
 */

import { z } from "zod";

// ====================================================================================
// ENUMS Y CONSTANTES
// ====================================================================================

/**
 * Roles de mensajes en el chat
 */
export const AutaMessageRole = z.enum(["user", "assistant", "system"]);
export type TAutaMessageRole = z.infer<typeof AutaMessageRole>;

/**
 * Estados de conversación
 */
export const AutaConversationStatus = z.enum(["active", "archived"]);
export type TAutaConversationStatus = z.infer<typeof AutaConversationStatus>;

/**
 * Intenciones posibles (desde intent-classifier.ts)
 */
export const AutaIntent = z.enum([
  "medications",
  "vitals",
  "appointments",
  "screenings",
  "symptoms",
  "reproductive",
  "allergies",
  "progress",
  "community",
  "platform",
  "greeting",
  "closing",
  "general",
  "unknown",
]);
export type TAutaIntent = z.infer<typeof AutaIntent>;

// ====================================================================================
// SCHEMAS PRINCIPALES
// ====================================================================================

/**
 * Mensaje individual en una conversación
 */
export const AutaMessage = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: AutaMessageRole,
  content: z.string().min(1),
  intent: AutaIntent.optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  processing_time_ms: z.number().int().nonnegative().optional().nullable(),
  tokens_prompt: z.number().int().nonnegative().optional().nullable(),
  tokens_completion: z.number().int().nonnegative().optional().nullable(),
  created_at: z.string(), // ISODateString
  deleted_at: z.string().optional().nullable(),
  deleted_by: z.string().uuid().optional().nullable(),
});

export type TAutaMessage = z.infer<typeof AutaMessage>;

/**
 * Conversación (agrupación de mensajes)
 */
export const AutaConversation = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  started_at: z.string(), // ISODateString
  last_message_at: z.string(), // ISODateString
  status: AutaConversationStatus,
  context_snapshot: z.any().nullable(), // JSONB - snapshot del estado del paciente
  message_count: z.number().int().nonnegative(),
  deleted_at: z.string().optional().nullable(),
  deleted_by: z.string().uuid().optional().nullable(),
});

export type TAutaConversation = z.infer<typeof AutaConversation>;

/**
 * Configuración de Auta IA por paciente
 */
export const AutaAISettings = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  personalize: z.boolean(),
  retain_days: z.number().int().positive().max(3650),
  allow_clinical_summaries: z.boolean(),
  allow_training: z.boolean(), // REQUIERE consentimiento explícito
  created_at: z.string(), // ISODateString
  updated_at: z.string(), // ISODateString
});

export type TAutaAISettings = z.infer<typeof AutaAISettings>;

/**
 * Registro de uso de IA (auditoría de tokens y costos)
 */
export const AutaAIUsage = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  message_id: z.string().uuid().nullable(),
  model: z.string().min(1),
  provider: z.string().min(1),
  tokens_input: z.number().int().nonnegative(),
  tokens_output: z.number().int().nonnegative(),
  latency_ms: z.number().int().nonnegative().nullable(),
  cost_usd: z.number().nonnegative().nullable(),
  created_at: z.string(), // ISODateString
});

export type TAutaAIUsage = z.infer<typeof AutaAIUsage>;

// ====================================================================================
// TIPOS PARA API REQUESTS/RESPONSES
// ====================================================================================

/**
 * Request para enviar mensaje a Auta
 */
export const AutaChatRequest = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  patientId: z.string().uuid(),
  message: z.string().min(1).max(10000),
});

export type TAutaChatRequest = z.infer<typeof AutaChatRequest>;

/**
 * Response de Auta
 */
export const AutaChatResponse = z.object({
  conversationId: z.string().uuid(),
  answer: z.string(),
  intent: AutaIntent.optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  processing_time_ms: z.number().int().nonnegative().optional().nullable(),
  suggested_actions: z.array(
    z.object({
      label: z.string(),
      action: z.string(),
    })
  ).optional(),
});

export type TAutaChatResponse = z.infer<typeof AutaChatResponse>;

/**
 * Contexto del paciente para construcción de prompts
 */
export const PatientContext = z.object({
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      nextDose: z.string().optional(),
    })
  ).optional(),
  vitals: z.object({
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
      date: z.string(),
    }).optional(),
    heartRate: z.object({
      bpm: z.number(),
      date: z.string(),
    }).optional(),
    temperature: z.object({
      celsius: z.number(),
      date: z.string(),
    }).optional(),
  }).optional(),
  appointments: z.array(
    z.object({
      date: z.string(),
      doctor: z.string(),
      specialty: z.string(),
      status: z.enum(["scheduled", "completed", "cancelled"]),
    })
  ).optional(),
  screenings: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["completed", "due", "upcoming", "overdue"]),
      lastCompleted: z.string().optional(),
      nextDue: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  allergies: z.array(z.string()).optional(),
  progress: z.object({
    level: z.number().int().nonnegative(),
    streak: z.number().int().nonnegative(),
    longestStreak: z.number().int().nonnegative(),
    completedScreenings: z.number().int().nonnegative(),
    totalScreenings: z.number().int().nonnegative(),
  }).optional(),
});

export type TPatientContext = z.infer<typeof PatientContext>;

// ====================================================================================
// TIPOS PARA CONVERSACIÓN CON MENSAJES (JOIN)
// ====================================================================================

/**
 * Conversación con sus mensajes incluidos
 */
export const AutaConversationWithMessages = AutaConversation.extend({
  messages: z.array(AutaMessage),
});

export type TAutaConversationWithMessages = z.infer<typeof AutaConversationWithMessages>;

// ====================================================================================
// EXPORTS CONSOLIDADOS
// ====================================================================================

export {
  // Schemas principales
  AutaMessage,
  AutaConversation,
  AutaAISettings,
  AutaAIUsage,
  // API types
  AutaChatRequest,
  AutaChatResponse,
  PatientContext,
  AutaConversationWithMessages,
  // Enums
  AutaMessageRole,
  AutaConversationStatus,
  AutaIntent,
};
