'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { logger } from '@autamedica/shared';
import { useSupabase } from '@autamedica/auth';
import { parseProfile, type Profile } from '@/lib/zod/profiles';
import { parsePatient, type Patient } from '@/lib/zod/patients';

interface PatientSessionState {
  user: User | null;
  profile: Profile | null;
  patient: Patient | null;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: PatientSessionState = {
  user: null,
  profile: null,
  patient: null,
  loading: true,
  error: null,
};

function ensureEmail(user: User): string {
  const candidate = user.email ?? (user.user_metadata as Record<string, unknown> | undefined)?.email;
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }
  return `${user.id}@patients.autamedica.local`;
}

export interface UsePatientSessionResult extends PatientSessionState {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function usePatientSession(): UsePatientSessionResult {
  const supabase = useSupabase();
  const [state, setState] = useState<PatientSessionState>(INITIAL_STATE);
  const isMountedRef = useRef(false);

  const safeSetState = useCallback(
    (updater: (prev: PatientSessionState) => PatientSessionState) => {
      if (isMountedRef.current) {
        setState(updater);
      }
    },
    [],
  );

  const fetchOrCreateProfile = useCallback(
    async (user: User): Promise<Profile> => {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const email = ensureEmail(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let profileRow = data ?? null;

      if (!profileRow) {
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email,
            role: 'patient',
            external_id: user.id,
          })
          .select('*')
          .single();

        if (insertError) {
          throw insertError;
        }

        profileRow = inserted;
      } else {
        const updates: Record<string, unknown> = {};

        if (!profileRow.email) {
          updates.email = email;
        }

        if (!profileRow.role) {
          updates.role = 'patient';
        }

        if (!profileRow.external_id) {
          updates.external_id = user.id;
        }

        if (Object.keys(updates).length > 0) {
          const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select('*')
            .single();

          if (updateError) {
            throw updateError;
          }

          profileRow = updated;
        }
      }

      return parseProfile(profileRow);
    },
    [supabase],
  );

  const fetchOrCreatePatient = useCallback(
    async (userId: string): Promise<Patient | null> => {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let patientRow = data ?? null;

      if (!patientRow) {
        const { data: inserted, error: insertError } = await supabase
          .from('patients')
          .insert({
            user_id: userId,
            active: true,
          })
          .select('*');

        if (insertError) {
          throw insertError;
        }

        if (Array.isArray(inserted) && inserted.length > 0) {
          patientRow = inserted[0];
        } else if (inserted && !Array.isArray(inserted)) {
          patientRow = inserted as Record<string, unknown>;
        }
      }

      return patientRow ? parsePatient(patientRow) : null;
    },
    [supabase],
  );

  const refresh = useCallback(async () => {
    // SSR guard: Don't try to fetch session during server-side rendering
    if (!supabase) {
      if (typeof window === 'undefined') {
        safeSetState(prev => ({ ...prev, loading: false }));
      }
      return;
    }

    safeSetState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData.session;

      if (!session?.user) {
        safeSetState(() => ({ ...INITIAL_STATE, loading: false, error: null }));
        return;
      }

      const user = session.user;
      const profile = await fetchOrCreateProfile(user);

      if (profile.role && profile.role !== 'patient') {
        safeSetState(() => ({
          user,
          profile,
          patient: null,
          loading: false,
          error: 'Tu cuenta no tiene acceso al portal de pacientes.',
        }));
        return;
      }

      const patient = await fetchOrCreatePatient(user.id);

      safeSetState(() => ({
        user,
        profile,
        patient,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('[usePatientSession] Failed to sync session', error);
      safeSetState(prev => ({
        ...prev,
        loading: false,
        error: 'No pudimos cargar tu sesión. Intentá nuevamente.',
      }));
    }
  }, [fetchOrCreatePatient, fetchOrCreateProfile, safeSetState, supabase]);

  useEffect(() => {
    isMountedRef.current = true;

    // SSR guard
    if (typeof window === 'undefined') {
      safeSetState(prev => ({ ...prev, loading: false }));
      return () => {
        isMountedRef.current = false;
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [safeSetState]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    refresh();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMountedRef.current) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        safeSetState(() => ({ ...INITIAL_STATE, loading: false }));
        return;
      }

      if (session?.user) {
        refresh();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [refresh, safeSetState, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    safeSetState(() => ({ ...INITIAL_STATE, loading: false }));
  }, [safeSetState, supabase]);

  return {
    ...state,
    refresh,
    signOut,
  };
}
