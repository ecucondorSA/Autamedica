'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth, type UseAuthReturn } from '../hooks/use-auth';
import { logger } from '@autamedica/shared';

// Create the auth context
const AuthContext = createContext<UseAuthReturn | null>(null);

// Auth Provider Props
export interface AuthProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  enableDebug?: boolean;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  fallback = null,
  enableDebug = false,
}) => {
  const authValue = useAuth();

  // Debug logging in development
  React.useEffect(() => {
    if (enableDebug && process.env.NODE_ENV === 'development') {
      // logger.info('AuthProvider state:', {
        user: authValue.user?.id,
        loading: authValue.loading,
        error: authValue.error?.message,
        initialized: authValue.initialized,
      });
    }
  }, [authValue.user, authValue.loading, authValue.error, authValue.initialized, enableDebug]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => authValue, [authValue]);

  // Show fallback during initialization
  if (!authValue.initialized && fallback) {
    return <>{fallback}</>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = (): UseAuthReturn => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Make sure to wrap your component tree with <AuthProvider>.'
    );
  }

  return context;
};

// Higher-order component for protected routes
export interface WithAuthOptions {
  redirectTo?: string;
  requireRole?: string;
  fallback?: ReactNode;
}

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, loading, hasRole, user: _user } = useAuthContext();
    const { redirectTo = '/auth/select-role', requireRole, fallback } = options;

    // Show loading state
    if (loading) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Check authentication
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    // Check role if required
    if (requireRole && !hasRole(requireRole as any)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook for conditional auth requirements
export const useAuthGuard = (options: {
  requireAuth?: boolean;
  requireRole?: string;
  redirectTo?: string;
} = {}) => {
  const { isAuthenticated, loading, hasRole } = useAuthContext();
  const { requireAuth = true, requireRole, redirectTo = '/auth/select-role' } = options;

  const isAllowed = useMemo(() => {
    if (loading) return false;
    if (requireAuth && !isAuthenticated) return false;
    if (requireRole && !hasRole(requireRole as any)) return false;
    return true;
  }, [loading, isAuthenticated, requireAuth, requireRole, hasRole]);

  const shouldRedirect = useMemo(() => {
    if (loading) return false;
    if (requireAuth && !isAuthenticated) return true;
    return false;
  }, [loading, requireAuth, isAuthenticated]);

  React.useEffect(() => {
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }, [shouldRedirect, redirectTo]);

  return {
    isAllowed,
    isLoading: loading,
    isAuthenticated,
    shouldRedirect,
  };
};