/**
 * Motor de respuestas médicas inteligente
 * Genera respuestas contextuales basadas en intención y datos del paciente
 */

import type { IntentClassification } from './intent-classifier';

export interface PatientScreening {
  name: string;
  status: 'completed' | 'due' | 'upcoming' | 'overdue';
  lastCompleted?: string;
  nextDue: string;
  description?: string;
}

export interface PatientContext {
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    nextDose?: string;
  }>;
  vitals?: {
    bloodPressure?: { systolic: number; diastolic: number; date: string };
    heartRate?: { bpm: number; date: string };
    temperature?: { celsius: number; date: string };
  };
  appointments?: Array<{
    date: string;
    doctor: string;
    specialty: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }>;
  screenings?: PatientScreening[];
  allergies?: string[];
  progress?: {
    level: number;
    streak: number;
    completedScreenings: number;
    totalScreenings: number;
  };
}

export interface MedicalResponse {
  text: string;
  confidence: number;
  suggestedActions?: Array<{
    label: string;
    action: string;
  }>;
  references?: string[];
}

/**
 * Generador de respuestas médicas
 */
export class MedicalQA {
  /**
   * Genera respuesta basada en intención y contexto
   */
  public generateResponse(
    classification: IntentClassification,
    context: PatientContext
  ): MedicalResponse {
    const { intent, confidence, context: intentContext } = classification;

    switch (intent) {
      case 'medications':
        return this.handleMedicationsQuery(context, confidence);

      case 'vitals':
        return this.handleVitalsQuery(context, intentContext, confidence);

      case 'appointments':
        return this.handleAppointmentsQuery(context, intentContext, confidence);

      case 'screenings':
        return this.handleScreeningsQuery(context, intentContext, confidence);

      case 'symptoms':
        return this.handleSymptomsQuery(confidence);

      case 'reproductive':
        return this.handleReproductiveQuery(intentContext, confidence);

      case 'allergies':
        return this.handleAllergiesQuery(context, confidence);

      case 'progress':
        return this.handleProgressQuery(context, confidence);

      case 'community':
        return this.handleCommunityQuery(confidence);

      case 'platform':
        return this.handlePlatformQuery(confidence);

      case 'greeting':
        return this.handleGreeting(confidence);

      case 'closing':
        return this.handleClosingQuery(confidence);

      case 'general':
        return this.handleGeneralQuery(confidence);

      default:
        return this.handleUnknown();
    }
  }

  private handleMedicationsQuery(context: PatientContext, confidence: number): MedicalResponse {
    const medications = context.medications || [];

    if (medications.length === 0) {
      return {
        text: '📋 **Medicamentos Activos**\n\nActualmente no tenés medicamentos registrados en tu perfil.\n\nSi estás tomando algún medicamento, podés agregarlo en la sección de **Historial Médico** para llevar un control completo.',
        confidence,
        suggestedActions: [
          { label: '➕ Agregar medicamento', action: '/medical-history/medications/add' }
        ]
      };
    }

    let text = `💊 **Medicamentos Activos** (${medications.length})\n\n`;

    for (const med of medications) {
      text += `• **${med.name}** - ${med.dosage}\n`;
      text += `  ${med.frequency}`;
      if (med.nextDose) {
        text += ` | Próxima dosis: ${med.nextDose}`;
      }
      text += '\n\n';
    }

    text += '💡 *Recordá tomar tus medicamentos según las indicaciones de tu médico.*';

    return {
      text,
      confidence,
      suggestedActions: [
        { label: '📝 Ver detalles completos', action: '/medical-history/medications' }
      ]
    };
  }

  private handleVitalsQuery(
    context: PatientContext,
    intentContext: string | undefined,
    confidence: number
  ): MedicalResponse {
    const vitals = context.vitals;

    if (!vitals) {
      return {
        text: '📊 **Signos Vitales**\n\nNo tenemos registros recientes de tus signos vitales.\n\n¿Querés registrar tu presión arterial u otros valores?',
        confidence,
        suggestedActions: [
          { label: '➕ Registrar valores', action: '/vitals/add' }
        ]
      };
    }

    if (intentContext === 'blood_pressure' && vitals.bloodPressure) {
      const { systolic, diastolic, date } = vitals.bloodPressure;
      const status = this.getBloodPressureStatus(systolic, diastolic);

      return {
        text: `🩺 **Presión Arterial**\n\n**${systolic}/${diastolic} mmHg** - ${status.label}\n\nÚltima medición: ${date}\n\n${status.advice}`,
        confidence,
        references: ['Guías ESH/ESC 2018 de hipertensión arterial']
      };
    }

    // Respuesta general de vitales
    let text = '📊 **Signos Vitales**\n\n';

    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure;
      text += `• **Presión arterial**: ${systolic}/${diastolic} mmHg\n`;
    }

    if (vitals.heartRate) {
      text += `• **Frecuencia cardíaca**: ${vitals.heartRate.bpm} lpm\n`;
    }

    if (vitals.temperature) {
      text += `• **Temperatura**: ${vitals.temperature.celsius}°C\n`;
    }

    return { text, confidence };
  }

  private handleAppointmentsQuery(
    context: PatientContext,
    intentContext: string | undefined,
    confidence: number
  ): MedicalResponse {
    const appointments = context.appointments || [];
    const upcoming = appointments.filter(a => a.status === 'scheduled');

    if (intentContext === 'schedule') {
      return {
        text: '📅 **Agendar Nueva Consulta**\n\nPodés reservar una consulta con nuestros especialistas.\n\n¿Qué tipo de consulta necesitás?',
        confidence,
        suggestedActions: [
          { label: '🩺 Medicina General', action: '/appointments/new?specialty=general' },
          { label: '❤️ Cardiología', action: '/appointments/new?specialty=cardiology' },
          { label: '💜 Ginecología', action: '/appointments/new?specialty=gynecology' }
        ]
      };
    }

    if (upcoming.length === 0) {
      return {
        text: '📅 **Próximas Consultas**\n\nNo tenés consultas agendadas.\n\n¿Querés agendar una?',
        confidence,
        suggestedActions: [
          { label: '➕ Agendar consulta', action: '/appointments/new' }
        ]
      };
    }

    let text = `📅 **Próximas Consultas** (${upcoming.length})\n\n`;

    for (const apt of upcoming.slice(0, 3)) {
      text += `• **${apt.specialty}** con ${apt.doctor}\n`;
      text += `  📆 ${apt.date}\n\n`;
    }

    return {
      text,
      confidence,
      suggestedActions: [
        { label: '📋 Ver todas las consultas', action: '/appointments' }
      ]
    };
  }

  private handleScreeningsQuery(
    context: PatientContext,
    intentContext: string | undefined,
    confidence: number
  ): MedicalResponse {
    const screenings = context.screenings || [];

    // Subir resultado
    if (intentContext === 'upload_result') {
      return {
        text: '📤 **Subir Resultados**\n\nPodés subir:\n• Análisis de sangre\n• Estudios por imágenes\n• Resultados de laboratorio\n• Informes médicos\n\nLos archivos quedan guardados en tu historial médico y tus doctores pueden verlos.',
        confidence,
        suggestedActions: [
          { label: '📤 Subir archivo', action: '/medical-history/upload' },
          { label: '📋 Ver resultados anteriores', action: '/medical-history/studies' }
        ]
      };
    }

    // Chequeos según edad
    if (intentContext === 'age_based') {
      const dueScreenings = screenings.filter(s => s.status === 'due' || s.status === 'upcoming');
      return {
        text: '🎯 **Chequeos Personalizados**\n\nSegún tu **edad y género**, estos son tus chequeos recomendados:\n\n' +
          (dueScreenings.length > 0
            ? dueScreenings.map(s => `• ${s.name} - ${s.nextDue}`).join('\n')
            : '• Ya estás al día con todos tus chequeos 🎉') +
          '\n\nLas recomendaciones siguen las guías médicas argentinas 2025.',
        confidence,
        suggestedActions: [
          { label: '📊 Ver calendario completo', action: '/preventive-health' }
        ]
      };
    }

    if (intentContext && ['psa', 'colonoscopy', 'mammography', 'pap'].includes(intentContext)) {
      const specific = screenings.find(s =>
        s.name.toLowerCase().includes(intentContext.substring(0, 3))
      );

      if (specific) {
        const statusEmoji = specific.status === 'completed' ? '✅' : specific.status === 'due' ? '⏰' : '📋';
        return {
          text: `${statusEmoji} **${specific.name}**\n\n**Estado**: ${this.translateStatus(specific.status)}\n**Última vez**: ${specific.lastCompleted || 'Nunca'}\n\n${specific.description}`,
          confidence
        };
      }
    }

    const due = screenings.filter(s => s.status === 'due');
    const upcoming = screenings.filter(s => s.status === 'upcoming');

    if (due.length === 0 && upcoming.length === 0) {
      return {
        text: '✅ **Salud Preventiva**\n\n¡Excelente! Estás al día con todos tus chequeos preventivos.\n\nSeguí cuidando tu salud con controles regulares.',
        confidence,
        suggestedActions: [
          { label: '📊 Ver mi calendario preventivo', action: '/preventive-health' }
        ]
      };
    }

    let text = '🛡️ **Chequeos Preventivos**\n\n';

    if (due.length > 0) {
      text += `**⏰ Pendientes (${due.length})**\n`;
      for (const screening of due.slice(0, 3)) {
        text += `• ${screening.name}\n`;
      }
      text += '\n';
    }

    if (upcoming.length > 0) {
      text += `**📅 Próximos (${upcoming.length})**\n`;
      for (const screening of upcoming.slice(0, 2)) {
        text += `• ${screening.name} - ${screening.nextDue}\n`;
      }
    }

    return {
      text,
      confidence,
      suggestedActions: [
        { label: '📊 Ver calendario completo', action: '/preventive-health' }
      ]
    };
  }

  private handleSymptomsQuery(confidence: number): MedicalResponse {
    return {
      text: '🩺 **Síntomas y Molestias**\n\nEntiendo que no te estás sintiendo bien. Es importante que consultes con un profesional médico para evaluar tus síntomas.\n\n¿Querés agendar una teleconsulta urgente?',
      confidence,
      suggestedActions: [
        { label: '🎥 Teleconsulta ahora', action: '/?consultation=urgent' },
        { label: '📅 Agendar consulta', action: '/appointments/new' }
      ]
    };
  }

  private handleReproductiveQuery(
    intentContext: string | undefined,
    confidence: number
  ): MedicalResponse {
    if (intentContext === 'pregnancy_interruption') {
      return {
        text: '💜 **Salud Reproductiva - IVE/ILE**\n\nTenés derecho a información y acceso a la Interrupción Voluntaria o Legal del Embarazo según la **Ley 27.610**.\n\nToda la información es **confidencial** y **segura**.',
        confidence,
        suggestedActions: [
          { label: '📖 Ver información completa', action: '/pregnancy-prevention' },
          { label: '🎥 Consulta con especialista', action: '/?consultation=reproductive-health' }
        ],
        references: ['Ley 27.610 - IVE/ILE Argentina']
      };
    }

    if (intentContext === 'reproductive_rights') {
      return {
        text: '📜 **Derechos Reproductivos en Argentina**\n\nTenés derecho a:\n• Información clara y confidencial\n• Acceso a métodos anticonceptivos\n• IVE/ILE según Ley 27.610\n• Atención sin discriminación\n• Acompañamiento profesional\n\nToda la información es **100% confidencial**.',
        confidence,
        suggestedActions: [
          { label: '📖 Ver Ley 27.610 completa', action: '/pregnancy-prevention' },
          { label: '📞 Línea gratuita: 0800-345-4266', action: 'tel:08003454266' }
        ],
        references: ['Ley 27.610 - IVE/ILE Argentina']
      };
    }

    return {
      text: '💜 **Salud Reproductiva**\n\nTenemos información sobre planificación familiar, métodos anticonceptivos, y derechos reproductivos.\n\n¿Qué te gustaría saber?',
      confidence,
      suggestedActions: [
        { label: '💊 Métodos anticonceptivos', action: '/pregnancy-prevention' },
        { label: '🎥 Consulta con ginecólogo/a', action: '/appointments/new?specialty=gynecology' }
      ]
    };
  }

  private handleAllergiesQuery(context: PatientContext, confidence: number): MedicalResponse {
    const allergies = context.allergies || [];

    if (allergies.length === 0) {
      return {
        text: '🩹 **Alergias**\n\nNo tenés alergias registradas en tu perfil.\n\nSi sos alérgico a algún medicamento o sustancia, es importante que lo registres.',
        confidence,
        suggestedActions: [
          { label: '➕ Registrar alergia', action: '/medical-history/allergies/add' }
        ]
      };
    }

    let text = `⚠️ **Alergias Registradas** (${allergies.length})\n\n`;
    for (const allergy of allergies) {
      text += `• ${allergy}\n`;
    }

    return { text, confidence };
  }

  private handleProgressQuery(context: PatientContext, confidence: number): MedicalResponse {
    const progress = context.progress;

    if (!progress) {
      return {
        text: '📈 **Tu Progreso**\n\nComenzá a completar tus chequeos preventivos para ver tu progreso y desbloquear logros.',
        confidence
      };
    }

    return {
      text: `🎯 **Tu Progreso en Salud**\n\n**Nivel**: ${progress.level}\n**Racha**: ${progress.streak} días\n**Screenings completados**: ${progress.completedScreenings}/${progress.totalScreenings}\n\n¡Seguí así! Cada chequeo suma puntos hacia tu próximo nivel.`,
      confidence,
      suggestedActions: [
        { label: '🏆 Ver todos los logros', action: '/profile/achievements' }
      ]
    };
  }

  private handleCommunityQuery(confidence: number): MedicalResponse {
    return {
      text: '💬 **Comunidad de Pacientes**\n\nConectá con otros pacientes que comparten experiencias similares.\n\n**Podés:**\n• Publicar sobre tu experiencia\n• Comentar en posts de otros\n• Unirte a grupos temáticos\n• Recibir y dar apoyo\n\nToda la comunidad es **moderada** y **respetuosa**.',
      confidence,
      suggestedActions: [
        { label: '📝 Crear publicación', action: '/community/new-post' },
        { label: '👥 Ver comunidad', action: '/community' },
        { label: '🔍 Explorar grupos', action: '/community/groups' }
      ]
    };
  }

  private handlePlatformQuery(confidence: number): MedicalResponse {
    return {
      text: '⚡ **Acciones Rápidas**\n\nAtajos para tareas frecuentes:\n\n• **💓 Registrar presión arterial**\n• **💊 Confirmar medicamento**\n• **📋 Agregar síntoma**\n• **📤 Subir resultado**\n• **💬 Publicar en comunidad**\n\nEncontrá estas opciones en el panel lateral derecho.',
      confidence,
      suggestedActions: [
        { label: '🩺 Registrar signos vitales', action: '/vitals/add' },
        { label: '📊 Ver tutorial completo', action: '/?tutorial=start' }
      ]
    };
  }

  private handleGreeting(confidence: number): MedicalResponse {
    const greetings = [
      '¡Hola! 👋 Soy **Auta**, tu asistente de salud. ¿En qué puedo ayudarte hoy?',
      '¡Buen día! 🌞 Estoy acá para ayudarte con tu salud. ¿Qué necesitás?',
      '¡Hola! 🏥 ¿Cómo te puedo asistir hoy con tu salud?'
    ];

    return {
      text: greetings[Math.floor(Math.random() * greetings.length)],
      confidence
    };
  }

  private handleClosingQuery(confidence: number): MedicalResponse {
    const closingMessages = [
      '👍 Perfecto! Estoy acá si necesitás algo más.',
      '✅ Dale! Cualquier cosa me consultás.',
      '👌 Listo! Acá estoy cuando me necesites.',
      '😊 De nada! Siempre a tu disposición.',
      '🙌 Genial! No dudes en consultarme de nuevo.'
    ];

    return {
      text: closingMessages[Math.floor(Math.random() * closingMessages.length)],
      confidence
    };
  }

  private handleGeneralQuery(confidence: number): MedicalResponse {
    const suggestions = [
      {
        text: '🏥 **¿En qué puedo ayudarte?**\n\nTengo información sobre tu salud:\n\n• **💊 Medicamentos**: Tus tratamientos activos\n• **📅 Citas**: Próximas consultas médicas\n• **🛡️ Chequeos**: Screenings preventivos\n• **💜 Salud reproductiva**: IVE/ILE y anticoncepción\n• **📊 Signos vitales**: Presión, pulso, etc.\n• **🏆 Progreso**: Tu nivel y logros\n• **💬 Comunidad**: Conectá con otros pacientes\n\n**Probá preguntarme**: "medicamentos", "citas", "chequeos", "presión", etc.',
        suggestedActions: [
          { label: '💊 Ver mis medicamentos', action: '/medical-history/medications' },
          { label: '📅 Próximas citas', action: '/appointments' },
          { label: '🛡️ Chequeos pendientes', action: '/preventive-health' }
        ]
      },
      {
        text: '💡 **Sugerencias para vos**\n\nPodés preguntarme cosas como:\n\n📋 **Consultas comunes:**\n• "¿Cuáles son mis medicamentos?"\n• "¿Cuándo tengo mi próxima cita?"\n• "¿Qué chequeos me faltan?"\n• "Mostrame mi presión arterial"\n• "¿Cómo está mi progreso?"\n\n⚡ **Acciones rápidas:**\n• "Subir resultado"\n• "Agregar síntoma"\n• "Publicar en comunidad"\n\n¿Qué te gustaría saber primero?',
        suggestedActions: [
          { label: '📊 Ver mis signos vitales', action: '/vitals' },
          { label: '🎯 Chequeos para mi edad', action: '/preventive-health' },
          { label: '⚡ Ver acciones rápidas', action: '/#quick-actions' }
        ]
      }
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    return {
      text: randomSuggestion.text,
      confidence,
      suggestedActions: randomSuggestion.suggestedActions
    };
  }

  private handleUnknown(): MedicalResponse {
    return {
      text: '🤔 No estoy segura de entender tu pregunta.\n\n¿Podrías reformularla o elegir una de estas opciones?',
      confidence: 0.1,
      suggestedActions: [
        { label: '💊 Ver medicamentos', action: '/medical-history/medications' },
        { label: '📅 Agendar consulta', action: '/appointments/new' },
        { label: '🛡️ Chequeos preventivos', action: '/preventive-health' }
      ]
    };
  }

  // Helper methods
  private getBloodPressureStatus(systolic: number, diastolic: number): {
    label: string;
    advice: string;
  } {
    if (systolic < 120 && diastolic < 80) {
      return {
        label: 'Normal ✅',
        advice: '¡Excelente! Tu presión arterial está en valores óptimos.'
      };
    } else if (systolic < 130 && diastolic < 85) {
      return {
        label: 'Normal-Alta ⚠️',
        advice: 'Tus valores están en el límite superior. Seguí un estilo de vida saludable.'
      };
    } else if (systolic < 140 || diastolic < 90) {
      return {
        label: 'Hipertensión Grado 1 ⚠️',
        advice: 'Consultá con tu médico para evaluar estos valores.'
      };
    } else {
      return {
        label: 'Hipertensión Grado 2 🚨',
        advice: '**Importante**: Consultá con tu médico a la brevedad.'
      };
    }
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'completed': 'Completado ✅',
      'due': 'Pendiente ⏰',
      'upcoming': 'Próximamente 📅',
      'overdue': 'Vencido 🚨'
    };
    return translations[status] || status;
  }
}

/**
 * Singleton QA service para uso en la app
 */
export const medicalQA = new MedicalQA();
