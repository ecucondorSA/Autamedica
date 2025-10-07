'use client';

import { useEffect, useRef, useState } from 'react';

// URLs de la app de autenticación
const AUTH_APP_URL = process.env.NEXT_PUBLIC_AUTH_APP_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://auth.autamedica.com'
    : 'http://localhost:3010');

export default function AccountMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectRole = () => {
    // Redirigir directamente a select-role
    window.location.href = `${AUTH_APP_URL}/auth/select-role`;
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="account-menu fixed top-3 right-3 z-[9999] md:top-7 md:right-7">
      <button
        onClick={toggleDropdown}
        className="account-button group relative p-2 sm:px-4 sm:py-2.5 bg-[var(--au-surface)]/90 hover:bg-[var(--au-hover)]/90 border-2 border-[var(--au-border)] hover:border-[var(--au-accent)] text-[var(--au-text-primary)] rounded-full text-sm transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 md:px-5 md:py-3"
        aria-label="Menú de cuenta"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          {/* User Icon */}
          <div className="w-5 h-5 rounded-full bg-[var(--au-accent)]/20 flex items-center justify-center group-hover:bg-[var(--au-accent)]/30 transition-all duration-300">
            <svg className="w-3 h-3 text-[var(--au-accent)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Text - Hidden on mobile */}
          <span className="hidden sm:inline font-medium">Cuenta</span>

          {/* Chevron - Hidden on mobile */}
          <svg
            className={`hidden sm:block w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-[var(--au-accent)]/0 group-hover:bg-[var(--au-accent)]/5 transition-all duration-300 pointer-events-none" />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-3 bg-[var(--au-surface)]/95 border-2 border-[var(--au-border)] rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl w-[85vw] sm:w-[320px] max-w-[320px] animate-slideDown">
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 bg-[var(--au-hover)]/30 border-b-2 border-[var(--au-border)]">
            <p className="text-xs text-[var(--au-text-tertiary)] mb-1">Bienvenido a</p>
            <p className="text-base sm:text-lg font-bold text-[var(--au-text-primary)]">AutaMedica</p>
          </div>

          {/* Primary Action */}
          <div className="p-2 sm:p-3">
            <button
              onClick={handleSelectRole}
              className="group w-full flex items-center gap-3 sm:gap-4 px-3 py-3 sm:px-5 sm:py-4 text-left text-[var(--au-text-primary)] transition-all hover:bg-[var(--au-hover)] rounded-xl border-2 border-transparent hover:border-[var(--au-accent)] active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--au-accent)]/10 border-2 border-[var(--au-border)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-[var(--au-accent)] transition-all">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--au-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-[var(--au-text-primary)] truncate">Iniciar Sesión</p>
                <p className="text-xs sm:text-sm text-[var(--au-text-secondary)] truncate">Accede a tu cuenta médica</p>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--au-text-tertiary)] group-hover:text-[var(--au-accent)] group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[var(--au-hover)]/20 border-t-2 border-[var(--au-border)]">
            <div className="flex items-center justify-center text-xs text-[var(--au-text-tertiary)]">
              <svg className="w-4 h-4 mr-1.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="truncate">Conexión segura y cifrada</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
