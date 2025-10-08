'use client';
/* global IntersectionObserver */

import { useEffect, useRef, useState } from 'react';
import { logger } from '@autamedica/shared';

const videoSources = [
  { src: '/videos/video1.mp4', title: 'Consultorio Digital' },
  { src: '/videos/video2.mp4', title: 'Asistente IA' },
  { src: '/videos/video3.mp4', title: 'Seguimiento' },
  { src: '/videos/alta-agent-ia.mp4', title: 'Diagnóstico Inteligente' },
  { src: '/videos/patient_consulta_virtual.mp4', title: 'Consulta Virtual' },
  { src: '/videos/patient_historia_clinica.mp4', title: 'Historia Clínica' },
  { src: '/videos/patient_agendamiento.mp4', title: 'Agendamiento' },
  { src: '/videos/patient_seguimiento.mp4', title: 'Monitoreo' }
];

export default function VideoGrid() {
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
   
  const [_isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // IntersectionObserver to detect when component is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Play videos when visible
             
            videosRef.current.forEach((video, _index) => {
              if (video && video.paused) {
                // Random start delay between 0 and 2 seconds
                const delay = Math.random() * 2000;
                setTimeout(() => {
                  // Check if video element still exists in DOM
                  if (document.body.contains(video) && video.paused) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                      playPromise.catch((error) => {
                        // Ignore AbortError silently
                        if (error.name !== 'AbortError') {
                          logger.debug('Video play error:', error.name);
                        }
                      });
                    }
                  }
                }, delay);
              }
            });
          } else {
            // Pause videos when not visible to save resources
            videosRef.current.forEach((video) => {
              if (video && !video.paused && document.body.contains(video)) {
                video.pause();
              }
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' } // Trigger slightly before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      // Cleanup: pause all videos
      videosRef.current.forEach((video) => {
        if (video && document.body.contains(video)) {
          video.pause();
        }
      });
    };
  }, []);

  useEffect(() => {
    // Set random start time for each video when metadata loads
    videosRef.current.forEach((video) => {
      if (video) {
        const handleLoadedMetadata = () => {
          if (video.duration && video.duration > 0) {
            video.currentTime = Math.random() * video.duration * 0.5;
          }
        };
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
    });
  }, []);

  return (
    <section ref={containerRef} className="video-grid-section">
      <div className="mx-auto max-w-[min(1600px,96vw)] px-[clamp(12px,2.5vw,24px)]">
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light text-center text-white mb-2 tracking-wide leading-tight">Ecosistema Médico Completo</h2>
        <p className="text-[clamp(1rem,2.5vw,1.4rem)] text-center text-white/60 mb-[clamp(2rem,6vh,4rem)] leading-relaxed">Múltiples herramientas trabajando en sincronía para tu salud</p>

        <div className="grid gap-[clamp(12px,2vw,24px)]" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 320px), 1fr))', gridAutoRows: 'clamp(140px, 18vh, 220px)'}}>
          {videoSources.map((video, index) => (
            <div key={index} className="video-item">
              <video
                ref={(el) => {
                  if (el) videosRef.current[index] = el;
                }}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="grid-video"
              >
                <source src={video.src} type="video/mp4" />
              </video>
              <div className="video-overlay">
                <span className="video-title">{video.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .video-grid-section {
          padding: clamp(2rem, 4vh, 4rem) clamp(1rem, 3vw, 3rem) !important;
          background: linear-gradient(180deg, #0a0a0a 0%, #141414 100%) !important;
          min-height: 100% !important;
          height: auto !important;
          max-height: none !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          overflow: visible !important;
          box-sizing: border-box !important;
        }

        .grid-container {
          max-width: none;
        }

        .grid-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 300;
          text-align: center;
          color: #ffffff;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
          line-height: 1.2;
        }

        .grid-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.4rem);
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: clamp(2rem, 6vh, 4rem);
          line-height: 1.4;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2.5rem;
          padding: 0 2rem;
        }

        .video-item {
          position: relative !important;
          aspect-ratio: 16 / 10 !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          background: #1a1a1a !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          min-height: clamp(140px, 18vh, 220px) !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .video-item:hover {
          transform: scale(1.08);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
          z-index: 10;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .grid-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: opacity 0.3s ease;
        }

        .video-item:hover .grid-video {
          opacity: 1;
        }

        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        .video-item:hover .video-overlay {
          transform: translateY(0);
        }

        .video-title {
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        @media (max-width: 1200px) {
          .video-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 0 1rem;
          }

          .grid-title {
            font-size: 2rem;
          }

          .grid-subtitle {
            font-size: 1rem;
          }

          .video-grid-section {
            padding: 4rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}