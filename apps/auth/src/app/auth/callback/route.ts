import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { logger, isProduction } from '@autamedica/shared';

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge';

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
              domain: isProduction() ? '.autamedica.com' : undefined,
              path: '/',
              sameSite: 'lax' as const,
              secure: isProduction(),
            };
            cookieStore.set({ name, value, ...cookieOptions });
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              domain: isProduction() ? '.autamedica.com' : undefined,
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
      logger.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    // logger.info('Session created successfully for user:', data.user?.email);

    // Persist role to user_metadata if provided
    if (role && data.user) {
      // logger.info('Persisting role to user_metadata:', role);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role }
      });

      if (updateError) {
        logger.error('Error updating user metadata with role:', updateError);
      } else {
        // logger.info('Role successfully saved to user_metadata');
      }
    }

    // Determine redirect destination
    let destination: string;

    if (returnTo) {
      // Extract base URL from returnTo
      const returnToUrl = new URL(returnTo);
      const baseUrl = `${returnToUrl.protocol}//${returnToUrl.host}`;

      // Redirect to the app's callback route with tokens
      destination = `${baseUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
    } else if (role === 'patient') {
      const baseUrl = isProduction()
        ? 'https://patients.autamedica.com'
        : 'http://localhost:3002';
      destination = `${baseUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
    } else if (role === 'doctor') {
      const baseUrl = isProduction()
        ? 'https://doctors.autamedica.com'
        : 'http://localhost:3001';
      destination = `${baseUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
    } else {
      destination = '/auth/select-role';
    }

    // logger.info('Redirecting to:', destination);

    return NextResponse.redirect(destination);
  } catch (error) {
    logger.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', requestUrl.origin)
    );
  }
}
