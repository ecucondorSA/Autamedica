'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HeroVertical from './HeroVertical';
import LoadingOverlay from './LoadingOverlay';
import TransitionBridge from '../ui/TransitionBridge';
import AccountMenu from '../ui/AccountMenu';

// Lazy load heavy components
const HorizontalExperience = dynamic(() => import('../experience/HorizontalExperience'), {
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando experiencia...</div>,
  ssr: false
}) as React.ComponentType;

const TestimonialsSection = dynamic(() => import('../landing/TestimonialsSection'), {
  loading: () => <div className="min-h-[50vh] bg-gray-900"></div>,
  ssr: true
}) as React.ComponentType;

const ProfessionalFooter = dynamic(() => import('../landing/ProfessionalFooter'), {
  ssr: true
}) as React.ComponentType;

const EnhancedLandingExperience: React.FC = () => {
  // Mantenemos un pequeño estado de fase solo para el overlay inicial
  const [phase, setPhase] = useState<'loading' | 'hero'>('loading');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
   
  const _router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('hero');
      // No auto-transition to horizontal - let user stay on hero with videos
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

   
  const _toggleChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen && chatMessages.length === 0) {
      setChatMessages([
        {
          text: '¡Hola! Soy el Dr. Virtual de AutaMedica. ¿En qué puedo ayudarte hoy?',
          isBot: true,
        },
      ]);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages((prev) => [...prev, { text: inputMessage, isBot: false }]);
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const responses = [
          'Entiendo tu consulta. ¿Podrías darme más detalles?',
          'Gracias por contactarnos. Un especialista te atenderá pronto.',
          'Puedes agendar una cita en nuestra plataforma.',
          'Nuestro horario de atención es de 8:00 a 20:00.',
          'Te puedo ayudar con turnos, consultas o información general.',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)] || 'Gracias por contactarnos.';
        setChatMessages((prev) => [...prev, { text: randomResponse, isBot: true }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <>
      {/* Top Credit */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 text-xs text-white/40 z-[1000] pointer-events-none tracking-wider font-medium md:text-sm">
        desarrollado por E.M Medicina -UBA
      </div>

      {/* Logo */}
      <div className="fixed top-3 left-3 text-xl text-white font-bold z-[1000] md:top-5 md:left-5 md:text-2xl">
        AutaMedica
      </div>

      {/* Account Menu - New Component */}
      <AccountMenu />

      {/* Main Content */}
      {phase === 'loading' && <LoadingOverlay onComplete={() => setPhase('hero')} />}
      {/* Secciones apiladas: Hero (arriba) + Experiencia horizontal (abajo). */}
      {phase !== 'loading' && (
        <div style={{ position: 'relative' }}>
          {/* Hero Section - Optimized height */}
          <div
            className="hero-section-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '100vh',
              minHeight: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
              backgroundColor: '#000',
              zIndex: 10,
            }}
          >
            <HeroVertical
              videos={[
                '/videos/video1.mp4',
                '/videos/video2.mp4',
                '/videos/video3.mp4'
              ]}
              title="AutaMedica existe para quitar la fricción de tu consulta"
              subtitle="Agenda inmediata, receta digital al finalizar y resultados en tu móvil"
            />
            {/* Single scroll indicator at bottom of hero */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: 'white',
                zIndex: 10,
              }}
              className="md:bottom-8"
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }} className="md:text-3xl md:mb-2">
                ↓
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }} className="md:text-sm">
                Explorar más
              </div>
            </div>
          </div>

          {/* Bridge: Hero → Horizontal Experience */}
          <TransitionBridge
            title="Explora nuestros portales"
            subtitle="Soluciones especializadas para cada necesidad"
            variant="gradient"
          />

          {/* Horizontal Experience Section */}
          <HorizontalExperience />

          {/* Bridge: VideoGrid → Testimonials */}
          <TransitionBridge
            title="Nuestra comunidad"
            subtitle="Testimonios reales de usuarios satisfechos"
            variant="default"
          />

          {/* Testimonials and Stats Section */}
          <TestimonialsSection />

          {/* Footer después del recorrido completo */}
          <ProfessionalFooter />
        </div>
      )}

      {/* 3D Doctor Help Button - Always visible */}
      {/* {phase !== 'loading' && <Doctor3DSimple onToggleChat={toggleChat} />} */}

      {/* Manga-style Chat Bubble */}
      {chatOpen && (
        <div
          className="chat-bubble-wrapper fixed bg-white border-4 border-[#333] rounded-[150px_/_190px] flex flex-col z-[999] shadow-[0_8px_25px_rgba(0,0,0,0.3)] origin-bottom-right animate-[popIn_0.4s_cubic-bezier(0.68,-0.55,0.265,1.55)]"
          style={{
            bottom: 'clamp(1rem, 3vh, 2rem)',
            right: 'clamp(1rem, 3vw, 2rem)',
            width: 'min(90vw, 380px)',
            height: 'min(85vh, 520px)',
            maxWidth: '90vw',
            maxHeight: '85vh',
            contain: 'layout size',
            willChange: 'transform',
          }}
        >
          {/* Chat tail - Optimized positioning */}
          <div className="absolute bottom-[-20px] right-[60px] w-0 h-0 border-l-[25px] border-l-transparent border-r-[5px] border-r-transparent border-t-[30px] border-t-white rotate-[-15deg] z-[1000] pointer-events-none" />
          <div className="absolute bottom-[-23px] right-[58px] w-0 h-0 border-l-[28px] border-l-transparent border-r-[7px] border-r-transparent border-t-[33px] border-t-[#333] rotate-[-15deg] z-[999] pointer-events-none" />

          {/* Chat header */}
          <div className="px-6 py-5 flex justify-between items-center border-b-2 border-gray-100 mx-4 mt-2">
            <h3 className="text-[#333] text-base flex items-center gap-2 font-bold">
              <span>👨‍⚕️</span>
              Dr. Virtual - AutaMedica
            </h3>
            <button
              onClick={() => setChatOpen(false)}
              className="border-2 text-white text-base cursor-pointer transition-all hover:scale-110 rounded-full w-6 h-6 flex items-center justify-center font-bold"
              style={{ backgroundColor: '#2a2a2a', borderColor: '#4c4c4c' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a'
                e.currentTarget.style.borderColor = '#5b5b5b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a'
                e.currentTarget.style.borderColor = '#4c4c4c'
              }}
            >
              ×
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 px-6 py-2 overflow-y-auto flex flex-col gap-3 mx-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-2xl max-w-[80%] animate-[slideIn_0.3s_ease] ${
                  msg.isBot
                    ? 'bg-gray-100 self-start border border-gray-200 text-[#333]'
                    : 'self-end text-white'
                }`}
                style={!msg.isBot ? { backgroundColor: 'var(--primary)' } : {}}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-2xl self-start max-w-[80px]">
                <span className="inline-block w-2 h-2 rounded-full mx-0.5 animate-[typing_1.4s_infinite_ease-in-out] animation-delay-[-0.32s]" style={{ backgroundColor: 'var(--primary)' }}></span>
                <span className="inline-block w-2 h-2 rounded-full mx-0.5 animate-[typing_1.4s_infinite_ease-in-out] animation-delay-[-0.16s]" style={{ backgroundColor: 'var(--primary)' }}></span>
                <span className="inline-block w-2 h-2 rounded-full mx-0.5 animate-[typing_1.4s_infinite_ease-in-out]" style={{ backgroundColor: 'var(--primary)' }}></span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-6 py-4 border-t-2 border-gray-100 flex gap-2 mx-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-full text-[#333] text-sm transition-all focus:outline-none"
              style={{ '--focus-border-color': 'var(--primary)' } as React.CSSProperties}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              placeholder="Escribe tu consulta aquí..."
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-full border-none text-white cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
          }
          70% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedLandingExperience;
