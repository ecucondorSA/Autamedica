'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage('Te hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Error al enviar el enlace de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6" style={{backgroundColor: '#0f0f10'}}>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border relative" style={{backgroundColor: '#1a1a1a', borderColor: '#333333', backdropFilter: 'blur(10px)'}}>
          {/* Header con gradiente */}
          <div className="text-center mb-4 sm:mb-6 relative">
            <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-gray-500/20 to-gray-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full blur-lg"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Recuperar Acceso
              </h1>

              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                <span className="hidden sm:inline">Introduce tu email para recibir un enlace de recuperación</span>
                <span className="sm:hidden">Recupera tu contraseña</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-3 sm:mb-4 bg-red-900/20 border border-red-600/30 rounded-lg p-2 sm:p-3">
              <div className="flex">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-2 sm:ml-3 text-xs sm:text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-3 sm:mb-4 bg-green-900/20 border border-green-600/30 rounded-lg p-2 sm:p-3">
              <div className="flex">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-2 sm:ml-3 text-xs sm:text-sm text-green-300">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="email" className="flex items-center text-xs sm:text-sm md:text-base font-medium text-white">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="hidden sm:inline">Correo electrónico registrado</span>
                <span className="sm:hidden">Email</span>
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

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              <span className={isLoading ? 'invisible' : ''}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </span>
            </button>
          </form>

          {/* Footer elegante */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/50 text-center relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <p className="text-xs sm:text-sm text-gray-300">
              ¿Recordaste tu contraseña?
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 mt-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Volver al inicio de sesión</span>
              <span className="sm:hidden">Ir a Login</span>
            </a>

            {/* Indicador de seguridad */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden sm:inline">Recuperación segura y cifrada</span>
              <span className="sm:hidden">Proceso seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}