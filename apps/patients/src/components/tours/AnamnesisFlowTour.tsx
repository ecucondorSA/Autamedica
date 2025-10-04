'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface AnamnesisFlowTourProps {
  autoStart?: boolean;
  currentStep?: number;
}

/**
 * Tour guiado para el proceso de Anamnesis
 * Se activa automáticamente en la primera visita o manualmente
 */
export function AnamnesisFlowTour({ autoStart = false, currentStep = 0 }: AnamnesisFlowTourProps) {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('autamedica_anamnesis_tour_completed');
    setHasSeenTour(!!seen);

    if (!seen && autoStart) {
      setTimeout(() => startTour(), 1000);
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
        localStorage.setItem('autamedica_anamnesis_tour_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '🩺 Bienvenido a tu Anamnesis Digital',
            description: `
              <div class="space-y-3">
                <p>La anamnesis es la historia clínica completa de tu salud. Este proceso te tomará <strong>15-20 minutos</strong>.</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p class="font-semibold text-blue-900 mb-1">💡 ¿Por qué es importante?</p>
                  <p class="text-blue-800">Permite que tu médico conozca tu historial completo para brindarte la mejor atención personalizada.</p>
                </div>
                <p class="text-xs text-stone-600">Tus respuestas se guardan automáticamente cada 30 segundos.</p>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="anamnesis-progress"]',
          popover: {
            title: '📊 Barra de Progreso',
            description: 'Aquí verás cuántos pasos has completado. Son <strong>13 secciones</strong> en total, organizadas por categorías médicas.',
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="anamnesis-section"]',
          popover: {
            title: '📝 Secciones Interactivas',
            description: `
              <div class="space-y-2">
                <p>Cada sección tiene un <strong>enfoque específico</strong>:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Datos personales y demográficos</li>
                  <li>Motivo de consulta actual</li>
                  <li>Antecedentes médicos familiares</li>
                  <li>Hábitos y estilo de vida</li>
                  <li>Medicamentos actuales</li>
                </ul>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="anamnesis-field"]',
          popover: {
            title: '✍️ Campos de Respuesta',
            description: 'Responde con la mayor precisión posible. Puedes usar <strong>texto libre</strong>, seleccionar opciones múltiples o fechas según el tipo de pregunta.',
            side: 'top',
          },
        },
        {
          element: '[data-tour="cognitive-pause"]',
          popover: {
            title: '⏸️ Pausas Cognitivas',
            description: `
              <div class="space-y-2">
                <p>Cada 4 pasos encontrarás una <strong>pausa obligatoria de 30 segundos</strong>.</p>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-sm">
                  <p class="text-amber-900">🧠 <strong>¿Por qué?</strong> Para que reflexiones sobre tus respuestas y recuerdes detalles importantes.</p>
                </div>
              </div>
            `,
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="privacy-toggle"]',
          popover: {
            title: '🔒 Privacidad de Respuestas',
            description: `
              <p>Puedes marcar respuestas como <strong>privadas</strong> usando el candado 🔒.</p>
              <p class="text-sm text-stone-600 mt-2">Las respuestas privadas solo las verá tu médico tratante, no otros especialistas.</p>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="educational-media"]',
          popover: {
            title: '📚 Contenido Educativo',
            description: 'Algunos pasos incluyen <strong>videos educativos</strong> o infografías para ayudarte a entender mejor las preguntas médicas.',
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="navigation-buttons"]',
          popover: {
            title: '🧭 Navegación',
            description: `
              <div class="space-y-2">
                <p>Usa los botones para moverte:</p>
                <ul class="text-sm space-y-1">
                  <li><strong>← Anterior</strong>: Volver al paso previo</li>
                  <li><strong>Siguiente →</strong>: Avanzar (se activa al responder)</li>
                  <li><strong>Guardar y salir</strong>: Continuar después</li>
                </ul>
                <p class="text-xs text-green-600 mt-2">✅ Auto-guardado activo cada 30s</p>
              </div>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="auta-help"]',
          popover: {
            title: '💬 Auta: Tu Asistente',
            description: `
              <p>Si tienes dudas durante el proceso, haz click en el botón flotante <strong>✨ Auta AI</strong> en la esquina inferior derecha.</p>
              <p class="text-sm text-stone-600 mt-2">Auta puede ayudarte a entender preguntas médicas complejas.</p>
            `,
            side: 'left',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🎉 ¡Listo para comenzar!',
            description: `
              <div class="space-y-3">
                <p>Recuerda:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Tómate tu tiempo, no hay prisa</li>
                  <li>💾 Se guarda automáticamente</li>
                  <li>🔒 Puedes marcar respuestas privadas</li>
                  <li>⏸️ Pausas cada 4 pasos para reflexionar</li>
                  <li>💬 Auta está disponible para ayudarte</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p class="text-green-900 font-semibold">¡Tu salud es lo primero! Responde con honestidad para recibir la mejor atención.</p>
                </div>
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
          className="fixed left-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-lg transition hover:bg-blue-100"
        >
          📚 Ver guía de anamnesis
        </button>
      )}
    </>
  );
}
