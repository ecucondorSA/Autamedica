'use client';

export default function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Registro Simple",
      description: "Crea tu cuenta en menos de 30 segundos",
      icon: "📝",
      time: "30 seg"
    },
    {
      number: "02",
      title: "Elige Especialista",
      description: "Accede a nuestra red de profesionales verificados",
      icon: "👨‍⚕️",
      time: "1 min"
    },
    {
      number: "03",
      title: "Agenda tu Cita",
      description: "Selecciona fecha y hora según tu conveniencia",
      icon: "📅",
      time: "2 min"
    },
    {
      number: "04",
      title: "Consulta Virtual",
      description: "Conéctate desde cualquier dispositivo",
      icon: "💻",
      time: "Inmediato"
    }
  ];

  return (
    <div className="process-container">
      <div className="process-header">
        <h2 className="process-title">Tu Salud en 4 Pasos</h2>
        <p className="process-subtitle">
          Simplificamos el acceso a la atención médica de calidad
        </p>
      </div>

      <div className="process-timeline">
        {steps.map((step, index) => (
          <div key={index} className="process-step">
            <div className="step-connector" />
            <div className="step-content">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              <div className="step-time">⏱ {step.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="process-benefits">
        <h3 className="benefits-title">¿Por qué AutaMedica?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <h4>100% Seguro</h4>
            <p>Encriptación de grado médico</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h4>Ultra Rápido</h4>
            <p>Resultados en minutos</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🌍</span>
            <h4>Sin Fronteras</h4>
            <p>Acceso desde cualquier lugar</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💰</span>
            <h4>Económico</h4>
            <p>Ahorra tiempo y dinero</p>
          </div>
        </div>
      </div>

      <div className="process-cta">
        <button className="start-button">
          Comenzar Ahora
          <span className="button-arrow">→</span>
        </button>
        <p className="cta-text">Sin compromiso • Cancela cuando quieras</p>
      </div>

      <style>{`
        .process-container {
          padding: 3rem;
          max-width: 95vw;
          margin: 0 auto;
          color: #fff;
          min-height: clamp(100vh, 100svh, 110vh);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .process-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .process-title {
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff, #c0c0c0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .process-subtitle {
          font-size: clamp(1.2rem, 2vw, 1.8rem);
          opacity: 0.8;
          max-width: 700px;
          margin: 0 auto;
        }

        .process-timeline {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 4rem;
          position: relative;
          padding: 2rem 0;
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #606060, transparent);
          z-index: 0;
        }

        .process-step {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .step-content {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .step-content:hover {
          transform: translateY(-10px) scale(1.05);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .step-number {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #606060, #808080);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .step-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .step-description {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .step-time {
          font-size: 0.9rem;
          color: #a0a0a0;
          font-weight: 500;
        }

        .process-benefits {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 25px;
          padding: 3rem;
          margin-bottom: 3rem;
          backdrop-filter: blur(10px);
        }

        .benefits-title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .benefit-item {
          text-align: center;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .benefit-item:hover {
          transform: scale(1.1);
        }

        .benefit-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .benefit-item h4 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .benefit-item p {
          font-size: 1rem;
          opacity: 0.7;
        }

        .process-cta {
          text-align: center;
        }

        .start-button {
          padding: 1.2rem 3rem;
          background: linear-gradient(135deg, #505050, #707070);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.3rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
        }

        .start-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .button-arrow {
          font-size: 1.5rem;
        }

        .cta-text {
          margin-top: 1rem;
          font-size: 0.9rem;
          opacity: 0.6;
        }

        @media (max-width: 968px) {
          .process-timeline {
            flex-direction: column;
            gap: 3rem;
          }

          .process-timeline::before {
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            height: auto;
            transform: translateX(-50%);
          }

          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .process-container {
            padding: 2rem 1rem;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}