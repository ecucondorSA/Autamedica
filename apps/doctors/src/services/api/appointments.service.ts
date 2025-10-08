/**
 * Appointments API Service
 * Handles all appointment-related API calls
 */

import { BaseAPIService } from './base.service'

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  scheduled_at: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  type: 'consultation' | 'follow_up' | 'emergency'
  notes?: string
}

export class AppointmentsService extends BaseAPIService {
  async getAppointment(id: string): Promise<Appointment> {
    return this.get<Appointment>(`/api/appointments/${id}`)
  }

  async listAppointments(doctorId: string): Promise<Appointment[]> {
    return this.get<Appointment[]>(`/api/appointments?doctor_id=${doctorId}`)
  }

  async createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
    return this.post<Appointment>('/api/appointments', data)
  }

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment> {
    return this.put<Appointment>(`/api/appointments/${id}`, data)
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.delete(`/api/appointments/${id}`)
  }

  async getTodayAppointments(doctorId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.get<Appointment[]>(
      `/api/appointments?doctor_id=${doctorId}&date=${today}`
    )
  }
}

// Export singleton instance
export const appointmentsService = new AppointmentsService()
