'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRoleDisplayName,
  getRoleDescription,
  AVAILABLE_ROLES
} from '@autamedica/shared/roles';
import type { UserRole } from '@autamedica/types';

export function PublicRoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }

    // Redirigir a login con el rol preseleccionado
    const loginUrl = new URL('/auth/login', window.location.origin);
    loginUrl.searchParams.set('role', selectedRole);
    router.push(loginUrl.toString());
  };

  const getRoleIcon = (role: UserRole) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6";
    switch (role) {
      case 'doctor':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
          </svg>
        );
      case 'patient':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'company_admin':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'organization_admin':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'platform_admin':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center mb-2 sm:mb-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white">
              Selecciona tu rol profesional
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              <span className="hidden sm:inline">Elige la opción que mejor describa tu actividad profesional</span>
              <span className="sm:hidden">Elige tu actividad profesional</span>
            </p>
          </div>
        </div>

        {AVAILABLE_ROLES.map((role) => (
          <label
            key={role}
            className={`
              relative flex items-start p-3 sm:p-3.5 md:p-4 lg:p-5 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 group transform hover:scale-[1.01]
              ${
                selectedRole === role
                  ? 'border-gray-400 bg-gradient-to-br from-gray-800/60 to-gray-700/40 shadow-lg scale-[1.02]'
                  : 'border-gray-600 bg-gray-800/20 hover:border-gray-500 hover:bg-gray-800/40'
              }
            `}
          >
            <input
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="sr-only"
            />

            <div
              className={`
                flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-3.5 md:mr-4 transition-all duration-200 shadow-sm
                ${
                  selectedRole === role
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 shadow-lg transform scale-105'
                    : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-white'
                }
              `}
            >
              {getRoleIcon(role)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`
                    text-sm sm:text-base md:text-lg font-bold transition-colors
                    ${selectedRole === role ? 'text-white' : 'text-gray-200 group-hover:text-white'}
                  `}>
                    {getRoleDisplayName(role)}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300 group-hover:text-gray-200 transition-colors leading-tight mt-0.5 sm:mt-1">
                    {getRoleDescription(role)}
                  </p>
                </div>
                {selectedRole === role && (
                  <div className="flex-shrink-0 ml-2 sm:ml-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </label>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className={`
          w-full relative overflow-hidden py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 transform
          ${
            selectedRole
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-gray-500 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <div className="relative flex items-center justify-center">
          {selectedRole && (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
          <span className="hidden sm:inline">
            Continuar {selectedRole ? `como ${getRoleDisplayName(selectedRole)}` : 'con rol seleccionado'}
          </span>
          <span className="sm:hidden">
            {selectedRole ? `Continuar` : 'Continuar'}
          </span>
        </div>
      </button>

      {/* Copyright */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} AutaMedica. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}