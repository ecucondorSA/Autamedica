'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { getRoleDisplayName, isValidUserRole } from '@autamedica/shared/roles';
import type { UserRole } from '@autamedica/types';
import { SearchParamsWrapper } from '../../../components/SearchParamsWrapper';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  useEffect(() => {
    // Si no hay rol preseleccionado, redirigir a select-role después de un delay
    if (!role || !isValidUserRole(role)) {
      const timer = setTimeout(() => {
        window.location.href = '/auth/select-role';
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
          data: {
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      setMessage('Te hemos enviado un enlace de confirmación a tu email. Revisa tu bandeja de entrada para activar tu cuenta.');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message?.includes('User already registered')) {
        setError('Este email ya está registrado. ¿Quieres iniciar sesión?');
      } else {
        setError(error.message || 'Error al crear la cuenta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!role || !isValidUserRole(role)) {
    return null; // Evita flash mientras redirige
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6" style={{backgroundColor: '#0f0f10'}}>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[95vh] overflow-y-auto">
        <div className="rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border relative" style={{backgroundColor: '#1a1a1a', borderColor: '#333333', backdropFilter: 'blur(10px)'}}>
          {/* Header con gradiente */}
          <div className="text-center mb-4 sm:mb-6 relative">
            <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-gray-500/20 to-gray-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full blur-lg"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Únete a AutaMedica
              </h1>

              <div className="bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg p-2 sm:p-3 mb-2 border border-gray-500/40">
                <p className="text-gray-200 text-xs sm:text-sm md:text-base font-medium">
                  Registro como <span className="font-bold text-white">{getRoleDisplayName(role)}</span>
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">
                  <span className="hidden sm:inline">Acceso a funcionalidades especializadas para tu rol profesional</span>
                  <span className="sm:hidden">Funcionalidades especializadas</span>
                </p>
              </div>

              <p className="text-gray-400 text-xs sm:text-sm">
                ¿No es tu rol? <a href="/auth/select-role" className="text-gray-300 hover:text-white font-medium">Cambiarlo aquí</a>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-3 bg-red-900/20 border border-red-600/30 rounded-lg p-2">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-3 bg-green-900/20 border border-green-600/30 rounded-lg p-2">
              <p className="text-xs text-green-300">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Campo Email mejorado */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="email" className="flex items-center text-xs sm:text-sm md:text-base font-medium text-white">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="hidden sm:inline">Correo electrónico profesional</span>
                <span className="sm:hidden">Email profesional</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  style={{
                    borderColor: email && email.includes('@') ? '#10b981' : '#374151'
                  }}
                  placeholder="tu.nombre@email.com"
                />
                {email && email.includes('@') && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Campo Contraseña mejorado */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="password" className="flex items-center text-xs sm:text-sm md:text-base font-medium text-white">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña segura
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  style={{
                    borderColor: password.length >= 6 ? '#10b981' : '#374151'
                  }}
                  placeholder="Mínimo 6 caracteres"
                />
                {password.length >= 6 && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-yellow-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Necesitas al menos 6 caracteres
                </p>
              )}
            </div>

            {/* Campo Confirmar Contraseña mejorado */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="confirmPassword" className="flex items-center text-xs sm:text-sm md:text-base font-medium text-white">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  style={{
                    borderColor: confirmPassword && password === confirmPassword ? '#10b981' : confirmPassword && password !== confirmPassword ? '#ef4444' : '#374151'
                  }}
                  placeholder="Repite tu contraseña"
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* Botón de registro mejorado */}
            <button
              type="submit"
              disabled={isLoading || !email || password.length < 6 || password !== confirmPassword}
              className="w-full relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              <span className={isLoading ? 'invisible' : ''}>
                {isLoading ? 'Creando cuenta...' : 'Crear mi cuenta AutaMedica'}
              </span>
            </button>
          </form>

          {/* Footer elegante */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/50 text-center relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-2">
              <span className="hidden sm:inline">¿Ya tienes cuenta en AutaMedica?</span>
              <span className="sm:hidden">¿Ya tienes cuenta?</span>
            </p>
            <a
              href={`/auth/login?role=${role}`}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm md:text-base font-medium text-gray-400 hover:text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar sesión
            </a>

            {/* Indicador de seguridad */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden sm:inline">Conexión segura y cifrada</span>
              <span className="sm:hidden">Conexión segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Register: React.FC = () => {
  return (
    <SearchParamsWrapper>
      <RegisterForm />
    </SearchParamsWrapper>
  );
};

export default Register;