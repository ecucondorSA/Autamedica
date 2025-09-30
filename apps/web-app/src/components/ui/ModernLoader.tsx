'use client';

import React from 'react';
import EnhancedLoader from './EnhancedLoader';

interface ModernLoaderProps {
  fullscreen?: boolean;
  text?: string;
  type?: 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse' | 'branded';
  progress?: number;
  onComplete?: () => void;
  minDuration?: number;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({
  fullscreen = true,
  text,
  type = 'branded',
  progress,
  onComplete,
  minDuration = 2500
}) => {
  return (
    <EnhancedLoader
      fullscreen={fullscreen}
      type={type}
      message={text}
      progress={progress}
      onComplete={onComplete}
      minDuration={minDuration}
    />
  );
};

export default ModernLoader;