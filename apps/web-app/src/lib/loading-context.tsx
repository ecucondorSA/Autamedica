'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'skeleton' | 'overlay';
}

interface LoadingContextType {
  // Global loading state
  globalLoading: LoadingState;

  // Loading controls
  startLoading: (options?: Partial<LoadingState>) => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;

  // Component-specific loading states
  componentLoadings: Record<string, LoadingState>;
  setComponentLoading: (componentId: string, loading: LoadingState) => void;
  clearComponentLoading: (componentId: string) => void;
  isComponentLoading: (componentId: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [globalLoading, setGlobalLoading] = useState<LoadingState>({
    isLoading: false,
    type: 'spinner'
  });

  const [componentLoadings, setComponentLoadings] = useState<Record<string, LoadingState>>({});

  const startLoading = useCallback((options: Partial<LoadingState> = {}) => {
    setGlobalLoading(prev => ({
      ...prev,
      isLoading: true,
      type: 'spinner',
      ...options
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setGlobalLoading(prev => ({
      ...prev,
      isLoading: false,
      progress: undefined,
      message: undefined
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setGlobalLoading(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setGlobalLoading(prev => ({
      ...prev,
      message
    }));
  }, []);

  const setComponentLoading = useCallback((componentId: string, loading: LoadingState) => {
    setComponentLoadings(prev => ({
      ...prev,
      [componentId]: loading
    }));
  }, []);

  const clearComponentLoading = useCallback((componentId: string) => {
    setComponentLoadings(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to remove key from object
      const { [componentId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const isComponentLoading = useCallback((componentId: string) => {
    return componentLoadings[componentId]?.isLoading ?? false;
  }, [componentLoadings]);

  const value: LoadingContextType = {
    globalLoading,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
    componentLoadings,
    setComponentLoading,
    clearComponentLoading,
    isComponentLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for component-specific loading
export function useComponentLoading(componentId: string) {
  const { setComponentLoading, clearComponentLoading, isComponentLoading, componentLoadings } = useLoading();

  const startLoading = useCallback((options: Partial<LoadingState> = {}) => {
    setComponentLoading(componentId, {
      isLoading: true,
      type: 'spinner',
      ...options
    });
  }, [componentId, setComponentLoading]);

  const stopLoading = useCallback(() => {
    clearComponentLoading(componentId);
  }, [componentId, clearComponentLoading]);

  const setProgress = useCallback((progress: number) => {
    setComponentLoading(componentId, {
      ...componentLoadings[componentId],
      isLoading: true,
      progress: Math.max(0, Math.min(100, progress))
    });
  }, [componentId, setComponentLoading, componentLoadings]);

  const setMessage = useCallback((message: string) => {
    setComponentLoading(componentId, {
      ...componentLoadings[componentId],
      isLoading: true,
      message
    });
  }, [componentId, setComponentLoading, componentLoadings]);

  return {
    isLoading: isComponentLoading(componentId),
    loadingState: componentLoadings[componentId],
    startLoading,
    stopLoading,
    setProgress,
    setMessage
  };
}