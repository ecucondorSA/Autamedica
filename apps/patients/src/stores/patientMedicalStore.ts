/**
 * Store médico específico para pacientes - Vista desde perspectiva del paciente
 */

// Usando una implementación simple sin zustand por ahora
interface PatientMedicalEntry {
  id: string
  type: 'symptom' | 'medication_taken' | 'vital_sign' | 'note' | 'appointment'
  content: string
  metadata?: {
    medication?: string
    dosage?: string
    takenAt?: string
    symptomSeverity?: 'leve' | 'moderado' | 'severo'
    vitals?: {
      weight?: number
      bloodPressure?: string
      heartRate?: number
      temperature?: number
    }
    appointmentType?: 'consulta' | 'control' | 'emergencia'
  }
  timestamp: string
  patientId: string
  isPrivate?: boolean // Notas privadas del paciente
}

interface PatientMedicalState {
  entries: PatientMedicalEntry[]
  isLoading: boolean
  lastSync: string | null
  personalNotes: string[]
  symptoms: PatientMedicalEntry[]
  medications: PatientMedicalEntry[]
  vitals: PatientMedicalEntry[]
}

class PatientMedicalStore {
  private state: PatientMedicalState = {
    entries: [],
    isLoading: false,
    lastSync: null,
    personalNotes: [],
    symptoms: [],
    medications: [],
    vitals: []
  }

  private listeners: Array<(state: PatientMedicalState) => void> = []

  // Subscribe to state changes
  subscribe(listener: (state: PatientMedicalState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state))
  }

  getState() {
    return this.state
  }

  // Actions específicas para pacientes
  async addPersonalNote(content: string, patientId: string) {
    const newEntry: PatientMedicalEntry = {
      id: crypto.randomUUID(),
      type: 'note',
      content,
      timestamp: new Date().toISOString(),
      patientId,
      isPrivate: true
    }

    this.state.entries.push(newEntry)
    this.state.personalNotes.push(content)
    this.state.lastSync = new Date().toISOString()
    this.notify()

    // Simular sincronización
    await this.syncWithBackend()
  }

  async recordSymptom(symptom: string, severity: 'leve' | 'moderado' | 'severo', patientId: string) {
    const newEntry: PatientMedicalEntry = {
      id: crypto.randomUUID(),
      type: 'symptom',
      content: symptom,
      metadata: {
        symptomSeverity: severity
      },
      timestamp: new Date().toISOString(),
      patientId
    }

    this.state.entries.push(newEntry)
    this.state.symptoms.push(newEntry)
    this.state.lastSync = new Date().toISOString()
    this.notify()

    await this.syncWithBackend()
  }

  async recordMedicationTaken(medication: string, dosage: string, patientId: string) {
    const newEntry: PatientMedicalEntry = {
      id: crypto.randomUUID(),
      type: 'medication_taken',
      content: `Tomé ${medication}`,
      metadata: {
        medication,
        dosage,
        takenAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      patientId
    }

    this.state.entries.push(newEntry)
    this.state.medications.push(newEntry)
    this.state.lastSync = new Date().toISOString()
    this.notify()

    await this.syncWithBackend()
  }

  async recordVitalSigns(vitals: PatientMedicalEntry['metadata']['vitals'], patientId: string) {
    const newEntry: PatientMedicalEntry = {
      id: crypto.randomUUID(),
      type: 'vital_sign',
      content: 'Signos vitales registrados',
      metadata: { vitals },
      timestamp: new Date().toISOString(),
      patientId
    }

    this.state.entries.push(newEntry)
    this.state.vitals.push(newEntry)
    this.state.lastSync = new Date().toISOString()
    this.notify()

    await this.syncWithBackend()
  }

  // Análisis desde perspectiva del paciente
  getSymptomTrends() {
    const symptoms = this.state.symptoms.slice(-7) // Últimos 7 registros
    const trends = symptoms.reduce((acc, symptom) => {
      const severity = symptom.metadata?.symptomSeverity || 'leve'
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return trends
  }

  getMedicationAdherence() {
    const medications = this.state.medications.slice(-30) // Último mes
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentMeds = medications.filter(med =>
      new Date(med.timestamp) >= thirtyDaysAgo
    )

    return {
      totalTaken: recentMeds.length,
      adherenceScore: recentMeds.length > 0 ? Math.min(100, (recentMeds.length / 30) * 100) : 0,
      lastTaken: recentMeds[recentMeds.length - 1]?.timestamp || null
    }
  }

  getHealthSummary() {
    const symptoms = this.getSymptomTrends()
    const medication = this.getMedicationAdherence()
    const vitals = this.state.vitals.slice(-1)[0] // Últimos signos vitales

    return {
      symptomsCount: this.state.symptoms.length,
      lastSymptom: this.state.symptoms[this.state.symptoms.length - 1]?.content || 'Ninguno',
      medicationAdherence: medication.adherenceScore,
      lastVitals: vitals?.metadata?.vitals || null,
      overallStatus: this.calculateOverallStatus()
    }
  }

  private calculateOverallStatus(): 'excelente' | 'bueno' | 'regular' | 'necesita_atencion' {
    const symptoms = this.getSymptomTrends()
    const severeSymptoms = symptoms['severo'] || 0
    const medication = this.getMedicationAdherence()

    if (severeSymptoms > 0) return 'necesita_atencion'
    if (medication.adherenceScore < 50) return 'regular'
    if (medication.adherenceScore > 80) return 'excelente'
    return 'bueno'
  }

  private async syncWithBackend() {
    this.state.isLoading = true
    this.notify()

    try {
      // Simular sincronización con backend
      await new Promise(resolve => setTimeout(resolve, 300))

      console.log('[Patient Medical Store] Synced with backend')
      this.state.lastSync = new Date().toISOString()
    } catch (error) {
      console.error('[Patient Medical Store] Sync failed:', error)
    } finally {
      this.state.isLoading = false
      this.notify()
    }
  }

  // Métodos para compartir con médicos
  async generateMedicalSummaryForDoctor() {
    const summary = this.getHealthSummary()
    const recentEntries = this.state.entries.slice(-10)

    return {
      summary,
      recentEntries: recentEntries.filter(entry => !entry.isPrivate), // Excluir notas privadas
      trends: this.getSymptomTrends(),
      medicationAdherence: this.getMedicationAdherence(),
      generatedAt: new Date().toISOString()
    }
  }

  // Limpiar datos sensibles
  async clearPrivateData() {
    this.state.personalNotes = []
    this.state.entries = this.state.entries.filter(entry => !entry.isPrivate)
    this.notify()
  }
}

// Singleton instance para toda la app
export const patientMedicalStore = new PatientMedicalStore()

// React hook para usar el store
export function usePatientMedicalStore() {
  const [state, setState] = useState(patientMedicalStore.getState())

  useEffect(() => {
    const unsubscribe = patientMedicalStore.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    addPersonalNote: patientMedicalStore.addPersonalNote.bind(patientMedicalStore),
    recordSymptom: patientMedicalStore.recordSymptom.bind(patientMedicalStore),
    recordMedicationTaken: patientMedicalStore.recordMedicationTaken.bind(patientMedicalStore),
    recordVitalSigns: patientMedicalStore.recordVitalSigns.bind(patientMedicalStore),
    getHealthSummary: patientMedicalStore.getHealthSummary.bind(patientMedicalStore),
    generateMedicalSummaryForDoctor: patientMedicalStore.generateMedicalSummaryForDoctor.bind(patientMedicalStore)
  }
}

// Necesario para useState
import { useState, useEffect } from 'react'