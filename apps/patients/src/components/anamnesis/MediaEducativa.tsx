'use client';

import { useState } from 'react';
import { Play, Image as ImageIcon, X } from 'lucide-react';

interface MediaEducativaProps {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  duration?: string; // Para videos: "2:30"
}

export function MediaEducativa({ type, url, thumbnail, title, description, duration }: MediaEducativaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setHasWatched(true);
  };

  return (
    <>
      {/* Card de preview - Compacto */}
      <button
        onClick={handleOpen}
        className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2 hover:shadow-lg transition-all group"
      >
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-indigo-200 rounded-lg flex items-center justify-center overflow-hidden">
              {thumbnail ? (
                <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
              ) : type === 'video' ? (
                <Play className="h-6 w-6 text-indigo-600" />
              ) : (
                <ImageIcon className="h-6 w-6 text-indigo-600" />
              )}
            </div>
            {type === 'video' && duration && (
              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                {duration}
              </span>
            )}
            {hasWatched && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              {type === 'video' ? (
                <Play className="h-3 w-3 text-indigo-600" />
              ) : (
                <ImageIcon className="h-3 w-3 text-indigo-600" />
              )}
              <h4 className="text-sm font-semibold text-indigo-900">{title}</h4>
            </div>
            <p className="text-xs text-indigo-700">{description}</p>
            <p className="text-xs text-indigo-600 mt-1 font-medium group-hover:underline">
              {hasWatched ? '✓ Vista' : 'Click para ver'} →
            </p>
          </div>
        </div>
      </button>

      {/* Modal fullscreen */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Botón cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Contenido */}
            <div className="bg-white rounded-lg overflow-hidden">
              {type === 'video' ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img src={url} alt={title} className="w-full h-auto" />
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-700">{description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
