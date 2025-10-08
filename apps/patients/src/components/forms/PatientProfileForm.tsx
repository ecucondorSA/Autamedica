'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { Profile } from '@/lib/zod/profiles';
import type {
  Patient,
  PatientProfileUpdateInput,
} from '@/lib/zod/patients';
import type { ProfileUpdateInput } from '@/lib/zod/profiles';

export interface PatientProfileFormPayload {
  profile: ProfileUpdateInput;
  patient: PatientProfileUpdateInput;
}

interface PatientProfileFormProps {
  profile: Profile | null;
  patient: Patient | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: PatientProfileFormPayload) => Promise<void> | void;
}

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  heightCm: string;
  weightKg: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyEmail: string;
}

const GENDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function buildInitialState(profile: Profile | null, patient: Patient | null): FormState {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    phone: profile?.phone ?? '',
    birthDate: patient?.birthDate ?? '',
    gender: patient?.gender ?? 'prefer_not_to_say',
    bloodType: patient?.bloodType ?? '',
    heightCm: patient?.heightCm ? String(patient.heightCm) : '',
    weightKg: patient?.weightKg ? String(patient.weightKg) : '',
    emergencyName: patient?.emergencyContact?.name ?? '',
    emergencyRelationship: patient?.emergencyContact?.relationship ?? '',
    emergencyPhone: patient?.emergencyContact?.phone ?? '',
    emergencyEmail: patient?.emergencyContact?.email ?? '',
  };
}

export function PatientProfileForm({
  profile,
  patient,
  isSaving,
  onCancel,
  onSubmit,
}: PatientProfileFormProps) {
  const [formState, setFormState] = useState<FormState>(() => buildInitialState(profile, patient));

  useEffect(() => {
    setFormState(buildInitialState(profile, patient));
  }, [profile, patient]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const payload = useMemo<PatientProfileFormPayload>(() => {
    const toNullable = (value: string) => (value.trim().length > 0 ? value.trim() : null);

    const parseNumber = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const emergencyFields = {
      name: toNullable(formState.emergencyName),
      relationship: toNullable(formState.emergencyRelationship),
      phone: toNullable(formState.emergencyPhone),
      email: toNullable(formState.emergencyEmail),
    };

    const hasEmergencyData = Object.values(emergencyFields).some(value => value);

    return {
      profile: {
        firstName: toNullable(formState.firstName),
        lastName: toNullable(formState.lastName),
        phone: toNullable(formState.phone),
      },
      patient: {
        birthDate: toNullable(formState.birthDate),
        gender: formState.gender ? (formState.gender as PatientProfileUpdateInput['gender']) : null,
        bloodType: formState.bloodType ? (formState.bloodType as PatientProfileUpdateInput['bloodType']) : null,
        heightCm: parseNumber(formState.heightCm),
        weightKg: parseNumber(formState.weightKg),
        emergencyContact: hasEmergencyData ? emergencyFields : null,
      },
    };
  }, [formState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="card-ivory p-6 space-y-4">
        <h2 className="heading-3">Información personal</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Nombre</span>
            <input
              type="text"
              value={formState.firstName}
              onChange={handleChange('firstName')}
              className="input-ivory"
              placeholder="Tu nombre"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Apellido</span>
            <input
              type="text"
              value={formState.lastName}
              onChange={handleChange('lastName')}
              className="input-ivory"
              placeholder="Tu apellido"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Teléfono</span>
            <input
              type="tel"
              value={formState.phone}
              onChange={handleChange('phone')}
              className="input-ivory"
              placeholder="Ej: +54 11 1234 5678"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Fecha de nacimiento</span>
            <input
              type="date"
              value={formState.birthDate ?? ''}
              onChange={handleChange('birthDate')}
              className="input-ivory"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Género</span>
            <select
              value={formState.gender}
              onChange={handleChange('gender')}
              className="input-ivory"
            >
              {GENDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Tipo de sangre</span>
            <select
              value={formState.bloodType}
              onChange={handleChange('bloodType')}
              className="input-ivory"
            >
              <option value="">Seleccioná una opción</option>
              {BLOOD_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card-ivory p-6 space-y-4">
        <h2 className="heading-3">Medidas y salud</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Altura (cm)</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={formState.heightCm}
              onChange={handleChange('heightCm')}
              className="input-ivory"
              placeholder="Ej: 170"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Peso (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={formState.weightKg}
              onChange={handleChange('weightKg')}
              className="input-ivory"
              placeholder="Ej: 70"
            />
          </label>
        </div>
      </section>

      <section className="card-ivory p-6 space-y-4">
        <h2 className="heading-3">Contacto de emergencia</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Nombre completo</span>
            <input
              type="text"
              value={formState.emergencyName}
              onChange={handleChange('emergencyName')}
              className="input-ivory"
              placeholder="Nombre y apellido"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Relación</span>
            <input
              type="text"
              value={formState.emergencyRelationship}
              onChange={handleChange('emergencyRelationship')}
              className="input-ivory"
              placeholder="Ej: Madre, pareja"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Teléfono</span>
            <input
              type="tel"
              value={formState.emergencyPhone}
              onChange={handleChange('emergencyPhone')}
              className="input-ivory"
              placeholder="Número de contacto"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label text-stone-600">Email</span>
            <input
              type="email"
              value={formState.emergencyEmail}
              onChange={handleChange('emergencyEmail')}
              className="input-ivory"
              placeholder="Correo de contacto"
            />
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary-ivory px-5 py-2 text-sm"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary-ivory px-6 py-2 text-sm"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
