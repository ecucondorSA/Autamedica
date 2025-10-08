/**
 * @autamedica/types/supabase - Tipos generados desde Supabase database schema
 *
 * Generado automáticamente el: 2025-10-08T00:00:00.000Z
 * Fuente: Supabase MCP - Schema actual en producción (18 tablas + TypeScript-aligned)
 *
 * IMPORTANTE: Este archivo se actualiza con el MCP de Supabase
 * No editar manualmente - usar los tipos de entities/ para logic business
 *
 * Últimas actualizaciones:
 * - ✅ TypeScript alignment completado (22 columnas nuevas)
 * - ✅ Soft deletes implementados (deleted_at)
 * - ✅ Community features agregadas
 * - ✅ Patient tracking systems completos
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      anamnesis: {
        Row: {
          completion_percentage: number
          created_at: string
          deleted_at: string | null
          id: string
          locked: boolean
          locked_at: string | null
          locked_by: string | null
          patient_id: string
          privacy_accepted: boolean
          sections_status: Json
          status: string
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          patient_id: string
          privacy_accepted?: boolean
          sections_status?: Json
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          patient_id?: string
          privacy_accepted?: boolean
          sections_status?: Json
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      anamnesis_attachments: {
        Row: {
          anamnesis_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          file_type: string
          id: string
          section: string | null
          uploaded_by: string
        }
        Insert: {
          anamnesis_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          file_type: string
          id?: string
          section?: string | null
          uploaded_by: string
        }
        Update: {
          anamnesis_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          section?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_attachments_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: false
            referencedRelation: "anamnesis"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_sections: {
        Row: {
          anamnesis_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          data: Json
          deleted_at: string | null
          id: string
          last_reviewed_at: string | null
          section: string
          updated_at: string
        }
        Insert: {
          anamnesis_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          data?: Json
          deleted_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          section: string
          updated_at?: string
        }
        Update: {
          anamnesis_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          data?: Json
          deleted_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          section?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_sections_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: false
            referencedRelation: "anamnesis"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          doctor_id: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          location: string | null
          meeting_url: string | null
          notes: string | null
          patient_id: string | null
          start_time: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          start_time: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          start_time?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: number
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_events: {
        Row: {
          at: string
          call_id: string
          deleted_at: string | null
          id: number
          payload: Json | null
          type: string
        }
        Insert: {
          at?: string
          call_id: string
          deleted_at?: string | null
          id?: number
          payload?: Json | null
          type: string
        }
        Update: {
          at?: string
          call_id?: string
          deleted_at?: string | null
          id?: number
          payload?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          accepted_at: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          ended_at: string | null
          id: string
          patient_id: string
          reason: string | null
          room_id: string
          status: Database["public"]["Enums"]["call_status"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          ended_at?: string | null
          id?: string
          patient_id: string
          reason?: string | null
          room_id: string
          status?: Database["public"]["Enums"]["call_status"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          ended_at?: string | null
          id?: string
          patient_id?: string
          reason?: string | null
          room_id?: string
          status?: Database["public"]["Enums"]["call_status"]
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          guidelines: string | null
          icon: string | null
          id: string
          member_count: number
          moderator_ids: Json | null
          name: string
          post_count: number
          privacy_level: string
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          guidelines?: string | null
          icon?: string | null
          id?: string
          member_count?: number
          moderator_ids?: Json | null
          name: string
          post_count?: number
          privacy_level?: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          guidelines?: string | null
          icon?: string | null
          id?: string
          member_count?: number
          moderator_ids?: Json | null
          name?: string
          post_count?: number
          privacy_level?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          content: string | null
          created_at: string
          id: string
          post_id: string | null
          read: boolean
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_display_name: string | null
          author_id: string
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          group_id: string
          id: string
          is_anonymous: boolean
          last_activity_at: string | null
          locked: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string
          pinned: boolean
          reaction_count: number
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_display_name?: string | null
          author_id: string
          comment_count?: number
          content: string
          created_at?: string
          deleted_at?: string | null
          group_id: string
          id?: string
          is_anonymous?: boolean
          last_activity_at?: string | null
          locked?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          pinned?: boolean
          reaction_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_display_name?: string | null
          author_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string
          id?: string
          is_anonymous?: boolean
          last_activity_at?: string | null
          locked?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          pinned?: boolean
          reaction_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          active: boolean | null
          address: Json | null
          created_at: string | null
          cuit: string | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          legal_name: string | null
          name: string
          owner_profile_id: string | null
          phone: string | null
          size: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: Json | null
          created_at?: string | null
          cuit?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          name: string
          owner_profile_id?: string | null
          phone?: string | null
          size?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: Json | null
          created_at?: string | null
          cuit?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          name?: string
          owner_profile_id?: string | null
          phone?: string | null
          size?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          active: boolean | null
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          department: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          position: string | null
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          position?: string | null
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          position?: string | null
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          comment_id: string | null
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reported_by: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reported_by: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_by?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          accepted_insurance: Json | null
          active: boolean | null
          bio: string | null
          certifications: Json | null
          consultation_fee: number | null
          created_at: string | null
          deleted_at: string | null
          education: Json | null
          id: string
          languages: Json | null
          license_number: string
          schedule: Json | null
          specialty: string
          subspecialty: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          accepted_insurance?: Json | null
          active?: boolean | null
          bio?: string | null
          certifications?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          deleted_at?: string | null
          education?: Json | null
          id?: string
          languages?: Json | null
          license_number: string
          schedule?: Json | null
          specialty: string
          subspecialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          accepted_insurance?: Json | null
          active?: boolean | null
          bio?: string | null
          certifications?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          deleted_at?: string | null
          education?: Json | null
          id?: string
          languages?: Json | null
          license_number?: string
          schedule?: Json | null
          specialty?: string
          subspecialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      group_memberships: {
        Row: {
          created_at: string
          group_id: string
          id: string
          joined_at: string
          left_at: string | null
          patient_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          patient_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          patient_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          created_at: string
          current_value: number | null
          deleted_at: string | null
          description: string | null
          goal_type: string
          id: string
          milestones: Json | null
          patient_id: string
          progress_percentage: number | null
          start_date: string
          status: string
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          deleted_at?: string | null
          description?: string | null
          goal_type: string
          id?: string
          milestones?: Json | null
          patient_id: string
          progress_percentage?: number | null
          start_date?: string
          status?: string
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          deleted_at?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          milestones?: Json | null
          patient_id?: string
          progress_percentage?: number | null
          start_date?: string
          status?: string
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          appointment_id: string | null
          attachments: Json | null
          content: Json
          created_at: string | null
          date_recorded: string | null
          deleted_at: string | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          title: string
          type: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          appointment_id?: string | null
          attachments?: Json | null
          content: Json
          created_at?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          appointment_id?: string | null
          attachments?: Json | null
          content?: Json
          created_at?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_care_team: {
        Row: {
          active: boolean | null
          assigned_date: string | null
          created_at: string | null
          deleted_at: string | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          assigned_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          assigned_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_care_team_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_care_team_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_screenings: {
        Row: {
          completed_date: string | null
          created_at: string
          deleted_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          patient_id: string
          recommended_by: string | null
          result: string | null
          result_file_url: string | null
          scheduled_date: string | null
          screening_type: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          recommended_by?: string | null
          result?: string | null
          result_file_url?: string | null
          scheduled_date?: string | null
          screening_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          recommended_by?: string | null
          result?: string | null
          result_file_url?: string | null
          scheduled_date?: string | null
          screening_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          active: boolean | null
          allergies: Json | null
          birth_date: string | null
          blood_type: string | null
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          dni: string | null
          emergency_contact: Json | null
          gender: string | null
          height_cm: number | null
          id: string
          insurance_info: Json | null
          medical_history: Json | null
          medications: Json | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          active?: boolean | null
          allergies?: Json | null
          birth_date?: string | null
          blood_type?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dni?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          medications?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          active?: boolean | null
          allergies?: Json | null
          birth_date?: string | null
          blood_type?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dni?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          medications?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_display_name: string | null
          author_id: string
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_anonymous: boolean
          moderation_status: string
          parent_comment_id: string | null
          post_id: string
          reaction_count: number
          updated_at: string
        }
        Insert: {
          author_display_name?: string | null
          author_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean
          moderation_status?: string
          parent_comment_id?: string | null
          post_id: string
          reaction_count?: number
          updated_at?: string
        }
        Update: {
          author_display_name?: string | null
          author_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean
          moderation_status?: string
          parent_comment_id?: string | null
          post_id?: string
          reaction_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          external_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          external_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          external_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      screening_reminders: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          screening_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          screening_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          reminder_type?: string
          scheduled_for?: string
          screening_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_reminders_screening_id_fkey"
            columns: ["screening_id"]
            isOneToOne: false
            referencedRelation: "patient_screenings"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          created_at: string
          details: string | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "telemedicine_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          connection_stats: Json | null
          created_at: string
          duration_seconds: number | null
          id: string
          joined_at: string
          left_at: string | null
          media_state: Json | null
          peer_id: string | null
          role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_stats?: Json | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          media_state?: Json | null
          peer_id?: string | null
          role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_stats?: Json | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          media_state?: Json | null
          peer_id?: string | null
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "telemedicine_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          created_at: string
          deleted_at: string | null
          duration_seconds: number | null
          file_path: string
          file_size_bytes: number | null
          format: string
          id: string
          metadata: Json | null
          session_id: string
          status: string
          transcription_url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          file_path: string
          file_size_bytes?: number | null
          format?: string
          id?: string
          metadata?: Json | null
          session_id: string
          status?: string
          transcription_url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          file_path?: string
          file_size_bytes?: number | null
          format?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          status?: string
          transcription_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "telemedicine_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      telemedicine_sessions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          appointment_id: string
          connection_quality: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          patient_id: string
          recording_consent_doctor: boolean
          recording_consent_patient: boolean
          recording_enabled: boolean
          recording_url: string | null
          scheduled_start: string | null
          signaling_room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          appointment_id: string
          connection_quality?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          patient_id: string
          recording_consent_doctor?: boolean
          recording_consent_patient?: boolean
          recording_enabled?: boolean
          recording_url?: string | null
          scheduled_start?: string | null
          signaling_room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          appointment_id?: string
          connection_quality?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          recording_consent_doctor?: boolean
          recording_consent_patient?: boolean
          recording_enabled?: boolean
          recording_url?: string | null
          scheduled_start?: string | null
          signaling_room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telemedicine_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_call: {
        Args: { p_doctor_id: string; p_patient_id: string }
        Returns: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          room_id: string
          status: Database["public"]["Enums"]["call_status"]
        }[]
      }
      decrypt_phi: {
        Args: { p_ciphertext: string; p_key?: string }
        Returns: string
      }
      encrypt_phi: {
        Args: { p_key?: string; p_plaintext: string }
        Returns: string
      }
      enforce_data_retention: {
        Args: Record<PropertyKey, never>
        Returns: {
          records_archived: number
          table_name: string
        }[]
      }
      format_user_id: {
        Args: { p_numeric_id: number; p_role: string }
        Returns: string
      }
      get_doctor_upcoming_appointments: {
        Args: { p_days_ahead?: number; p_doctor_id: string }
        Returns: {
          appointment_id: string
          duration_minutes: number
          end_time: string
          patient_name: string
          start_time: string
          status: string
          type: string
        }[]
      }
      get_next_numeric_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_patient_medical_history: {
        Args: { p_limit?: number; p_patient_id: string }
        Returns: {
          content: string
          created_at: string
          created_by: string
          doctor_name: string
          record_id: string
          title: string
          type: string
        }[]
      }
      get_user_role: {
        Args: { target_user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_audit_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: number
      }
      set_user_role: {
        Args: { p_role: Database["public"]["Enums"]["user_role"] }
        Returns: undefined
      }
      update_call_status: {
        Args: {
          p_call_id: string
          p_reason?: string
          p_status: Database["public"]["Enums"]["call_status"]
        }
        Returns: boolean
      }
      validate_cuit: {
        Args: { cuit: string }
        Returns: boolean
      }
    }
    Enums: {
      call_status:
        | "requested"
        | "ringing"
        | "accepted"
        | "declined"
        | "canceled"
        | "connecting"
        | "connected"
        | "ended"
      user_role:
        | "doctor"
        | "patient"
        | "company_admin"
        | "organization_admin"
        | "platform_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      call_status: [
        "requested",
        "ringing",
        "accepted",
        "declined",
        "canceled",
        "connecting",
        "connected",
        "ended",
      ],
      user_role: [
        "doctor",
        "patient",
        "company_admin",
        "organization_admin",
        "platform_admin",
      ],
    },
  },
} as const
