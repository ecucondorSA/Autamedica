/**
 * @autamedica/types - Reproductive Health Types
 *
 * Tipos para el sistema de salud reproductiva (IVE/ILE)
 * según Ley 27.610 de Argentina
 */

import type { UUID, ISODateString, PatientId, DoctorId } from '../core/brand.types';
import type { Coordinates, Address } from '../core/location.types';
import type { PhoneE164 } from '../core/phone.types';

// ==========================================
// Especialistas en Salud Reproductiva
// ==========================================

export type ReproductiveHealthSpecialistId = UUID & { readonly __brand: 'ReproductiveHealthSpecialistId' };

export type SpecialistAvailabilityStatus = 'available' | 'busy' | 'offline';

export type ReproductiveHealthSpecialtyType =
  | 'gynecology'           // Ginecología
  | 'general_medicine'     // Medicina General
  | 'psychology'           // Psicología Perinatal
  | 'social_work'          // Trabajo Social
  | 'nursing';             // Enfermería

export interface ReproductiveHealthSpecialist {
  readonly id: ReproductiveHealthSpecialistId;
  readonly doctor_id: DoctorId;
  readonly specialty: ReproductiveHealthSpecialtyType;
  readonly is_certified_ive_ile: boolean;
  readonly availability_status: SpecialistAvailabilityStatus;
  readonly accepts_emergency_consultations: boolean;
  readonly rating: number; // 0-5
  readonly total_consultations: number;
  readonly years_of_experience: number;
  readonly languages: string[]; // ['es', 'en', 'pt']
  readonly bio: string;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

export interface ReproductiveHealthSpecialistWithProfile extends ReproductiveHealthSpecialist {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly phone?: PhoneE164;
  readonly profile_image_url?: string;
}

export interface ReproductiveHealthSpecialistInsert {
  readonly doctor_id: DoctorId;
  readonly specialty: ReproductiveHealthSpecialtyType;
  readonly is_certified_ive_ile: boolean;
  readonly bio: string;
  readonly languages?: string[];
}

// ==========================================
// Sistema de Citas para Salud Reproductiva
// ==========================================

export type ReproductiveHealthAppointmentId = UUID & { readonly __brand: 'ReproductiveHealthAppointmentId' };

export type AppointmentConsultationType =
  | 'information'          // Consulta informativa
  | 'pre_procedure'        // Pre-procedimiento
  | 'procedure_scheduling' // Agendar procedimiento
  | 'post_procedure'       // Seguimiento post-procedimiento
  | 'psychological'        // Apoyo psicológico
  | 'emergency';           // Emergencia

export type AppointmentModalityType =
  | 'video_call'           // Videollamada
  | 'phone_call'           // Llamada telefónica
  | 'in_person'            // Presencial
  | 'chat';                // Chat asíncrono

export type AppointmentStatusType =
  | 'scheduled'            // Agendada
  | 'confirmed'            // Confirmada
  | 'in_progress'          // En curso
  | 'completed'            // Completada
  | 'cancelled_by_patient' // Cancelada por paciente
  | 'cancelled_by_doctor'  // Cancelada por médico
  | 'no_show';             // Paciente no se presentó

export interface ReproductiveHealthAppointment {
  readonly id: ReproductiveHealthAppointmentId;
  readonly patient_id: PatientId;
  readonly specialist_id: ReproductiveHealthSpecialistId;
  readonly consultation_type: AppointmentConsultationType;
  readonly modality: AppointmentModalityType;
  readonly status: AppointmentStatusType;
  readonly scheduled_at: ISODateString;
  readonly duration_minutes: number;
  readonly meeting_url?: string; // Para videollamadas
  readonly notes_for_doctor?: string;
  readonly is_first_consultation: boolean;
  readonly requires_interpreter: boolean;
  readonly preferred_language: string;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

export interface ReproductiveHealthAppointmentInsert {
  readonly patient_id: PatientId;
  readonly specialist_id: ReproductiveHealthSpecialistId;
  readonly consultation_type: AppointmentConsultationType;
  readonly modality: AppointmentModalityType;
  readonly scheduled_at: ISODateString;
  readonly duration_minutes?: number; // Default 30
  readonly notes_for_doctor?: string;
  readonly requires_interpreter?: boolean;
  readonly preferred_language?: string; // Default 'es'
}

export interface ReproductiveHealthAppointmentUpdate {
  readonly status?: AppointmentStatusType;
  readonly scheduled_at?: ISODateString;
  readonly notes_for_doctor?: string;
  readonly meeting_url?: string;
}

export interface ReproductiveHealthAppointmentWithDetails extends ReproductiveHealthAppointment {
  readonly specialist_name: string;
  readonly specialist_specialty: ReproductiveHealthSpecialtyType;
  readonly patient_name: string;
}

// ==========================================
// Centros de Salud con Servicios IVE/ILE
// ==========================================

export type HealthCenterId = UUID & { readonly __brand: 'HealthCenterId' };

export type HealthCenterType =
  | 'public_hospital'      // Hospital público
  | 'health_center'        // Centro de salud
  | 'caps'                 // Centro de Atención Primaria de Salud
  | 'clinic'               // Clínica privada
  | 'ngo';                 // ONG

export interface HealthCenter {
  readonly id: HealthCenterId;
  readonly name: string;
  readonly type: HealthCenterType;
  readonly address: Address;
  readonly coordinates: Coordinates;
  readonly phone: PhoneE164;
  readonly email?: string;
  readonly website_url?: string;
  readonly offers_ive_ile: boolean;
  readonly offers_medication_method: boolean;
  readonly offers_surgical_method: boolean;
  readonly offers_psychological_support: boolean;
  readonly requires_appointment: boolean;
  readonly accepts_walk_ins: boolean;
  readonly has_24h_service: boolean;
  readonly operating_hours: OperatingHours;
  readonly average_wait_time_days: number;
  readonly accessibility_features: string[]; // ['wheelchair_accessible', 'sign_language']
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

export interface OperatingHours {
  readonly monday?: TimeRange;
  readonly tuesday?: TimeRange;
  readonly wednesday?: TimeRange;
  readonly thursday?: TimeRange;
  readonly friday?: TimeRange;
  readonly saturday?: TimeRange;
  readonly sunday?: TimeRange;
}

export interface TimeRange {
  readonly open: string;  // HH:mm format
  readonly close: string; // HH:mm format
}

export interface HealthCenterInsert {
  readonly name: string;
  readonly type: HealthCenterType;
  readonly address: Address;
  readonly coordinates: Coordinates;
  readonly phone: PhoneE164;
  readonly email?: string;
  readonly website_url?: string;
  readonly offers_medication_method?: boolean;
  readonly offers_surgical_method?: boolean;
  readonly offers_psychological_support?: boolean;
  readonly operating_hours?: OperatingHours;
}

export interface HealthCenterWithDistance extends HealthCenter {
  readonly distance_km: number;
  readonly travel_time_minutes?: number;
}

// ==========================================
// Chat Médico Asíncrono
// ==========================================

export type MedicalChatId = UUID & { readonly __brand: 'MedicalChatId' };
export type MedicalMessageId = UUID & { readonly __brand: 'MedicalMessageId' };

export type MessageAuthorType = 'patient' | 'doctor' | 'system';

export type MessageContentType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'system_notification';

export type ChatStatusType =
  | 'active'               // Chat activo
  | 'waiting_response'     // Esperando respuesta del médico
  | 'resolved'             // Consulta resuelta
  | 'closed';              // Chat cerrado

export interface MedicalChat {
  readonly id: MedicalChatId;
  readonly patient_id: PatientId;
  readonly specialist_id: ReproductiveHealthSpecialistId;
  readonly appointment_id?: ReproductiveHealthAppointmentId;
  readonly status: ChatStatusType;
  readonly subject: string;
  readonly is_urgent: boolean;
  readonly last_message_at: ISODateString;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

export interface MedicalMessage {
  readonly id: MedicalMessageId;
  readonly chat_id: MedicalChatId;
  readonly author_type: MessageAuthorType;
  readonly author_id: UUID; // PatientId o DoctorId
  readonly content_type: MessageContentType;
  readonly content: string;
  readonly attachment_url?: string;
  readonly is_read: boolean;
  readonly read_at?: ISODateString;
  readonly created_at: ISODateString;
}

export interface MedicalChatInsert {
  readonly patient_id: PatientId;
  readonly specialist_id: ReproductiveHealthSpecialistId;
  readonly subject: string;
  readonly is_urgent?: boolean;
}

export interface MedicalMessageInsert {
  readonly chat_id: MedicalChatId;
  readonly author_type: MessageAuthorType;
  readonly author_id: UUID;
  readonly content_type: MessageContentType;
  readonly content: string;
  readonly attachment_url?: string;
}

export interface MedicalChatWithLastMessage extends MedicalChat {
  readonly last_message_content: string;
  readonly last_message_author: MessageAuthorType;
  readonly unread_count: number;
  readonly specialist_name: string;
}

// ==========================================
// Geolocalización y Búsqueda
// ==========================================

export interface GeolocationQuery {
  readonly latitude: number;
  readonly longitude: number;
  readonly radius_km?: number; // Default 50km
  readonly max_results?: number; // Default 10
}

export interface HealthCenterSearchFilters {
  readonly type?: HealthCenterType[];
  readonly offers_medication_method?: boolean;
  readonly offers_surgical_method?: boolean;
  readonly accepts_walk_ins?: boolean;
  readonly has_24h_service?: boolean;
  readonly max_distance_km?: number;
  readonly min_rating?: number;
}

// ==========================================
// Estadísticas y Métricas
// ==========================================

export interface ReproductiveHealthStats {
  readonly total_consultations: number;
  readonly active_chats: number;
  readonly upcoming_appointments: number;
  readonly completed_appointments: number;
  readonly average_response_time_hours: number;
  readonly patient_satisfaction_score: number; // 0-5
}

export interface SpecialistAvailability {
  readonly specialist_id: ReproductiveHealthSpecialistId;
  readonly available_slots: AvailableSlot[];
  readonly earliest_available: ISODateString;
}

export interface AvailableSlot {
  readonly start_time: ISODateString;
  readonly end_time: ISODateString;
  readonly duration_minutes: number;
  readonly modality: AppointmentModalityType;
}

// ==========================================
// Type Guards
// ==========================================

export function isReproductiveHealthSpecialty(value: unknown): value is ReproductiveHealthSpecialtyType {
  return typeof value === 'string' && [
    'gynecology',
    'general_medicine',
    'psychology',
    'social_work',
    'nursing'
  ].includes(value);
}

export function isAppointmentConsultationType(value: unknown): value is AppointmentConsultationType {
  return typeof value === 'string' && [
    'information',
    'pre_procedure',
    'procedure_scheduling',
    'post_procedure',
    'psychological',
    'emergency'
  ].includes(value);
}

export function isHealthCenterType(value: unknown): value is HealthCenterType {
  return typeof value === 'string' && [
    'public_hospital',
    'health_center',
    'caps',
    'clinic',
    'ngo'
  ].includes(value);
}

export function isSpecialistAvailable(specialist: ReproductiveHealthSpecialist): boolean {
  return specialist.availability_status === 'available';
}

export function canAcceptEmergency(specialist: ReproductiveHealthSpecialist): boolean {
  return specialist.accepts_emergency_consultations && isSpecialistAvailable(specialist);
}

export function isChatActive(chat: MedicalChat): boolean {
  return chat.status === 'active' || chat.status === 'waiting_response';
}

export function requiresUrgentAttention(chat: MedicalChat): boolean {
  return chat.is_urgent && isChatActive(chat);
}

// ==========================================
// Helper Functions
// ==========================================

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  // Fórmula Haversine para calcular distancia entre dos puntos geográficos
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
    Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function sortByDistance<T extends { readonly distance_km: number }>(
  centers: T[]
): T[] {
  return [...centers].sort((a, b) => a.distance_km - b.distance_km);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export function estimateTravelTime(distanceKm: number, mode: 'walking' | 'driving' | 'transit' = 'driving'): number {
  // Estimación aproximada en minutos
  const speeds = {
    walking: 5,   // 5 km/h
    driving: 40,  // 40 km/h promedio urbano
    transit: 25   // 25 km/h promedio transporte público
  };

  return Math.round((distanceKm / speeds[mode]) * 60);
}

export function getSpecialtyDisplayName(specialty: ReproductiveHealthSpecialtyType): string {
  const names: Record<ReproductiveHealthSpecialtyType, string> = {
    gynecology: 'Ginecología',
    general_medicine: 'Medicina General',
    psychology: 'Psicología Perinatal',
    social_work: 'Trabajo Social',
    nursing: 'Enfermería'
  };
  return names[specialty];
}

export function getConsultationTypeDisplayName(type: AppointmentConsultationType): string {
  const names: Record<AppointmentConsultationType, string> = {
    information: 'Consulta Informativa',
    pre_procedure: 'Pre-Procedimiento',
    procedure_scheduling: 'Agendar Procedimiento',
    post_procedure: 'Seguimiento Post-Procedimiento',
    psychological: 'Apoyo Psicológico',
    emergency: 'Emergencia'
  };
  return names[type];
}
