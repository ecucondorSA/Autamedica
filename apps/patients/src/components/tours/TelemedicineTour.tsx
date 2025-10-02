'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour guiado para videollamadas de telemedicina
 */
export function TelemedicineTour({ autoStart = false }: { autoStart?: boolean }) {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('autamedica_telemedicine_tour_completed');
    setHasSeenTour(!!seen);

    if (!seen && autoStart) {
      setTimeout(() => startTour(), 800);
    }
  }, [autoStart]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      popoverClass: 'autamedica-tour-popover',
      onDestroyStarted: () => {
        localStorage.setItem('autamedica_telemedicine_tour_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '💻 Bienvenido a Telemedicina',
            description: `
              <div class="space-y-3">
                <p>Prepárate para tu <strong>videoconsulta médica</strong> desde la comodidad de tu hogar.</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p class="font-semibold text-blue-900 mb-1">🩺 Atención médica profesional a distancia</p>
                  <p class="text-blue-800">Misma calidad que una consulta presencial, con la comodidad de estar en casa.</p>
                </div>
                <p class="text-xs text-stone-600">⏱️ La consulta dura aproximadamente 15-30 minutos.</p>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="video-container"]',
          popover: {
            title: '📹 Área de Video Principal',
            description: `
              <div class="space-y-2">
                <p>Aquí verás:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li><strong>Tu video</strong> en pantalla completa</li>
                  <li><strong>Video del médico</strong> (cuando se una)</li>
                  <li><strong>Compartir pantalla</strong> si es necesario</li>
                </ul>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-amber-900">💡 Asegúrate de tener buena iluminación y estar en un lugar tranquilo.</p>
                </div>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="video-controls"]',
          popover: {
            title: '🎛️ Controles de Video',
            description: `
              <div class="space-y-2">
                <p><strong>Controles disponibles:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>🎤 <strong>Micrófono</strong>: Activar/Silenciar</li>
                  <li>📹 <strong>Cámara</strong>: Mostrar/Ocultar video</li>
                  <li>🖥️ <strong>Pantalla</strong>: Compartir tu pantalla</li>
                  <li>📞 <strong>Colgar</strong>: Terminar llamada (rojo)</li>
                </ul>
                <p class="text-xs text-stone-600 mt-2">Los controles se ocultan automáticamente después de 3 segundos sin movimiento.</p>
              </div>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="session-info"]',
          popover: {
            title: 'ℹ️ Información de la Sesión',
            description: `
              <p>En la esquina superior izquierda verás:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li><strong>Nombre del médico</strong></li>
                <li><strong>Especialidad</strong></li>
                <li><strong>Duración</strong> de la llamada</li>
                <li><strong>Calidad de conexión</strong> (HD/Normal)</li>
              </ul>
            `,
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="focus-mode"]',
          popover: {
            title: '🎯 Modo Foco',
            description: `
              <div class="space-y-2">
                <p>Activa el <strong>modo foco</strong> para:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Ocultar el panel lateral</li>
                  <li>Maximizar el área de video</li>
                  <li>Minimizar distracciones</li>
                </ul>
                <p class="text-xs text-green-600 mt-2">💡 Ideal para concentrarte en la consulta.</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="quick-actions"]',
          popover: {
            title: '⚡ Acciones Rápidas',
            description: `
              <p>Panel lateral con herramientas útiles durante la consulta:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>❤️ <strong>Reportar síntoma</strong>: Agregar síntomas en tiempo real</li>
                <li>🌡️ <strong>Signos vitales</strong>: Compartir presión, temperatura</li>
                <li>💊 <strong>Medicamentos</strong>: Consultar tu lista actual</li>
                <li>📝 <strong>Notas</strong>: Escribir recordatorios</li>
              </ul>
            `,
            side: 'left',
          },
        },
        {
          element: 'body',
          popover: {
            title: '✅ Checklist Pre-Consulta',
            description: `
              <div class="space-y-3">
                <p class="font-semibold text-stone-900">Antes de iniciar, verifica:</p>
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>🎥 Cámara y micrófono</strong>
                    <p class="text-xs text-stone-600 ml-4">Permite el acceso cuando el navegador lo solicite</p>
                  </li>
                  <li>
                    <strong>🌐 Conexión a internet</strong>
                    <p class="text-xs text-stone-600 ml-4">Mínimo 5 Mbps recomendado</p>
                  </li>
                  <li>
                    <strong>💡 Iluminación</strong>
                    <p class="text-xs text-stone-600 ml-4">Que el médico pueda verte claramente</p>
                  </li>
                  <li>
                    <strong>🔇 Ambiente</strong>
                    <p class="text-xs text-stone-600 ml-4">Lugar tranquilo sin ruidos</p>
                  </li>
                  <li>
                    <strong>📋 Documentos</strong>
                    <p class="text-xs text-stone-600 ml-4">Análisis, recetas, lista de medicamentos</p>
                  </li>
                </ul>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'body',
          popover: {
            title: '📝 Durante la Consulta',
            description: `
              <div class="space-y-2">
                <p class="font-semibold">Consejos para aprovechar al máximo:</p>
                <ul class="text-sm space-y-2 ml-4 list-disc">
                  <li><strong>Explica tus síntomas</strong> con detalle: cuándo comenzaron, intensidad, frecuencia</li>
                  <li><strong>Menciona todos tus medicamentos</strong> actuales, incluyendo suplementos</li>
                  <li><strong>Pregunta tus dudas</strong> sin miedo, el médico está para ayudarte</li>
                  <li><strong>Toma notas</strong> de las indicaciones importantes</li>
                  <li><strong>Confirma el plan</strong> de tratamiento antes de finalizar</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p class="text-green-900 font-semibold">🩺 El médico tendrá acceso a tu anamnesis y historial médico completo.</p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🔒 Privacidad y Seguridad',
            description: `
              <div class="space-y-3">
                <p>Tu consulta está completamente protegida:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>🔐 Conexión encriptada de extremo a extremo</li>
                  <li>🚫 No se graban las videollamadas</li>
                  <li>👁️ Solo tú y tu médico pueden acceder</li>
                  <li>📝 Las notas médicas se guardan en tu historial</li>
                </ul>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-blue-900">Cumplimiento total con HIPAA y regulaciones de telemedicina.</p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🎉 ¡Todo Listo para tu Consulta!',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Recuerda:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Prueba tu cámara y micrófono antes</li>
                  <li>✅ Ten tus documentos médicos a mano</li>
                  <li>✅ Usa el modo foco para concentrarte</li>
                  <li>✅ Las herramientas rápidas están en el panel derecho</li>
                  <li>✅ Auta puede ayudarte durante la consulta</li>
                </ul>
                <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-3">
                  <p class="text-stone-900 font-bold text-center">¡Disfruta de tu consulta médica profesional desde casa! 🏥💻</p>
                </div>
                <p class="text-xs text-stone-600 text-center mt-2">Si tienes problemas técnicos, contacta soporte o usa Auta para ayuda inmediata.</p>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
      ],
    });

    driverObj.drive();
  };

  return (
    <>
      {hasSeenTour && (
        <button
          onClick={startTour}
          className="fixed left-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 shadow-lg transition hover:bg-purple-100"
        >
          💻 Ver guía de videollamada
        </button>
      )}
    </>
  );
}
