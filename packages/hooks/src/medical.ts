"use client";

import { useState, useEffect, useCallback } from "react";
import type { Patient, Appointment } from "@autamedica/types";

/**
 * Hook para obtener pacientes del doctor actual
 * Requiere cliente de Supabase con sesión activa
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

      // Obtener pacientes activos (sin soft delete)
      const { data, error: fetchError } = await supabaseClient
        .from('patients')
        .select('*')
        .is('deleted_at', null)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
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
      console.error('Error fetching appointments:', err);
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
          patient:patients(id, user_id, dni),
          doctor:doctors(id, specialty, license_number)
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
      console.error('Error fetching appointments with details:', err);
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