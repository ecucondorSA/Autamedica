'use client';

import React, { useState, useCallback } from 'react';
import { DoctorInsert, DoctorEducation, MedicalCertification, WeeklySchedule } from '@autamedica/types';
import { LicenseValidationStep } from './LicenseValidationStep';
import { SpecialtySelectionStep } from './SpecialtySelectionStep';
import { EducationCertificationStep } from './EducationCertificationStep';
import { ScheduleSetupStep } from './ScheduleSetupStep';
import { ProfileCompletionStep } from './ProfileCompletionStep';

interface DoctorOnboardingWizardProps {
  userId: string;
  onComplete?: (doctorProfile: DoctorInsert) => void;
  onCancel?: () => void;
}

export type OnboardingStep =
  | 'license'
  | 'specialty'
  | 'education'
  | 'schedule'
  | 'profile'
  | 'complete';

export interface OnboardingData {
  // Paso 1: Licencia médica
  license_number: string;
  license_valid: boolean;

  // Paso 2: Especialidad
  specialty: string;
  subspecialty?: string;
  years_experience: number;

  // Paso 3: Educación y certificaciones
  education: DoctorEducation[];
  certifications: MedicalCertification[];

  // Paso 4: Horarios
  schedule: WeeklySchedule;
  consultation_fee?: number;
  accepted_insurance: string[];

  // Paso 5: Perfil final
  bio: string;
  languages: string[];
  phone?: string;
}

const STEPS: OnboardingStep[] = ['license', 'specialty', 'education', 'schedule', 'profile'];

export function DoctorOnboardingWizard({
  userId,
  onComplete,
  onCancel
}: DoctorOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('license');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    education: [],
    certifications: [],
    schedule: {},
    accepted_insurance: [],
    languages: ['Spanish'],
    years_experience: 0
  });

  const updateFormData = useCallback((updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStepIndex(nextIndex);
      setCurrentStep(STEPS[nextIndex]);
    } else {
      handleComplete();
    }
  }, [currentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepIndex(prevIndex);
      setCurrentStep(STEPS[prevIndex]);
    }
  }, [currentStepIndex]);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validar que tenemos todos los datos necesarios
      if (!formData.license_number || !formData.specialty) {
        throw new Error('Faltan datos obligatorios: licencia médica y especialidad');
      }

      const doctorProfile: DoctorInsert = {
        user_id: userId,
        license_number: formData.license_number,
        specialty: formData.specialty,
        subspecialty: formData.subspecialty || null,
        years_experience: formData.years_experience || 0,
        education: formData.education || [],
        certifications: formData.certifications || [],
        schedule: formData.schedule || {},
        consultation_fee: formData.consultation_fee || null,
        accepted_insurance: formData.accepted_insurance || [],
        bio: formData.bio || '',
        languages: formData.languages || ['Spanish'],
        active: true
      };

      // Llamar API para crear perfil
      const response = await fetch('/api/profiles/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorProfile)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear perfil de doctor');
      }

      const result = await response.json();

      // Notificar completación
      onComplete?.(doctorProfile);

      setCurrentStep('complete');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: OnboardingStep): string => {
    switch (step) {
      case 'license': return 'Validación de Licencia Médica';
      case 'specialty': return 'Especialidad Médica';
      case 'education': return 'Educación y Certificaciones';
      case 'schedule': return 'Horarios y Consultas';
      case 'profile': return 'Perfil Profesional';
      case 'complete': return 'Perfil Completado';
      default: return 'Configuración';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'license':
        return (
          <LicenseValidationStep
            licenseNumber={formData.license_number || ''}
            onUpdate={(license_number, license_valid) =>
              updateFormData({ license_number, license_valid })
            }
            onNext={goToNextStep}
            onCancel={onCancel}
          />
        );

      case 'specialty':
        return (
          <SpecialtySelectionStep
            specialty={formData.specialty || ''}
            subspecialty={formData.subspecialty}
            yearsExperience={formData.years_experience || 0}
            onUpdate={(specialty, subspecialty, years_experience) =>
              updateFormData({ specialty, subspecialty, years_experience })
            }
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case 'education':
        return (
          <EducationCertificationStep
            education={formData.education || []}
            certifications={formData.certifications || []}
            onUpdate={(education, certifications) =>
              updateFormData({ education, certifications })
            }
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case 'schedule':
        return (
          <ScheduleSetupStep
            schedule={formData.schedule || {}}
            consultationFee={formData.consultation_fee}
            acceptedInsurance={formData.accepted_insurance || []}
            onUpdate={(schedule, consultation_fee, accepted_insurance) =>
              updateFormData({ schedule, consultation_fee, accepted_insurance })
            }
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case 'profile':
        return (
          <ProfileCompletionStep
            bio={formData.bio || ''}
            languages={formData.languages || ['Spanish']}
            onUpdate={(bio, languages) =>
              updateFormData({ bio, languages })
            }
            onComplete={handleComplete}
            onBack={goToPreviousStep}
            isSubmitting={isSubmitting}
          />
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Perfil de Doctor Completado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu perfil profesional ha sido creado exitosamente. Ahora puedes comenzar a atender pacientes.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        );

      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header con progreso */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Configuración de Perfil Médico
            </h1>
            <span className="text-sm text-gray-500">
              Paso {currentStepIndex + 1} de {STEPS.length}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            {getStepTitle(currentStep)}
          </h2>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}