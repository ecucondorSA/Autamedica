/**
 * Hook para contexto de onboarding y sugerencias de Auta AI
 */

import { useMemo } from 'react';

export type OnboardingStep =
  | 'welcome'
  | 'navigation'
  | 'anamnesis'
  | 'history'
  | 'preventive'
  | 'reproductive'
  | 'appointments'
  | 'telemedicine'
  | 'community'
  | 'actions'
  | 'advanced';

export interface OnboardingStepInfo {
  id: OnboardingStep;
  title: string;
  icon: string;
  autaTip: string;
  suggestedQuestions: string[];
  keywords: string[];
}

/**
 * Hook para obtener información contextual del onboarding
 */
export function useOnboardingContext(currentStep: number = 0) {
  const steps: OnboardingStepInfo[] = useMemo(() => [
    {
      id: 'welcome',
      title: 'Bienvenida',
      icon: '🏥',
      autaTip: 'Hola! Soy Auta, tu asistente de IA médica. Estoy aquí para ayudarte a conocer AutaMedica.',
      suggestedQuestions: [
        '¿Qué puedo hacer en AutaMedica?',
        '¿Cómo funciona la plataforma?',
        '¿Es seguro mi historial médico?',
      ],
      keywords: ['bienvenida', 'inicio', 'plataforma', 'autamedica']
    },
    {
      id: 'navigation',
      title: 'Navegación',
      icon: '🧭',
      autaTip: 'Desde el menú lateral puedes acceder a todas las secciones. ¿Te explico alguna?',
      suggestedQuestions: [
        '¿Dónde veo mis citas?',
        '¿Cómo accedo a mi historial?',
        '¿Qué hay en cada sección?',
      ],
      keywords: ['navegación', 'menú', 'secciones', 'donde']
    },
    {
      id: 'anamnesis',
      title: 'Anamnesis Digital',
      icon: '🩺',
      autaTip: 'La anamnesis es tu historia clínica digital. Es importante completarla para que los médicos te conozcan mejor.',
      suggestedQuestions: [
        '¿Qué es la anamnesis?',
        '¿Por qué debo completarla?',
        '¿Cuánto tiempo toma?',
        '¿Es obligatorio completarla?'
      ],
      keywords: ['anamnesis', 'historia', 'clínica', 'formulario', 'completar']
    },
    {
      id: 'history',
      title: 'Historial Médico',
      icon: '📋',
      autaTip: 'Tu historial incluye medicamentos, alergias, cirugías y condiciones. Todo encriptado y seguro bajo HIPAA.',
      suggestedQuestions: [
        '¿Cómo agrego medicamentos?',
        '¿Puedo ver mis recetas?',
        '¿Qué es HIPAA?',
        '¿Los médicos ven todo mi historial?'
      ],
      keywords: ['historial', 'medicamentos', 'alergias', 'cirugías', 'hipaa', 'seguridad']
    },
    {
      id: 'preventive',
      title: 'Salud Preventiva',
      icon: '🛡️',
      autaTip: 'Te mostramos qué chequeos preventivos necesitas según tu edad y género. Prevenir es mejor que curar!',
      suggestedQuestions: [
        '¿Qué screenings necesito?',
        '¿Cada cuánto debo hacerme chequeos?',
        '¿Qué es un screening PSA?',
        '¿Por qué la colonoscopia es importante?'
      ],
      keywords: ['preventivo', 'screening', 'chequeo', 'psa', 'colonoscopia', 'mamografía']
    },
    {
      id: 'reproductive',
      title: 'Salud Reproductiva',
      icon: '💜',
      autaTip: 'Información sobre IVE/ILE según Ley 27.610. Toda la información es confidencial y profesional.',
      suggestedQuestions: [
        '¿Qué es la Ley 27.610?',
        '¿Qué derechos tengo?',
        '¿Es confidencial la información?',
        '¿Cómo accedo a IVE/ILE?'
      ],
      keywords: ['reproductivo', 'ive', 'ile', 'ley', 'anticonceptivo', 'planificación']
    },
    {
      id: 'appointments',
      title: 'Agendar Citas',
      icon: '📅',
      autaTip: 'Puedes agendar consultas con especialistas en segundos. Te enviamos recordatorios automáticos.',
      suggestedQuestions: [
        '¿Cómo agendo una cita?',
        '¿Qué especialistas hay?',
        '¿Puedo cancelar o reprogramar?',
        '¿Recibo recordatorios?'
      ],
      keywords: ['cita', 'consulta', 'agendar', 'turno', 'especialista', 'doctor']
    },
    {
      id: 'telemedicine',
      title: 'Telemedicina',
      icon: '🎥',
      autaTip: 'Videollamadas seguras con médicos certificados. Incluye chat, compartir archivos y recetas digitales.',
      suggestedQuestions: [
        '¿Cómo funcionan las videoconsultas?',
        '¿Necesito cámara y micrófono?',
        '¿Puedo compartir estudios?',
        '¿Me dan recetas digitales?'
      ],
      keywords: ['telemedicina', 'videollamada', 'videoconsulta', 'virtual', 'online']
    },
    {
      id: 'community',
      title: 'Comunidad',
      icon: '💬',
      autaTip: 'Conecta con otros pacientes, comparte experiencias y encuentra grupos de apoyo.',
      suggestedQuestions: [
        '¿Cómo funciona la comunidad?',
        '¿Es anónimo?',
        '¿Hay grupos de apoyo?',
        '¿Puedo crear publicaciones?'
      ],
      keywords: ['comunidad', 'grupo', 'apoyo', 'compartir', 'publicación']
    },
    {
      id: 'actions',
      title: 'Acciones Rápidas',
      icon: '⚡',
      autaTip: 'Atajos para tareas frecuentes: medir presión, registrar síntomas, pedir recetas, etc.',
      suggestedQuestions: [
        '¿Qué son las acciones rápidas?',
        '¿Cómo registro mi presión?',
        '¿Puedo anotar síntomas?',
        '¿Cómo solicito una receta?'
      ],
      keywords: ['acciones', 'rápidas', 'presión', 'síntomas', 'receta']
    },
    {
      id: 'advanced',
      title: 'Funciones Avanzadas',
      icon: '🚀',
      autaTip: 'Auta AI, tours guiados, exportar datos y más. Todo diseñado para tu comodidad.',
      suggestedQuestions: [
        '¿Qué es Auta AI?',
        '¿Puedo exportar mis datos?',
        '¿Hay tours para cada sección?',
        '¿Cómo activo las notificaciones?'
      ],
      keywords: ['auta', 'ia', 'exportar', 'tour', 'notificaciones', 'avanzado']
    },
  ], []);

  const currentStepInfo = steps[currentStep] || steps[0];

  return {
    steps,
    currentStepInfo,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}

/**
 * Hook para obtener respuesta contextual de Auta según el paso
 */
export function useAutaOnboardingResponse(stepId: OnboardingStep, query: string): string {
  const responses: Record<OnboardingStep, Record<string, string>> = useMemo(() => ({
    welcome: {
      'default': 'AutaMedica es tu centro de salud digital. Puedes hacer videoconsultas, gestionar tu historial, y acceder a chequeos preventivos. ¿Qué te gustaría saber?',
      'funciona': 'La plataforma integra telemedicina, historial médico, screenings preventivos y comunidad. Todo en un solo lugar, seguro y fácil de usar.',
      'seguro': 'Sí, cumplimos con HIPAA. Toda tu información está encriptada y solo tú y tus médicos autorizados pueden acceder.'
    },
    navigation: {
      'default': 'El menú lateral tiene todas las secciones: Inicio, Anamnesis, Historial, Salud Preventiva, Citas, Telemedicina y más.',
      'citas': 'Las citas están en la sección 📅 Citas Médicas. Ahí puedes agendar, ver próximas y historial.',
      'historial': 'Tu historial está en 📋 Historial Médico. Incluye medicamentos, alergias, cirugías y condiciones.',
    },
    anamnesis: {
      'default': 'La anamnesis es un cuestionario médico completo. Ayuda a los doctores a conocer tu salud integral antes de la consulta.',
      'tiempo': 'Toma aproximadamente 10-15 minutos. Puedes guardar y continuar después si lo prefieres.',
      'obligatorio': 'No es obligatorio, pero es muy recomendado. Mejora significativamente la calidad de tus consultas.',
      'importante': 'Es importante porque permite al médico tener un panorama completo de tu salud sin necesidad de preguntarte todo en la consulta.'
    },
    history: {
      'default': 'Tu historial médico incluye medicamentos actuales, alergias, cirugías pasadas y condiciones crónicas.',
      'medicamentos': 'Puedes agregar medicamentos en Historial Médico → Medicamentos → ➕ Agregar. Incluye dosis y frecuencia.',
      'recetas': 'Sí, las recetas digitales aparecen automáticamente después de cada consulta con el médico.',
      'hipaa': 'HIPAA es la ley de privacidad médica en EE.UU. Garantiza que tu información de salud esté protegida y confidencial.'
    },
    preventive: {
      'default': 'Los screenings son chequeos preventivos según tu edad y género. Ayudan a detectar enfermedades temprano.',
      'necesito': 'Según tu edad y género, te mostramos una lista personalizada. Por ejemplo, PSA para hombres 50+, mamografía para mujeres 40+.',
      'frecuencia': 'Cada screening tiene su propia frecuencia: presión arterial anual, colonoscopia cada 10 años, etc.',
      'psa': 'El PSA es un análisis de sangre para detectar problemas de próstata. Recomendado para hombres de 50+ años.'
    },
    reproductive: {
      'default': 'Información sobre salud reproductiva y acceso a IVE/ILE según la Ley 27.610 de Argentina.',
      'ley': 'La Ley 27.610 garantiza el derecho a la Interrupción Voluntaria y Legal del Embarazo hasta la semana 14.',
      'derechos': 'Tenés derecho a información, acceso gratuito, confidencialidad y atención sin discriminación.',
      'confidencial': 'Sí, toda la información es estrictamente confidencial y protegida por secreto médico.'
    },
    appointments: {
      'default': 'Puedes agendar citas con especialistas en pocos clicks. El sistema te muestra horarios disponibles.',
      'agendar': 'Ve a 📅 Citas Médicas → ➕ Nueva Cita → Selecciona especialidad y horario disponible.',
      'especialistas': 'Tenemos cardiología, ginecología, urología, medicina general, pediatría y más.',
      'cancelar': 'Sí, puedes cancelar o reprogramar hasta 24hs antes sin cargo.'
    },
    telemedicine: {
      'default': 'Las videoconsultas son como ir al médico, pero desde tu casa. Seguras, profesionales y prácticas.',
      'funciona': 'El médico te envía un link, haces click, y se abre la videollamada. Incluye chat y compartir archivos.',
      'necesito': 'Sí, necesitas cámara y micrófono. Puede ser desde computadora, tablet o celular.',
      'recetas': 'Sí, el médico puede enviarte recetas digitales durante o después de la consulta.'
    },
    community: {
      'default': 'La comunidad te permite conectar con otros pacientes, compartir experiencias y encontrar apoyo.',
      'funciona': 'Puedes crear publicaciones, comentar, unirte a grupos temáticos y recibir apoyo de personas en situaciones similares.',
      'anonimo': 'Puedes usar tu nombre real o un pseudónimo. Tú decides cuánta información compartir.',
      'grupos': 'Sí, hay grupos de apoyo para diabetes, cáncer, salud mental, embarazo y más.'
    },
    actions: {
      'default': 'Las acciones rápidas son atajos para tareas frecuentes: medir presión, registrar síntomas, solicitar recetas.',
      'presion': 'Clic en ⚡ Acciones Rápidas → 💓 Registrar Presión → Ingresa systolic/diastolic → Guardar.',
      'sintomas': 'Sí, puedes anotar síntomas con intensidad, duración y otras notas. Útil para tus consultas.',
      'receta': 'Ve a Acciones Rápidas → 💊 Solicitar Receta → Selecciona medicamento y el médico lo revisará.'
    },
    advanced: {
      'default': 'Funciones avanzadas incluyen Auta AI (asistente inteligente), exportar datos, tours guiados y más.',
      'auta': 'Auta AI es tu asistente médico inteligente. Puede responder preguntas sobre tu salud, recordarte medicamentos y más.',
      'exportar': 'Sí, puedes exportar todo tu historial médico en PDF o JSON. Ve a Perfil → Exportar Datos.',
      'tours': 'Sí, cada sección tiene su propio tour guiado. Accede desde 📚 Centro de Ayuda (botón inferior izquierdo).'
    },
  }), []);

  const stepResponses = responses[stepId] || responses.welcome;
  const normalizedQuery = query.toLowerCase();

  // Buscar respuesta específica
  for (const [key, response] of Object.entries(stepResponses)) {
    if (key !== 'default' && normalizedQuery.includes(key)) {
      return response;
    }
  }

  return stepResponses.default;
}
