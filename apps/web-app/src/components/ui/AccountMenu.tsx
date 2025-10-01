'use client';

import { useEffect, useRef, useState } from 'react';

// URLs de la app de autenticación
const AUTH_APP_URL = process.env.NEXT_PUBLIC_AUTH_APP_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://autamedica-auth.pages.dev'
    : 'http://localhost:3010');

export default function AccountMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogin = () => {
    // Redirigir a la app de autenticación
    window.location.href = `${AUTH_APP_URL}/login`;
  };

  const handleRegister = () => {
    // Redirigir a la app de autenticación para registro
    window.location.href = `${AUTH_APP_URL}/register`;
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
    <div ref={dropdownRef} className="account-menu fixed top-5 right-3 z-[1000] md:top-7 md:right-7">
      <button
        onClick={toggleDropdown}
        className="account-button group relative px-4 py-2.5 bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-700/90 hover:to-gray-800/90 border border-gray-600/40 hover:border-gray-400/60 text-white rounded-full text-sm transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 md:px-5 md:py-3"
        aria-label="Menú de cuenta"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          {/* User Icon */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center group-hover:from-white group-hover:to-gray-200 transition-all duration-300">
            <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Text */}
          <span className="hidden sm:inline font-medium">Cuenta</span>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-300 pointer-events-none" />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-3 bg-gray-900/95 border border-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl min-w-[280px] animate-slideDown">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Bienvenido a</p>
            <p className="text-sm font-bold text-white">AutaMedica</p>
          </div>

          {/* Primary Action */}
          <div className="p-2">
            <button
              onClick={handleLogin}
              className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-white transition-all hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-hover:from-gray-500 group-hover:to-gray-700">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Iniciar Sesión</p>
                <p className="text-xs text-gray-400">Accede a tu cuenta médica</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="px-4 py-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Secondary Action */}
          <div className="p-2">
            <button
              onClick={handleRegister}
              className="group w-full flex items-center gap-3 px-4 py-3.5 text-left text-white transition-all hover:bg-gray-700/50 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Crear Cuenta</p>
                <p className="text-xs text-gray-400">Únete a nuestra plataforma</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700/50">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Conexión segura
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
