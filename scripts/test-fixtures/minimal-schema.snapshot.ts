/**
 * Test generated types - 2025-09-28T14:03:22.930Z
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
      // test_table table
      test_table: {
        Row: {
          id: string // UUID
          required_text: string
          optional_text: string | null
          has_default_text: string | null
          price: number // decimal
          quantity: number | null // decimal
          is_active: boolean | null
          created_at: string | null // timestamptz
          updated_at: string | null // timestamptz
          metadata: Json | null
          tags: string | null
          ip_address: string | null // IP address
          role: 'admin' | 'user' | 'guest' | null
        }
        Insert: {
          id?: string // UUID
          required_text: string
          optional_text?: string | null
          has_default_text?: string | null
          price?: number // decimal
          quantity?: number | null // decimal
          is_active?: boolean | null
          created_at?: string | null // timestamptz
          updated_at?: string | null // timestamptz
          metadata?: Json | null
          tags?: string | null
          ip_address?: string | null // IP address
          role?: 'admin' | 'user' | 'guest' | null
        }
        Update: {
          id?: string // UUID
          required_text?: string
          optional_text?: string | null
          has_default_text?: string | null
          price?: number // decimal
          quantity?: number | null // decimal
          is_active?: boolean | null
          created_at?: string | null // timestamptz
          updated_at?: string | null // timestamptz
          metadata?: Json | null
          tags?: string | null
          ip_address?: string | null // IP address
          role?: 'admin' | 'user' | 'guest' | null
        }
      }
      // test_relations table
      test_relations: {
        Row: {
          table_id: string | null // UUID
          relation_id: string // UUID
          relation_type: string
          created_at: string | null // timestamptz
        }
        Insert: {
          table_id?: string | null // UUID
          relation_id: string // UUID
          relation_type: string
          created_at?: string | null // timestamptz
        }
        Update: {
          table_id?: string | null // UUID
          relation_id?: string // UUID
          relation_type?: string
          created_at?: string | null // timestamptz
        }
      }
      // test_enums table
      test_enums: {
        Row: {
          id: number
          current_mood: 'sad' | 'ok' | 'happy' // enum
          name: string
        }
        Insert: {
          id: number
          current_mood?: 'sad' | 'ok' | 'happy' // enum
          name: string
        }
        Update: {
          id?: number
          current_mood?: 'sad' | 'ok' | 'happy' // enum
          name?: string
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
