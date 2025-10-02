'use client';

import { useState, useEffect } from 'react';
import { PatientWithProfile } from '@autamedica/types';
import { selectActive } from '@autamedica/shared';

/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 */

interface UsePatientsResult {
  patients: PatientWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Tipo UI (camelCase) para Patient
interface UiPatient {
  id: string;
  userId: string;
  dni: string | null;
  birthDate: string | null;
  gender: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  emergencyContact: Record<string, unknown> | null;
  medicalHistory: Record<string, unknown> | null;
  allergies: Record<string, unknown> | null;
  medications: Record<string, unknown> | null;
  insuranceInfo: Record<string, unknown> | null;
  companyId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  profile?: {
    userId: string;
    email: string | null;
    role: string | null;
  };
}

export function useRealPatients(): UsePatientsResult {
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sistema híbrido: selectActive() retorna camelCase automáticamente
      const data = await selectActive<UiPatient>('patients', `
        *,
        profile:profiles!inner(*)
      `, {
        orderBy: { column: 'created_at', ascending: false }
      });

      // Filtrar solo activos
      const activePatients = data.filter(p => p.active);

      setPatients(activePatients as unknown as PatientWithProfile[]);
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

      const data = await selectActive<UiPatient>('patients', `
        *,
        profile:profiles!inner(*)
      `);

      // Filtrar por user_id y active
      const currentPatient = data.find(p => p.userId === userId && p.active);

      if (!currentPatient) {
        setPatient(null);
        return;
      }

      setPatient(currentPatient as unknown as PatientWithProfile);
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
      const doctors = await selectActive<{ id: string; userId: string }>('doctors', 'id, user_id');
      const doctor = doctors.find(d => d.userId === doctorUserId);

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Then get patients assigned to this doctor through patient_care_team
      const careTeam = await selectActive<{
        doctorId: string;
        patientId: string;
        active: boolean;
      }>('patient_care_team', `
        doctor_id,
        patient_id,
        active
      `);

      // Filter by doctor and active
      const activeAssignments = careTeam.filter(
        ct => ct.doctorId === doctor.id && ct.active
      );

      // Get patient IDs
      const patientIds = activeAssignments.map(ct => ct.patientId);

      if (patientIds.length === 0) {
        setPatients([]);
        return;
      }

      // Fetch all patients and filter by IDs
      const allPatients = await selectActive<UiPatient>('patients', `
        *,
        profile:profiles!inner(*)
      `);

      const doctorPatients = allPatients.filter(p =>
        patientIds.includes(p.id) && p.active
      );

      setPatients(doctorPatients as unknown as PatientWithProfile[]);
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

      const data = await selectActive<UiPatient>('patients', `
        *,
        profile:profiles!inner(*)
      `, {
        orderBy: { column: 'created_at', ascending: false }
      });

      // Filtrar por company_id y active
      const companyPatients = data.filter(p =>
        p.companyId === companyId && p.active
      );

      setPatients(companyPatients as unknown as PatientWithProfile[]);
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
