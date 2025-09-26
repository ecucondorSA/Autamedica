'use client';

export default function InnovationSection() {
  const innovations = [
    {
      title: "Inteligencia Artificial",
      description: "Diagnósticos asistidos por IA de última generación",
      icon: "🤖",
      features: ["Análisis predictivo", "Detección temprana", "Recomendaciones personalizadas"]
    },
    {
      title: "Blockchain Médico",
      description: "Historias clínicas seguras y descentralizadas",
      icon: "🔗",
      features: ["Inmutabilidad", "Privacidad total", "Acceso instantáneo"]
    },
    {
      title: "IoT Salud",
      description: "Dispositivos conectados para monitoreo continuo",
      icon: "📱",
      features: ["Tiempo real", "Alertas automáticas", "Integración completa"]
    },
    {
      title: "Realidad Virtual",
      description: "Consultas inmersivas y rehabilitación virtual",
      icon: "🥽",
      features: ["Experiencia 3D", "Terapias virtuales", "Formación médica"]
    }
  ];

  return (
    <div className="innovation-container">
      <div className="innovation-header">
        <h2 className="innovation-title">Innovación en Salud Digital</h2>
        <p className="innovation-subtitle">
          Tecnología de vanguardia al servicio de tu bienestar
        </p>
      </div>

      <div className="innovations-grid">
        {innovations.map((item, index) => (
          <div key={index} className="innovation-card">
            <div className="innovation-icon">{item.icon}</div>
            <h3 className="innovation-name">{item.title}</h3>
            <p className="innovation-desc">{item.description}</p>
            <ul className="innovation-features">
              {item.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="innovation-btn">Conocer más</button>
          </div>
        ))}
      </div>

      <div className="innovation-stats">
        <div className="stat-item">
          <div className="stat-number">90%</div>
          <div className="stat-text">Precisión diagnóstica</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">5x</div>
          <div className="stat-text">Más rápido</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-text">Monitoreo continuo</div>
        </div>
      </div>

      <style>{`
        .innovation-container {
          padding: 3rem;
          max-width: 95vw;
          margin: 0 auto;
          color: #fff;
        }

        .innovation-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .innovation-title {
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff, #b0b0b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .innovation-subtitle {
          font-size: clamp(1.2rem, 2vw, 1.8rem);
          opacity: 0.8;
          max-width: 700px;
          margin: 0 auto;
        }

        .innovations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-bottom: 4rem;
        }

        .innovation-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .innovation-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .innovation-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .innovation-name {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .innovation-desc {
          font-size: 1.1rem;
          opacity: 0.8;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .innovation-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem 0;
        }

        .innovation-features li {
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          opacity: 0.9;
        }

        .feature-check {
          color: #a0a0a0;
          font-weight: bold;
        }

        .innovation-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #404040, #606060);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .innovation-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .innovation-stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .stat-text {
          font-size: 1.1rem;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .innovation-container {
            padding: 2rem 1rem;
          }

          .innovations-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .innovation-stats {
            flex-direction: column;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}