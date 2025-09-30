'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (scrolled / total) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-[9999] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso de lectura de la página"
    >
      <div
        className="h-full bg-gradient-to-r from-gray-400 via-white to-gray-400 transition-all duration-150 ease-out shadow-lg"
        style={{
          width: `${scrollProgress}%`,
          boxShadow: scrollProgress > 0 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
        }}
      />
    </div>
  );
}
