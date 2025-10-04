'use server';

import { updateRecord } from '@autamedica/shared';
import { requireSession } from '@autamedica/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logger } from '@autamedica/shared';

/**
 * Server Action: Completar onboarding de paciente
 *
 * Sistema híbrido:
 * - updateRecord() transforma automáticamente a snake_case
 * - Validación con Zod
 * - Redirección post-onboarding
 */

const PatientOnboardingSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  bloodType: z.string().optional(),
  heightCm: z.number().min(50).max(250).optional(),
  weightKg: z.number().min(10).max(300).optional(),
  emergencyContactName: z.string().min(1, 'Nombre de contacto de emergencia requerido'),
  emergencyContactPhone: z.string().min(1, 'Teléfono de contacto de emergencia requerido'),
  emergencyContactRelation: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export type PatientOnboardingData = z.infer<typeof PatientOnboardingSchema>;

interface OnboardingResult {
  success: boolean;
  error?: string;
}

export async function completePatientOnboarding(
  data: PatientOnboardingData
): Promise<OnboardingResult> {
  try {
    const session = await requireSession('/auth/login');

    // Verificar que sea paciente
    if (session.user.role !== 'patient') {
      return {
        success: false,
        error: 'Solo pacientes pueden completar este onboarding'
      };
    }

    // Validar datos
    const validated = PatientOnboardingSchema.parse(data);

    // Preparar datos para actualización (updateRecord auto-transforma a snake_case)
    const updateData = {
      birth_date: validated.birthDate,
      gender: validated.gender,
      blood_type: validated.bloodType || null,
      height_cm: validated.heightCm || null,
      weight_kg: validated.weightKg || null,
      emergency_contact: {
        name: validated.emergencyContactName,
        phone: validated.emergencyContactPhone,
        relation: validated.emergencyContactRelation || null
      },
      insurance_info: validated.insuranceProvider ? {
        provider: validated.insuranceProvider,
        policy_number: validated.insurancePolicyNumber || null
      } : null
    };

    // Actualizar registro en 'patients' (sistema híbrido)
    await updateRecord('patients', session.user.id, updateData);

    return { success: true };

  } catch (err) {
    logger.error('[completePatientOnboarding] Error:', err);

    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: `Validación fallida: ${err.errors.map(e => e.message).join(', ')}`
      };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido'
    };
  }
}

export async function skipOnboarding(): Promise<void> {
  const session = await requireSession('/auth/login');

  if (session.user.role !== 'patient') {
    throw new Error('Solo pacientes pueden saltar onboarding');
  }

  // Redirigir al dashboard sin completar onboarding
  redirect('/patients/dashboard');
}
