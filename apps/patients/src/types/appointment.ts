/**
 * Tipos para el sistema de citas médicas
 */

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type AppointmentType = 'telemedicine' | 'in_person' | 'emergency' | 'follow_up' | 'consultation';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string; // ISO date string
  duration_minutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes: string | null;
  reason: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  meeting_url?: string | null;
  location?: string | null;
  end_time?: string | null;
  start_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentInput {
  doctor_id?: string | null;
  scheduled_at: string;
  duration_minutes?: number;
  type?: AppointmentType;
  notes?: string;
  reason?: string;
  meeting_url?: string;
  location?: string;
}

export interface UpdateAppointmentInput {
  scheduled_at?: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  notes?: string;
  reason?: string;
  diagnosis?: string;
  treatment_plan?: string;
  meeting_url?: string | null;
  location?: string | null;
}

export interface AppointmentWithDoctor extends Appointment {
  doctor?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    specialty: string | null;
    profile_picture_url: string | null;
  } | null;
}
