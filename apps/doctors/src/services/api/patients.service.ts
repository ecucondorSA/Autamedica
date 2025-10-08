/**
 * Patients API Service
 * Handles all patient-related API calls
 */

import { BaseAPIService } from './base.service'

export interface Patient {
  id: string
  full_name: string
  email: string
  age?: number
  phone?: string
  medical_history?: unknown[]
}

export class PatientsService extends BaseAPIService {
  async getPatient(id: string): Promise<Patient> {
    return this.get<Patient>(`/api/patients/${id}`)
  }

  async listPatients(): Promise<Patient[]> {
    return this.get<Patient[]>('/api/patients')
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    return this.put<Patient>(`/api/patients/${id}`, data)
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return this.get<Patient[]>(`/api/patients/search?q=${encodeURIComponent(query)}`)
  }
}

// Export singleton instance
export const patientsService = new PatientsService()
