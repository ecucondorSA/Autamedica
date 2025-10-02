/**
 * Mock data - Appointments
 * Datos de ejemplo para desarrollo y testing
 */

import type { Appointment } from "@autamedica/types";

export const mockAppointments: Appointment[] = [
  {
    id: "apt_2025_001" as any,
    patient_id: "pat_demo_001" as any,
    doctor_id: "doc_garcia_card" as any,
    appointment_type: "follow_up",
    status: "confirmed",
    start_time: "2025-10-15T10:00:00Z",
    end_time: "2025-10-15T10:30:00Z",
    duration_minutes: 30,
    location: "Consultorio 302",
    meeting_url: null,
    reason: "Control de presión arterial y ajuste de medicación",
    notes: "Traer resultados de laboratorio de la semana pasada",
    created_by: "doc_garcia_card" as any,
    created_at: "2025-10-01T14:23:00Z",
    updated_at: "2025-10-01T14:23:00Z",
    deleted_at: null,
  },
  {
    id: "apt_2025_002" as any,
    patient_id: "pat_demo_001" as any,
    doctor_id: "doc_martinez_gen" as any,
    appointment_type: "consultation",
    status: "scheduled",
    start_time: "2025-10-20T14:00:00Z",
    end_time: "2025-10-20T14:30:00Z",
    duration_minutes: 30,
    location: null,
    meeting_url: "https://meet.autamedica.com/room/abc123",
    reason: "Consulta general - chequeo anual",
    notes: null,
    created_by: "pat_demo_001" as any,
    created_at: "2025-10-02T09:15:00Z",
    updated_at: "2025-10-02T09:15:00Z",
    deleted_at: null,
  },
  {
    id: "apt_2025_003" as any,
    patient_id: "pat_demo_001" as any,
    doctor_id: "doc_rodriguez_endo" as any,
    appointment_type: "telemedicine",
    status: "scheduled",
    start_time: "2025-10-25T11:00:00Z",
    end_time: "2025-10-25T11:30:00Z",
    duration_minutes: 30,
    location: null,
    meeting_url: "https://meet.autamedica.com/room/xyz789",
    reason: "Seguimiento diabetes - revisión de niveles de glucosa",
    notes: "Tener glucómetro disponible para la videoconsulta",
    created_by: "doc_rodriguez_endo" as any,
    created_at: "2025-09-28T16:00:00Z",
    updated_at: "2025-09-28T16:00:00Z",
    deleted_at: null,
  },
  {
    id: "apt_2024_099" as any,
    patient_id: "pat_demo_001" as any,
    doctor_id: "doc_fernandez_nutr" as any,
    appointment_type: "consultation",
    status: "completed",
    start_time: "2024-09-30T16:00:00Z",
    end_time: "2024-09-30T16:45:00Z",
    duration_minutes: 45,
    location: "Consultorio Virtual",
    meeting_url: "https://meet.autamedica.com/room/past123",
    reason: "Plan nutricional para control de peso",
    notes: "Se envió plan por email. Próximo control en 30 días.",
    created_by: "pat_demo_001" as any,
    created_at: "2024-09-20T10:00:00Z",
    updated_at: "2024-09-30T17:00:00Z",
    deleted_at: null,
  },
];

export function getAppointmentsByStatus(status: Appointment['status']) {
  return mockAppointments.filter(apt => apt.status === status);
}

export function getNextAppointment() {
  const now = new Date();
  return mockAppointments
    .filter(apt =>
      apt.status !== 'completed' &&
      apt.status !== 'cancelled' &&
      new Date(apt.start_time) > now
    )
    .sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )[0];
}
