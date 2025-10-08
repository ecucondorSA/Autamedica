'use client';

import { useState, useEffect } from 'react';

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Dr. María González",
      role: "Cardióloga",
      image: "👩‍⚕️",
      text: "AutaMedica revolucionó mi práctica médica. Ahora puedo atender a más pacientes con mayor eficiencia y calidad.",
      rating: 5,
      location: "Buenos Aires"
    },
    {
      name: "Juan Pérez",
      role: "Paciente",
      image: "👨",
      text: "Conseguir turnos nunca fue tan fácil. La atención virtual es excelente y las recetas digitales me ahorran mucho tiempo.",
      rating: 5,
      location: "Córdoba"
    },
    {
      name: "Dra. Ana Martínez",
      role: "Pediatra",
      image: "👩‍⚕️",
      text: "La plataforma es intuitiva y mis pacientes están encantados con la facilidad de uso. Recomiendo AutaMedica 100%.",
      rating: 5,
      location: "Rosario"
    },
    {
      name: "Carlos López",
      role: "Empresario",
      image: "👨‍💼",
      text: "Implementamos AutaMedica en nuestra empresa y la satisfacción de los empleados aumentó notablemente.",
      rating: 5,
      location: "Mendoza"
    }
  ];

  const statistics = [
    { value: "500K+", label: "Consultas Realizadas", icon: "📊" },
    { value: "98%", label: "Satisfacción", icon: "⭐" },
    { value: "24/7", label: "Disponibilidad", icon: "⏰" },
    { value: "150+", label: "Especialistas", icon: "👥" },
    { value: "30seg", label: "Tiempo de Respuesta", icon: "⚡" },
    { value: "100%", label: "Digital", icon: "💻" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="testimonials-section" role="region" aria-label="Testimonios y estadísticas">
      <div className="container">

        {/* Statistics Section */}
        <div className="statistics-wrapper">
          <h2 className="section-title">Números que Hablan por Sí Solos</h2>
          <p className="section-subtitle">La confianza de miles de usuarios nos respalda</p>

          <div className="statistics-grid">
            {statistics.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="testimonials-wrapper">
          <h2 className="section-title">Lo que Dicen Nuestros Usuarios</h2>
          <p className="section-subtitle">Experiencias reales de personas como tú</p>

          <div className="testimonials-carousel">
            <div className="testimonial-track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">{testimonial.image}</div>
                    <div className="testimonial-info">
                      <h3 className="testimonial-name">{testimonial.name}</h3>
                      <p className="testimonial-role">{testimonial.role}</p>
                      <p className="testimonial-location">📍 {testimonial.location}</p>
                    </div>
                    <div className="testimonial-rating">
                      {"⭐".repeat(testimonial.rating)}
                    </div>
                  </div>
                  <blockquote className="testimonial-text">
                    "{testimonial.text}"
                  </blockquote>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="carousel-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="final-cta">
          <h2 className="cta-title">¿Listo para Transformar tu Experiencia Médica?</h2>
          <p className="cta-subtitle">Únete a miles de usuarios que ya disfrutan de una atención médica moderna</p>

          <div className="cta-features">
            <div className="cta-feature">
              <span className="cta-icon">✓</span>
              <span>Sin costos ocultos</span>
            </div>
            <div className="cta-feature">
              <span className="cta-icon">✓</span>
              <span>Cancelación gratuita</span>
            </div>
            <div className="cta-feature">
              <span className="cta-icon">✓</span>
              <span>Soporte 24/7</span>
            </div>
          </div>

          <div className="cta-buttons">
            <button className="btn-primary-large">
              Comenzar Ahora
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary-large">
              Ver Demo
              <span className="btn-play">▶</span>
            </button>
          </div>

          <p className="cta-disclaimer">
            🔒 Tu información está segura. No compartimos datos con terceros.
          </p>
        </div>
      </div>

      <style>{`
        .testimonials-section {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          padding: 5rem 2rem;
          min-height: auto;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .container {
          max-width: 95vw;
          margin: 0 auto;
          width: 100%;
        }

        .section-title {
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 700;
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #e0e0e0, #ffffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: clamp(1.2rem, 2vw, 1.8rem);
          text-align: center;
          opacity: 0.8;
          margin-bottom: 3rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Statistics Grid */
        .statistics-wrapper {
          margin-bottom: 5rem;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .stat-card {
          background: var(--au-surface);
          border: 2px solid var(--au-border);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: var(--au-hover);
          border-color: var(--au-accent);
          box-shadow: 0 10px 30px rgba(217, 217, 217, 0.2);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .stat-value {
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 700;
          color: var(--au-text-primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          color: var(--au-text-secondary);
        }

        /* Testimonials Carousel */
        .testimonials-wrapper {
          margin-bottom: 5rem;
        }

        .testimonials-carousel {
          position: relative;
          overflow: hidden;
          margin: 3rem auto;
          max-width: 1200px;
        }

        .testimonial-track {
          display: flex;
          transition: transform 0.5s ease;
        }

        .testimonial-card {
          flex: 0 0 100%;
          padding: 3rem;
          background: var(--au-surface);
          border: 2px solid var(--au-border);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .testimonial-avatar {
          font-size: 4rem;
          width: 80px;
          height: 80px;
          background: var(--au-accent)/10;
          border: 2px solid var(--au-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .testimonial-info {
          flex: 1;
        }

        .testimonial-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--au-text-primary);
        }

        .testimonial-role {
          font-size: 1.1rem;
          color: var(--au-text-secondary);
          margin-bottom: 0.25rem;
        }

        .testimonial-location {
          font-size: 0.9rem;
          color: var(--au-text-tertiary);
        }

        .testimonial-rating {
          font-size: 1.5rem;
        }

        .testimonial-text {
          font-size: clamp(1.2rem, 2vw, 1.6rem);
          line-height: 1.6;
          font-style: italic;
          color: var(--au-text-secondary);
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .carousel-dots .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--au-border);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dots .dot.active {
          background: var(--au-accent);
          transform: scale(1.3);
        }

        /* Final CTA */
        .final-cta {
          background: var(--au-surface);
          border: 2px solid var(--au-border);
          border-radius: 30px;
          padding: 4rem;
          text-align: center;
          backdrop-filter: blur(20px);
          margin-top: 5rem;
        }

        .cta-title {
          font-size: clamp(2rem, 3.5vw, 3.5rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--au-text-primary);
        }

        .cta-subtitle {
          font-size: clamp(1.1rem, 1.8vw, 1.5rem);
          color: var(--au-text-secondary);
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-features {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .cta-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          color: var(--au-text-secondary);
        }

        .cta-icon {
          color: var(--au-accent);
          font-size: 1.5rem;
          font-weight: bold;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .btn-primary-large,
        .btn-secondary-large {
          padding: 1.2rem 3rem;
          font-size: 1.2rem;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-primary-large {
          background: var(--au-accent);
          color: var(--au-bg);
          font-weight: 600;
        }

        .btn-primary-large:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(217, 217, 217, 0.3);
          background: var(--au-text-primary);
        }

        .btn-secondary-large {
          background: var(--au-hover);
          color: var(--au-text-primary);
          border: 2px solid var(--au-border);
        }

        .btn-secondary-large:hover {
          background: var(--au-surface);
          border-color: var(--au-accent);
        }

        .btn-arrow,
        .btn-play {
          font-size: 1.5rem;
        }

        .cta-disclaimer {
          font-size: 0.9rem;
          color: var(--au-text-tertiary);
          margin-top: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .testimonials-section {
            padding: 2.5rem 1rem;
            min-height: auto;
          }

          .section-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            margin-bottom: 0.75rem;
          }

          .section-subtitle {
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            margin-bottom: 2rem;
            padding: 0 1rem;
          }

          .statistics-wrapper {
            margin-bottom: 3rem;
          }

          .statistics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card {
            padding: 1.5rem 1rem;
          }

          .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
          }

          .stat-value {
            font-size: clamp(1.5rem, 4vw, 2rem);
          }

          .stat-label {
            font-size: clamp(0.8rem, 2vw, 1rem);
          }

          .testimonials-wrapper {
            margin-bottom: 3rem;
          }

          .testimonial-card {
            padding: 2rem 1.5rem;
          }

          .testimonial-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .testimonial-avatar {
            font-size: 3rem;
            width: 60px;
            height: 60px;
          }

          .testimonial-name {
            font-size: 1.25rem;
          }

          .testimonial-role {
            font-size: 1rem;
          }

          .testimonial-location {
            font-size: 0.85rem;
          }

          .testimonial-rating {
            font-size: 1.25rem;
          }

          .testimonial-text {
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            line-height: 1.5;
          }

          .final-cta {
            padding: 2.5rem 1.5rem;
            margin-top: 3rem;
          }

          .cta-title {
            font-size: clamp(1.5rem, 4.5vw, 2rem);
          }

          .cta-subtitle {
            font-size: clamp(0.95rem, 2.2vw, 1.1rem);
            margin-bottom: 1.5rem;
          }

          .cta-features {
            flex-direction: column;
            gap: 1rem;
          }

          .cta-feature {
            font-size: 1.1rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .btn-primary-large,
          .btn-secondary-large {
            width: 100%;
            max-width: 320px;
            justify-content: center;
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .testimonials-section {
            padding: 2rem 0.75rem;
            min-height: auto;
          }

          .section-title {
            font-size: clamp(1.5rem, 6vw, 1.75rem);
          }

          .section-subtitle {
            font-size: clamp(0.9rem, 3vw, 1rem);
            padding: 0 0.5rem;
          }

          .statistics-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .stat-card {
            padding: 1.25rem 1rem;
          }

          .stat-icon {
            font-size: 2rem;
          }

          .testimonial-card {
            padding: 1.5rem 1rem;
          }

          .testimonial-avatar {
            font-size: 2.5rem;
            width: 50px;
            height: 50px;
          }

          .testimonial-name {
            font-size: 1.1rem;
          }

          .carousel-dots {
            gap: 0.75rem;
            margin-top: 1.5rem;
          }

          .carousel-dots .dot {
            width: 10px;
            height: 10px;
          }

          .final-cta {
            padding: 2rem 1rem;
            border-radius: 20px;
          }

          .cta-title {
            font-size: clamp(1.35rem, 5vw, 1.5rem);
          }

          .cta-feature {
            font-size: 1rem;
          }

          .btn-primary-large,
          .btn-secondary-large {
            max-width: 280px;
            padding: 0.9rem 2rem;
            font-size: 1rem;
          }

          .cta-disclaimer {
            font-size: 0.8rem;
            padding: 0 0.5rem;
          }
        }
      `}</style>
    </section>
  );
}