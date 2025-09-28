/**
 * Middleware de autenticación para la aplicación de Companies
 * Verifica que el usuario esté autenticado y tenga el rol correcto
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureEnv } from "@autamedica/shared";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/health'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acceso a rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Crear cliente de Supabase
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    ensureEnv('NEXT_PUBLIC_SUPABASE_URL'),
    ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Verificar sesión
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      // No autenticado - redirigir al login
      const loginUrl = new URL('/auth/login',
        ensureEnv('NODE_ENV') === 'production'
          ? 'https://autamedica-web-app.pages.dev'
          : 'http://localhost:3000'
      );
      loginUrl.searchParams.set('portal', 'companies');
      loginUrl.searchParams.set('returnTo', pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    // Verificar rol del usuario
    const userRole = session.user.user_metadata?.role;
    
    // Solo permitir acceso a company admins, companies y platform admins
    if (userRole !== 'company' && userRole !== 'company_admin' && userRole !== 'admin' && userRole !== 'platform_admin') {
      // Usuario no autorizado - redirigir al home del web-app
      const homeUrl = new URL('/',
        ensureEnv('NODE_ENV') === 'production'
          ? 'https://autamedica-web-app.pages.dev'
          : 'http://localhost:3000'
      );
      
      return NextResponse.redirect(homeUrl);
    }

    // Usuario autorizado - continuar
    return response;

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // En caso de error, redirigir al login
    const loginUrl = new URL('/auth/login',
      ensureEnv('NODE_ENV') === 'production'
        ? 'https://autamedica.com'
        : 'http://localhost:3000'
    );
    loginUrl.searchParams.set('portal', 'companies');
    loginUrl.searchParams.set('error', 'middleware_error');
    
    return NextResponse.redirect(loginUrl);
  }
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos con extensión
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};