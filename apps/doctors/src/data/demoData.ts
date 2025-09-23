/**
 * Datos de demostración con UUIDs válidos para desarrollo
 */

import type { PatientProfile } from '@/types/medical'

// UUID válido generado para el paciente de demostración
export const DEMO_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440000'

export const DEMO_PATIENT: PatientProfile = {
  id: DEMO_PATIENT_ID,
  first_name: 'María',
  last_name: 'González',
  full_name: 'María González',
  date_of_birth: '1992-03-15',
  age: 32,
  gender: 'femenino',
  phone: '+34 612 345 678',
  email: 'maria.gonzalez@email.com',
  address: 'Calle Mayor 123, 28001 Madrid',
  emergency_contact_name: 'Juan González',
  emergency_contact_phone: '+34 612 345 679',
  blood_type: 'A+',
  allergies: ['Penicilina'],
  chronic_conditions: [],
  insurance_provider: 'Sanitas',
  insurance_number: 'SAN-123456789',
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: '2024-01-15T10:00:00.000Z'
}