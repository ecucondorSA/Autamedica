'use client';

import { getAppUrl } from '@/lib/env';
import { useEffect, useRef, useState } from 'react';

type PlaylistItem = {
  title: string;
  video: string;
  duration: string;
};

type Testimonial = {
  quote: string;
  author: string;
  position: string;
};

const features = [
  'Turnos confirmados en tiempo real',
  'Historial clínico accesible',
  'Recetas digitales firmadas',
  'Seguimiento post consulta',
  'Alertas inteligentes de tratamientos',
  'Integración con laboratorios',
  'Soporte multicanal 24/7',
  'Resultados clínicos adjuntos'
];

const playlist: PlaylistItem[] = [
  {
    title: 'Consulta sin esperas',
    video: '/videos/patient_consulta_virtual.mp4',
    duration: '07:52'
  },
  {
    title: 'Tu historia en un solo lugar',
    video: '/videos/patient_historia_clinica.mp4',
    duration: '06:15'
  },
  {
    title: 'Agenda inteligente',
    video: '/videos/patient_agendamiento.mp4',
    duration: '05:44'
  },
  {
    title: 'Seguimiento continuo',
    video: '/videos/patient_seguimiento.mp4',
    duration: '04:58'
  }
];

const testimonials: Testimonial[] = [
  {
    quote: 'Pasé de esperar semanas a resolverme en minutos. La receta llegó al instante y el control fue impecable.',
    author: 'Carolina S.',
    position: 'Paciente crónica de clínica médica'
  },
  {
    quote: 'Los recordatorios automáticos me ayudaron a cumplir el tratamiento completo. El equipo estuvo disponible todo el tiempo.',
    author: 'Hernán M.',
    position: 'Programa de rehabilitación cardiológica'
  }
];

export default function ProfessionalPatientsFeatures() {
  const [currentVideo, setCurrentVideo] = useState(playlist[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    const currentIndex = playlist.findIndex((item) => item.video === currentVideo?.video);
    const nextItem = playlist[(currentIndex + 1) % playlist.length];
    setCurrentVideo(nextItem);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSelect = (item: PlaylistItem) => {
    setCurrentVideo(item);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const play = videoRef.current.play();
      if (play instanceof Promise) {
        play.catch(() => setIsPlaying(false));
      }
    }
  }, [currentVideo, isPlaying]);

  return (
    <section className="patients-portal" aria-label="Portal Pacientes">
      <div className="media-zone">
        <div className="video-frame">
          <video
            key={currentVideo?.video}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src={currentVideo?.video} type="video/mp4" />
          </video>
          <div className="video-overlay">
            <div>
              <span className="badge">Historias reales</span>
              <h3>{currentVideo?.title}</h3>
            </div>
            <button type="button" onClick={togglePlayback} className="control" aria-label="Controlar reproducción">
              {isPlaying ? 'Pausa' : 'Reproducir'}
            </button>
          </div>
        </div>
        <div className="playlist" role="list">
          {playlist.map((item) => (
            <button
              key={item.video}
              type="button"
              onClick={() => handleSelect(item)}
              className={`playlist-item ${item.video === currentVideo?.video ? 'active' : ''}`}
              aria-pressed={item.video === currentVideo?.video}
            >
              <div className="item-head">
                <span className="dot" />
                <span className="duration">{item.duration}</span>
              </div>
              <p>{item.title}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="content-zone">
        <header className="header">
          <div className="identity">
            <span className="glyph" aria-hidden="true">🩺</span>
            <div>
              <h2>Portal Pacientes</h2>
              <p>Un ecosistema completo para gestionar turnos, recetas y seguimiento clínico sin salir de casa.</p>
            </div>
          </div>
          <div className="metrics">
            <div>
              <span className="metric-value">120K</span>
              <span className="metric-label">Consultas resueltas</span>
            </div>
            <div>
              <span className="metric-value">+95%</span>
              <span className="metric-label">Satisfacción registrada</span>
            </div>
            <div>
              <span className="metric-value">24/7</span>
              <span className="metric-label">Disponibilidad asistencial</span>
            </div>
          </div>
        </header>

        <div className="details-grid">
          <div className="feature-grid" role="list">
            {features.map((feature) => (
              <div key={feature} className="feature-card" role="listitem">
                <span className="marker" aria-hidden="true">▢</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="stories">
            <h3>Testimonios y casos de éxito</h3>
            <div className="stories-list">
              {testimonials.map((item) => (
                <article key={item.author}>
                  <p className="quote">“{item.quote}”</p>
                  <div className="attribution">
                    <span className="name">{item.author}</span>
                    <span className="role">{item.position}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="actions">
          <a className="cta primary" href={getAppUrl('/auth/login?portal=patients', 'patients')}>
            Acceder al Portal Pacientes
          </a>
          <a className="cta secondary" href={getAppUrl('/auth/register?portal=patients', 'patients')}>
            Crear mi cuenta gratuita
          </a>
        </div>
      </div>

      <style>{`
        .patients-portal {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          width: 100%;
          height: auto;
          min-height: 100%;
          padding: 2.2rem 3rem 1.9rem;
          box-sizing: border-box;
          background: linear-gradient(135deg, var(--au-surface), #151515);
          color: var(--au-text-primary);
        }

        .media-zone {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .video-frame {
          position: relative;
          width: 100%;
          min-height: 220px;
          height: clamp(250px, 34vh, 380px);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a, #262626);
          border: 1px solid var(--au-border);
        }

        .video-frame video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 1.6rem 1.8rem;
          background: linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.75) 90%);
        }

        .video-overlay h3 {
          font-size: clamp(1.5rem, 2.3vw, 2rem);
          margin: 0.75rem 0 0;
          font-weight: 600;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
        }

        .control {
          align-self: flex-start;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.18);
          color: var(--au-text-primary);
          border-radius: 999px;
          padding: 0.65rem 1.3rem;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          cursor: pointer;
        }

        .control:hover {
          background: rgba(0,0,0,0.7);
        }

        .playlist {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.55rem;
        }

        .playlist-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.85rem 1.15rem;
          border-radius: 12px;
          background: rgba(24,24,24,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--au-text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .playlist-item p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--au-text-primary);
        }

        .playlist-item:hover {
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .playlist-item.active {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.35);
          color: var(--au-text-primary);
        }

        .item-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: var(--au-accent);
        }

        .duration {
          color: var(--au-text-tertiary);
        }

        .content-zone {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          gap: 1.4rem;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.6rem;
          flex-wrap: wrap;
        }

        .identity {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          max-width: 600px;
        }

        .glyph {
          font-size: clamp(2rem, 4vw, 2.8rem);
          line-height: 1;
        }

        .identity h2 {
          margin: 0 0 0.5rem;
          font-size: clamp(2.4rem, 4.6vw, 3.3rem);
          letter-spacing: -0.02em;
        }

        .identity p {
          margin: 0;
          font-size: clamp(1.05rem, 1.8vw, 1.25rem);
          color: var(--au-text-secondary);
          line-height: 1.4;
        }

        .metrics {
          display: flex;
          gap: 1.4rem;
          flex-wrap: wrap;
        }

        .metrics div {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .metric-value {
          font-size: clamp(1.7rem, 2.7vw, 2.2rem);
          font-weight: 600;
        }

        .metric-label {
          font-size: 0.95rem;
          color: var(--au-text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .details-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          gap: 1.4rem;
          align-items: stretch;
          overflow: hidden;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          align-content: start;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.9rem 1.15rem;
          border-radius: 10px;
          background: rgba(26,26,26,0.78);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 0.94rem;
          line-height: 1.3;
          color: var(--au-text-secondary);
          transition: border-color 0.2s ease;
        }

        .feature-card:hover {
          border-color: rgba(255,255,255,0.2);
          color: var(--au-text-primary);
        }

        .marker {
          font-size: 1.1rem;
          color: var(--au-accent);
          margin-top: 0.1rem;
        }

        .stories {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(15,15,15,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 1.25rem 1.4rem 1.3rem 1.25rem;
          min-height: 0;
          overflow: hidden;
        }

        .stories h3 {
          margin: 0;
          font-size: clamp(1.3rem, 2vw, 1.7rem);
          font-weight: 600;
        }

        .stories-list {
          display: grid;
          gap: 0.8rem;
          overflow-y: auto;
          padding-right: 0.35rem;
          scrollbar-width: thin;
        }

        .quote {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.45;
          color: var(--au-text-secondary);
        }

        .attribution {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.6rem;
        }

        .name {
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .role {
          font-size: 0.9rem;
          color: var(--au-text-tertiary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 2.3rem;
          border-radius: 999px;
          font-size: 0.98rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          border: 1px solid transparent;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .cta.primary {
          background: var(--au-accent);
          color: #111;
        }

        .cta.secondary {
          background: transparent;
          border-color: rgba(255,255,255,0.18);
          color: var(--au-text-primary);
        }

        .cta:hover {
          transform: translateY(-2px);
        }

        .cta.secondary:hover {
          border-color: rgba(255,255,255,0.4);
        }

        @media (max-width: 1520px) {
          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1280px) {
          .patients-portal {
            padding: 2rem 2.5rem 1.8rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1180px) {
          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .patients-portal {
            padding: 1.8rem 1.45rem 1.6rem;
          }

          .media-zone {
            gap: 0.8rem;
          }

          .video-frame {
            height: 220px;
          }

          .playlist {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .metrics {
            width: 100%;
            justify-content: space-between;
          }

          .actions {
            flex-direction: column;
          }

          .cta {
            width: 100%;
          }
        }

        @media (max-width: 540px) {
          .playlist {
            grid-template-columns: 1fr;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
