import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnTo = requestUrl.searchParams.get('returnTo');
  const role = requestUrl.searchParams.get('role');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();

    // Create Supabase client with cookie configuration for cross-subdomain sharing
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Set domain to .autamedica.com for cross-subdomain cookie sharing
            const cookieOptions = {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.autamedica.com' : undefined,
              path: '/',
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
            };
            cookieStore.set({ name, value, ...cookieOptions });
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.autamedica.com' : undefined,
              path: '/',
            };
            cookieStore.set({ name, value: '', ...cookieOptions, maxAge: 0 });
          },
        },
      }
    );

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    // console.log('Session created successfully for user:', data.user?.email);

    // Persist role to user_metadata if provided
    if (role && data.user) {
      // console.log('Persisting role to user_metadata:', role);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role }
      });

      if (updateError) {
        console.error('Error updating user metadata with role:', updateError);
      } else {
        // console.log('Role successfully saved to user_metadata');
      }
    }

    // Determine redirect destination
    let destination: string;

    if (returnTo) {
      // Use returnTo if provided
      destination = returnTo;
    } else if (role === 'patient') {
      destination = process.env.NODE_ENV === 'production'
        ? 'https://patients.autamedica.com'
        : 'http://localhost:3003';
    } else if (role === 'doctor') {
      destination = process.env.NODE_ENV === 'production'
        ? 'https://doctors.autamedica.com'
        : 'http://localhost:3002';
    } else {
      destination = '/auth/select-role';
    }

    // console.log('Redirecting to:', destination);

    return NextResponse.redirect(destination);
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', requestUrl.origin)
    );
  }
}
