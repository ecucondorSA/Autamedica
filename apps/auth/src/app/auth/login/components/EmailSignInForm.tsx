'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { UserRole } from '@autamedica/types';

interface EmailSignInFormProps {
  returnTo?: string;
  role: UserRole;
}

export function EmailSignInForm({ returnTo, role }: EmailSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Redirect will be handled by the auth state change
      const redirectUrl = new URL(returnTo || '/auth/callback', window.location.origin);
      redirectUrl.searchParams.set('role', role);
      window.location.href = redirectUrl.toString();

    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const redirectUrl = new URL('/auth/callback', window.location.origin);
      if (returnTo) {
        redirectUrl.searchParams.set('returnTo', returnTo);
      }
      redirectUrl.searchParams.set('role', role);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Te hemos enviado un enlace mágico a tu email. Revisa tu bandeja de entrada.');

    } catch (error: any) {
      console.error('Magic link error:', error);
      setError(error.message || 'Error al enviar el enlace mágico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <p className="text-sm text-green-300">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-white mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-2 py-1.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 text-xs text-white placeholder:text-gray-400"
            style={{
              borderColor: '#333333',
              backgroundColor: '#262626'
            }}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-white mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-2 py-1.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 text-xs text-white placeholder:text-gray-400"
            style={{
              borderColor: '#333333',
              backgroundColor: '#262626'
            }}
            placeholder="Tu contraseña"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-1.5 px-3 border border-transparent rounded-lg shadow-sm text-xs font-medium transition-colors duration-200"
            style={{
              backgroundColor: isLoading ? '#4b5563' : '#d1d5db',
              color: isLoading ? '#9ca3af' : '#1f2937',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isLoading}
            className="w-full flex justify-center py-1.5 px-3 border rounded-lg shadow-sm text-xs font-medium text-white transition-colors duration-200"
            style={{
              borderColor: '#333333',
              backgroundColor: '#262626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#262626';
            }}
          >
            Enviar enlace mágico
          </button>
        </div>
      </form>

      <div className="text-center">
        <a
          href="/auth/forgot-password"
          className="text-xs text-gray-300 hover:text-white"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}