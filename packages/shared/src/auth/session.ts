/**
 * Server-side session verification using JWT
 * No Supabase client needed - direct JWT verification
 */

import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { logger } from '../services/logger.service';

export type SessionRole = 'patient' | 'doctor' | 'company' | 'company_admin' | 'organization_admin' | 'platform_admin';

export interface Session {
  user: {
    id: string;
    email?: string;
    role?: SessionRole;
  };
}

/**
 * Get session from request cookies using JWT verification
 * No Supabase client needed - prevents hardcoded credentials
 */
export async function getSession(req: NextRequest): Promise<Session | null> {
  // Check multiple cookie names for compatibility
  // Extract project ref from NEXT_PUBLIC_SUPABASE_URL if available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
  const legacyCookieName = projectRef ? `sb-${projectRef}-auth-token` : null;

  const token =
    req.cookies.get('sb-access-token')?.value ||
    (legacyCookieName ? req.cookies.get(legacyCookieName)?.value : null) ||
    req.cookies.get('sb-auth-token')?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET not configured - required for session verification');
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    // Extract role from various possible locations in JWT
    const role = (
      payload['user_role'] ||
      payload['role'] ||
      (payload['app_metadata'] as any)?.['role'] ||
      (payload['user_metadata'] as any)?.['role']
    ) as SessionRole | undefined;

    // Extract email if available
    const email = payload['email'] as string | undefined;

    return {
      user: {
        id: String(payload.sub || ''),
        email,
        role
      }
    };
  } catch (error) {
    // Invalid or expired token
    logger.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Verify user has one of the allowed roles
 */
export function hasRole(session: Session | null, allowedRoles: SessionRole[]): boolean {
  if (!session?.user.role) {
    return false;
  }
  return allowedRoles.includes(session.user.role);
}