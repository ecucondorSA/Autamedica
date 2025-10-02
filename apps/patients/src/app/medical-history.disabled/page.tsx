'use client';

import { useState } from 'react';
import {
  MedicalHistoryTimeline as MedicalHistoryTimelineView,
  MedicalHistorySummary as MedicalHistorySummaryView,
  AnamnesisForm,
} from '@/components/medical-history';
import {
  createId,
  toISODateString,
  type MedicalHistoryTimeline,
  type MedicalHistorySummary,
  type PatientId,
  type ConditionId,
  type AllergyId,
  type MedicationId,
  type ProcedureId,
  type ImmunizationId,
  type EncounterId,
  type UserId,
} from '@autamedica/types';

const CONDITION_STATUS = {
  ACTIVE: 'active',
  UNDER_TREATMENT: 'under_treatment',
  RESOLVED: 'resolved',
  MONITORED: 'monitored'
} as const;

const MEDICATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold'
} as const;

const ENCOUNTER_TYPE = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency'
} as const;

const iso = (value: string) => toISODateString(value);

const PATIENT_ID = createId<PatientId>('PAT_MOCK0001');
const DOCTOR_GARCIA_ID = createId<UserId>('USR_DR_GARCIA');
const DOCTOR_MARTINEZ_ID = createId<UserId>('USR_DR_MARTINEZ');
const NURSE_RODRIGUEZ_ID = createId<UserId>('USR_NURSE_RODRIGUEZ');

const mockSummary: MedicalHistorySummary = {
  patient_id: PATIENT_ID,
  active_conditions_count: 2,
  active_medications_count: 3,
  known_allergies_count: 1,
  last_encounter_date: iso('2024-01-15T10:00:00Z'),
  chronic_conditions: ['Hipertensión Arterial', 'Diabetes Tipo 2'],
  critical_allergies: ['Penicilina'],
  current_medications: ['Lisinopril 10mg', 'Metformina 500mg', 'Aspirina 100mg'],
};

const mockTimeline: MedicalHistoryTimeline = {
  patient_id: PATIENT_ID,
  sections: {
    conditions: [
      {
        id: createId<ConditionId>('COND_HIPERTENSION'),
        patient_id: PATIENT_ID,
        name: 'Hipertensión Arterial',
        status: CONDITION_STATUS.UNDER_TREATMENT,
        onset_date: iso('2023-06-15T00:00:00Z'),
        notes: 'Detectada en control rutinario. Responde bien al tratamiento.',
        is_chronic: true,
        is_family_history: false,
        severity: 'moderate',
        recorded_by: DOCTOR_GARCIA_ID,
        createdAt: iso('2023-06-15T00:00:00Z'),
        updatedAt: iso('2024-01-15T00:00:00Z'),
        isActive: true,
      },
      {
        id: createId<ConditionId>('COND_DIABETES'),
        patient_id: PATIENT_ID,
        name: 'Diabetes Tipo 2',
        status: CONDITION_STATUS.ACTIVE,
        onset_date: iso('2022-03-10T00:00:00Z'),
        notes: 'Bien controlada con medicación y dieta.',
        is_chronic: true,
        is_family_history: false,
        severity: 'moderate',
        recorded_by: DOCTOR_MARTINEZ_ID,
        createdAt: iso('2022-03-10T00:00:00Z'),
        updatedAt: iso('2024-01-10T00:00:00Z'),
        isActive: true,
      },
    ],
    allergies: [
      {
        id: createId<AllergyId>('ALLERGY_PENICILIN'),
        patient_id: PATIENT_ID,
        allergen: 'Penicilina',
        allergen_type: 'medication',
        severity: 'severe',
        reaction_description: 'Erupción cutánea severa y dificultad respiratoria',
        onset_date: iso('2020-08-20T00:00:00Z'),
        notes: 'Alergia confirmada. Evitar penicilina y derivados.',
        is_verified: true,
        recorded_by: DOCTOR_GARCIA_ID,
        createdAt: iso('2020-08-20T00:00:00Z'),
        updatedAt: iso('2020-08-20T00:00:00Z'),
        isActive: true,
      },
    ],
    medications: [
      {
        id: createId<MedicationId>('MED_LISINOPRIL'),
        patient_id: PATIENT_ID,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Una vez al día',
        route: 'Oral',
        status: MEDICATION_STATUS.ACTIVE,
        start_date: iso('2023-06-15T00:00:00Z'),
        indication: 'Hipertensión arterial',
        prescribing_doctor: DOCTOR_GARCIA_ID,
        notes: 'Tomar por la mañana con el desayuno',
        is_self_reported: false,
        createdAt: iso('2023-06-15T00:00:00Z'),
        updatedAt: iso('2024-01-15T00:00:00Z'),
        isActive: true,
      },
      {
        id: createId<MedicationId>('MED_METFORMIN'),
        patient_id: PATIENT_ID,
        name: 'Metformina',
        dosage: '500mg',
        frequency: 'Dos veces al día',
        route: 'Oral',
        status: MEDICATION_STATUS.ACTIVE,
        start_date: iso('2022-03-10T00:00:00Z'),
        indication: 'Diabetes tipo 2',
        prescribing_doctor: DOCTOR_MARTINEZ_ID,
        notes: 'Con las comidas principales',
        is_self_reported: false,
        createdAt: iso('2022-03-10T00:00:00Z'),
        updatedAt: iso('2024-01-10T00:00:00Z'),
        isActive: true,
      },
      {
        id: createId<MedicationId>('MED_ASPIRIN'),
        patient_id: PATIENT_ID,
        name: 'Aspirina',
        dosage: '100mg',
        frequency: 'Una vez al día',
        route: 'Oral',
        status: MEDICATION_STATUS.ACTIVE,
        start_date: iso('2023-01-15T00:00:00Z'),
        indication: 'Prevención secundaria',
        prescribing_doctor: DOCTOR_GARCIA_ID,
        notes: 'Tomar con alimentos para evitar malestar estomacal',
        is_self_reported: false,
        createdAt: iso('2023-01-15T00:00:00Z'),
        updatedAt: iso('2024-01-10T00:00:00Z'),
        isActive: true,
      },
    ],
    procedures: [
      {
        id: createId<ProcedureId>('PROC_ECG_2024'),
        patient_id: PATIENT_ID,
        name: 'Electrocardiograma',
        performed_date: iso('2024-01-15T00:00:00Z'),
        performed_by: 'Dr. García',
        indication: 'Control rutinario por hipertensión',
        outcome: 'Normal',
        notes: 'ECG sin alteraciones significativas',
        recorded_by: DOCTOR_GARCIA_ID,
        createdAt: iso('2024-01-15T00:00:00Z'),
        updatedAt: iso('2024-01-15T00:00:00Z'),
        isActive: true,
      },
    ],
    encounters: [
      {
        id: createId<EncounterId>('ENC_CONTROL_202401'),
        patient_id: PATIENT_ID,
        encounter_type: ENCOUNTER_TYPE.CONSULTATION,
        encounter_date: iso('2024-01-15T10:00:00Z'),
        chief_complaint: 'Control rutinario',
        present_illness: 'Paciente asintomático, acude para control.',
        assessment: 'Hipertensión y diabetes bien controladas',
        plan: 'Continuar tratamiento actual, control en 3 meses',
        attending_doctor: DOCTOR_GARCIA_ID,
        location: 'Consultorio 205',
        duration_minutes: 30,
        notes: 'Paciente adherente al tratamiento',
        createdAt: iso('2024-01-15T10:00:00Z'),
        updatedAt: iso('2024-01-15T10:00:00Z'),
        isActive: true,
      },
    ],
    immunizations: [
      {
        id: createId<ImmunizationId>('IMM_COVID_2023'),
        patient_id: PATIENT_ID,
        vaccine_name: 'Vacuna COVID-19',
        administration_date: iso('2023-10-15T00:00:00Z'),
        dose_number: 5,
        administered_by: 'Enfermera Rodríguez',
        site: 'Brazo izquierdo',
        notes: 'Refuerzo anual',
        recorded_by: NURSE_RODRIGUEZ_ID,
        createdAt: iso('2023-10-15T00:00:00Z'),
        updatedAt: iso('2023-10-15T00:00:00Z'),
        isActive: true,
      },
    ],
  },
};

type ViewMode = 'summary' | 'timeline' | 'anamnesis';

export default function MedicalHistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [showAnamnesisForm, setShowAnamnesisForm] = useState(false);

  const handleAnamnesisSubmit = (data: any) => {
    console.log('Anamnesis data submitted:', data);
    setShowAnamnesisForm(false);
    // Here you would typically send the data to your API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">
            📋 Historia Clínica Completa
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Gestiona y revisa tu historia médica completa. Información crítica para tu equipo médico.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📅 Cronología
          </button>
          <button
            onClick={() => setViewMode('anamnesis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'anamnesis'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📝 Anamnesis
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setShowAnamnesisForm(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            + Actualizar Historia
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            📄 Generar Resumen
          </button>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            📤 Compartir con Médico
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {showAnamnesisForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Nueva Anamnesis</h2>
                <button
                  onClick={() => setShowAnamnesisForm(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
              <AnamnesisForm onSubmit={handleAnamnesisSubmit} />
            </div>
          ) : (
            <>
              {viewMode === 'summary' && (
                <MedicalHistorySummaryView summary={mockSummary} />
              )}

              {viewMode === 'timeline' && (
                <MedicalHistoryTimelineView timeline={mockTimeline} />
              )}

              {viewMode === 'anamnesis' && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-white">📝 Anamnesis Médica</h2>
                    <p className="text-white/70 max-w-2xl mx-auto">
                      La anamnesis es una herramienta fundamental para el diagnóstico médico.
                      Proporciona información valiosa sobre tus síntomas, antecedentes y estado actual.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/20 rounded-lg border border-white/20 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-white mb-4">🎯 Anamnesis Dirigida</h3>
                      <p className="text-white/70 mb-4">
                        Formulario estructurado para recopilar información específica sobre tus síntomas y antecedentes.
                      </p>
                      <button
                        onClick={() => setShowAnamnesisForm(true)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Iniciar Anamnesis
                      </button>
                    </div>

                    <div className="p-6 bg-black/20 rounded-lg border border-white/20 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-white mb-4">🤖 Anamnesis con IA</h3>
                      <p className="text-white/70 mb-4">
                        Conversación natural con nuestra IA médica para explorar tus síntomas de forma intuitiva.
                      </p>
                      <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                        Hablar con ALTA
                      </button>
                    </div>
                  </div>

                  {/* Previous Anamnesis */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">📚 Anamnesis Anteriores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/20 rounded-lg border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">Control Rutinario</h4>
                          <span className="text-white/60 text-sm">15 Ene 2024</span>
                        </div>
                        <p className="text-white/70 text-sm mb-3">
                          Evaluación completa sin síntomas específicos. Control de condiciones crónicas.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                          Ver Detalles
                        </button>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">Síntomas Digestivos</h4>
                          <span className="text-white/60 text-sm">28 Dic 2023</span>
                        </div>
                        <p className="text-white/70 text-sm mb-3">
                          Molestias abdominales intermitentes. Evaluación gastrointestinal.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                          Ver Detalles
                        </button>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">Evaluación Inicial</h4>
                          <span className="text-white/60 text-sm">10 Mar 2022</span>
                        </div>
                        <p className="text-white/70 text-sm mb-3">
                          Primera consulta. Establecimiento de historia clínica base.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            ← Volver al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
