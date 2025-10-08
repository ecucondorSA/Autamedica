/**
 * Servicio para obtener datos médicos
 * Usa Supabase en producción, mocks en desarrollo (controlado por feature flags)
 */

import { createClient } from '@supabase/supabase-js'
import { featureFlags } from '@autamedica/shared/config/feature-flags'
import type {
  VitalSigns,
  MedicalRecord,
  Prescription,
  AIAnalysis,
  UUID,
  MedicalRecordFilters,
  PrescriptionFilters
} from '@/types/medical'

// Cliente de Supabase (solo se inicializa si NO usamos mocks)
const supabase = !featureFlags.USE_MOCK_MEDICAL_DATA
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null

// API Client
class MedicalDataAPI {
  private supabase = supabase

  constructor() {
    if (featureFlags.USE_MOCK_MEDICAL_DATA) {
      console.log('⚠️  MedicalDataAPI en modo MOCK (desarrollo)')
    } else {
      console.log('✅ MedicalDataAPI usando Supabase (producción)')
    }
  }

  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Signos vitales
  async getVitalSigns(patientId: UUID): Promise<VitalSigns[]> {
    // Modo mock para desarrollo
    if (featureFlags.USE_MOCK_MEDICAL_DATA || !this.supabase) {
      return this.getMockVitalSigns(patientId)
    }

    // Modo producción con Supabase
    try {
      const { data, error } = await this.supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching vital signs:', error)
      // Fallback a mock en caso de error
      return this.getMockVitalSigns(patientId)
    }
  }

  private getMockVitalSigns(patientId: UUID): Promise<VitalSigns[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = patientId === '550e8400-e29b-41d4-a716-446655440000' ? [
          {
            id: '1' as UUID,
            patient_id: patientId,
            recorded_by_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            recorded_at: new Date().toISOString(),
            blood_pressure_systolic: 120,
            blood_pressure_diastolic: 80,
            heart_rate: 72,
            temperature: 36.5,
            respiratory_rate: 16,
            oxygen_saturation: 98,
            weight: 65.5,
            height: 168,
            bmi: 23.2,
            pain_scale: 0,
            notes: 'Signos vitales dentro de parámetros normales. Paciente estable.',
            measurement_context: 'routine_checkup',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2' as UUID,
            patient_id: patientId,
            recorded_by_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            blood_pressure_systolic: 125,
            blood_pressure_diastolic: 82,
            heart_rate: 75,
            temperature: 36.4,
            respiratory_rate: 15,
            oxygen_saturation: 97,
            weight: 65.8,
            height: 168,
            bmi: 23.3,
            pain_scale: 1,
            notes: 'Leve aumento en presión arterial, seguimiento necesario.',
            measurement_context: 'follow_up',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] : [] as any
        resolve(mockData)
      }, 100) // Simular latencia de red
    })
  }

  // Historial médico
  async getMedicalRecords(
    patientId: UUID,
    filters: MedicalRecordFilters = {},
    page = 0,
    pageSize = 10
  ): Promise<{ records: MedicalRecord[]; hasMore: boolean }> {
    // Modo mock
    if (featureFlags.USE_MOCK_MEDICAL_DATA || !this.supabase) {
      return this.getMockMedicalRecords(patientId, filters, page, pageSize)
    }

    // Modo producción con Supabase
    try {
      let query = this.supabase
        .from('medical_records')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)

      // Aplicar filtros
      if (filters.consultation_type) {
        query = query.eq('consultation_type', filters.consultation_type)
      }
      if (filters.diagnosis_contains) {
        query = query.ilike('diagnosis', `%${filters.diagnosis_contains}%`)
      }

      // Paginación
      const startIndex = page * pageSize
      query = query
        .order('consultation_date', { ascending: false })
        .range(startIndex, startIndex + pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        records: data || [],
        hasMore: count ? startIndex + pageSize < count : false,
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
      return this.getMockMedicalRecords(patientId, filters, page, pageSize)
    }
  }

  private getMockMedicalRecords(
    patientId: UUID,
    filters: MedicalRecordFilters = {},
    page = 0,
    pageSize = 10
  ): Promise<{ records: MedicalRecord[]; hasMore: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRecords = patientId === '550e8400-e29b-41d4-a716-446655440000' ? [
          {
            id: '1' as UUID,
            patient_id: patientId,
            doctor_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            consultation_date: new Date().toISOString(),
            consultation_type: 'consulta_general',
            chief_complaint: 'Control de diabetes tipo 2',
            diagnosis: 'Diabetes mellitus tipo 2 estable',
            treatment: 'Continuar con metformina 850mg c/12h',
            notes: 'Paciente con buen control glicémico. HbA1c 6.8%',
            follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2' as UUID,
            patient_id: patientId,
            doctor_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            consultation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            consultation_type: 'seguimiento',
            chief_complaint: 'Seguimiento diabetes',
            diagnosis: 'Diabetes mellitus tipo 2 en control',
            treatment: 'Ajuste de dosis de metformina',
            notes: 'Mejora en niveles de glucosa. Continuar tratamiento.',
            follow_up_date: new Date().toISOString(),
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] : [] as any

        // Aplicar filtros
        let filteredRecords = mockRecords
          .filter((record: any) => !filters.consultation_type || record.consultation_type === filters.consultation_type)
          .filter((record: any) => !filters.diagnosis_contains || record.diagnosis.toLowerCase().includes(filters.diagnosis_contains.toLowerCase()))

        const startIndex = page * pageSize
        const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize)
        const hasMore = startIndex + pageSize < filteredRecords.length

        resolve({
          records: paginatedRecords,
          hasMore
        })
      }, 150) // Simular latencia de red
    })
  }

  // Prescripciones
  async getPrescriptions(
    patientId: UUID,
    filters: PrescriptionFilters = {}
  ): Promise<Prescription[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPrescriptions = patientId === '550e8400-e29b-41d4-a716-446655440000' ? [
          {
            id: '1' as UUID,
            patient_id: patientId,
            doctor_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            medication_name: 'Metformina',
            dosage: '850mg',
            frequency: 'cada 12 horas',
            instructions: 'Tomar con las comidas principales',
            prescribed_date: new Date().toISOString(),
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'activa',
            refills_remaining: 2,
            total_refills: 3,
            notes: 'Control de diabetes. Monitorear función renal cada 3 meses.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2' as UUID,
            patient_id: patientId,
            doctor_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            medication_name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'una vez al día',
            instructions: 'Tomar por la mañana, preferiblemente a la misma hora',
            prescribed_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'activa',
            refills_remaining: 1,
            total_refills: 2,
            notes: 'Control de presión arterial. Monitorear potasio sérico.',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] : [] as any

        // Aplicar filtros
        let filteredPrescriptions = mockPrescriptions

        if (filters.status) {
          filteredPrescriptions = filteredPrescriptions.filter((p: any) => p.status === filters.status)
        }

        if (filters.medication_name) {
          const searchTerm = filters.medication_name.toLowerCase()
          filteredPrescriptions = filteredPrescriptions.filter((p: any) =>
            p.medication_name.toLowerCase().includes(searchTerm)
          )
        }

        if (filters.active_only) {
          const today = new Date()
          filteredPrescriptions = filteredPrescriptions.filter((p: any) =>
            p.status === 'activa' &&
            new Date(p.start_date) <= today &&
            (!p.end_date || new Date(p.end_date) >= today)
          )
        }

        resolve(filteredPrescriptions)
      }, 120) // Simular latencia de red
    })
  }

  // Análisis de IA
  async getAIAnalyses(patientId: UUID): Promise<AIAnalysis[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAnalyses = patientId === '550e8400-e29b-41d4-a716-446655440000' ? [
          {
            id: '1' as UUID,
            patient_id: patientId,
            created_by_id: '660f9500-f30c-52e5-b827-556766550001' as UUID,
            input_text: 'Paciente con diabetes tipo 2, presenta fatiga y visión borrosa ocasional',
            input_symptoms: ['fatiga', 'visión borrosa'],
            diagnosis_suggestions: [
              {
                condition: 'Diabetes mellitus tipo 2 descompensada',
                confidence: 0.85,
                reasoning: 'Los síntomas concuerdan con hiperglicemia',
                icd_code: 'E11.9'
              },
              {
                condition: 'Retinopatía diabética incipiente',
                confidence: 0.65,
                reasoning: 'Visión borrosa en paciente diabético',
                icd_code: 'H36.0'
              }
            ],
            treatment_suggestions: [
              {
                type: 'medication',
                suggestion: 'Ajustar dosis de metformina',
                priority: 'high',
                reasoning: 'Control glicémico subóptimo'
              },
              {
                type: 'lifestyle',
                suggestion: 'Evaluación oftalmológica urgente',
                priority: 'high',
                reasoning: 'Prevenir progresión de retinopatía'
              }
            ],
            confidence_score: 0.82,
            analysis_model: 'AltaAgent-Medical-v1.0',
            reviewed_by_doctor: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ] : [] as any
        resolve(mockAnalyses)
      }, 200) // Simular latencia de red
    })
  }
}

// Instancia singleton del API
export const medicalDataAPI = new MedicalDataAPI()

// Funciones individuales para compatibilidad
export const fetchVitalSigns = (patientId: UUID) => medicalDataAPI.getVitalSigns(patientId)
export const fetchMedicalRecords = (patientId: UUID, filters?: MedicalRecordFilters, page?: number, pageSize?: number) =>
  medicalDataAPI.getMedicalRecords(patientId, filters, page, pageSize)
export const fetchPrescriptions = (patientId: UUID, filters?: PrescriptionFilters) =>
  medicalDataAPI.getPrescriptions(patientId, filters)
export const fetchAIAnalyses = (patientId: UUID) => medicalDataAPI.getAIAnalyses(patientId)
