'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPortalForRole } from '@autamedica/shared';
import type { UserRole } from '@autamedica/types';

/**
 * Server action to set user role
 * Uses the database RPC function to ensure role is set atomically
 */
export async function chooseRole(role: UserRole) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Call the RPC function to set role (only works if role is currently null)
    const { error } = await supabase.rpc('set_user_role', { p_role: role });

    if (error) {
      console.error('Error setting user role:', error);
      if (error.message === 'role_already_set_or_profile_missing') {
        throw new Error('El rol ya ha sido configurado o el perfil no existe');
      }
      throw new Error(error.message);
    }

    console.log(`Role set successfully for user ${user.email}: ${role}`);

    // Redirect to the correct portal for this role
    const portalUrl = getPortalForRole(role);
    redirect(portalUrl);

  } catch (error) {
    console.error('Failed to choose role:', error);
    throw error;
  }
}

/**
 * Get current user profile and role
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, email, role, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  return {
    user,
    profile
  };
}