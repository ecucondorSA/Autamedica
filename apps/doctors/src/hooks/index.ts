/**
 * Barrel export para todos los hooks médicos
 */

// Patient data hooks
export { usePatientData } from './usePatientData'
export { useMedicalHistory } from './useMedicalHistory'
export { usePrescriptions } from './usePrescriptions'
export { useVitalSigns } from './useVitalSigns'
export { useRealPatients } from './useRealPatients'

// Doctor hooks
export { useAuthenticatedUser } from './useAuthenticatedUser'
export { useRealDoctors, useCurrentDoctor, useDoctorsBySpecialty } from './useRealDoctors'
export { useDoctorStats } from './useDoctorStats'

// AI & Analysis
export { useAIAnalysis } from './useAIAnalysis'

// Telemedicine
export { useActiveSession } from './useActiveSession'
export { useTelemedicineSignaling } from './useTelemedicineSignaling'
