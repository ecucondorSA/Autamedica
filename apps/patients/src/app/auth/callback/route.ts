/**
 * OAuth Callback Route Handler
 * Handles the OAuth callback from Supabase
 * Works with both PKCE and implicit flow to avoid code verifier issues
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { ensureEnv } from '@autamedica/shared';
import type { UserRole } from '@autamedica/types';

// Simple URL validation helper
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const returnTo = requestUrl.searchParams.get('returnTo');
  const preselectedRole = requestUrl.searchParams.get('role') as UserRole | null;

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  // Only exchange code if it exists
  if (code) {
    try {
      const cookieStore = await cookies();

      // Clear any stale PKCE cookies that might cause issues
      const pkceKeys = ['sb-gtyvdircfhmdjiaelqkg-auth-token-code-verifier', 'pkce_code_verifier'];
      pkceKeys.forEach(key => {
        if (cookieStore.get(key)) {
          // console.log(`Clearing stale PKCE cookie: ${key}`);
        }
      });

      // Create server client with implicit flow to avoid PKCE issues
      const supabase = createServerClient(
        ensureEnv('SUPABASE_URL'),
        ensureEnv('SUPABASE_ANON_KEY'),
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase SSR cookie options type
            set(name: string, value: string, options: any) {
              // Set domain to .autamedica.com for cross-subdomain sharing in production
              const cookieOptions = {
                ...options,
                domain: process.env.NODE_ENV === 'production' ? '.autamedica.com' : undefined,
              };
              cookieStore.set({ name, value, ...cookieOptions });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase SSR cookie options type
            remove(name: string, options: any) {
              const cookieOptions = {
                ...options,
                domain: process.env.NODE_ENV === 'production' ? '.autamedica.com' : undefined,
              };
              cookieStore.set({ name, value: '', ...cookieOptions, maxAge: 0 });
            },
          },
          auth: {
            flowType: 'implicit', // Use implicit to bypass PKCE
            detectSessionInUrl: true,
          },
        }
      );

      // Try to exchange the code for a session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);

        // If PKCE error, try alternative approach
        if (exchangeError.message?.includes('code challenge') || exchangeError.message?.includes('code verifier')) {
          // console.log('PKCE error detected, attempting workaround...');

          // Clear all auth cookies and redirect to login
          const authCookies = ['sb-access-token', 'sb-refresh-token'];
          authCookies.forEach(key => {
            cookieStore.delete(key);
          });

          return NextResponse.redirect(
            new URL(`/auth/login?error=session_error&retry=true`, requestUrl.origin)
          );
        }

        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      // console.log('Session exchange successful:', {
        userId: sessionData?.user?.id,
        email: sessionData?.user?.email,
        sessionPresent: !!sessionData?.session
      });

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(
          new URL('/auth/login?error=no_user', requestUrl.origin)
        );
      }

      // Read role from profiles table (source of truth)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let role = (user.app_metadata?.role || user.user_metadata?.role) as UserRole | undefined;

      // Check if user has a role in profiles table
      if (!profile?.role) {
        // No role assigned yet
        if (preselectedRole) {
          // User has preselected role, try to assign it
          // console.log(`Assigning preselected role ${preselectedRole} to user ${user.email}`);

          // Try using RPC function first (preferred method)
          const { error: rpcError } = await supabase.rpc('set_user_role', {
            p_role: preselectedRole
          });

          if (rpcError) {
            console.warn('RPC set_user_role failed, trying direct upsert:', rpcError.message);

            // Fallback: Direct upsert to profiles table
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                user_id: user.id,
                email: user.email,
                role: preselectedRole,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              });

            if (upsertError) {
              console.error('Failed to set user role via upsert:', upsertError);
              return NextResponse.redirect(
                new URL(`/auth/login?error=${encodeURIComponent('Error assigning role: ' + upsertError.message)}&role=${preselectedRole}`, requestUrl.origin)
              );
            }

            // console.log(`Role ${preselectedRole} assigned via upsert to user ${user.email}`);
          } else {
            // console.log(`Role ${preselectedRole} assigned via RPC to user ${user.email}`);
          }

          // Role assigned successfully, use it for redirect
          role = preselectedRole;
        } else {
          // No preselected role, redirect to role selection page
          // console.log(`User ${user.email} has no role and no preselected role, redirecting to role selection`);
          return NextResponse.redirect(
            new URL('/auth/select-role', requestUrl.origin)
          );
        }
      } else {
        // User already has a role in profile
        role = profile.role as UserRole;
      }

      // If profile exists and role differs, sync to app_metadata
      if (profile?.role && profile.role !== role) {
        // Only sync if we have service role key (admin operations)
        try {
          const serviceRoleKey = ensureEnv('SUPABASE_SERVICE_ROLE_KEY');
          const adminClient = createClient(
            ensureEnv('SUPABASE_URL'),
            serviceRoleKey
          );

          const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { app_metadata: { role: profile.role } }
          );

          if (updateError) {
            console.error('Failed to update user role in app_metadata:', updateError);
          } else {
            // console.log(`Synced role for user ${user.email}: ${profile.role}`);
            role = profile.role as UserRole;
          }
        } catch {
          // Service role key not available, skip role sync (ensureEnv throws if not found)
          // console.log('Service role key not available, skipping role sync');
        }
      }

      // Use the determined role (either from profile or newly assigned)
      const finalRole = role || profile?.role as UserRole;

      if (!finalRole) {
        // This should not happen, but safety check
        console.error('No role determined for user');
        return NextResponse.redirect(
          new URL('/auth/select-role', requestUrl.origin)
        );
      }

      // Determine destination (always redirect within same app)
      const destination = returnTo || '/';

      // console.log(`User ${user.email} authenticated with role: ${finalRole}, redirecting to: ${destination}`);

      return NextResponse.redirect(destination, { status: 302 });
    } catch (err) {
      console.error('Callback processing error:', err);
      return NextResponse.redirect(
        new URL('/auth/login?error=callback_error', requestUrl.origin)
      );
    }
  }

  // No code parameter - this shouldn't happen in normal flow
  console.warn('OAuth callback called without code parameter');
  return NextResponse.redirect(
    new URL('/auth/login?error=no_code', requestUrl.origin)
  );
}