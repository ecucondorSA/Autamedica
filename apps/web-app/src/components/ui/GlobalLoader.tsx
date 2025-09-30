'use client';

import React from 'react';
import { useLoading } from '@/lib/loading-context';
import EnhancedLoader from './EnhancedLoader';

const GlobalLoader: React.FC = () => {
  const { globalLoading } = useLoading();

  if (!globalLoading.isLoading) {
    return null;
  }

  return (
    <EnhancedLoader
      fullscreen
      type={globalLoading.type || 'spinner'}
      message={globalLoading.message}
      progress={globalLoading.progress}
    />
  );
};

export default GlobalLoader;