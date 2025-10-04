/**
 * Utilidades para verificar completitud de perfil de paciente
 */

interface PatientProfile {
  birth_date: string | null;
  gender: string | null;
  emergency_contact: Record<string, unknown> | null;
}

/**
 * Verifica si el perfil de paciente está completo
 *
 * Campos mínimos requeridos:
 * - birth_date
 * - gender
 * - emergency_contact (con name y phone)
 */
export function isPatientProfileComplete(patient: PatientProfile): boolean {
  if (!patient.birth_date) return false;
  if (!patient.gender) return false;

  if (!patient.emergency_contact) return false;

  const contact = patient.emergency_contact as { name?: string; phone?: string };
  if (!contact.name || !contact.phone) return false;

  return true;
}

/**
 * Retorna lista de campos faltantes en el perfil
 */
export function getMissingPatientFields(patient: PatientProfile): string[] {
  const missing: string[] = [];

  if (!patient.birth_date) missing.push('Fecha de nacimiento');
  if (!patient.gender) missing.push('Género');

  if (!patient.emergency_contact) {
    missing.push('Contacto de emergencia');
  } else {
    const contact = patient.emergency_contact as { name?: string; phone?: string };
    if (!contact.name) missing.push('Nombre de contacto de emergencia');
    if (!contact.phone) missing.push('Teléfono de contacto de emergencia');
  }

  return missing;
}

/**
 * Calcula progreso de completitud del perfil (0-100%)
 */
export function getPatientProfileCompletion(patient: PatientProfile): number {
  const totalFields = 7; // birth_date, gender, blood_type, height_cm, weight_kg, emergency_contact, insurance_info
  let completedFields = 0;

  if (patient.birth_date) completedFields++;
  if (patient.gender) completedFields++;

  // emergency_contact cuenta como 1 campo si tiene name y phone
  if (patient.emergency_contact) {
    const contact = patient.emergency_contact as { name?: string; phone?: string };
    if (contact.name && contact.phone) completedFields++;
  }

  // Campos opcionales pero recomendados
  const patientAny = patient as any;
  if (patientAny.blood_type) completedFields++;
  if (patientAny.height_cm) completedFields++;
  if (patientAny.weight_kg) completedFields++;
  if (patientAny.insurance_info) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}
