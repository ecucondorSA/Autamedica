/**
 * Mock data - Medical Records
 * Datos de ejemplo para historial médico
 */

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  record_type: 'diagnosis' | 'prescription' | 'lab_result' | 'note';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  created_at: string;
  updated_at: string;
}

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "rec_001",
    patient_id: "pat_demo_001",
    doctor_id: "doc_garcia_card",
    appointment_id: "apt_2024_099",
    record_type: "diagnosis",
    title: "Hipertensión Arterial Controlada",
    description: "Paciente con diagnóstico de HTA desde hace 2 años, actualmente bien controlada con medicación.",
    diagnosis: "Hipertensión Arterial Grado I (ICD-10: I10)",
    treatment: "Lisinopril 10mg 1 vez al día",
    created_at: "2024-09-30T16:30:00Z",
    updated_at: "2024-09-30T16:30:00Z",
  },
  {
    id: "rec_002",
    patient_id: "pat_demo_001",
    doctor_id: "doc_martinez_gen",
    appointment_id: null,
    record_type: "lab_result",
    title: "Análisis de Sangre Completo",
    description: "Hemograma completo, perfil lipídico y glucemia en ayunas.",
    created_at: "2024-09-25T08:00:00Z",
    updated_at: "2024-09-25T08:00:00Z",
  },
  {
    id: "rec_003",
    patient_id: "pat_demo_001",
    doctor_id: "doc_garcia_card",
    appointment_id: "apt_2024_099",
    record_type: "prescription",
    title: "Renovación de Receta - Antihipertensivos",
    description: "Renovación de medicación para control de presión arterial por 3 meses.",
    treatment: "Lisinopril 10mg - Tomar 1 comprimido cada 24hs en ayunas",
    created_at: "2024-09-30T16:45:00Z",
    updated_at: "2024-09-30T16:45:00Z",
  },
];
