'use client';

import { useState, useEffect } from 'react';
import { PatientWithProfile } from '@autamedica/types';
import { supabase } from '@/lib/supabase';

interface UsePatientsResult {
  patients: PatientWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRealPatients(): UsePatientsResult {
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients
  };
}

interface UseCurrentPatientResult {
  patient: PatientWithProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCurrentPatient(userId?: string): UseCurrentPatientResult {
  const [patient, setPatient] = useState<PatientWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPatient = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No patient profile found
          setPatient(null);
          return;
        }
        throw fetchError;
      }

      setPatient(data);
    } catch (err) {
      console.error('Error fetching current patient:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPatient();
  }, [userId]);

  return {
    patient,
    loading,
    error,
    refetch: fetchCurrentPatient
  };
}

interface UseDoctorPatientsResult {
  patients: PatientWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDoctorPatients(doctorUserId?: string): UseDoctorPatientsResult {
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorPatients = async () => {
    if (!doctorUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get the doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', doctorUserId)
        .single();

      if (doctorError || !doctorData) {
        throw new Error('Doctor not found');
      }

      // Then get patients assigned to this doctor through patient_care_team
      const { data, error: fetchError } = await supabase
        .from('patient_care_team')
        .select(`
          patients!inner(
            *,
            profile:profiles!inner(*)
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('active', true);

      if (fetchError) {
        throw fetchError;
      }

      // Extract patients from the nested structure
      const patientsData = data?.map((item: any) => item.patients).filter(Boolean) || [];
      setPatients(patientsData);
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorPatients();
  }, [doctorUserId]);

  return {
    patients,
    loading,
    error,
    refetch: fetchDoctorPatients
  };
}

interface UsePatientsByCompanyResult {
  patients: PatientWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePatientsByCompany(companyId?: string): UsePatientsByCompanyResult {
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientsByCompany = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('company_id', companyId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients by company:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsByCompany();
  }, [companyId]);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatientsByCompany
  };
}