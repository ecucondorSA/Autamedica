'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { getRoleDisplayName, isValidUserRole } from '@autamedica/shared';
import type { UserRole } from '@autamedica/types';
import { SearchParamsWrapper } from '../../../components/SearchParamsWrapper';
import { AuthLogo } from '@/components/AuthLogo';
import { logger } from '@autamedica/shared';

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
    // Si no hay rol preseleccionado, redirigir a select-role
    if (!role || !isValidUserRole(role)) {
      window.location.href = '/auth/select-role';
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
      logger.error('Registration error:', error);
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
    return null;
  }

  const roleDisplayName = getRoleDisplayName(role);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--au-bg)]">
      <div className="w-full max-w-md">
        <div className="bg-[var(--au-surface)] border-2 border-[var(--au-border)] rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <AuthLogo size="md" />
            <h1 className="text-2xl font-bold text-[var(--au-text-primary)] mb-2">
              Únete a AutaMedica
            </h1>

            {/* Role Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[var(--au-hover)] rounded-full border-2 border-[var(--au-border)] mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--au-text-secondary)]">
                Registro como {roleDisplayName}
              </span>
            </div>

            <p className="text-[var(--au-text-secondary)] text-sm">
              ¿No es tu rol?{' '}
              <a href="/auth/select-role" className="text-[var(--au-accent)] hover:text-[var(--au-text-primary)] font-medium transition-colors">
                Cambiar aquí
              </a>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-300">{message}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--au-text-secondary)] mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--au-hover)] border-2 border-[var(--au-border)] rounded-xl text-[var(--au-text-primary)] placeholder:text-[var(--au-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--au-accent)] focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--au-text-secondary)] mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--au-hover)] border-2 border-[var(--au-border)] rounded-xl text-[var(--au-text-primary)] placeholder:text-[var(--au-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--au-accent)] focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
              />
              {password.length > 0 && password.length < 6 && (
                <p className="mt-2 text-xs text-yellow-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Necesitas al menos 6 caracteres
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--au-text-secondary)] mb-2">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--au-hover)] border-2 border-[var(--au-border)] rounded-xl text-[var(--au-text-primary)] placeholder:text-[var(--au-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--au-accent)] focus:border-transparent transition-all"
                placeholder="Repite tu contraseña"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || password.length < 6 || password !== confirmPassword}
              className="w-full px-6 py-3 bg-[var(--au-accent)] hover:bg-[var(--au-text-primary)] text-[var(--au-bg)] font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[var(--au-border)] text-center space-y-4">
            <p className="text-sm text-[var(--au-text-tertiary)]">
              ¿Ya tienes cuenta en AutaMedica?
            </p>
            <a
              href={`/auth/login?role=${role}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-[var(--au-text-secondary)] hover:text-[var(--au-text-primary)] bg-[var(--au-hover)] hover:bg-[var(--au-hover-border)] border-2 border-[var(--au-border)] hover:border-[var(--au-accent)] rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar sesión
            </a>

            {/* Security Badge */}
            <div className="flex items-center justify-center text-xs text-[var(--au-text-tertiary)] mt-4">
              <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Conexión segura y cifrada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <SearchParamsWrapper>
      <RegisterForm />
    </SearchParamsWrapper>
  );
}
