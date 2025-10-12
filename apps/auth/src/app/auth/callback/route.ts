import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  logger,
  isProduction,
  isValidRole,
  getTargetUrlByRole,
  getRoleForPortal,
  type UserRole,
} from '@autamedica/shared';
import { validateRedirectUrl } from '@/lib/cookies';

// Configure for Cloudflare Pages (Edge Runtime)
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
    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) {
      logger.error('Missing session tokens after exchange');
      return NextResponse.redirect(
        new URL('/auth/login?error=session_tokens_missing', requestUrl.origin)
      );
    }

    const safeReturnTo = returnTo && validateRedirectUrl(returnTo) ? new URL(returnTo) : null;
    const userMetadata = (data.user?.user_metadata ?? {}) as Record<string, unknown>;

    const roleFromQuery = role && isValidRole(role) ? role as UserRole : undefined;
    const metadataRoleValue = typeof userMetadata.role === 'string' ? userMetadata.role : undefined;
    const roleFromMetadata = metadataRoleValue && isValidRole(metadataRoleValue)
      ? metadataRoleValue as UserRole
      : undefined;
    const metadataPortalValue = typeof userMetadata.portal === 'string' ? userMetadata.portal : undefined;
    const roleFromPortal = metadataPortalValue ? getRoleForPortal(metadataPortalValue) : undefined;

    const resolvedRole = roleFromQuery ?? roleFromMetadata ?? roleFromPortal;

    const destinationBase = safeReturnTo
      ? `${safeReturnTo.protocol}//${safeReturnTo.host}`
      : resolvedRole
        ? new URL('/', getTargetUrlByRole(resolvedRole)).origin
        : undefined;

    let destination: string;

    if (destinationBase) {
      const tokenParams = new URLSearchParams({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).toString();
      destination = `${destinationBase}/auth/callback?${tokenParams}`;
    } else {
      destination = '/auth/select-role';
    }

    return NextResponse.redirect(destination);
  } catch (error) {
    logger.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', requestUrl.origin)
    );
  }
}
