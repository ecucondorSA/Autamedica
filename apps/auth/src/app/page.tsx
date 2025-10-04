'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLogo } from '@/components/AuthLogo';

function HomePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const role = searchParams.get('role');
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    // Si hay un código de autenticación, redirigir al callback
    if (code) {
      window.location.href = `/auth/callback?code=${code}`;
      return;
    }

    // Si hay un rol, redirigir al login correspondiente
    if (role) {
      const loginUrl = `/auth/login/?role=${role}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      window.location.href = loginUrl;
      return;
    }

    // Por defecto, redirigir a la selección de rol
    window.location.href = '/auth/select-role';
  }, [code, role, returnTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AuthLogo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            AutaMedica Auth Hub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Redirigiendo al sistema de autenticación...
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AuthLogo />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              AutaMedica Auth Hub
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Cargando...
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}