/**
 * Test generated types - 2025-09-28T14:03:22.940Z
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // main_table table
      main_table: {
        Row: {
          id: string // UUID
          name: string
          status: 'active' | 'inactive' | null
          created_at: string | null // timestamptz
        }
        Insert: {
          id?: string // UUID
          name: string
          status?: 'active' | 'inactive' | null
          created_at?: string | null // timestamptz
        }
        Update: {
          id?: string // UUID
          name?: string
          status?: 'active' | 'inactive' | null
          created_at?: string | null // timestamptz
        }
      }
      // settings table
      settings: {
        Row: {
          id: number
          key: string
          value: Json | null
          description: string | null
          is_public: boolean | null
        }
        Insert: {
          id: number
          key: string
          value?: Json | null
          description?: string | null
          is_public?: boolean | null
        }
        Update: {
          id?: number
          key?: string
          value?: Json | null
          description?: string | null
          is_public?: boolean | null
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
