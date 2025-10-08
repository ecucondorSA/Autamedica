'use client';
/* global performance */

import React, { useEffect, useState } from 'react';

interface EnhancedLoaderProps {
  // Display options
  fullscreen?: boolean;
  overlay?: boolean;
  transparent?: boolean;

  // Loading type
  type?: 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse' | 'branded' | 'overlay';

  // Content
  message?: string;
  progress?: number;

  // Styling
  size?: 'sm' | 'md' | 'lg';
  className?: string;

  // Branded loader options
  minDuration?: number;
  onComplete?: () => void;
}

const EnhancedLoader: React.FC<EnhancedLoaderProps> = ({
  fullscreen = false,
  overlay = false,
  transparent = false,
  type = 'spinner',
  message,
  progress,
  size = 'md',
  className = '',
  minDuration = 1200,
  onComplete
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [internalProgress, setInternalProgress] = useState(0);

  // Auto-progress for branded loader
  useEffect(() => {
    if (type === 'branded' && onComplete) {
      const started = performance.now();
      const progressInterval = setInterval(() => {
        setInternalProgress(p => Math.min(100, p + Math.random() * 15));
      }, 100);

      const checkCompletion = setInterval(() => {
        const elapsed = performance.now() - started;
        if (internalProgress >= 100 && elapsed >= minDuration) {
          clearInterval(progressInterval);
          clearInterval(checkCompletion);
          onComplete();
        }
      }, 50);

      return () => {
        clearInterval(progressInterval);
        clearInterval(checkCompletion);
      };
    }
  }, [type, onComplete, minDuration, internalProgress]);

  // Animate progress changes
  useEffect(() => {
    const targetProgress = progress ?? internalProgress;
    const increment = (targetProgress - animatedProgress) / 10;
    if (Math.abs(increment) > 0.1) {
      const timer = setTimeout(() => {
        setAnimatedProgress(prev => prev + increment);
      }, 16);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(targetProgress);
    }
  }, [progress, internalProgress, animatedProgress]);

  // Size configurations
  const sizeConfig = {
    sm: { spinner: 'w-4 h-4', text: 'text-xs' },
    md: { spinner: 'w-8 h-8', text: 'text-sm' },
    lg: { spinner: 'w-12 h-12', text: 'text-base' }
  };

  // Container classes
  const containerClasses = [
    fullscreen ? 'fixed inset-0 z-[9999]' : 'relative',
    overlay ? 'absolute inset-0' : '',
    transparent ? 'bg-transparent' : fullscreen || overlay ? 'bg-black/80 backdrop-blur-sm' : '',
    'flex items-center justify-center',
    className
  ].filter(Boolean).join(' ');

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className={`${sizeConfig[size].spinner} border-2 border-gray-600 border-t-white rounded-full animate-spin`} />
            {message && <div className={`text-white ${sizeConfig[size].text}`}>{message}</div>}
          </div>
        );

      case 'progress':
        return (
          <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
            {message && <div className={`text-white text-center ${sizeConfig[size].text} mb-2`}>{message}</div>}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
            <div className="text-white text-xs">{Math.round(animatedProgress)}%</div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} bg-white rounded-full animate-pulse`}
                  style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.5s' }}
                />
              ))}
            </div>
            {message && <div className={`text-white ${sizeConfig[size].text}`}>{message}</div>}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className={`${sizeConfig[size].spinner} bg-white rounded-full animate-ping`} />
            {message && <div className={`text-white ${sizeConfig[size].text}`}>{message}</div>}
          </div>
        );

      case 'skeleton':
        return (
          <div className="w-full max-w-md space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        );

      case 'branded':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <style jsx global>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');

              .autamedica-logo {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 300;
                font-size: 2.5rem;
                letter-spacing: 0.25em;
                color: #ffffff;
                text-transform: uppercase;
                user-select: none;
                line-height: 1;
                animation: fadeInScale 0.8s ease-out;
              }

              @media (min-width: 768px) {
                .autamedica-logo { font-size: 3rem; letter-spacing: 0.3em; }
              }

              @media (min-width: 1024px) {
                .autamedica-logo { font-size: 3.5rem; letter-spacing: 0.35em; }
              }

              @keyframes fadeInScale {
                0% { opacity: 0; transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
              }

              @keyframes progressGlow {
                0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.3); }
                50% { box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4); }
              }

              .progress-container {
                width: 280px;
                max-width: 80vw;
                height: 2px;
                background: rgba(255,255,255,0.1);
                border-radius: 1px;
                overflow: hidden;
                margin-top: 3rem;
                position: relative;
              }

              .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #ffffff, #e0e0e0, #ffffff);
                background-size: 200% 100%;
                animation: progressGlow 2s ease-in-out infinite, shimmer 1.5s linear infinite;
                transition: width 0.3s ease-out;
                border-radius: 1px;
              }

              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>

            <h1 className="autamedica-logo">AUTAMEDICA</h1>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>

            {message && (
              <div className="mt-6 text-center">
                <div className="text-white/70 text-sm tracking-wider">{message}</div>
              </div>
            )}
          </div>
        );

      default:
        return renderLoader();
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
    </div>
  );
};

export default EnhancedLoader;