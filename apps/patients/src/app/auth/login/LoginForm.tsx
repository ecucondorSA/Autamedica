'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

const portals = ['doctors', 'patients', 'companies', 'admin'] as const;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const portal = searchParams.get('portal');
  const returnTo = searchParams.get('returnTo');
  const target = portal && portals.includes(portal as any) ? portal : 'patients';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createBrowserClient();

      // Construct redirect URL with portal and returnTo parameters
      const redirectUrl = new URL('/auth/callback', window.location.origin);
      if (portal) redirectUrl.searchParams.set('portal', portal);
      if (returnTo) redirectUrl.searchParams.set('returnTo', returnTo);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl.toString()
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('¡Revisa tu email! Te enviamos un enlace de acceso.');
      }
    } catch {
      setMessage('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalLabel = (portalName: string) => {
    const labels = {
      doctors: 'Médicos',
      patients: 'Pacientes',
      companies: 'Empresas',
      admin: 'Administradores'
    };
    return labels[portalName as keyof typeof labels] || 'Pacientes';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Acceso a AutaMedica
          </h1>
          <p className="text-white/70">
            Portal: <span className="font-semibold text-autamedica-light-green">
              {getPortalLabel(target)}
            </span>
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-autamedica-light-green focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <input type="hidden" name="portal" value={target} />
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-autamedica-green hover:bg-autamedica-light-green disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-autamedica-light-green focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            message.includes('Error')
              ? 'bg-red-100/10 text-red-200 border border-red-300/30'
              : 'bg-green-100/10 text-green-200 border border-green-300/30'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            ¿Necesitas acceso a otro portal?{' '}
            <a
              href="/auth/select-role"
              className="text-autamedica-light-green hover:text-autamedica-green underline transition-colors"
            >
              Cambiar portal
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/50 text-xs text-center">
            Sistema de autenticación segura con verificación por email.
            <br />
            No guardamos contraseñas, solo enlaces seguros.
          </p>
        </div>
      </div>
    </div>
  );
}