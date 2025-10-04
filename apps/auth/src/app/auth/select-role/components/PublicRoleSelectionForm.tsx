'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getRoleDisplayName,
  getRoleDescription,
  AVAILABLE_ROLES
} from '@autamedica/shared';
import type { UserRole } from '@autamedica/types';
import { AuthCard } from '@/components/AuthCard';
import { AuthButton } from '@/components/AuthButton';

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
    const iconClass = "w-6 h-6";
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-[var(--au-text-primary)] mb-2">
          Selecciona tu rol profesional
        </h2>
        <p className="text-sm text-[var(--au-text-secondary)]">
          Elige la opción que mejor describa tu actividad profesional
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-3">
        {AVAILABLE_ROLES.map((role) => (
          <AuthCard
            key={role}
            onClick={() => setSelectedRole(role)}
            selected={selectedRole === role}
            icon={getRoleIcon(role)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--au-text-primary)] mb-1">
                  {getRoleDisplayName(role)}
                </h3>
                <p className="text-sm text-[var(--au-text-secondary)] leading-snug">
                  {getRoleDescription(role)}
                </p>
              </div>
              {selectedRole === role && (
                <div className="flex-shrink-0 ml-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </AuthCard>
        ))}
      </div>

      {/* Continue Button */}
      <AuthButton
        onClick={handleContinue}
        disabled={!selectedRole}
        variant="primary"
        fullWidth
      >
        {selectedRole && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
        <span>
          Continuar {selectedRole ? `como ${getRoleDisplayName(selectedRole)}` : ''}
        </span>
      </AuthButton>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-xs text-[var(--au-text-tertiary)]">
          © {new Date().getFullYear()} AutaMedica. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
