'use client';

import { useState, useEffect } from 'react';
import { DoctorWithProfile } from '@autamedica/types';
import { selectActive } from '@autamedica/shared';
import { logger } from '@autamedica/shared';

/**
 * Hook migrado al sistema híbrido
 *
 * CAMBIOS:
 * - Usa selectActive() en lugar de supabase directo
 * - Datos retornados en camelCase automáticamente
 * - Auto-filtrado de soft-deleted (deleted_at IS NULL)
 */

interface UseDoctorsResult {
  doctors: DoctorWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Tipo UI (camelCase) para Doctor
interface UiDoctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialty: string;
  subspecialty: string | null;
  yearsExperience: number;
  education: Record<string, unknown> | null;
  certifications: Record<string, unknown> | null;
  schedule: Record<string, unknown> | null;
  consultationFee: number | null;
  acceptedInsurance: Record<string, unknown> | null;
  bio: string | null;
  languages: string[];
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

export function useRealDoctors(): UseDoctorsResult {
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sistema híbrido: selectActive() retorna camelCase automáticamente
      // y filtra deleted_at IS NULL
      const data = await selectActive<UiDoctor>('doctors', `
        *,
        profile:profiles!inner(*)
      `, {
        orderBy: { column: 'created_at', ascending: false }
      });

      // Filtrar solo activos (campo active = true)
      const activeDoctors = data.filter(d => d.active);

      setDoctors(activeDoctors as unknown as DoctorWithProfile[]);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Error fetching doctors';

      logger.error('Error fetching doctors:', {
        error: err,
        errorType: typeof err,
        errorConstructor: err?.constructor?.name
      });

      setError(errorMessage);
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

      // Sistema híbrido: selectActive con filtro adicional
      const data = await selectActive<UiDoctor>('doctors', `
        *,
        profile:profiles!inner(*)
      `, {
        // Nota: selectActive no soporta .eq() directamente
        // Necesitamos filtrar después o usar raw query
      });

      // Filtrar por user_id y active manualmente
      const currentDoctor = data.find(d => d.userId === userId && d.active);

      if (!currentDoctor) {
        setDoctor(null);
        return;
      }

      setDoctor(currentDoctor as unknown as DoctorWithProfile);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Error fetching current doctor';

      logger.error('Error fetching current doctor:', {
        error: err,
        errorType: typeof err,
        errorConstructor: err?.constructor?.name,
        userId
      });

      setError(errorMessage);
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

      // Sistema híbrido: fetch all y filtrar
      const data = await selectActive<UiDoctor>('doctors', `
        *,
        profile:profiles!inner(*)
      `, {
        orderBy: { column: 'created_at', ascending: false }
      });

      // Filtrar por specialty y active
      const filtered = data.filter(d =>
        d.specialty === specialty && d.active
      );

      setDoctors(filtered as unknown as DoctorWithProfile[]);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Error fetching doctors by specialty';

      logger.error('Error fetching doctors by specialty:', {
        error: err,
        errorType: typeof err,
        errorConstructor: err?.constructor?.name,
        specialty
      });

      setError(errorMessage);
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
