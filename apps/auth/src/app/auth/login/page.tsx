import { redirect } from 'next/navigation';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { EmailSignInForm } from './components/EmailSignInForm';
import { getRoleDisplayName, isValidUserRole } from '@autamedica/shared/roles';
import { AuthPageWrapper } from '@/components/AuthPageWrapper';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Cloudflare Pages requires Edge Runtime for all dynamic routes
export const runtime = 'edge';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
    returnTo?: string;
    role?: string;
  }>
}) {
  // Check if user is already authenticated
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is already logged in, check if they have a role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile?.role) {
      // No role yet, redirect to role selection
      redirect('/auth/select-role');
    } else {
      // Has role, redirect to their portal
      const { getPortalForRole } = await import('@autamedica/shared/roles');
      redirect(getPortalForRole(profile.role));
    }
  }

  const { error, message, returnTo, role } = await searchParams;

  // Si no hay rol preseleccionado, redirigir a select-role
  if (!role || !isValidUserRole(role)) {
    redirect('/auth/select-role');
  }

  const roleDisplayName = getRoleDisplayName(role);

  return (
    <AuthPageWrapper>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AutaMedica
              </span>
            </div>

            {/* Developer Credit */}
            <div className="hidden sm:block text-xs text-gray-400 font-medium">
              desarrollado por E.M Medicina -UBA
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                  Bienvenido de vuelta
                </h1>

                {/* Role Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-full border border-indigo-500/30 mb-4">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-indigo-200">
                    Acceso como {roleDisplayName}
                  </span>
                </div>

                <p className="text-gray-400 text-sm">
                  ¿No es tu rol?
                  <a href="/auth/select-role" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1 transition-colors">
                    Cambiar aquí
                  </a>
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-300">
                      {error === 'session_error' ? 'Error de sesión. Por favor intenta nuevamente.' :
                       error === 'no_user' ? 'No se pudo obtener la información del usuario.' :
                       error === 'callback_error' ? 'Error en el proceso de autenticación.' :
                       error === 'no_code' ? 'Parámetros de autenticación inválidos.' :
                       error}
                    </p>
                  </div>
                </div>
              )}

              {message && (
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-300">{message}</p>
                  </div>
                </div>
              )}

              {/* Auth Forms */}
              <div className="space-y-6">
                <GoogleSignInButton returnTo={returnTo} role={role} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 py-1 text-gray-400 bg-gray-900 rounded-full border border-gray-700/50">
                      o continúa con email
                    </span>
                  </div>
                </div>

                <EmailSignInForm returnTo={returnTo} role={role} />
              </div>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-gray-700/50 text-center space-y-4">
                <p className="text-sm text-gray-400">
                  ¿No tienes cuenta en AutaMedica?
                </p>
                <a
                  href={`/auth/register?role=${role}`}
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/30 hover:bg-gray-600/50 border border-gray-600/30 hover:border-gray-500/50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Crear cuenta nueva
                </a>

                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                  <a href="/auth/forgot-password" className="hover:text-gray-400 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Conexión segura y cifrada
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthPageWrapper>
  );
}