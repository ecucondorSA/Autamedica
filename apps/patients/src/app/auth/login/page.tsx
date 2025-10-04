'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getRoleDisplayName, isValidUserRole } from '@autamedica/shared';
import { useAuth } from '@autamedica/auth/hooks';
import type { UserRole } from '@autamedica/types';
import { SearchParamsWrapper } from '../../../components/SearchParamsWrapper';
import { AuthLogo } from '@/components/AuthLogo';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const returnTo = searchParams.get('returnTo');

  const { signIn, signInWithOAuth, signInWithMagicLink } = useAuth();

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

    try {
      await signIn(email, password);
      // On success, the auth provider will redirect automatically
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithOAuth('google');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (error: any) {
      console.error('Magic link error:', error);
      setError(error.message || 'Error al enviar el enlace de acceso');
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
              Bienvenido de vuelta
            </h1>

            {/* Role Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[var(--au-hover)] rounded-full border-2 border-[var(--au-border)] mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--au-text-secondary)]">
                Acceso como {roleDisplayName}
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

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[var(--au-hover)] hover:bg-[var(--au-hover-border)] border-2 border-[var(--au-border)] hover:border-[var(--au-accent)] rounded-xl text-[var(--au-text-primary)] font-medium transition-all duration-200 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--au-border)] to-transparent" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 py-1 text-[var(--au-text-secondary)] bg-[var(--au-surface)] rounded-full border-2 border-[var(--au-border)]">
                o continúa con email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
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
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[var(--au-accent)] hover:bg-[var(--au-text-primary)] text-[var(--au-bg)] font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[var(--au-border)] text-center space-y-4">
            <p className="text-sm text-[var(--au-text-tertiary)]">
              ¿No tienes cuenta en AutaMedica?
            </p>
            <a
              href={`/auth/register?role=${role}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-[var(--au-text-secondary)] hover:text-[var(--au-text-primary)] bg-[var(--au-hover)] hover:bg-[var(--au-hover-border)] border-2 border-[var(--au-border)] hover:border-[var(--au-accent)] rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Crear cuenta nueva
            </a>

            <div className="flex justify-center space-x-6 text-xs text-[var(--au-text-tertiary)]">
              <a href="/auth/forgot-password" className="hover:text-[var(--au-accent)] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

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

export default function LoginPage() {
  return (
    <SearchParamsWrapper>
      <LoginForm />
    </SearchParamsWrapper>
  );
}
