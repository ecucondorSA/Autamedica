'use client';

import React from 'react';

interface AuthPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthPageWrapper: React.FC<AuthPageWrapperProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%)
        `,
      }}
    >
      {children}
    </div>
  );
};