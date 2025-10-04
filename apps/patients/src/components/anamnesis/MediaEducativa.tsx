'use client';

import { Play, Image as ImageIcon } from 'lucide-react';

interface MediaEducativaProps {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  duration?: string; // Para videos: "2:30"
}

export function MediaEducativa({ type, url, title, description }: MediaEducativaProps) {
  // Detectar si es video local (.mp4, .webm, etc.)
  const isLocalVideo = url.match(/\.(mp4|webm|ogg)$/i);

  console.log('MediaEducativa - Loading video:', url, 'isLocal:', isLocalVideo);

  return (
    <div className="mb-3">
      {type === 'video' && isLocalVideo ? (
        // Video local con autoplay - Compacto
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2 overflow-hidden">
          {/* Video más pequeño - max height de 280px */}
          <div className="relative rounded-lg overflow-hidden bg-black" style={{ maxHeight: '280px' }}>
            <video
              src={url}
              controls
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-auto max-h-[280px] object-contain"
              onLoadedMetadata={(e) => {
                console.log('Video metadata loaded:', url);
                const video = e.target as HTMLVideoElement;
                console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
                console.log('Video duration:', video.duration);
              }}
              onCanPlay={() => {
                console.log('Video can play:', url);
              }}
              onError={(e) => {
                console.error('Error loading video:', url);
                const video = e.target as HTMLVideoElement;
                console.error('Video error code:', video.error?.code);
                console.error('Video error message:', video.error?.message);
              }}
            >
              <source src={url} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
          <div className="mt-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-indigo-900">{title}</h4>
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5">{description}</p>
          </div>
        </div>
      ) : type === 'video' ? (
        // Video de iframe (YouTube, Vimeo, etc.) - Compacto
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2 overflow-hidden">
          <div className="relative rounded-lg overflow-hidden bg-black" style={{ maxHeight: '280px', aspectRatio: '16/9' }}>
            <iframe
              src={url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-indigo-900">{title}</h4>
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5">{description}</p>
          </div>
        </div>
      ) : (
        // Imagen - Compacto
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2 overflow-hidden">
          <img src={url} alt={title} className="w-full h-auto max-h-[280px] object-contain rounded-lg" />
          <div className="mt-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-indigo-900">{title}</h4>
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
