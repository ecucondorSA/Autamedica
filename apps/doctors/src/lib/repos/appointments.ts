import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@autamedica/types';

// Row = lectura, Insert = creación, Update = parches
export type Appointment = Tables<'appointments'>;
export type NewAppointment = TablesInsert<'appointments'>;
export type PatchAppointment = TablesUpdate<'appointments'>;

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function createAppointment(input: NewAppointment): Promise<Appointment> {
  // Validation: ensure duration_minutes is a number as expected
  if (typeof input.duration_minutes === 'string') {
    throw new Error('duration_minutes must be a number, not a string');
  }

  const { data, error } = await supabase
    .from('appointments' as const)
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data!;
}

export async function updateAppointment(id: string, patch: PatchAppointment): Promise<Appointment> {
  // Validation: ensure duration_minutes is a number if provided
  if (patch.duration_minutes !== undefined && typeof patch.duration_minutes === 'string') {
    throw new Error('duration_minutes must be a number, not a string');
  }

  const { data, error } = await supabase
    .from('appointments' as const)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}