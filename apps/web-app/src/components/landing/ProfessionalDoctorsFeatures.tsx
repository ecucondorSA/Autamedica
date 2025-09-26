'use client';

import { getAppUrl } from '@/lib/env';
import { useEffect, useRef, useState } from 'react';

type Reel = {
  title: string;
  description: string;
  video: string;
  duration: string;
};

const keyTools = [
  'Consultorio virtual con múltiples salas simultáneas',
  'Tablero clínico con soporte de IA integrada',
  'Prescripción electrónica con firma digital',
  'Análisis evolutivo por paciente y cohorte',
  'Protocolos compartidos entre equipos médicos',
  'Checklist pre consulta automatizado',
  'Reportes exportables en segundos',
  'Alertas sobre interacciones farmacológicas'
];

const techHighlights = [
  {
    title: 'Seguridad de datos',
    detail: 'Cifrado AES-256, firma doble factor y auditoría completa.'
  },
  {
    title: 'Workflows configurables',
    detail: 'Protocolos por especialidad con plantillas reutilizables.'
  },
  {
    title: 'Analítica inmediata',
    detail: 'Paneles dinámicos con métricas comparativas y alertas.'
  }
];

const integrations = [
  {
    name: 'HL7 & FHIR',
    detail: 'Intercambio interoperable con hospitales y laboratorios.'
  },
  {
    name: 'PACS / DICOM',
    detail: 'Imágenes diagnósticas en alta resolución directamente en la ficha.'
  },
  {
    name: 'Sistemas contables',
    detail: 'Facturación automática y conciliación de cobranzas.'
  }
];

const demoReels: Reel[] = [
  {
    title: 'Consultorio digital integral',
    description: 'Agenda compartida, sala de espera virtual y panel clínico en vivo.',
    video: '/videos/Video_Listo_Telemedicina.mp4',
    duration: '08:10'
  },
  {
    title: 'Asistente diagnóstico',
    description: 'IA que sugiere diagnósticos diferenciales y protocolos terapéuticos.',
    video: '/videos/alta-agent-ia.mp4',
    duration: '05:36'
  },
  {
    title: 'Seguimiento longitudinal',
    description: 'Evolución clínica y resultados compartidos con el equipo ampliado.',
    video: '/videos/Video_Listo_Encuentra_Doctor.mp4',
    duration: '07:04'
  }
];

export default function ProfessionalDoctorsFeatures() {
  const [current, setCurrent] = useState(demoReels[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    const index = demoReels.findIndex((reel) => reel.video === current.video);
    const next = demoReels[(index + 1) % demoReels.length];
    setCurrent(next);
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

  const handleSelect = (reel: Reel) => {
    setCurrent(reel);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise instanceof Promise) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
  }, [current, isPlaying]);

  return (
    <section className="doctors-portal" aria-label="Portal Médicos">
      <div className="media-block">
        <div className="reel-frame">
          <video
            key={current.video}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src={current.video} type="video/mp4" />
          </video>
          <div className="reel-overlay">
            <div className="reel-copy">
              <span className="reel-badge">Demostración clínica</span>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
            </div>
            <button type="button" className="reel-control" onClick={togglePlayback}>
              {isPlaying ? 'Pausa' : 'Reproducir'}
            </button>
          </div>
        </div>
        <div className="reel-strip" role="list">
          {demoReels.map((reel) => (
            <button
              key={reel.video}
              type="button"
              onClick={() => handleSelect(reel)}
              className={`reel-card ${reel.video === current.video ? 'active' : ''}`}
              aria-pressed={reel.video === current.video}
            >
              <div className="card-header">
                <span className="card-dot" />
                <span className="card-duration">{reel.duration}</span>
              </div>
              <strong>{reel.title}</strong>
              <span>{reel.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="content-block">
        <header className="portal-head">
          <div className="portal-title">
            <span aria-hidden="true" className="symbol">⚕️</span>
            <div>
              <h2>Portal Médico</h2>
              <p>Un workspace clínico diseñado para profesionales que necesitan precisión, velocidad y trazabilidad.</p>
            </div>
          </div>
          <dl className="portal-metrics">
            <div>
              <dt>Tiempo medio por consulta</dt>
              <dd>11 min</dd>
            </div>
            <div>
              <dt>Protocolos activos</dt>
              <dd>145</dd>
            </div>
            <div>
              <dt>Prescripciones digitales</dt>
              <dd>320K</dd>
            </div>
          </dl>
        </header>

        <div className="information-grid">
          <div className="tools" role="list">
            {keyTools.map((tool) => (
              <div key={tool} className="tool-card" role="listitem">
                <span className="bullet" aria-hidden="true">▣</span>
                <span>{tool}</span>
              </div>
            ))}
          </div>

          <div className="tech-panels">
            <section>
              <h3>Características técnicas</h3>
              <div className="tech-list">
                {techHighlights.map((item) => (
                  <article key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <h3>Integraciones principales</h3>
              <ul>
                {integrations.map((integration) => (
                  <li key={integration.name}>
                    <span>{integration.name}</span>
                    <p>{integration.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="cta-row">
          <a className="cta primary" href={getAppUrl('/auth/login?portal=doctors', 'doctors')}>
            Acceder como Médico
          </a>
          <a className="cta secondary" href={getAppUrl('/auth/register?portal=doctors', 'doctors')}>
            Solicitar demostración técnica
          </a>
        </div>
      </div>

      <style>{`
        .doctors-portal {
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 1.6rem;
          width: 100%;
          height: 100%;
          min-height: 100%;
          padding: 2.2rem 3rem 1.9rem;
          box-sizing: border-box;
          background: linear-gradient(135deg, #f2f2f2, #d8d8d8);
          color: #111;
          overflow: hidden;
        }

        .media-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reel-frame {
          position: relative;
          width: 100%;
          min-height: 220px;
          height: clamp(250px, 34vh, 380px);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #cbcbcb, #dedede);
          border: 1px solid rgba(0,0,0,0.08);
        }

        .reel-frame video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reel-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 1.6rem 1.8rem;
          background: linear-gradient(180deg, rgba(15,15,15,0.15) 0%, rgba(10,10,10,0.65) 90%);
          color: #f7f7f7;
        }

        .reel-copy h3 {
          margin: 0.75rem 0 0;
          font-size: clamp(1.6rem, 2.5vw, 2.1rem);
          font-weight: 600;
        }

        .reel-copy p {
          margin: 0.4rem 0 0;
          font-size: 1rem;
          line-height: 1.5;
          color: #dedede;
          max-width: 420px;
        }

        .reel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
        }

        .reel-control {
          align-self: flex-start;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.3);
          color: #f1f1f1;
          border-radius: 999px;
          padding: 0.65rem 1.3rem;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          cursor: pointer;
        }

        .reel-control:hover {
          background: rgba(0,0,0,0.75);
        }

        .reel-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 0.75rem;
        }

        .reel-card {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
          padding: 1rem 1.3rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.08);
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .reel-card strong {
          font-size: 1rem;
        }

        .reel-card span {
          font-size: 0.9rem;
          color: #3e3e3e;
        }

        .reel-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,0,0,0.2);
        }

        .reel-card.active {
          background: rgba(17,17,17,0.85);
          color: #f7f7f7;
          border-color: rgba(17,17,17,0.65);
        }

        .reel-card.active span {
          color: #d8d8d8;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .card-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: #1a1a1a;
        }

        .reel-card.active .card-dot {
          background: #f7f7f7;
        }

        .card-duration {
          color: #555;
        }

        .reel-card.active .card-duration {
          color: #cfcfcf;
        }

        .content-block {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          gap: 1.4rem;
          overflow: hidden;
        }

        .portal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.6rem;
          flex-wrap: wrap;
        }

        .portal-title {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          max-width: 620px;
        }

        .portal-title h2 {
          margin: 0 0 0.5rem;
          font-size: clamp(2.4rem, 4.6vw, 3.3rem);
          letter-spacing: -0.02em;
        }

        .portal-title p {
          margin: 0;
          font-size: clamp(1rem, 1.8vw, 1.25rem);
          color: #3a3a3a;
          line-height: 1.45;
        }

        .symbol {
          font-size: clamp(2rem, 3.6vw, 2.8rem);
        }

        .portal-metrics {
          display: flex;
          gap: 1.75rem;
          flex-wrap: wrap;
          margin: 0;
        }

        .portal-metrics div {
          min-width: 150px;
        }

        .portal-metrics dt {
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #5a5a5a;
          margin: 0 0 0.35rem;
        }

        .portal-metrics dd {
          margin: 0;
          font-size: clamp(1.5rem, 2.6vw, 2rem);
          font-weight: 600;
          color: #121212;
        }

        .information-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          gap: 1.4rem;
          align-items: stretch;
          overflow: hidden;
        }

        .tools {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          align-content: start;
        }

        .tool-card {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          padding: 0.9rem 1.15rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.68);
          border: 1px solid rgba(0,0,0,0.08);
          font-size: 0.94rem;
          line-height: 1.3;
          color: #1e1e1e;
          transition: border-color 0.2s ease;
        }

        .tool-card:hover {
          border-color: rgba(0,0,0,0.22);
        }

        .bullet {
          font-size: 1.1rem;
          color: #222;
          margin-top: 0.1rem;
        }

        .tech-panels {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 1.4rem;
          min-height: 0;
        }

        .tech-panels h3 {
          margin: 0 0 1rem;
          font-size: clamp(1.3rem, 2vw, 1.7rem);
        }

        .tech-list {
          display: grid;
          gap: 0.75rem;
        }

        .tech-list article {
          padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .tech-list article:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tech-list h4 {
          margin: 0 0 0.35rem;
          font-size: 1.02rem;
          font-weight: 600;
        }

        .tech-list p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #3c3c3c;
        }

        .tech-panels ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.8rem;
        }

        .tech-panels li span {
          display: block;
          font-weight: 600;
          font-size: 1rem;
        }

        .tech-panels li p {
          margin: 0.35rem 0 0;
          font-size: 0.9rem;
          color: #3c3c3c;
          line-height: 1.5;
        }

        .cta-row {
          display: flex;
          gap: 1.05rem;
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
          background: #1b1b1b;
          color: #f8f8f8;
        }

        .cta.secondary {
          background: transparent;
          border-color: rgba(0,0,0,0.35);
          color: #1b1b1b;
        }

        .cta:hover {
          transform: translateY(-2px);
        }

        .cta.secondary:hover {
          border-color: rgba(0,0,0,0.55);
        }

        @media (max-width: 1520px) {
          .tools {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1280px) {
          .doctors-portal {
            padding: 2rem 2.5rem 1.8rem;
          }

          .information-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1024px) {
          .tools {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .doctors-portal {
            padding: 1.8rem 1.45rem 1.6rem;
          }

          .reel-frame {
            height: 220px;
          }

          .reel-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .portal-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .cta-row {
            flex-direction: column;
          }

          .cta {
            width: 100%;
          }
        }

        @media (max-width: 540px) {
          .reel-strip {
            grid-template-columns: 1fr;
          }

          .tools {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
