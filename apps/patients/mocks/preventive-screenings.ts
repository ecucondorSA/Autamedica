/**
 * Mock data - Preventive Screenings
 * Datos de ejemplo para salud preventiva
 */

export interface PreventiveScreening {
  id: string;
  patient_id: string;
  screening_type: 'cholesterol' | 'blood_pressure' | 'mammography' | 'pap_smear' | 'colonoscopy' | 'glucose';
  title: string;
  description: string;
  recommended_frequency: string;
  last_done_date: string | null;
  next_due_date: string;
  status: 'overdue' | 'due_soon' | 'up_to_date';
  priority: 'high' | 'medium' | 'low';
}

export const mockPreventiveScreenings: PreventiveScreening[] = [
  {
    id: "scr_001",
    patient_id: "pat_demo_001",
    screening_type: "cholesterol",
    title: "Control de Colesterol",
    description: "Análisis de perfil lipídico completo (LDL, HDL, triglicéridos)",
    recommended_frequency: "Anual",
    last_done_date: "2024-09-25T00:00:00Z",
    next_due_date: "2025-09-25T00:00:00Z",
    status: "up_to_date",
    priority: "medium",
  },
  {
    id: "scr_002",
    patient_id: "pat_demo_001",
    screening_type: "blood_pressure",
    title: "Control de Presión Arterial",
    description: "Medición de presión arterial - paciente con HTA",
    recommended_frequency: "Mensual",
    last_done_date: "2024-09-30T00:00:00Z",
    next_due_date: "2024-10-30T00:00:00Z",
    status: "due_soon",
    priority: "high",
  },
  {
    id: "scr_003",
    patient_id: "pat_demo_001",
    screening_type: "mammography",
    title: "Mamografía",
    description: "Screening de cáncer de mama (recomendado a partir de 40 años)",
    recommended_frequency: "Anual",
    last_done_date: "2023-08-15T00:00:00Z",
    next_due_date: "2024-08-15T00:00:00Z",
    status: "overdue",
    priority: "high",
  },
  {
    id: "scr_004",
    patient_id: "pat_demo_001",
    screening_type: "glucose",
    title: "Glucemia en Ayunas",
    description: "Control de niveles de glucosa para prevención de diabetes",
    recommended_frequency: "Anual",
    last_done_date: "2024-09-25T00:00:00Z",
    next_due_date: "2025-09-25T00:00:00Z",
    status: "up_to_date",
    priority: "medium",
  },
];

export function getScreeningsByStatus(status: PreventiveScreening['status']) {
  return mockPreventiveScreenings.filter(scr => scr.status === status);
}

export function getOverdueScreenings() {
  return getScreeningsByStatus('overdue');
}
