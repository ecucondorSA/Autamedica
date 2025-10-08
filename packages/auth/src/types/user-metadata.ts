/**
 * @fileoverview User metadata type definitions
 * Provides type safety for Supabase user_metadata
 */

/**
 * User metadata stored in Supabase auth.users.user_metadata
 */
export interface UserMetadata {
  /** User's full name */
  full_name?: string
  
  /** User's first name */
  first_name?: string
  
  /** User's last name */
  last_name?: string
  
  /** User's role in the system */
  role?: string
  
  /** Company name for organization admins */
  company_name?: string
  
  /** User's avatar URL */
  avatar_url?: string
  
  /** User's phone number */
  phone?: string
  
  /** Additional custom metadata */
  [key: string]: unknown
}
