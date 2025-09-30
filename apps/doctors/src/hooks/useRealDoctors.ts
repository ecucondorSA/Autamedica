'use client';

import { useState, useEffect } from 'react';
import { DoctorWithProfile } from '@autamedica/types';
import { supabase } from '@/lib/supabase';

interface UseDoctorsResult {
  doctors: DoctorWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRealDoctors(): UseDoctorsResult {
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors
  };
}

interface UseCurrentDoctorResult {
  doctor: DoctorWithProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCurrentDoctor(userId?: string): UseCurrentDoctorResult {
  const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentDoctor = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No doctor profile found
          setDoctor(null);
          return;
        }
        throw fetchError;
      }

      setDoctor(data);
    } catch (err) {
      console.error('Error fetching current doctor:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentDoctor();
  }, [userId]);

  return {
    doctor,
    loading,
    error,
    refetch: fetchCurrentDoctor
  };
}

interface UseDoctorsBySpecialtyResult {
  doctors: DoctorWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDoctorsBySpecialty(specialty: string): UseDoctorsBySpecialtyResult {
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorsBySpecialty = async () => {
    if (!specialty) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('specialty', specialty)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors by specialty:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsBySpecialty();
  }, [specialty]);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctorsBySpecialty
  };
}