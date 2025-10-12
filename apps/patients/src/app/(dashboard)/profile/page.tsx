'use client';

// Disable SSG for this page since it uses auth and client-side data fetching
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit,
  Loader2,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { PatientProfileForm, type PatientProfileFormPayload } from '@/components/forms/PatientProfileForm';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useSupabase } from '@autamedica/auth/react';
import { usePatientProfile } from '@/hooks/useProfile';
import { ensureClientEnv } from '@autamedica/shared';

export default function ProfilePage() {
  const { user, profile, patient, loading, error, refresh } = usePatientSession();
  const supabase = useSupabase();
  const { updateProfile, isSaving, success, error: updateError, resetStatus } = usePatientProfile(user?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success]);

  const age = useMemo(() => {
    if (!patient?.birthDate) return null;
    return computeAge(patient.birthDate);
  }, [patient?.birthDate]);

  const bmi = useMemo(() => {
    if (!patient?.heightCm || !patient?.weightKg) return null;
    const heightMeters = patient.heightCm / 100;
    if (!heightMeters) return null;
    const value = patient.weightKg / (heightMeters * heightMeters);
    return Number.isFinite(value) ? Number(value.toFixed(1)) : null;
  }, [patient?.heightCm, patient?.weightKg]);

  const toggleEditing = () => {
    setIsEditing(prev => !prev);
    resetStatus();
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetStatus();
  };

  const handleSubmit = async (payload: PatientProfileFormPayload) => {
    const result = await updateProfile(payload);
    if (result) {
      await refresh();
      setIsEditing(false);
    }
  };

  // Auto-reparar perfiles inexistentes (esquemas legacy) si el usuario existe
  const ensureProfile = useCallback(async () => {
    try {
      // Obtener token actual del cliente para autorizar en backend
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabaseClient = createBrowserClient(
        ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL'),
        ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      );
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch('/api/profile/ensure', {
        method: 'POST',
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      console.log('[Profile] ensureProfile status:', res.status);
      await refresh();
    } catch (e) {
      console.error('[Profile] ensureProfile failed', (e as Error)?.message);
    }
  }, [refresh]);

  useEffect(() => {
    void ensureProfile();
  }, [ensureProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-stone-600">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Cargando perfil…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">No pudimos cargar tu perfil</h2>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-amber-900">No encontramos tu perfil</h2>
            <p className="text-amber-700 mt-1">Estamos preparando tu perfil automáticamente. Si persiste, tocá &quot;Actualizar datos&quot;.</p>
            <div className="mt-4">
              <button
                onClick={async () => { console.log('[Profile] clicked ensure+edit'); await ensureProfile(); setIsEditing(true); }}
                className="btn-secondary-ivory px-4 py-2 text-sm"
              >
                Crear y editar perfil
              </button>
              <button onClick={() => { void refresh(); }} className="btn-secondary-ivory px-4 py-2 text-sm ml-3">Actualizar datos</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="heading-1 flex items-center gap-3">
              <User className="h-8 w-8 text-stone-700" />
              Mi Perfil
            </h1>
            <p className="text-stone-600 mt-1">Gestioná tu información personal y médica básica.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refresh()}
              className="btn-secondary-ivory px-4 py-2 text-sm"
              disabled={loading}
            >
              Actualizar datos
            </button>
            <button
              onClick={toggleEditing}
              className="btn-primary-ivory px-5 py-2 text-sm inline-flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cerrar edición' : 'Editar perfil'}
            </button>
          </div>
        </div>
      </header>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          <span>Guardamos tus cambios correctamente.</span>
        </div>
      )}

      {updateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{updateError}</span>
        </div>
      )}

      {isEditing ? (
        <PatientProfileForm
          profile={profile}
          patient={patient ?? null}
          isSaving={isSaving}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="space-y-6">
          <section className="card-ivory-elevated p-8">
            <h2 className="heading-2 mb-6">Información personal</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-label text-stone-600 block mb-1">Nombre completo</span>
                <p className="text-body text-stone-900 font-semibold">
                  {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Edad</span>
                <div className="flex items-center gap-2 text-body text-stone-900">
                  <Calendar className="h-4 w-4 text-stone-500" />
                  {age !== null ? `${age} años` : '—'}
                </div>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Fecha de nacimiento</span>
                <p className="text-body text-stone-900">
                  {patient?.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Género</span>
                <p className="text-body text-stone-900">
                  {patient?.gender
                    ? GENDER_LABELS[patient.gender] ?? patient.gender
                    : '—'}
                </p>
              </div>
            </div>
          </section>

          <section className="card-ivory p-8">
            <h2 className="heading-2 mb-6">Contacto</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-stone-500" />
                <div>
                  <span className="text-label text-stone-600 block">Email</span>
                  <p className="text-body text-stone-900">{profile.email ?? user?.email ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-stone-500" />
                <div>
                  <span className="text-label text-stone-600 block">Teléfono</span>
                  <p className="text-body text-stone-900">{profile.phone ?? '—'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-ivory p-8">
            <h2 className="heading-2 mb-6">Datos médicos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <span className="text-label text-stone-600 block mb-1">Tipo de sangre</span>
                <p className="text-body text-stone-900">{patient?.bloodType ?? '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Altura</span>
                <p className="text-body text-stone-900">{patient?.heightCm ? `${patient.heightCm} cm` : '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Peso</span>
                <p className="text-body text-stone-900">{patient?.weightKg ? `${patient.weightKg} kg` : '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">IMC</span>
                <p className="text-body text-stone-900">{bmi ?? '—'}</p>
              </div>
            </div>
          </section>

          <section className="card-ivory p-8">
            <h2 className="heading-2 mb-6">Contacto de emergencia</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-label text-stone-600 block mb-1">Nombre</span>
                <p className="text-body text-stone-900">{patient?.emergencyContact?.name ?? '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Relación</span>
                <p className="text-body text-stone-900">{patient?.emergencyContact?.relationship ?? '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Teléfono</span>
                <p className="text-body text-stone-900">{patient?.emergencyContact?.phone ?? '—'}</p>
              </div>
              <div>
                <span className="text-label text-stone-600 block mb-1">Email</span>
                <p className="text-body text-stone-900">{patient?.emergencyContact?.email ?? '—'}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiero no decirlo',
};

function computeAge(birthDate: string): number | null {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  let computed = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    computed -= 1;
  }

  return computed;
}
