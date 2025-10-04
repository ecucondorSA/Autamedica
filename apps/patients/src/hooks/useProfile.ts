'use client';

import { useCallback, useState } from 'react';
import { logger } from '@autamedica/shared';
import { useSupabase } from '@autamedica/auth';
import {
  buildProfileUpdatePayload,
  type ProfileUpdateInput,
  parseProfile,
} from '@/lib/zod/profiles';
import {
  buildPatientUpdatePayload,
  type PatientProfileUpdateInput,
  parsePatient,
} from '@/lib/zod/patients';
import type { Patient } from '@/lib/zod/patients';
import type { Profile } from '@/lib/zod/profiles';

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
  const supabase = useSupabase();
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

        let nextProfile: Profile | null = null;
        let nextPatient: Patient | null = null;

        if (typeof window === 'undefined') {
          setError('Las actualizaciones solo están disponibles desde el navegador.');
          return null;
        }

        if (profile) {
          const payload = buildProfileUpdatePayload(profile);

          if (Object.keys(payload).length > 0) {
            const { data, error: updateError } = await supabase
              .from('profiles')
              .update(payload)
              .eq('user_id', userId)
              .select('*')
              .single();

            if (updateError) {
              throw updateError;
            }

            nextProfile = parseProfile(data);
          }
        }

        if (patient) {
          const payload = buildPatientUpdatePayload(patient);

          if (Object.keys(payload).length > 0) {
            const { data, error: updateError } = await supabase
              .from('patients')
              .update(payload)
              .eq('user_id', userId)
              .select('*')
              .maybeSingle();

            if (updateError) {
              throw updateError;
            }

            nextPatient = data ? parsePatient(data) : null;
          }
        }

        setSuccess(true);
        return { profile: nextProfile, patient: nextPatient };
      } catch (updateError) {
        logger.error('[usePatientProfile] update failed', updateError);
        setError('No pudimos guardar los cambios. Intentá nuevamente.');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, userId],
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
