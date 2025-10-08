import { selectActive, selectById, insertRecord, updateRecord, softDelete } from '@autamedica/shared';
import type { Tables, TablesInsert, TablesUpdate } from '@autamedica/types';

/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 * - Usa softDelete() en lugar de DELETE hard
 */

// Row = lectura (snake_case), Insert = creación, Update = parches
export type Appointment = Tables<'appointments'>;
export type NewAppointment = TablesInsert<'appointments'>;
export type PatchAppointment = TablesUpdate<'appointments'>;

// Tipo UI (camelCase) para Appointment
interface UiAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  type: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export async function listAppointments(): Promise<UiAppointment[]> {
  const data = await selectActive<UiAppointment>('appointments', '*', {
    orderBy: { column: 'start_time', ascending: true }
  });
  return data;
}

export async function getAppointment(id: string): Promise<UiAppointment | null> {
  try {
    const data = await selectById<UiAppointment>('appointments', id);
    return data;
  } catch {
    return null;
  }
}

export async function createAppointment(input: NewAppointment): Promise<UiAppointment> {
  // Validation: ensure duration_minutes is a number as expected
  if (typeof input.duration_minutes === 'string') {
    throw new Error('duration_minutes must be a number, not a string');
  }

  const data = await insertRecord<UiAppointment>('appointments', input);
  return data;
}

export async function updateAppointment(id: string, patch: PatchAppointment): Promise<UiAppointment> {
  // Validation: ensure duration_minutes is a number if provided
  if (patch.duration_minutes !== undefined && typeof patch.duration_minutes === 'string') {
    throw new Error('duration_minutes must be a number, not a string');
  }

  const data = await updateRecord<UiAppointment>('appointments', id, patch);
  return data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await softDelete('appointments', id);
}