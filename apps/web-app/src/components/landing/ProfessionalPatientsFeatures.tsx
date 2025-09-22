'use client';

// import Link from 'next/link';
import { useState, useRef } from 'react';
import { getAppUrl } from '@/lib/env';

export default function ProfessionalPatientsFeatures() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const features = [
    'Consultas virtuales HD',
    'Historia clínica digital',
    'Agendamiento inteligente',
    'Recordatorios automáticos',
    'Acceso 24/7 a especialistas',
    'Recetas digitales',
    'Seguimiento médico continuo'
  ];

  const videoThumbnails = [
    {
      title: 'Consulta Virtual',
      video: '/videos/patient_consulta_virtual.mp4',
      thumbnail: '/videos/thumb1.jpg',
      duration: '8:00'
    },
    {
      title: 'Historia Clínica',
      video: '/videos/patient_historia_clinica.mp4',
      thumbnail: '/videos/thumb2.jpg',
      duration: '8:00'
    },
    {
      title: 'Agendamiento',
      video: '/videos/patient_agendamiento.mp4',
      thumbnail: '/videos/thumb3.jpg',
      duration: '8:00'
    },
    {
      title: 'Seguimiento',
      video: '/videos/patient_seguimiento.mp4',
      thumbnail: '/videos/thumb4.jpg',
      duration: '5:00'
    }
  ];

  // Función para avanzar al siguiente video
  const handleVideoEnd = () => {
    const nextIndex = (currentVideoIndex + 1) % videoThumbnails.length;
    setCurrentVideoIndex(nextIndex);
  };

  // Video actual seguro
  const currentVideo = videoThumbnails[currentVideoIndex];

  // Función para pausar/reanudar la secuencia
  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Función para ir a un video específico
  const goToVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="content">
      <div className="icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>

      <h2>Portal de Pacientes</h2>
      <p className="subtitle">Gestiona tu salud desde cualquier lugar</p>

      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index}>
            <span className="check">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Videos de pacientes - Reproducción automática en secuencia */}
      <div className="video-section">
        <h3 className="video-title">Experiencias de nuestros pacientes</h3>
        
        {/* Reproductor principal */}
        <div className="video-player-container">
          <video
            ref={videoRef}
            key={currentVideo?.video}
            width="100%"
            height="400"
            autoPlay
            muted
            onEnded={handleVideoEnd}
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              objectFit: 'cover'
            }}
          >
            <source src={currentVideo?.video} type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>
          
          {/* Overlay con información del video actual */}
          <div className="video-overlay">
            <div className="video-info">
              <h4 className="current-video-title">{currentVideo?.title}</h4>
              <div className="video-progress">
                <div className="progress-dots">
                  {videoThumbnails.map((_, index) => (
                    <button
                      key={index}
                      className={`progress-dot ${index === currentVideoIndex ? 'active' : ''} ${index < currentVideoIndex ? 'completed' : ''}`}
                      onClick={() => goToVideo(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Controles de reproducción */}
            <div className="video-controls">
              <button onClick={togglePlayback} className="play-pause-btn">
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnails como navegación */}
        <div className="video-navigation">
          {videoThumbnails.map((video, index) => (
            <div 
              key={index} 
              className={`nav-thumbnail ${index === currentVideoIndex ? 'active' : ''}`}
              onClick={() => goToVideo(index)}
            >
              <div className="nav-thumb-image">
                <span className="nav-duration">{video.duration}</span>
              </div>
              <p className="nav-title">{video.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-buttons">
        <a href={getAppUrl('/auth/login?portal=patients', 'patients')} className="btn btn-primary">
          Acceder como Paciente
        </a>
        <a href={getAppUrl('/auth/login?portal=patients', 'patients')} className="btn btn-secondary">
          Comenzar Gratis
        </a>
      </div>

      <style>{`
        .content {
          text-align: center;
          max-width: 900px;
          color: #fff;
          padding: 0;
          width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
        }

        .icon {
          margin-bottom: 0;
          opacity: 0.9;
        }

        h2 {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          margin-bottom: 0.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 0.9;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: clamp(0.6rem, 1vw, 0.7rem);
          margin-bottom: 0.25rem;
          opacity: 0.8;
          color: #e5e7eb;
          line-height: 1;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0.1rem 0;
          text-align: left;
          max-width: 250px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-list li {
          padding: clamp(0.05rem, 0.3vw, 0.1rem) 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: clamp(0.15rem, 0.3vw, 0.25rem);
          transition: all 0.2s ease;
          font-size: clamp(0.6rem, 0.9vw, 0.65rem);
          line-height: 1;
        }

        .features-list li:hover {
          padding-left: 0.5rem;
          border-color: rgba(37, 211, 102, 0.3);
        }

        .check {
          color: var(--primary);
          font-weight: bold;
          font-size: 1.1rem;
        }

        .cta-buttons {
          display: flex;
          gap: 0.25rem;
          justify-content: center;
          margin-top: 0.25rem;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: clamp(0.25rem, 0.7vw, 0.4rem) clamp(0.5rem, 1vw, 0.8rem);
          text-decoration: none;
          border-radius: 3px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          font-size: clamp(0.55rem, 0.8vw, 0.6rem);
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #000;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: #fff;
        }

        @media (max-width: 768px) {
          .cta-buttons {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .btn {
            width: 100%;
            max-width: 280px;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 1rem;
          }

          .features-list {
            max-width: 400px;
          }

          .cta-buttons {
            gap: 0.5rem;
          }

          .thumbnail-grid {
            grid-template-columns: 1fr;
            max-width: 300px;
          }

          .video-thumbnails {
            padding: 0.75rem;
            margin: 1rem 0;
          }
        }

        /* Video section - Reproductor automático */
        .video-section {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .video-title {
          font-size: clamp(0.8rem, 1.4vw, 1rem);
          font-weight: 600;
          color: #fff;
          margin-bottom: 1rem;
          text-align: center;
        }

        .video-player-container {
          position: relative;
          margin-bottom: 1rem;
          border-radius: 12px;
          overflow: hidden;
        }

        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .current-video-title {
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .progress-dots {
          display: flex;
          gap: 8px;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.5);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          transform: scale(1.2);
        }

        .progress-dot.completed {
          background: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.7);
        }

        .video-controls {
          display: flex;
          gap: 10px;
        }

        .play-pause-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .play-pause-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.05);
        }

        .video-navigation {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .nav-thumbnail {
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
        }

        .nav-thumbnail.active {
          border-color: var(--primary);
          transform: scale(1.05);
        }

        .nav-thumbnail:hover {
          transform: scale(1.03);
        }

        .nav-thumb-image {
          aspect-ratio: 16/9;
          background: linear-gradient(45deg, rgba(37, 211, 102, 0.3), rgba(0, 100, 255, 0.3));
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-duration {
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          position: absolute;
          bottom: 4px;
          right: 4px;
        }

        .nav-title {
          color: #fff;
          font-size: 0.7rem;
          text-align: center;
          margin: 0.3rem 0 0 0;
          padding: 0 0.2rem;
        }

        .thumbnail-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thumbnail-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          border-color: var(--primary);
        }

        .thumbnail-image {
          position: relative;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .play-button {
          width: 18px;
          height: 18px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-size: 8px;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .thumbnail-card:hover .play-button {
          transform: scale(1.1);
          background: var(--primary);
          box-shadow: 0 2px 6px rgba(247, 217, 104, 0.4);
        }

        .duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .thumbnail-text {
          padding: 0.1rem 0.15rem;
          font-size: clamp(0.5rem, 0.7vw, 0.55rem);
          font-weight: 500;
          color: #e5e7eb;
          text-align: center;
          margin: 0;
          line-height: 0.9;
        }

        /* Responsive design for video section */
        @media (max-width: 768px) {
          .video-section {
            padding: 0.5rem;
          }
          
          .video-navigation {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3rem;
          }
          
          .current-video-title {
            font-size: 0.9rem;
          }
          
          .video-overlay {
            padding: 0.5rem;
          }
          
          .nav-title {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 480px) {
          .video-navigation {
            grid-template-columns: 1fr 1fr;
          }
          
          .progress-dots {
            gap: 6px;
          }
          
          .progress-dot {
            width: 8px;
            height: 8px;
          }
          
          .play-pause-btn {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
        }

        /* Optimización para zoom */
        @media (min-width: 1200px) {
          .content {
            max-width: 1000px;
          }

          .features-list {
            max-width: 500px;
          }

          .video-section {
            max-width: 800px;
            margin: 1.5rem auto;
          }
        }
      `}</style>
    </div>
  );
}