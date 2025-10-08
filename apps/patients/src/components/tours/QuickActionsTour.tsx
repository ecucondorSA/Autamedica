'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour guiado para Acciones Rápidas
 */
export function QuickActionsTour({ autoStart = false }: { autoStart?: boolean }) {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('autamedica_actions_tour_completed');
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
        localStorage.setItem('autamedica_actions_tour_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '⚡ Acciones Rápidas',
            description: `
              <div class="space-y-3">
                <p>Herramientas instantáneas para <strong>gestionar tu salud</strong> en un solo click.</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p class="font-semibold text-blue-900 mb-1">🚀 Acceso directo a funciones clave</p>
                  <p class="text-blue-800">Sin necesidad de navegar por menús complejos.</p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="action-blood-pressure"]',
          popover: {
            title: '💓 Registrar Presión Arterial',
            description: `
              <div class="space-y-2">
                <p><strong>¿Cuándo registrar?</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Cada mañana al despertar</li>
                  <li>Antes de tomar medicamentos</li>
                  <li>Cuando te sientas mareado</li>
                  <li>Según indicación médica</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-green-900">✅ Ingresa valores sistólica/diastólica (ej: 120/80)</p>
                </div>
                <p class="text-xs text-stone-600 mt-2">📊 Tu médico podrá ver la evolución en tiempo real</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="action-medication"]',
          popover: {
            title: '💊 Confirmar Medicamento',
            description: `
              <div class="space-y-2">
                <p><strong>Marca tus medicamentos tomados:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Confirma dosis</li>
                  <li>⏰ Registra hora exacta</li>
                  <li>📝 Agrega notas si olvidaste alguna</li>
                </ul>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-blue-900">💡 Mantén tu adherencia al 100% para mejores resultados</p>
                </div>
                <p class="text-xs text-amber-600 mt-2">⚠️ Si olvidas una dosis, consulta con tu médico antes de duplicar</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="action-symptom"]',
          popover: {
            title: '🩺 Agregar Síntoma',
            description: `
              <div class="space-y-2">
                <p><strong>Reporta síntomas nuevos o recurrentes:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Describe el síntoma con detalle</li>
                  <li>Intensidad (1-10)</li>
                  <li>Duración y frecuencia</li>
                  <li>Qué lo mejora/empeora</li>
                </ul>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-amber-900">⚠️ Síntomas graves (dolor de pecho, dificultad respirar): Llamar 911</p>
                </div>
                <p class="text-xs text-stone-600 mt-2">Tu médico recibirá una notificación si marca como urgente</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="action-lab-result"]',
          popover: {
            title: '📊 Subir Resultado de Laboratorio',
            description: `
              <div class="space-y-2">
                <p><strong>Digitaliza tus análisis:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Foto o PDF del resultado</li>
                  <li>Fecha del análisis</li>
                  <li>Tipo de estudio (sangre, orina, etc.)</li>
                  <li>Laboratorio donde se realizó</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-green-900">✨ La IA de Auta puede interpretar resultados automáticamente</p>
                </div>
                <p class="text-xs text-stone-600 mt-2">📁 Todos tus análisis organizados en tu perfil</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="action-community-post"]',
          popover: {
            title: '💬 Publicar en Comunidad',
            description: `
              <p><strong>Comparte rápidamente con la comunidad:</strong></p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>Haz una pregunta</li>
                <li>Comparte tu progreso</li>
                <li>Busca apoyo emocional</li>
                <li>Ofrece consejos basados en tu experiencia</li>
              </ul>
              <p class="text-xs text-blue-600 mt-2">💡 Acceso directo al formulario de publicación</p>
            `,
            side: 'left',
          },
        },
        {
          element: 'body',
          popover: {
            title: '📲 Acciones Adicionales',
            description: `
              <div class="space-y-2">
                <p class="font-semibold">Otras acciones disponibles:</p>
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>🌡️ Signos Vitales</strong>
                    <p class="text-xs text-stone-600 ml-4">Temperatura, peso, saturación O2, glucosa</p>
                  </li>
                  <li>
                    <strong>💉 Vacunas</strong>
                    <p class="text-xs text-stone-600 ml-4">Registra nuevas vacunas recibidas</p>
                  </li>
                  <li>
                    <strong>📸 Fotos Médicas</strong>
                    <p class="text-xs text-stone-600 ml-4">Erupciones, heridas, evolución de lesiones</p>
                  </li>
                  <li>
                    <strong>🚨 Emergencia</strong>
                    <p class="text-xs text-stone-600 ml-4">Llamada directa a servicios de urgencia</p>
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
            title: '⏰ Notificaciones y Recordatorios',
            description: `
              <div class="space-y-3">
                <p><strong>Las acciones rápidas te ayudan con:</strong></p>
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>📬 Recordatorios automáticos</strong>
                    <p class="text-xs text-stone-600 ml-4">Medicamentos, presión arterial, citas</p>
                  </li>
                  <li>
                    <strong>🏆 Gamificación</strong>
                    <p class="text-xs text-stone-600 ml-4">Gana puntos por mantener adherencia</p>
                  </li>
                  <li>
                    <strong>📊 Estadísticas</strong>
                    <p class="text-xs text-stone-600 ml-4">Ve tu progreso en el tiempo</p>
                  </li>
                </ul>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p class="text-blue-900 font-semibold">🎯 Completa acciones diarias para desbloquear logros</p>
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
            title: '💡 Consejos de Uso',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Para aprovechar al máximo:</p>
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>⏰ Crea rutinas</strong>
                    <p class="text-xs text-stone-600 ml-4">Registra presión y medicamentos a la misma hora</p>
                  </li>
                  <li>
                    <strong>📝 Sé consistente</strong>
                    <p class="text-xs text-stone-600 ml-4">Los datos regulares ayudan a tu médico</p>
                  </li>
                  <li>
                    <strong>🔔 Activa notificaciones</strong>
                    <p class="text-xs text-stone-600 ml-4">No olvides tus registros diarios</p>
                  </li>
                  <li>
                    <strong>💬 Usa Auta</strong>
                    <p class="text-xs text-stone-600 ml-4">Si no sabes cómo registrar algo, pregúntale</p>
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
            title: '🎉 ¡Listo para Tomar el Control!',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Recuerda:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Usa acciones rápidas diariamente</li>
                  <li>✅ Mantén tus registros al día</li>
                  <li>✅ Reporta síntomas nuevos inmediatamente</li>
                  <li>✅ Confirma medicamentos sin falta</li>
                  <li>✅ Tu médico tiene acceso a todo en tiempo real</li>
                </ul>
                <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-3">
                  <p class="text-stone-900 font-bold text-center">¡Tu salud, siempre a un click de distancia! ⚡</p>
                </div>
                <p class="text-xs text-stone-600 text-center mt-2">Las acciones rápidas están disponibles desde cualquier página del portal</p>
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
          className="fixed left-4 bottom-28 z-40 flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 shadow-lg transition hover:bg-amber-100"
        >
          ⚡ Ver guía de acciones
        </button>
      )}
    </>
  );
}
