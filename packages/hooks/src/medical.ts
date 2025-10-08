"use client";

import { useState, useEffect, useCallback } from "react";
import type { Patient, Appointment } from "@autamedica/types";
import { mapDbPatientToPatient } from "@autamedica/types";
import { logger } from '@autamedica/shared';

/**
 * Hook para obtener pacientes del doctor actual
 * Requiere cliente de Supabase con sesión activa
 *
 * ACTUALIZADO: Usa campos TypeScript-aligned (first_name, last_name, email, phone, date_of_birth, address)
 */
export function usePatients(supabaseClient?: any) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener pacientes activos con campos TypeScript-aligned
      const { data, error: fetchError } = await supabaseClient
        .from('patients')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          gender,
          address,
          emergency_contact,
          created_at,
          updated_at
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Mapear de DB (snake_case) a TypeScript (camelCase)
      const mappedPatients = (data || []).map(mapDbPatientToPatient);
      setPatients(mappedPatients);
    } catch (err) {
      logger.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients
  };
}

/**
 * Hook para obtener citas del doctor actual
 * Requiere cliente de Supabase con sesión activa
 */
export function useAppointments(supabaseClient?: any, doctorId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from('appointments')
        .select('*')
        .is('deleted_at', null)
        .order('start_time', { ascending: true });

      // Filtrar por doctor si se proporciona ID
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAppointments(data || []);
    } catch (err) {
      logger.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [supabaseClient, doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments
  };
}

/**
 * Hook para obtener citas con detalles de paciente y doctor
 * Realiza join con tablas relacionadas
 *
 * ACTUALIZADO: Usa campos TypeScript-aligned en joins (first_name, last_name, email, specialties array)
 */
export function useAppointmentsWithDetails(supabaseClient?: any, doctorId?: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from('appointments')
        .select(`
          *,
          patient:patients(
            id,
            user_id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth
          ),
          doctor:doctors(
            id,
            first_name,
            last_name,
            email,
            license_number,
            specialties,
            is_active
          )
        `)
        .is('deleted_at', null)
        .order('start_time', { ascending: true });

      // Filtrar por doctor si se proporciona ID
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAppointments(data || []);
    } catch (err) {
      logger.error('Error fetching appointments with details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [supabaseClient, doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments
  };
}