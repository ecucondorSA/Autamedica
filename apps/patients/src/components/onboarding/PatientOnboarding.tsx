'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { X } from 'lucide-react';

interface PatientOnboardingProps {
  autoStart?: boolean;
}

export function PatientOnboarding({ autoStart = false }: PatientOnboardingProps) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    // Verificar si el usuario ya vio el onboarding
    const seen = localStorage.getItem('autamedica_onboarding_completed');
    setHasSeenOnboarding(!!seen);

    if (!seen && autoStart) {
      // Pequeño delay para que el DOM esté completamente cargado
      setTimeout(() => {
        startOnboarding();
      }, 500);
    }
  }, [autoStart]);

  const startOnboarding = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      closeBtnText: '✕',
      popoverClass: 'autamedica-onboarding-popover',

      steps: [
        {
          element: 'aside:first-of-type',
          popover: {
            title: '🏥 Bienvenido/a a AutaMedica',
            description: 'Te voy a mostrar las funcionalidades principales del portal. Este es tu <strong>menú de navegación</strong> donde puedes acceder a todas las secciones.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'a[href="/"]',
          popover: {
            title: '🏠 Inicio',
            description: 'Tu página principal con el <strong>video de telemedicina</strong> siempre disponible y resumen de tu salud.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'a[href="/anamnesis"]',
          popover: {
            title: '📖 Mi Anamnesis',
            description: 'Aquí completarás tu <strong>historia clínica interactiva</strong>. Es educativa y te explica por qué cada pregunta es importante para tu diagnóstico.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'a[href="/medical-history"]',
          popover: {
            title: '📋 Historial Médico',
            description: 'Accede a todos tus <strong>registros médicos</strong>: signos vitales, medicamentos, alergias, y más. Puedes ver quién accedió a tu información.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'a[href="/appointments"]',
          popover: {
            title: '📅 Mis Citas',
            description: 'Gestiona tus <strong>consultas médicas</strong>. Prepara preguntas antes de la cita y accede directamente a videollamadas.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'a[href="/preventive-health"]',
          popover: {
            title: '🛡️ Salud Preventiva',
            description: 'Mantén al día tus <strong>chequeos preventivos</strong> y vacunas según tu edad y género.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'div.flex.h-screen > div:first-child > div:first-child',
          popover: {
            title: '🎥 Centro de Telemedicina',
            description: 'Este es el <strong>corazón de AutaMedica</strong>. Aquí tendrás tus videoconsultas con tus médicos. Los controles aparecen cuando inicias una llamada.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: 'aside:last-of-type',
          popover: {
            title: '📊 Panel Dinámico',
            description: 'Este panel cambia según la sección donde estés. Aquí verás: <strong>comunidad de pacientes</strong>, tu <strong>progreso gamificado</strong>, y <strong>acciones rápidas</strong>.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: 'aside:last-of-type > div:first-child',
          popover: {
            title: '🔄 Tabs Contextuales',
            description: 'Estos tabs cambian según donde estés:<br/>• <strong>Inicio:</strong> Comunidad, Progreso, Acciones<br/>• <strong>Video:</strong> Chat, Info Médica<br/>• <strong>Citas:</strong> Preguntas, Preparación',
            side: 'left',
            align: 'start'
          }
        },
        {
          popover: {
            title: '🎉 ¡Listo para comenzar!',
            description: `
              <div style="text-align: center; padding: 1rem 0;">
                <p style="margin-bottom: 1rem;">Ya conoces lo básico de AutaMedica. Recuerda:</p>
                <ul style="text-align: left; margin: 1rem 0; padding-left: 1.5rem;">
                  <li>💾 <strong>Tu información se guarda automáticamente</strong></li>
                  <li>🔒 <strong>Puedes ver quién accede a tu historial</strong></li>
                  <li>🏆 <strong>Gana puntos cuidando tu salud</strong></li>
                  <li>💬 <strong>Conecta con otros pacientes en Comunidad</strong></li>
                  <li>🎥 <strong>Video siempre disponible para consultas</strong></li>
                </ul>
                <p style="margin-top: 1rem; color: #059669; font-weight: 600;">¡Empecemos a cuidar tu salud! 🌟</p>
              </div>
            `,
          }
        }
      ],

      onDestroyStarted: () => {
        // Marcar onboarding como completado
        localStorage.setItem('autamedica_onboarding_completed', 'true');
        setHasSeenOnboarding(true);
        driverObj.destroy();
      }
    });

    driverObj.drive();
  };

  // Botón flotante para reiniciar el onboarding
  if (hasSeenOnboarding) {
    return (
      <button
        onClick={startOnboarding}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Ver tutorial de nuevo"
      >
        <span className="text-xl">🎓</span>
        <span className="text-sm font-medium">Tutorial</span>
      </button>
    );
  }

  return null;
}
