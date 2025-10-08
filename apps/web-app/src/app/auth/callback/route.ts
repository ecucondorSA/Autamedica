/**
 * Auth Callback Route Handler
 * Maneja el callback de autenticación OAuth/Magic Link
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@autamedica/auth';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const portal = requestUrl.searchParams.get('portal');

  if (code) {
    const { supabase, response } = createRouteHandlerClient(request);

    // Intercambiar code por session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL('/auth/login?error=auth_callback_failed', requestUrl.origin)
      );
    }

    // Obtener sesión para verificar si necesita selección de rol
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Verificar si el usuario tiene un perfil con rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, portal')
        .eq('id', session.user.id)
        .single();

      // Si no tiene rol o portal, redirigir a select-role
      if (!profile?.role || !profile?.portal) {
        const selectRoleUrl = new URL('/auth/select-role', requestUrl.origin);
        if (portal) {
          selectRoleUrl.searchParams.set('portal', portal);
        }
        return NextResponse.redirect(selectRoleUrl);
      }

      // Si tiene rol, redirigir según el portal
      const portalUrls: Record<string, string> = {
        patients: process.env.NEXT_PUBLIC_PATIENTS_URL || 'http://localhost:3002',
        doctors: process.env.NEXT_PUBLIC_DOCTORS_URL || 'http://localhost:3001',
        companies: process.env.NEXT_PUBLIC_COMPANIES_URL || 'http://localhost:3003',
        admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3004',
      };

      const redirectUrl = profile.portal
        ? portalUrls[profile.portal]
        : requestUrl.origin + next;

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Si no hay code o falló, redirigir al home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
