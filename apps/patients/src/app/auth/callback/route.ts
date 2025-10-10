import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isProduction, ensureClientEnv } from '@autamedica/shared';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const access_token = requestUrl.searchParams.get('access_token');
  const refresh_token = requestUrl.searchParams.get('refresh_token');

  // Determinar URL del auth hub según entorno
  const authBaseUrl = isProduction()
    ? 'https://auth.autamedica.com'
    : 'http://localhost:3005';

  if (!access_token || !refresh_token) {
    // Si no hay tokens, redirigir al hub de autenticación
    return NextResponse.redirect(
      new URL(`${authBaseUrl}/auth/select-role`, requestUrl.origin)
    );
  }

  try {
    const cookieStore = await cookies();

    // Crear cliente de Supabase con configuración de cookies
    const supabase = createServerClient(
      ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL'),
      ensureClientEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
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

    // Establecer la sesión con los tokens recibidos
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('Error setting session:', error);
      return NextResponse.redirect(
        new URL(`${authBaseUrl}/auth/login?error=${encodeURIComponent(error.message)}&role=patient`, requestUrl.origin)
      );
    }

    // Sesión establecida exitosamente, redirigir al dashboard
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(`${authBaseUrl}/auth/login?error=callback_error&role=patient`, requestUrl.origin)
    );
  }
}
