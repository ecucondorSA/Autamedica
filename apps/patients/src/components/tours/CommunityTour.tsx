'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour guiado para la Comunidad de Pacientes
 */
export function CommunityTour({ autoStart = false }: { autoStart?: boolean }) {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('autamedica_community_tour_completed');
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
        localStorage.setItem('autamedica_community_tour_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '💬 Bienvenido a la Comunidad',
            description: `
              <div class="space-y-3">
                <p>Conecta con <strong>otros pacientes</strong> que comparten experiencias similares a las tuyas.</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p class="font-semibold text-green-900 mb-1">🤝 Apoyo entre pares</p>
                  <p class="text-green-800">Comparte vivencias, haz preguntas y encuentra apoyo emocional en un espacio seguro.</p>
                </div>
                <p class="text-xs text-stone-600">📊 Más de 15,000 pacientes activos en la comunidad</p>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="community-groups"]',
          popover: {
            title: '🏥 Grupos por Condición',
            description: `
              <div class="space-y-2">
                <p>Únete a grupos específicos según tu condición:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li><strong>Diabetes Tipo 2</strong> - 1,200 miembros</li>
                  <li><strong>Hipertensión</strong> - 850 miembros</li>
                  <li><strong>Salud Mental</strong> - 620 miembros</li>
                  <li><strong>Salud Cardiovascular</strong> - 540 miembros</li>
                  <li>Y muchos más...</li>
                </ul>
                <p class="text-xs text-blue-600 mt-2">💡 Puedes unirte a múltiples grupos</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="community-post"]',
          popover: {
            title: '📝 Publicaciones de la Comunidad',
            description: `
              <p>Cada publicación muestra:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li><strong>Autor anónimo</strong> (ej: "María, 45 años")</li>
                <li><strong>Grupo</strong> al que pertenece</li>
                <li><strong>Contenido</strong> del mensaje</li>
                <li><strong>Respuestas</strong> de otros miembros 💬</li>
                <li><strong>Reacciones</strong> de apoyo 👍</li>
              </ul>
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mt-2">
                <p class="text-amber-900">🔒 Tu identidad real nunca se muestra públicamente</p>
              </div>
            `,
            side: 'right',
          },
        },
        {
          element: '[data-tour="create-post-button"]',
          popover: {
            title: '✍️ Crear Publicación',
            description: `
              <div class="space-y-2">
                <p><strong>Comparte tu experiencia:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Haz preguntas sobre síntomas</li>
                  <li>Comparte tu progreso</li>
                  <li>Pide recomendaciones</li>
                  <li>Ofrece apoyo a otros</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-green-900">✨ Las publicaciones son moderadas por profesionales de salud</p>
                </div>
              </div>
            `,
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="post-reactions"]',
          popover: {
            title: '❤️ Reacciones y Respuestas',
            description: `
              <p><strong>Interactúa con la comunidad:</strong></p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>👍 Dale "Me gusta" para mostrar apoyo</li>
                <li>💬 Responde con tu experiencia</li>
                <li>🔖 Guarda publicaciones útiles</li>
                <li>🚩 Reporta contenido inapropiado</li>
              </ul>
              <p class="text-xs text-stone-600 mt-2">Las respuestas pueden ser anónimas o con tu nombre visible (tú eliges)</p>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="community-filters"]',
          popover: {
            title: '🔍 Filtros y Búsqueda',
            description: `
              <div class="space-y-2">
                <p>Encuentra contenido relevante:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li><strong>Por grupo</strong>: Solo de tus grupos</li>
                  <li><strong>Más recientes</strong>: Últimas 24 horas</li>
                  <li><strong>Más populares</strong>: Con más interacciones</li>
                  <li><strong>Sin responder</strong>: Preguntas que necesitan ayuda</li>
                </ul>
              </div>
            `,
            side: 'bottom',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🔒 Privacidad y Moderación',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Tu seguridad es nuestra prioridad:</p>
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>✅ Anonimato protegido</strong>
                    <p class="text-xs text-stone-600 ml-4">Solo se muestra edad y género, nunca tu nombre real</p>
                  </li>
                  <li>
                    <strong>✅ Moderación 24/7</strong>
                    <p class="text-xs text-stone-600 ml-4">Equipo médico revisa todas las publicaciones</p>
                  </li>
                  <li>
                    <strong>✅ Sin diagnósticos</strong>
                    <p class="text-xs text-stone-600 ml-4">La comunidad NO sustituye consulta médica</p>
                  </li>
                  <li>
                    <strong>✅ Reporte de abuso</strong>
                    <p class="text-xs text-stone-600 ml-4">Puedes reportar contenido inapropiado</p>
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
            title: '⚠️ Reglas de la Comunidad',
            description: `
              <div class="space-y-2">
                <p class="font-semibold text-red-900">No está permitido:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc text-stone-700">
                  <li>❌ Compartir información médica de terceros</li>
                  <li>❌ Dar diagnósticos o prescribir medicamentos</li>
                  <li>❌ Promover terapias no científicas</li>
                  <li>❌ Vender productos o servicios</li>
                  <li>❌ Compartir datos de contacto personal</li>
                  <li>❌ Contenido ofensivo o discriminatorio</li>
                </ul>
                <div class="bg-red-50 border border-red-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-red-900 font-semibold">⚠️ Violar estas reglas puede resultar en suspensión de tu cuenta</p>
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
            title: '💡 Consejos para Aprovechar la Comunidad',
            description: `
              <div class="space-y-3">
                <ul class="text-sm space-y-2">
                  <li>
                    <strong>🎯 Sé específico</strong>
                    <p class="text-xs text-stone-600 ml-4">Da contexto: edad, tiempo con la condición, tratamientos</p>
                  </li>
                  <li>
                    <strong>🤝 Sé empático</strong>
                    <p class="text-xs text-stone-600 ml-4">Todos estamos pasando por algo difícil</p>
                  </li>
                  <li>
                    <strong>📚 Comparte recursos</strong>
                    <p class="text-xs text-stone-600 ml-4">Artículos, videos educativos, experiencias positivas</p>
                  </li>
                  <li>
                    <strong>⏰ Sé paciente</strong>
                    <p class="text-xs text-stone-600 ml-4">Las respuestas pueden tomar algunas horas</p>
                  </li>
                </ul>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p class="text-blue-900 font-semibold">💬 ¿Tienes dudas? Pregúntale a Auta sobre cómo usar la comunidad</p>
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
            title: '🎉 ¡Listo para Conectar!',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Recuerda:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Tu anonimato está protegido</li>
                  <li>✅ Todas las publicaciones son moderadas</li>
                  <li>✅ No sustituye consulta médica profesional</li>
                  <li>✅ Reporta contenido inapropiado</li>
                  <li>✅ Sé respetuoso y empático siempre</li>
                </ul>
                <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-3">
                  <p class="text-stone-900 font-bold text-center">¡Bienvenido a una comunidad de apoyo mutuo! 🤗</p>
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
          className="fixed left-4 bottom-16 z-40 flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-lg transition hover:bg-blue-100"
        >
          💬 Ver guía de comunidad
        </button>
      )}
    </>
  );
}
