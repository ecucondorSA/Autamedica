'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@autamedica/shared';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary for Auth App
 * Catches React component errors and provides fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logger.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--au-bg)]">
          <div className="w-full max-w-2xl">
            <div className="bg-[var(--au-surface)] border-2 border-red-500/30 rounded-2xl shadow-2xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[var(--au-text-primary)] mb-2">
                  Algo salió mal
                </h1>
                <p className="text-[var(--au-text-secondary)]">
                  Ha ocurrido un error inesperado en la aplicación
                </p>
              </div>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm font-mono text-red-300 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-xs font-mono text-red-300/70">
                      <summary className="cursor-pointer hover:text-red-300">Ver stack trace</summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-[var(--au-accent)] hover:bg-[var(--au-text-primary)] text-[var(--au-bg)] font-semibold rounded-xl transition-all duration-200"
                >
                  Intentar nuevamente
                </button>
                <a
                  href="/auth/select-role"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--au-hover)] hover:bg-[var(--au-hover-border)] border-2 border-[var(--au-border)] hover:border-[var(--au-accent)] text-[var(--au-text-secondary)] hover:text-[var(--au-text-primary)] font-semibold rounded-xl transition-all duration-200"
                >
                  Volver al inicio
                </a>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t-2 border-[var(--au-border)] text-center">
                <p className="text-sm text-[var(--au-text-tertiary)]">
                  Si el problema persiste, contacta al soporte técnico
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary (for use in functional components)
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
