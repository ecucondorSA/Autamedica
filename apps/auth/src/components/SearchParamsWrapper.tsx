'use client';

import { Suspense } from 'react';

interface SearchParamsWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper para componentes que usan useSearchParams
 * Mejores prácticas de Next.js 2025 según documentación oficial
 */
export const SearchParamsWrapper: React.FC<SearchParamsWrapperProps> = ({ children, fallback }) => {
  const loadingFallback = fallback || (
    <div className="fixed inset-0 flex items-center justify-center p-1" style={{backgroundColor: '#0f0f10'}}>
      <div className="max-w-sm w-full">
        <div className="rounded-xl shadow-xl p-4 border" style={{backgroundColor: '#1a1a1a', borderColor: '#333333'}}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
            <p className="text-gray-400 mt-2 text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    </div>
  );

  // @ts-ignore - React 19 Suspense compatibility workaround
  return (
    <Suspense fallback={loadingFallback}>
      {children}
    </Suspense>
  );
};