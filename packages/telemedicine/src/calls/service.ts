import { createClient } from '@supabase/supabase-js'
import type { Database } from '@autamedica/types'
import { logger } from '@autamedica/shared'
import type { Call, CallStatus, CallEvent } from './types'

// Service for call management
export class CallService {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async createCall(doctorId: string, patientId: string): Promise<Call> {
    try {
      // Get auth session for authorization header
      const { data: { session } } = await this.supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No active session found. Please login first.')
      }

      // Use Edge Function instead of direct RPC call
      const response = await fetch(`https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/create-call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          doctorId,
          patientId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create call')
      }

      return result.call as Call
    } catch (err) {
      logger.error('Error in createCall:', err)
      throw err
    }
  }

  async updateCallStatus(callId: string, status: CallStatus, reason?: string): Promise<boolean> {
    try {
      // Get auth session for authorization header
      const { data: { session } } = await this.supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No active session found. Please login first.')
      }

      // Use Edge Function instead of direct RPC call
      const response = await fetch(`https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/update-call-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          callId,
          status,
          reason
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update call status')
      }

      return result.updated as boolean
    } catch (err) {
      logger.error('Error in updateCallStatus:', err)
      throw err
    }
  }

  async getCall(callId: string): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .maybeSingle()

    if (error) throw error
    return data as Call | null
  }

  async getCallByRoomId(roomId: string): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('room_id', roomId)
      .maybeSingle()

    if (error) throw error
    return data as Call | null
  }

  async getActiveCallsForDoctor(doctorId: string): Promise<Call[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('doctor_id', doctorId)
      .in('status', ['requested', 'ringing', 'accepted', 'connecting', 'connected'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Call[]
  }

  async getActiveCallsForPatient(patientId: string): Promise<Call[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('patient_id', patientId)
      .in('status', ['requested', 'ringing', 'accepted', 'connecting', 'connected'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Call[]
  }

  async logEvent(callId: string, type: string, payload?: Record<string, any>): Promise<void> {
    const { error } = await this.supabase
      .from('call_events')
      .insert({
        call_id: callId,
        type,
        payload
      })

    if (error) throw error
  }

  async getCallEvents(callId: string): Promise<CallEvent[]> {
    const { data, error } = await this.supabase
      .from('call_events')
      .select('*')
      .eq('call_id', callId)
      .order('at', { ascending: true })

    if (error) throw error
    return data as CallEvent[]
  }

  // Subscribe to call changes
  subscribeToCall(callId: string, callback: (call: Call) => void) {
    return this.supabase
      .channel(`call:${callId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'calls',
        filter: `id=eq.${callId}`
      }, (payload: any) => {
        callback(payload.new as Call)
      })
      .subscribe()
  }

  // Subscribe to calls for a user (doctor or patient)
  subscribeToUserCalls(userId: string, userType: 'doctor' | 'patient', callback: (call: Call) => void) {
    const column = userType === 'doctor' ? 'doctor_id' : 'patient_id'

    return this.supabase
      .channel(`user_calls:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calls',
        filter: `${column}=eq.${userId}`
      }, (payload: any) => {
        callback(payload.new as Call)
      })
      .subscribe()
  }
}

// Utility function to generate room ID
export function generateRoomId(): string {
  return `room_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`
}

// Create service instance with environment variables
export function createCallService(): CallService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return new CallService(supabaseUrl, supabaseKey)
}