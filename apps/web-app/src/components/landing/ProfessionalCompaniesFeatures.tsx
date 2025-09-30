'use client';

import { getAppUrl } from '@/lib/env';

const plans = [
  {
    name: 'Essential',
    headcount: 'Hasta 200 colaboradores',
    detail: 'Cobertura médica integral con seguimiento preventivo.',
    services: [
      'Telemedicina corporativa 24/7',
      'Programas de bienestar trimestrales',
      'Dashboard ejecutivo en tiempo real'
    ]
  },
  {
    name: 'Growth',
    headcount: '200 a 1000 colaboradores',
    detail: 'Incluye analítica avanzada y campañas de prevención segmentadas.',
    services: [
      'Métricas de productividad y ausentismo',
      'Integración con RR.HH. y payroll',
      'Clínica virtual exclusiva para la empresa'
    ]
  },
  {
    name: 'Enterprise',
    headcount: '+1000 colaboradores',
    detail: 'Implementación dedicada con soporte on-site y SLA personalizados.',
    services: [
      'Gerente médico asignado',
      'Programas de riesgo específicos',
      'Reportes financieros y regulatorios'
    ]
  }
];

const productivityMetrics = [
  { label: 'Reducción de ausentismo', value: '18%' },
  { label: 'Retorno sobre inversión', value: '3.5x' },
  { label: 'Adopción de la plataforma', value: '92%' }
];

const supportHighlights = [
  {
    title: 'Soporte dedicado',
    description: 'Equipo médico y de operaciones asignado a cada cuenta corporativa.'
  },
  {
    title: 'Onboarding express',
    description: 'Integraciones técnicas en menos de 10 días sin interrumpir operaciones.'
  },
  {
    title: 'Cumplimiento normativo',
    description: 'Auditorías periódicas y reportes regulatorios listos para presentar.'
  }
];

const corporateSolutions = [
  'Campañas de prevención específicas por población',
  'Alertas inteligentes sobre factores de riesgo',
  'Beneficios integrados con programas de bienestar',
  'Reportes comparativos por sede y región'
];

export default function ProfessionalCompaniesFeatures() {
  return (
    <section className="companies-portal" aria-label="Portal Empresas">
      <div className="media-header">
        <div className="corporate-video">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/videos/video3.mp4" type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
          <div className="video-caption">
            <div>
              <span className="video-badge">Estrategia corporativa</span>
              <h3>Salud ocupacional sin fricciones</h3>
              <p>
                Panel ejecutivo unificado con métricas de productividad, campañas preventivas y soporte 24/7
                para cada colaborador.
              </p>
            </div>
            <div className="video-metrics">
              {productivityMetrics.map((metric) => (
                <div key={metric.label}>
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="portal-body">
        <header className="portal-header">
          <div className="title-block">
            <span className="icon" aria-hidden="true">🏢</span>
            <div>
              <h2>Portal Empresas</h2>
              <p>
                Diseñado para RR.HH. y áreas médicas corporativas que necesitan datos confiables, planes
                escalables y soporte inmediato.
              </p>
            </div>
          </div>
          <ul className="solutions" role="list">
            {corporateSolutions.map((item) => (
              <li key={item} role="listitem">
                <span className="mark" aria-hidden="true">▧</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="plan-grid plans-grid">
          {plans.map((plan) => (
            <article key={plan.name} className="plan-card">
              <div className="plan-head">
                <h3>{plan.name}</h3>
                <span>{plan.headcount}</span>
              </div>
              <p className="plan-detail">{plan.detail}</p>
              <ul>
                {plan.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
              <a className="plan-link" href={getAppUrl(`/contact?plan=${plan.name.toLowerCase()}`, 'companies')}>
                Solicitar propuesta
              </a>
            </article>
          ))}
        </div>

        <div className="plan-popover">
          <div className="plan-popover-grid">
            <div className="support-copy">
              <h3>Soporte dedicado y administrativo</h3>
              <p>
                Cada empresa cuenta con un gerente médico, analistas de datos y un equipo de soporte operativo que
                monitorea indicadores críticos de salud ocupacional.
              </p>
            </div>
            <div className="support-grid">
              {supportHighlights.map((highlight) => (
                <article key={highlight.title}>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="cta-row">
          <a className="cta primary" href={getAppUrl('/auth/login?portal=companies', 'companies')}>
            Acceso Portal Empresas
          </a>
          <a className="cta secondary" href={getAppUrl('/contact/demo', 'companies')}>
            Agenda una reunión ejecutiva
          </a>
        </div>
      </div>

      <style>{`
        .companies-portal {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          width: 100%;
          height: auto;
          min-height: 100%;
          padding: 1.5rem 2.5rem 1rem;
          box-sizing: border-box;
          background: linear-gradient(135deg, #111111, #1a1a1a);
          color: var(--au-text-primary);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .media-header {
          width: 100%;
        }

        .corporate-video {
          position: relative;
          width: 100%;
          min-height: 180px;
          height: clamp(180px, 25vh, 280px);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--au-border);
          background: linear-gradient(135deg, #1c1c1c, #232323);
        }

        .corporate-video video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-caption {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 1.5rem 1.8rem;
          background: linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.82) 92%);
          gap: 1.45rem;
        }

        .video-caption h3 {
          margin: 0.7rem 0 0;
          font-size: clamp(1.55rem, 2.3vw, 2rem);
          font-weight: 600;
        }

        .video-caption p {
          margin: 0.45rem 0 0;
          font-size: 0.96rem;
          line-height: 1.45;
          color: var(--au-text-secondary);
          max-width: 440px;
        }

        .video-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.22);
          padding: 0.42rem 0.8rem;
          border-radius: 999px;
        }

        .video-metrics {
          display: flex;
          gap: 1.3rem;
          flex-wrap: wrap;
        }

        .video-metrics div {
          display: flex;
          flex-direction: column;
          gap: 0.28rem;
          min-width: 110px;
        }

        .metric-value {
          font-size: clamp(1.5rem, 2.4vw, 2.1rem);
          font-weight: 600;
        }

        .metric-label {
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--au-text-secondary);
        }

        .portal-body {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          overflow: visible;
          padding-bottom: 0.5rem;
          min-height: 0;
        }

        .portal-header {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: 1.4rem;
          align-items: start;
        }

        .title-block {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .title-block h2 {
          margin: 0 0 0.45rem;
          font-size: clamp(2.4rem, 4.6vw, 3.3rem);
          letter-spacing: -0.02em;
        }

        .title-block p {
          margin: 0;
          font-size: clamp(1rem, 1.8vw, 1.25rem);
          color: var(--au-text-secondary);
          line-height: 1.42;
          max-width: 520px;
        }

        .icon {
          font-size: clamp(2rem, 3.6vw, 2.8rem);
        }

        .solutions {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
        }

        .solutions li {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          font-size: 1rem;
          color: var(--au-text-secondary);
        }

        .mark {
          font-size: 1.08rem;
          color: var(--au-accent);
          margin-top: 0.12rem;
        }

        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
          min-height: 0;
        }

        .plans-grid {
          position: relative;
          z-index: 1;
        }

        .plan-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          background: rgba(18,18,18,0.83);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1rem;
          min-height: 100%;
          isolation: isolate;
        }

        .plan-head {
          display: flex;
          flex-direction: column;
          gap: 0.32rem;
        }

        .plan-head h3 {
          margin: 0;
          font-size: clamp(1.3rem, 2vw, 1.7rem);
        }

        .plan-head span {
          font-size: 0.88rem;
          color: var(--au-text-tertiary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .plan-detail {
          margin: 0;
          font-size: 0.88rem;
          color: var(--au-text-secondary);
          line-height: 1.45;
        }

        .plan-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.55rem;
          font-size: 0.88rem;
          color: var(--au-text-secondary);
        }

        .plan-card li::before {
          content: '—';
          margin-right: 0.45rem;
          color: var(--au-accent);
        }

        .plan-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.8rem 2.2rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          color: var(--au-text-primary);
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .plan-link:hover {
          border-color: rgba(255,255,255,0.32);
        }

        .plan-popover {
          position: absolute;
          inset: auto 0 0 0;
          z-index: 3;
          background: #141415;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          mix-blend-mode: normal;
          overflow: hidden;
          padding: 1.5rem 1.8rem;
        }

        .plan-popover-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
          gap: 1.4rem;
          align-items: start;
        }

        .plan-popover h3,
        .plan-popover p {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .support-copy h3 {
          margin: 0 0 0.65rem;
          font-size: clamp(1.5rem, 2.1vw, 1.9rem);
        }

        .support-copy p {
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
          color: var(--au-text-secondary);
        }

        .support-grid {
          display: grid;
          gap: 0.9rem;
          overflow-y: auto;
          padding-right: 0.4rem;
          scrollbar-width: thin;
        }
        .support-grid::-webkit-scrollbar{ width: 6px; }
        .support-grid::-webkit-scrollbar-thumb{ background: rgba(255,255,255,0.1); border-radius: 3px; }

        .support-grid article {
          background: rgba(10,10,10,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .support-grid h4 {
          margin: 0;
          font-size: 1.05rem;
        }

        .support-grid p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--au-text-secondary);
          line-height: 1.42;
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
          background: var(--au-accent);
          color: #111;
        }

        .cta.secondary {
          background: transparent;
          border-color: rgba(255,255,255,0.25);
          color: var(--au-text-primary);
        }

        .cta:hover {
          transform: translateY(-2px);
        }

        .cta.secondary:hover {
          border-color: rgba(255,255,255,0.38);
        }

        @media (max-width: 1520px) {
          .plan-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1280px) {
          .companies-portal {
            padding: 2rem 2.5rem 1.8rem;
          }

          .portal-header {
            grid-template-columns: 1fr;
          }

          .solutions {
            grid-template-columns: 1fr;
          }

          .plan-popover-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1024px) {
          .plan-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .portal-body {
            padding-bottom: 2.5rem;
          }

          .plan-popover {
            position: static;
            margin-top: 1.5rem;
            border-radius: 14px;
          }
        }

        @media (max-width: 820px) {
          .plan-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .companies-portal {
            padding: 1.8rem 1.45rem 1.6rem;
          }

          .corporate-video {
            height: 220px;
          }

          .video-caption {
            flex-direction: column;
            align-items: flex-start;
          }

          .cta-row {
            flex-direction: column;
          }

          .cta {
            width: 100%;
          }

          .portal-body {
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
