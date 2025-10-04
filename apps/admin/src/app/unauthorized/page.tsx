import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso No Autorizado - AutaMedica Admin',
  description: 'No tienes permisos para acceder al panel de administración',
};

export default function UnauthorizedPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso No Autorizado
        </h1>

        <p className="text-gray-600 mb-8">
          No tienes permisos para acceder al panel de administración de AutaMedica.
          Esta área está restringida solo para administradores de plataforma.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>

          <Link
            href="/auth/logout"
            className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cerrar Sesión
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Si crees que deberías tener acceso, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
