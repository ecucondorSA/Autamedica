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
    <div>
      {type === 'video' && isLocalVideo ? (
        // Video local con autoplay - Diseño limpio
        <div className="rounded-xl bg-sky-50 p-4 border border-sky-200">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              src={url}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="w-full aspect-video object-contain"
              onLoadedMetadata={(e) => {
                console.log('Video metadata loaded:', url);
                const video = e.target as HTMLVideoElement;
                video.volume = 0.3; // Set volume to 30%
                console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
                console.log('Video duration:', video.duration);
                console.log('Video volume set to:', video.volume);
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
          <div className="mt-3">
            <p className="text-sm text-gray-700 font-medium mb-1">🎥 Video educativo</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      ) : type === 'video' ? (
        // Video de iframe (YouTube, Vimeo, etc.)
        <div className="rounded-xl bg-sky-50 p-4 border border-sky-200">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <iframe
              src={url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-700 font-medium mb-1">🎥 Video educativo</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      ) : (
        // Imagen
        <div className="rounded-xl bg-green-50 p-4 border border-green-200">
          <img src={url} alt={title} className="w-full h-auto rounded-lg" />
          <div className="mt-3">
            <p className="text-sm font-medium text-green-900">{title}</p>
            <p className="text-sm text-green-800 mt-1">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
