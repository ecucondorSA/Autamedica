// Hooks simplificados para pacientes
export function useActiveSession() {
  return { session: null }
}

export function usePatientData(patientId: string | null) {
  return { patient: null }
}