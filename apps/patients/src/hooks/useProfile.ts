'use client';

import { useCallback, useState } from 'react';
import { logger } from '@autamedica/shared';
import type { ProfileUpdateInput, Profile } from '@/lib/zod/profiles';
import type { PatientProfileUpdateInput, Patient } from '@/lib/zod/patients';

export interface PatientProfileUpdateResult {
  profile: Profile | null;
  patient: Patient | null;
}

export interface UsePatientProfileReturn {
  isSaving: boolean;
  error: string | null;
  success: boolean;
  updateProfile: (input: {
    profile?: ProfileUpdateInput;
    patient?: PatientProfileUpdateInput;
  }) => Promise<PatientProfileUpdateResult | null>;
  resetStatus: () => void;
}

export function usePatientProfile(userId: string | null): UsePatientProfileReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = useCallback<UsePatientProfileReturn['updateProfile']>(
    async ({ profile, patient }) => {
      if (!userId) {
        setError('Sesión inválida. Iniciá sesión nuevamente.');
        return null;
      }

      try {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        if (typeof window === 'undefined') {
          setError('Las actualizaciones solo están disponibles desde el navegador.');
          return null;
        }

        // Usar API server-side para respetar RLS y lógica de negocio
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, patient }),
        });

        if (!res.ok) {
          const details = await res.json().catch(() => ({}));
          throw new Error(details?.error || 'No pudimos guardar los cambios');
        }

        const json = await res.json();
        setSuccess(true);
        return { profile: json?.data?.profile ?? null, patient: json?.data?.patient ?? null };
      } catch (updateError) {
        logger.error('[usePatientProfile] update failed', updateError);
        setError('No pudimos guardar los cambios. Intentá nuevamente.');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [userId],
  );

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isSaving,
    error,
    success,
    updateProfile,
    resetStatus,
  };
}
