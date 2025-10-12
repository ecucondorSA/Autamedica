'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { logger } from '@autamedica/shared';
import { useSupabase } from '@autamedica/auth/react';
import { parseProfile, safeParseProfile, type Profile } from '@/lib/zod/profiles';
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

      // Intento 1: esquema nuevo (user_id)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si la columna no existe o no hay fila, intentar esquema legacy (id)
      if ((error && error.code !== 'PGRST116') || (!data && !error)) {
        const tryLegacy = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        data = tryLegacy.data as any;
        error = tryLegacy.error as any;
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let profileRow: any = data ?? null;
      // Normalizar id -> user_id si fuese legacy
      if (profileRow && !profileRow.user_id && profileRow.id) {
        profileRow = { ...profileRow, user_id: profileRow.id };
      }

      if (!profileRow) {
        // Intentar insertar con user_id; si falla por columna, probar con id
        let inserted: any = null;
        let insertError: any = null;
        let insert = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email,
            role: 'patient',
            external_id: user.id,
          })
          .select('*')
          .single();
        inserted = insert.data;
        insertError = insert.error;

        if (insertError) {
          // Reintentar esquema legacy
          const legacy = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email,
              role: 'patient',
              external_id: user.id,
            })
            .select('*')
            .single();
          inserted = legacy.data;
          insertError = legacy.error;
        }

        if (insertError) {
          throw insertError;
        }

        profileRow = inserted;
      } else {
        const updates: Record<string, unknown> = {};

        if (!profileRow.email) {
          updates.email = email;
        }

        // Evitar escribir columnas que podrían no existir en ciertos esquemas (role/external_id)

        if (Object.keys(updates).length > 0) {
          // Update por user_id o por id según exista
          const updateTry = await supabase
            .from('profiles')
            .update(updates)
            .eq(profileRow.user_id ? 'user_id' : 'id', user.id)
            .select('*')
            .single();
          const updated = updateTry.data as any;
          const updateError = updateTry.error as any;

          if (updateError) {
            throw updateError;
          }

          profileRow = updated;
        }
      }
      // Parse robusto: intentar zod; si falla, normalizar mínimamente
      const parsed = safeParseProfile(profileRow);
      if (parsed) return parsed;
      return {
        userId: profileRow.user_id ?? profileRow.id,
        email: profileRow.email ?? email,
        role: (profileRow.role as any) ?? 'patient',
        firstName: (profileRow.first_name as any) ?? null,
        lastName: (profileRow.last_name as any) ?? null,
        phone: (profileRow.phone as any) ?? null,
        avatarUrl: (profileRow.avatar_url as any) ?? null,
        active: (profileRow.active as any) ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      } as unknown as Profile;
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
