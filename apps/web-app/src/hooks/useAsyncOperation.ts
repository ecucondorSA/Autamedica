'use client';

import { useState, useCallback } from 'react';
import { useLoading } from '@/lib/loading-context';

interface UseAsyncOperationOptions {
  componentId?: string;
  loadingMessage?: string;
  useGlobalLoader?: boolean;
  autoStart?: boolean;
}

export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const { componentId, loadingMessage, useGlobalLoader = false, autoStart = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(autoStart);

  const globalLoading = useLoading();

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use global loader or component-specific loader
      if (useGlobalLoader) {
        globalLoading.startLoading({
          type: 'spinner',
          message: loadingMessage
        });
      } else if (componentId) {
        globalLoading.setComponentLoading(componentId, {
          isLoading: true,
          type: 'spinner',
          message: loadingMessage
        });
      }

      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);

      // Clear loaders
      if (useGlobalLoader) {
        globalLoading.stopLoading();
      } else if (componentId) {
        globalLoading.clearComponentLoading(componentId);
      }
    }
  }, [operation, componentId, loadingMessage, useGlobalLoader, globalLoading]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);

    if (useGlobalLoader) {
      globalLoading.stopLoading();
    } else if (componentId) {
      globalLoading.clearComponentLoading(componentId);
    }
  }, [componentId, useGlobalLoader, globalLoading]);

  return {
    data,
    error,
    isLoading,
    execute,
    reset
  };
}

// Hook for API calls with automatic error handling
export function useApiCall<T = any>(
  apiCall: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation(apiCall, {
    loadingMessage: 'Cargando...',
    ...options
  });
}

// Hook for form submissions
export function useFormSubmission<T = any>(
  submitFn: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation(submitFn, {
    loadingMessage: 'Enviando...',
    useGlobalLoader: true,
    ...options
  });
}