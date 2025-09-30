/**
 * Test generated types - 2025-09-28T14:03:22.939Z
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
      // UserProfiles table
      UserProfiles: {
        Row: {
          id: number
          userId: string // UUID
          firstName: string
          lastName: string
          status: 'active' | 'inactive' | 'suspended' // enum
          createdAt: string // timestamptz
          updatedAt: string | null // timestamptz
        }
        Insert: {
          id?: number
          userId: string // UUID
          firstName: string
          lastName: string
          status?: 'active' | 'inactive' | 'suspended' // enum
          createdAt?: string // timestamptz
          updatedAt?: string | null // timestamptz
        }
        Update: {
          id?: number
          userId?: string // UUID
          firstName?: string
          lastName?: string
          status?: 'active' | 'inactive' | 'suspended' // enum
          createdAt?: string // timestamptz
          updatedAt?: string | null // timestamptz
        }
      }
      // audit_trail table
      audit_trail: {
        Row: {
          id: number
          user_id: string // UUID
          action: string
          priority: 'low' | 'medium' | 'high' | 'critical' | null // enum
          metadata: Json | null
          tags: string | null
          ip_address: string | null // IP address
          created_at: string // timestamptz
        }
        Insert: {
          id?: number
          user_id: string // UUID
          action: string
          priority?: 'low' | 'medium' | 'high' | 'critical' | null // enum
          metadata?: Json | null
          tags?: string | null
          ip_address?: string | null // IP address
          created_at?: string // timestamptz
        }
        Update: {
          id?: number
          user_id?: string // UUID
          action?: string
          priority?: 'low' | 'medium' | 'high' | 'critical' | null // enum
          metadata?: Json | null
          tags?: string | null
          ip_address?: string | null // IP address
          created_at?: string // timestamptz
        }
      }
      // ProjectMembers table
      ProjectMembers: {
        Row: {
          projectId: string // UUID
          memberId: string // UUID
          role: 'owner' | 'admin' | 'member' | 'viewer' | null
          permissions: Json | null
          joinedAt: string // timestamptz
          lastActiveAt: string | null // timestamptz
        }
        Insert: {
          projectId: string // UUID
          memberId: string // UUID
          role?: 'owner' | 'admin' | 'member' | 'viewer' | null
          permissions?: Json | null
          joinedAt?: string // timestamptz
          lastActiveAt?: string | null // timestamptz
        }
        Update: {
          projectId?: string // UUID
          memberId?: string // UUID
          role?: 'owner' | 'admin' | 'member' | 'viewer' | null
          permissions?: Json | null
          joinedAt?: string // timestamptz
          lastActiveAt?: string | null // timestamptz
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
