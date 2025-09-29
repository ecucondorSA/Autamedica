/**
 * @autamedica/types/supabase - Tipos generados desde Supabase database schema
 *
 * Generado automáticamente el: 2025-09-28T15:45:22.777Z
 * Fuente: database/schema.sql
 *
 * IMPORTANTE: Este archivo se actualiza automáticamente con `pnpm db:generate`
 * No editar manualmente - usar los tipos de entities/ para logic business
 */

// ============================================================================
// JSON and Base Types
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ISODateTime = string // ISO 8601 DateTime (timestamptz)
export type ISODate = string     // ISO 8601 Date

// ============================================================================
// Database Structure
// ============================================================================

export interface Database {
  public: {
    Tables: {
      // appointments table
      appointments: {
        Row: {
          organization_id: string | null // UUID
          doctor_id: string // UUID
          duration_minutes: number
          id: string | null // UUID
          notes: string | null
          patient_id: string // UUID
          start_time: string // timestamptz
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | null
          type: 'consultation' | 'follow-up' | 'emergency' | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          organization_id?: string | null // UUID
          doctor_id: string // UUID
          duration_minutes: number
          id?: string | null // UUID
          notes?: string | null
          patient_id: string // UUID
          start_time: string // timestamptz
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | null
          type?: 'consultation' | 'follow-up' | 'emergency' | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          organization_id?: string | null // UUID
          doctor_id?: string // UUID
          duration_minutes?: number
          id?: string | null // UUID
          notes?: string | null
          patient_id?: string // UUID
          start_time?: string // timestamptz
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | null
          type?: 'consultation' | 'follow-up' | 'emergency' | null
          updated_at?: string | null // timestamptz
        }
      }
      // audit_log table
      audit_log: {
        Row: {
          action: string
          id: string | null // UUID
          ip_address: string | null // IP address
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null // UUID
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null // UUID
        }
        Insert: {
          action: string
          id?: string | null // UUID
          ip_address?: string | null // IP address
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null // UUID
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null // UUID
        }
        Update: {
          action?: string
          id?: string | null // UUID
          ip_address?: string | null // IP address
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null // UUID
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null // UUID
        }
      }
      // billing_accounts table
      billing_accounts: {
        Row: {
          billing_address: Json
          billing_email: string
          billing_name: string
          entity_id: string // UUID
          entity_type: 'patient' | 'organization'
          id: string | null // UUID
          is_active: boolean | null
          payment_method: Json | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          billing_address: Json
          billing_email: string
          billing_name: string
          entity_id: string // UUID
          entity_type: 'patient' | 'organization'
          id?: string | null // UUID
          is_active?: boolean | null
          payment_method?: Json | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          billing_address?: Json
          billing_email?: string
          billing_name?: string
          entity_id?: string // UUID
          entity_type?: 'patient' | 'organization'
          id?: string | null // UUID
          is_active?: boolean | null
          payment_method?: Json | null
          updated_at?: string | null // timestamptz
        }
      }
      // organizations table
      organizations: {
        Row: {
          address: Json | null
          contact: Json | null
          created_at: string | null // timestamptz
          id: string | null // UUID
          industry: string | null
          is_active: boolean | null
          legal_name: string | null
          metadata: Json | null
          name: string
          owner_profile_id: string // UUID
          size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          slug: string
          tax_id: string | null
          type: 'company' | 'clinic' | 'provider' | 'partner' | 'internal' | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          address?: Json | null
          contact?: Json | null
          created_at?: string | null // timestamptz
          id?: string | null // UUID
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          metadata?: Json | null
          name: string
          owner_profile_id: string // UUID
          size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          slug: string
          tax_id?: string | null
          type?: 'company' | 'clinic' | 'provider' | 'partner' | 'internal' | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          address?: Json | null
          contact?: Json | null
          created_at?: string | null // timestamptz
          id?: string | null // UUID
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          metadata?: Json | null
          name?: string
          owner_profile_id?: string // UUID
          size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          slug?: string
          tax_id?: string | null
          type?: 'company' | 'clinic' | 'provider' | 'partner' | 'internal' | null
          updated_at?: string | null // timestamptz
        }
      }
      // org_members table
      org_members: {
        Row: {
          invited_by: string | null // UUID
          metadata: Json | null
          organization_id: string | null // UUID
          profile_id: string | null // UUID
          role: 'owner' | 'admin' | 'member' | 'billing' | 'support' | null
          status: 'pending' | 'active' | 'suspended' | 'revoked' | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          invited_by?: string | null // UUID
          metadata?: Json | null
          organization_id?: string | null // UUID
          profile_id?: string | null // UUID
          role?: 'owner' | 'admin' | 'member' | 'billing' | 'support' | null
          status?: 'pending' | 'active' | 'suspended' | 'revoked' | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          invited_by?: string | null // UUID
          metadata?: Json | null
          organization_id?: string | null // UUID
          profile_id?: string | null // UUID
          role?: 'owner' | 'admin' | 'member' | 'billing' | 'support' | null
          status?: 'pending' | 'active' | 'suspended' | 'revoked' | null
          updated_at?: string | null // timestamptz
        }
      }
      // user_roles table
      user_roles: {
        Row: {
          granted_at: string | null // timestamptz
          granted_by: string | null // UUID
          id: string | null // UUID
          metadata: Json | null
          organization_id: string | null // UUID
          profile_id: string
          role: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin'
        }
        Insert: {
          granted_at?: string | null // timestamptz
          granted_by?: string | null // UUID
          id?: string | null // UUID
          metadata?: Json | null
          organization_id?: string | null // UUID
          profile_id: string
          role: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin'
        }
        Update: {
          granted_at?: string | null // timestamptz
          granted_by?: string | null // UUID
          id?: string | null // UUID
          metadata?: Json | null
          organization_id?: string | null // UUID
          profile_id?: string
          role?: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin'
        }
      }
      // doctors table
      doctors: {
        Row: {
          bio: string | null
          education: Json | null
          email: string
          experience: Json | null
          first_name: string
          id: string | null // UUID
          is_active: boolean | null
          last_name: string
          license_number: string
          phone: string | null
          specialties: string | null
          updated_at: string | null // timestamptz
          user_id: string // UUID
        }
        Insert: {
          bio?: string | null
          education?: Json | null
          email: string
          experience?: Json | null
          first_name: string
          id?: string | null // UUID
          is_active?: boolean | null
          last_name: string
          license_number: string
          phone?: string | null
          specialties?: string | null
          updated_at?: string | null // timestamptz
          user_id: string // UUID
        }
        Update: {
          bio?: string | null
          education?: Json | null
          email?: string
          experience?: Json | null
          first_name?: string
          id?: string | null // UUID
          is_active?: boolean | null
          last_name?: string
          license_number?: string
          phone?: string | null
          specialties?: string | null
          updated_at?: string | null // timestamptz
          user_id?: string // UUID
        }
      }
      // error_log table
      error_log: {
        Row: {
          error_message: string
          error_type: string
          id: string | null // UUID
          ip_address: string | null // IP address
          is_resolved: boolean | null
          method: string | null
          resolved_at: string | null // timestamptz
          resolved_by: string | null // UUID
          severity: 'low' | 'medium' | 'high' | 'critical' | null
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null // UUID
        }
        Insert: {
          error_message: string
          error_type: string
          id?: string | null // UUID
          ip_address?: string | null // IP address
          is_resolved?: boolean | null
          method?: string | null
          resolved_at?: string | null // timestamptz
          resolved_by?: string | null // UUID
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null // UUID
        }
        Update: {
          error_message?: string
          error_type?: string
          id?: string | null // UUID
          ip_address?: string | null // IP address
          is_resolved?: boolean | null
          method?: string | null
          resolved_at?: string | null // timestamptz
          resolved_by?: string | null // UUID
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null // UUID
        }
      }
      // invoice_items table
      invoice_items: {
        Row: {
          description: string
          id: string | null // UUID
          invoice_id: string // UUID
          quantity: number // decimal
          service_code: string | null
          total_price: number // decimal
          unit_price: number // decimal
        }
        Insert: {
          description: string
          id?: string | null // UUID
          invoice_id: string // UUID
          quantity?: number // decimal
          service_code?: string | null
          total_price: number // decimal
          unit_price: number // decimal
        }
        Update: {
          description?: string
          id?: string | null // UUID
          invoice_id?: string // UUID
          quantity?: number // decimal
          service_code?: string | null
          total_price?: number // decimal
          unit_price?: number // decimal
        }
      }
      // invoices table
      invoices: {
        Row: {
          appointment_id: string | null // UUID
          billing_account_id: string // UUID
          currency: string | null
          doctor_id: string | null // UUID
          due_date: string // date
          id: string | null // UUID
          invoice_number: string
          issue_date: string // date
          notes: string | null
          patient_id: string | null // UUID
          payment_terms: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | null
          subtotal: number // decimal
          tax_amount: number // decimal
          total_amount: number // decimal
          updated_at: string | null // timestamptz
        }
        Insert: {
          appointment_id?: string | null // UUID
          billing_account_id: string // UUID
          currency?: string | null
          doctor_id?: string | null // UUID
          due_date: string // date
          id?: string | null // UUID
          invoice_number: string
          issue_date?: string // date
          notes?: string | null
          patient_id?: string | null // UUID
          payment_terms?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | null
          subtotal?: number // decimal
          tax_amount?: number // decimal
          total_amount?: number // decimal
          updated_at?: string | null // timestamptz
        }
        Update: {
          appointment_id?: string | null // UUID
          billing_account_id?: string // UUID
          currency?: string | null
          doctor_id?: string | null // UUID
          due_date?: string // date
          id?: string | null // UUID
          invoice_number?: string
          issue_date?: string // date
          notes?: string | null
          patient_id?: string | null // UUID
          payment_terms?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | null
          subtotal?: number // decimal
          tax_amount?: number // decimal
          total_amount?: number // decimal
          updated_at?: string | null // timestamptz
        }
      }
      // medical_records table
      medical_records: {
        Row: {
          appointment_id: string | null // UUID
          data: Json | null
          doctor_id: string | null // UUID
          id: string | null // UUID
          patient_id: string // UUID
          summary: string | null
          title: string
          updated_at: string | null // timestamptz
          visibility: 'patient' | 'care_team' | 'private' | null
        }
        Insert: {
          appointment_id?: string | null // UUID
          data?: Json | null
          doctor_id?: string | null // UUID
          id?: string | null // UUID
          patient_id: string // UUID
          summary?: string | null
          title: string
          updated_at?: string | null // timestamptz
          visibility?: 'patient' | 'care_team' | 'private' | null
        }
        Update: {
          appointment_id?: string | null // UUID
          data?: Json | null
          doctor_id?: string | null // UUID
          id?: string | null // UUID
          patient_id?: string // UUID
          summary?: string | null
          title?: string
          updated_at?: string | null // timestamptz
          visibility?: 'patient' | 'care_team' | 'private' | null
        }
      }
      // patient_care_team table
      patient_care_team: {
        Row: {
          added_by: string | null // UUID
          doctor_id: string | null // UUID
          patient_id: string | null // UUID
          relationship: string | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          added_by?: string | null // UUID
          doctor_id?: string | null // UUID
          patient_id?: string | null // UUID
          relationship?: string | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          added_by?: string | null // UUID
          doctor_id?: string | null // UUID
          patient_id?: string | null // UUID
          relationship?: string | null
          updated_at?: string | null // timestamptz
        }
      }
      // patients table
      patients: {
        Row: {
          address: Json | null
          organization_id: string | null // UUID
          date_of_birth: string | null // date
          email: string
          emergency_contact: Json | null
          first_name: string
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          id: string | null // UUID
          last_name: string
          medical_record_number: string | null
          phone: string | null
          updated_at: string | null // timestamptz
          user_id: string // UUID
        }
        Insert: {
          address?: Json | null
          organization_id?: string | null // UUID
          date_of_birth?: string | null // date
          email: string
          emergency_contact?: Json | null
          first_name: string
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          id?: string | null // UUID
          last_name: string
          medical_record_number?: string | null
          phone?: string | null
          updated_at?: string | null // timestamptz
          user_id: string // UUID
        }
        Update: {
          address?: Json | null
          organization_id?: string | null // UUID
          date_of_birth?: string | null // date
          email?: string
          emergency_contact?: Json | null
          first_name?: string
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          id?: string | null // UUID
          last_name?: string
          medical_record_number?: string | null
          phone?: string | null
          updated_at?: string | null // timestamptz
          user_id?: string // UUID
        }
      }
      // payments table
      payments: {
        Row: {
          amount: number // decimal
          billing_account_id: string // UUID
          currency: string | null
          id: string | null // UUID
          invoice_id: string // UUID
          notes: string | null
          payment_date: string | null // timestamptz
          payment_method: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'insurance' | 'other' | null
          processed_by: string | null // UUID
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | null
          transaction_id: string | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          amount: number // decimal
          billing_account_id: string // UUID
          currency?: string | null
          id?: string | null // UUID
          invoice_id: string // UUID
          notes?: string | null
          payment_date?: string | null // timestamptz
          payment_method?: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'insurance' | 'other' | null
          processed_by?: string | null // UUID
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | null
          transaction_id?: string | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          amount?: number // decimal
          billing_account_id?: string // UUID
          currency?: string | null
          id?: string | null // UUID
          invoice_id?: string // UUID
          notes?: string | null
          payment_date?: string | null // timestamptz
          payment_method?: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'insurance' | 'other' | null
          processed_by?: string | null // UUID
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | null
          transaction_id?: string | null
          updated_at?: string | null // timestamptz
        }
      }
      // profiles table
      profiles: {
        Row: {
          email: string
          first_name: string | null
          id: string // UUID
          last_name: string | null
          role: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin' | null
          updated_at: string | null // timestamptz
        }
        Insert: {
          email: string
          first_name?: string | null
          id: string // UUID
          last_name?: string | null
          role?: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin' | null
          updated_at?: string | null // timestamptz
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string // UUID
          last_name?: string | null
          role?: 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'admin' | 'platform_admin' | null
          updated_at?: string | null // timestamptz
        }
      }
      // service_plans table
      service_plans: {
        Row: {
          currency: string | null
          description: string | null
          features: Json | null
          id: string | null // UUID
          is_active: boolean | null
          is_public: boolean | null
          max_appointments_per_month: number | null
          max_users: number | null
          name: string
          plan_type: 'individual' | 'family' | 'corporate' | 'enterprise'
          price_monthly: number | null // decimal
          price_yearly: number | null // decimal
          updated_at: string | null // timestamptz
        }
        Insert: {
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null // UUID
          is_active?: boolean | null
          is_public?: boolean | null
          max_appointments_per_month?: number | null
          max_users?: number | null
          name: string
          plan_type: 'individual' | 'family' | 'corporate' | 'enterprise'
          price_monthly?: number | null // decimal
          price_yearly?: number | null // decimal
          updated_at?: string | null // timestamptz
        }
        Update: {
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null // UUID
          is_active?: boolean | null
          is_public?: boolean | null
          max_appointments_per_month?: number | null
          max_users?: number | null
          name?: string
          plan_type?: 'individual' | 'family' | 'corporate' | 'enterprise'
          price_monthly?: number | null // decimal
          price_yearly?: number | null // decimal
          updated_at?: string | null // timestamptz
        }
      }
      // subscriptions table
      subscriptions: {
        Row: {
          billing_account_id: string // UUID
          billing_cycle: 'monthly' | 'yearly' | null
          end_date: string | null // date
          id: string | null // UUID
          is_trial: boolean | null
          next_billing_date: string | null // date
          service_plan_id: string // UUID
          start_date: string // date
          status: 'active' | 'paused' | 'cancelled' | 'expired' | null
          subscriber_id: string // UUID
          subscriber_type: 'patient' | 'organization'
          trial_end_date: string | null // date
          trial_start_date: string | null // date
          updated_at: string | null // timestamptz
        }
        Insert: {
          billing_account_id: string // UUID
          billing_cycle?: 'monthly' | 'yearly' | null
          end_date?: string | null // date
          id?: string | null // UUID
          is_trial?: boolean | null
          next_billing_date?: string | null // date
          service_plan_id: string // UUID
          start_date?: string // date
          status?: 'active' | 'paused' | 'cancelled' | 'expired' | null
          subscriber_id: string // UUID
          subscriber_type: 'patient' | 'organization'
          trial_end_date?: string | null // date
          trial_start_date?: string | null // date
          updated_at?: string | null // timestamptz
        }
        Update: {
          billing_account_id?: string // UUID
          billing_cycle?: 'monthly' | 'yearly' | null
          end_date?: string | null // date
          id?: string | null // UUID
          is_trial?: boolean | null
          next_billing_date?: string | null // date
          service_plan_id?: string // UUID
          start_date?: string // date
          status?: 'active' | 'paused' | 'cancelled' | 'expired' | null
          subscriber_id?: string // UUID
          subscriber_type?: 'patient' | 'organization'
          trial_end_date?: string | null // date
          trial_start_date?: string | null // date
          updated_at?: string | null // timestamptz
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// Convenience Types
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Helper types for better DX
export type RowOf<T extends keyof Database['public']['Tables']> = Tables<T>
export type InsertOf<T extends keyof Database['public']['Tables']> = TablesInsert<T>
export type UpdateOf<T extends keyof Database['public']['Tables']> = TablesUpdate<T>
