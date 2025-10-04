'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour guiado para agendar citas médicas
 */
export function AppointmentsTour({ autoStart = false }: { autoStart?: boolean }) {
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('autamedica_appointments_tour_completed');
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
        localStorage.setItem('autamedica_appointments_tour_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: 'body',
          popover: {
            title: '📅 Agenda tu Cita Médica',
            description: `
              <div class="space-y-3">
                <p>Aquí puedes <strong>agendar, ver y gestionar</strong> todas tus citas médicas de manera fácil y rápida.</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p class="font-semibold text-green-900 mb-1">✨ Proceso simplificado:</p>
                  <p class="text-green-800">1. Selecciona especialidad → 2. Elige médico → 3. Escoge fecha/hora → 4. ¡Confirma!</p>
                </div>
              </div>
            `,
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="upcoming-appointments"]',
          popover: {
            title: '🗓️ Tus Próximas Citas',
            description: `
              <p>Aquí verás todas tus citas programadas con:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li><strong>Fecha y hora</strong> exactas</li>
                <li><strong>Médico</strong> y especialidad</li>
                <li><strong>Tipo de consulta</strong> (presencial/virtual)</li>
                <li><strong>Botón de acceso</strong> para videollamadas</li>
              </ul>
            `,
            side: 'right',
          },
        },
        {
          element: '[data-tour="filter-specialty"]',
          popover: {
            title: '🔍 Filtrar por Especialidad',
            description: 'Usa los filtros para encontrar rápidamente el tipo de médico que necesitas: Cardiología, Dermatología, Medicina General, etc.',
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="doctor-card"]',
          popover: {
            title: '👨‍⚕️ Perfil del Médico',
            description: `
              <div class="space-y-2">
                <p>Cada tarjeta muestra:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>Nombre y especialidad</li>
                  <li>Años de experiencia</li>
                  <li>Calificación de pacientes ⭐</li>
                  <li>Próximos horarios disponibles</li>
                </ul>
                <p class="text-xs text-stone-600 mt-2">Haz click en "Ver perfil" para más detalles.</p>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="calendar-picker"]',
          popover: {
            title: '📆 Selecciona Fecha',
            description: `
              <p>El calendario muestra:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>🟢 <strong>Verde</strong>: Días con alta disponibilidad</li>
                <li>🟡 <strong>Amarillo</strong>: Disponibilidad limitada</li>
                <li>🔴 <strong>Rojo</strong>: No hay horarios</li>
              </ul>
              <p class="text-xs text-blue-600 mt-2">💡 Tip: Reserva con al menos 48h de anticipación.</p>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="time-slots"]',
          popover: {
            title: '⏰ Horarios Disponibles',
            description: 'Selecciona el horario que mejor se ajuste a tu agenda. Los horarios se muestran en <strong>tu zona horaria local</strong>.',
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="consultation-type"]',
          popover: {
            title: '📞 Tipo de Consulta',
            description: `
              <div class="space-y-2">
                <p><strong>Elige cómo prefieres tu consulta:</strong></p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>💻 <strong>Telemedicina</strong>: Videollamada desde casa</li>
                  <li>🏥 <strong>Presencial</strong>: Visita al consultorio</li>
                </ul>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-blue-900">La mayoría de especialistas ofrecen ambas opciones.</p>
                </div>
              </div>
            `,
            side: 'left',
          },
        },
        {
          element: '[data-tour="appointment-notes"]',
          popover: {
            title: '📝 Motivo de Consulta',
            description: `
              <p>Escribe brevemente el <strong>motivo de tu cita</strong>:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>Síntomas principales</li>
                <li>Tiempo de evolución</li>
                <li>Preguntas específicas</li>
              </ul>
              <p class="text-xs text-green-600 mt-2">Esto ayuda al médico a prepararse mejor para tu consulta.</p>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="confirmation-button"]',
          popover: {
            title: '✅ Confirmar Cita',
            description: `
              <div class="space-y-2">
                <p>Antes de confirmar, revisa que todo esté correcto:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✓ Médico y especialidad</li>
                  <li>✓ Fecha y hora</li>
                  <li>✓ Tipo de consulta</li>
                  <li>✓ Motivo de la cita</li>
                </ul>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mt-2">
                  <p class="text-amber-900">⚠️ Políticas de cancelación: Cancela con al menos 24h de anticipación.</p>
                </div>
              </div>
            `,
            side: 'top',
          },
        },
        {
          element: '[data-tour="notifications"]',
          popover: {
            title: '🔔 Recordatorios Automáticos',
            description: `
              <p>Recibirás notificaciones:</p>
              <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>📧 Email de confirmación inmediato</li>
                <li>⏰ Recordatorio 24h antes</li>
                <li>⏰ Recordatorio 1h antes</li>
                <li>💬 Link de videollamada (si es virtual)</li>
              </ul>
            `,
            side: 'bottom',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🎉 ¡Listo para Agendar!',
            description: `
              <div class="space-y-3">
                <p class="font-semibold">Recuerda:</p>
                <ul class="text-sm space-y-1 ml-4 list-disc">
                  <li>✅ Puedes cancelar hasta 24h antes</li>
                  <li>✅ Recibirás confirmación por email</li>
                  <li>✅ Auta puede ayudarte a elegir especialista</li>
                  <li>✅ Tus anamnesis completadas estarán disponibles para el médico</li>
                </ul>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p class="text-green-900 font-semibold">💡 ¿Tienes dudas? Pregúntale a Auta en el botón flotante ✨</p>
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
          className="fixed left-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 shadow-lg transition hover:bg-green-100"
        >
          📅 Ver guía de citas
        </button>
      )}
    </>
  );
}
