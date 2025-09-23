/**
 * Tipos TypeScript para datos médicos en la aplicación de doctores
 * Integrados con Supabase y siguiendo estándares médicos
 */

// =============== TIPOS BÁSICOS ===============

export type UUID = string
export type ISODateString = string

export type PatientGender = 'masculino' | 'femenino' | 'otro' | 'no_especificado'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconocido'
export type PrescriptionStatus = 'activa' | 'completada' | 'cancelada' | 'pausada'
export type ConsultationType = 'general' | 'seguimiento' | 'urgencia' | 'especialidad'
export type DiagnosticConfidence = 'alta' | 'media' | 'baja'

// =============== PACIENTE ===============

export interface Patient {
  id: UUID
  first_name: string
  last_name: string
  date_of_birth: ISODateString
  gender: PatientGender
  phone: string | null
  email: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  blood_type: BloodType
  allergies: string[]
  chronic_conditions: string[]
  insurance_provider: string | null
  insurance_number: string | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface PatientProfile extends Patient {
  age: number
  full_name: string
  avatar_url?: string
}

// =============== SIGNOS VITALES ===============

export interface VitalSigns {
  id: UUID
  patient_id: UUID
  doctor_id: UUID
  recorded_at: ISODateString

  // Signos vitales básicos
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  heart_rate: number | null // BPM
  temperature: number | null // Celsius
  oxygen_saturation: number | null // %
  respiratory_rate: number | null // breaths per minute

  // Medidas adicionales
  weight: number | null // kg
  height: number | null // cm
  bmi: number | null

  // Notas y observaciones
  notes: string | null
  created_at: ISODateString
}

// =============== HISTORIAL MÉDICO ===============

export interface MedicalRecord {
  id: UUID
  patient_id: UUID
  doctor_id: UUID
  consultation_date: ISODateString
  consultation_type: ConsultationType

  // Datos de la consulta
  chief_complaint: string // Motivo principal de consulta
  symptoms: string[]
  diagnosis: string
  treatment_plan: string
  follow_up_instructions: string | null

  // Referencias y archivos
  attachments: MedicalAttachment[]

  created_at: ISODateString
  updated_at: ISODateString
}

export interface MedicalAttachment {
  id: UUID
  record_id: UUID
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  description: string | null
  uploaded_at: ISODateString
}

// =============== PRESCRIPCIONES ===============

export interface Prescription {
  id: UUID
  patient_id: UUID
  doctor_id: UUID
  medical_record_id: UUID | null

  // Información del medicamento
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string

  // Estado y fechas
  status: PrescriptionStatus
  prescribed_date: ISODateString
  start_date: ISODateString
  end_date: ISODateString | null

  // Notas adicionales
  notes: string | null
  side_effects_warning: string | null

  created_at: ISODateString
  updated_at: ISODateString
}

// =============== HISTORIAL IA ===============

export interface AIAnalysis {
  id: UUID
  patient_id: UUID
  doctor_id: UUID
  medical_record_id: UUID | null

  // Entrada del análisis
  input_symptoms: string[]
  input_text: string
  additional_context: string | null

  // Resultados del análisis
  primary_diagnosis: AIDiagnosis
  differential_diagnoses: AIDiagnosis[]
  treatment_suggestions: AITreatmentSuggestion[]
  risk_factors: string[]

  // Metadatos
  model_version: string
  confidence_score: number // 0-1
  processing_time_ms: number

  created_at: ISODateString
}

export interface AIDiagnosis {
  condition: string
  icd_code: string | null
  description: string
  confidence: DiagnosticConfidence
  probability: number // 0-1
  reasoning: string
}

export interface AITreatmentSuggestion {
  treatment: string
  type: 'medicacion' | 'procedimiento' | 'medidas_generales' | 'referencia'
  priority: 'alta' | 'media' | 'baja'
  details: string
  contraindications: string[]
}

// =============== CONSULTA ACTIVA ===============

export interface ActiveConsultation {
  id: UUID
  patient_id: UUID
  doctor_id: UUID

  // Información de la sesión
  session_start: ISODateString
  session_end: ISODateString | null
  consultation_type: ConsultationType
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada'

  // Datos de videollamada
  call_duration_seconds: number
  call_quality: 'excelente' | 'buena' | 'regular' | 'mala'
  technical_issues: string | null

  // Notas de la sesión
  session_notes: string | null

  created_at: ISODateString
  updated_at: ISODateString
}

// =============== RESPUESTAS DE API ===============

export interface APIResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

// =============== FILTROS Y BÚSQUEDA ===============

export interface PatientSearchFilters {
  search?: string
  gender?: PatientGender
  age_min?: number
  age_max?: number
  has_chronic_conditions?: boolean
  blood_type?: BloodType
}

export interface MedicalRecordFilters {
  patient_id?: UUID
  consultation_type?: ConsultationType
  date_from?: ISODateString
  date_to?: ISODateString
  diagnosis_contains?: string
}

export interface PrescriptionFilters {
  patient_id?: UUID
  status?: PrescriptionStatus
  medication_name?: string
  active_only?: boolean
}

// =============== HOOKS DE DATOS ===============

export interface UsePatientDataResult {
  patient: PatientProfile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface UseMedicalHistoryResult {
  records: MedicalRecord[]
  loading: boolean
  error: string | null
  loadMore: () => Promise<void>
  hasMore: boolean
}

export interface UsePrescriptionsResult {
  prescriptions: Prescription[]
  loading: boolean
  error: string | null
  addPrescription: (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePrescription: (id: UUID, updates: Partial<Prescription>) => Promise<void>
}

export interface UseVitalSignsResult {
  vitalSigns: VitalSigns[]
  loading: boolean
  error: string | null
  addVitalSigns: (vitals: Omit<VitalSigns, 'id' | 'created_at'>) => Promise<void>
  latest: VitalSigns | null
}

export interface UseAIAnalysisResult {
  analyses: AIAnalysis[]
  loading: boolean
  error: string | null
  createAnalysis: (input: {
    symptoms: string[]
    text: string
    context?: string
  }) => Promise<AIAnalysis | null>
}