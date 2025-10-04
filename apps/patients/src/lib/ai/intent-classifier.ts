/**
 * Clasificador de intenciones para queries médicas
 * Categoriza las preguntas del paciente en intenciones específicas
 */

import { medicalTokenizer } from './tokenizer';

export type MedicalIntent =
  | 'medications'        // Consultas sobre medicamentos
  | 'vitals'            // Presión arterial, signos vitales
  | 'appointments'      // Citas y consultas
  | 'screenings'        // Estudios preventivos
  | 'symptoms'          // Síntomas y molestias
  | 'reproductive'      // Salud reproductiva (IVE/ILE)
  | 'allergies'         // Alergias
  | 'progress'          // Progreso del paciente
  | 'community'         // Comunidad y publicaciones
  | 'platform'          // Funciones de la plataforma
  | 'general'           // Información general
  | 'greeting'          // Saludos
  | 'closing'           // Cierre de conversación
  | 'unknown';          // No identificado

export interface IntentClassification {
  intent: MedicalIntent;
  confidence: number;
  keywords: string[];
  context?: string;
}

/**
 * Patrones de keywords por intención
 */
const INTENT_PATTERNS: Record<MedicalIntent, string[]> = {
  medications: [
    'medicamento', 'pastilla', 'pildora', 'dosis', 'tratamiento', 'receta',
    'medicina', 'tomar', 'tomo', 'farmaco', 'medicacion', 'droga',
    'prescripcion', 'remedios', 'pildoras', 'tabletas', 'capsulas'
  ],
  vitals: [
    'presion', 'tension', 'arterial', 'latidos', 'pulso', 'frecuencia',
    'cardiaca', 'temperatura', 'saturacion', 'oxigeno', 'signos vitales',
    'signos', 'vitales', 'parametros', 'indicadores', 'mediciones',
    'peso', 'altura', 'imc', 'glucosa', 'azucar'
  ],
  appointments: [
    'cita', 'consulta', 'turno', 'agendar', 'reservar', 'doctor', 'medico',
    'cuando', 'horario', 'disponible', 'ver', 'proximo', 'proxima',
    'agenda', 'reunion', 'visita', 'atencion', 'ver medico', 'especialista'
  ],
  screenings: [
    'screening', 'chequeo', 'analisis', 'estudio', 'examen', 'control',
    'mamografia', 'colonoscopia', 'pap', 'preventivo', 'deteccion', 'psa',
    'laboratorio', 'sangre', 'orina', 'radiografia', 'ecografia',
    'tomografia', 'resonancia', 'ultrasonido', 'biopsia', 'electrocardiograma',
    'resultado', 'resultados', 'subir resultado', 'mi edad', 'para mi edad',
    'edad', 'segun mi edad', 'personalizados', 'recomendados'
  ],
  symptoms: [
    'dolor', 'fiebre', 'tos', 'nausea', 'mareo', 'cansancio', 'malestar',
    'sintoma', 'siento', 'tengo', 'me duele', 'molestia', 'padezco',
    'sufro', 'incomodidad', 'debilidad', 'fatiga', 'agotamiento'
  ],
  reproductive: [
    'embarazo', 'anticonceptivo', 'ive', 'ile', 'interrupcion', 'aborto',
    'reproduccion', 'metodo', 'prevenir', 'planificacion', 'menstruacion',
    'reproductiva', 'gestacion', 'fertilidad', 'anticoncepcion',
    'derechos reproductivos', 'salud reproductiva', 'ginecologia'
  ],
  allergies: [
    'alergia', 'alergico', 'reaccion', 'intolerancia', 'hipersensible',
    'alergias', 'sensibilidad', 'adversa', 'rechazo'
  ],
  progress: [
    'progreso', 'avance', 'mejoria', 'evolucion', 'logro', 'achievement',
    'nivel', 'racha', 'completado', 'perfil', 'estadisticas', 'stats',
    'puntos', 'gamificacion', 'recompensas', 'medallas', 'insignias'
  ],
  community: [
    'comunidad', 'publicar', 'publicacion', 'post', 'compartir',
    'grupo', 'foro', 'experiencia', 'otros pacientes', 'red social',
    'comentario', 'comentar', 'interactuar', 'conectar'
  ],
  platform: [
    'acciones', 'accion rapida', 'funciones', 'caracteristicas',
    'opciones', 'que puedo hacer', 'herramientas', 'utilidades',
    'menu', 'navegacion', 'seccion', 'donde', 'como uso', 'tutorial'
  ],
  general: [
    'informacion', 'que es', 'como funciona', 'explicar', 'ayuda',
    'necesito', 'quiero saber', 'dime', 'cuentame', 'historia clinica',
    'historial', 'anamnesis', 'expediente', 'registro', 'datos',
    'salud', 'plataforma', 'sistema', 'autamedica', 'funcionalidad',
    'puede ayudar', 'puede hacer', 'puedes ayudar', 'puedes hacer',
    'decime', 'contame', 'mostrame', 'sugerime', 'recomendame',
    'no se', 'nose', 'no estoy seguro', 'dudas', 'opciones'
  ],
  greeting: [
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos',
    'hey', 'ola', 'que tal', 'como estas', 'holi'
  ],
  closing: [
    'no', 'nada', 'ok', 'gracias', 'listo', 'ya esta', 'perfecto',
    'entendido', 'vale', 'bien', 'chau', 'adios', 'hasta luego',
    'nos vemos', 'bye', 'thank', 'thanks', 'eso es todo'
  ],
  unknown: []
};

/**
 * Clasificador de intenciones
 */
export class IntentClassifier {
  /**
   * Clasifica un texto en una intención médica
   */
  public classify(text: string): IntentClassification {
    const keywords = medicalTokenizer.extractMedicalKeywords(text);
    const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Calcular scores por intención
    const scores: Record<MedicalIntent, number> = {
      medications: 0,
      vitals: 0,
      appointments: 0,
      screenings: 0,
      symptoms: 0,
      reproductive: 0,
      allergies: 0,
      progress: 0,
      community: 0,
      platform: 0,
      general: 0,
      greeting: 0,
      closing: 0,
      unknown: 0
    };

    // Scoring basado en keywords
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedText.includes(normalizedPattern)) {
          scores[intent as MedicalIntent] += 1;
        }
      }
    }

    // Encontrar intención con mayor score
    let maxScore = 0;
    let topIntent: MedicalIntent = 'unknown';

    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topIntent = intent as MedicalIntent;
      }
    }

    // Si no hay coincidencias claras, verificar patrones especiales
    if (maxScore === 0) {
      const words = normalizedText.split(' ').filter(w => w.length > 0);

      // Solo saludos muy cortos y comunes
      const commonGreetings = ['hola', 'hey', 'ola', 'buenas', 'buenos', 'saludos'];
      const isGreeting = words.length <= 2 && commonGreetings.some(g => normalizedText.includes(g));

      // Cierre de conversación monosílabo
      const commonClosings = ['no', 'nada', 'ok', 'bien', 'listo', 'gracias', 'chau', 'bye'];
      const isClosing = words.length <= 2 && commonClosings.some(c => normalizedText.includes(c));

      if (isGreeting) {
        topIntent = 'greeting';
        maxScore = 0.5;
      } else if (isClosing) {
        topIntent = 'closing';
        maxScore = 0.6;
      } else {
        topIntent = 'general';
        maxScore = 0.3;
      }
    }

    // Calcular confianza (normalizada entre 0 y 1)
    const confidence = Math.min(maxScore / 3, 1.0);

    // Extraer contexto adicional
    const context = this.extractContext(normalizedText, topIntent);

    return {
      intent: topIntent,
      confidence,
      keywords,
      context
    };
  }

  /**
   * Extrae contexto adicional basado en la intención
   */
  private extractContext(text: string, intent: MedicalIntent): string | undefined {
    switch (intent) {
      case 'screenings':
        // Detectar tipo de screening específico
        if (text.includes('psa')) return 'psa';
        if (text.includes('colonoscopia')) return 'colonoscopy';
        if (text.includes('mamografia')) return 'mammography';
        if (text.includes('pap')) return 'pap';
        if (text.includes('subir') || text.includes('resultado')) return 'upload_result';
        if (text.includes('edad') || text.includes('personalizad')) return 'age_based';
        break;

      case 'vitals':
        // Detectar tipo de vital específico
        if (text.includes('presion') || text.includes('tension')) return 'blood_pressure';
        if (text.includes('pulso') || text.includes('frecuencia')) return 'heart_rate';
        break;

      case 'reproductive':
        // Detectar subcategoría
        if (text.includes('ive') || text.includes('ile') || text.includes('interrupcion') || text.includes('aborto')) {
          return 'pregnancy_interruption';
        }
        if (text.includes('anticonceptivo') || text.includes('anticoncepcion')) return 'contraception';
        if (text.includes('derechos')) return 'reproductive_rights';
        break;

      case 'appointments':
        // Detectar acción específica
        if (text.includes('agendar') || text.includes('reservar')) return 'schedule';
        if (text.includes('cuando') || text.includes('proximo')) return 'check';
        break;
    }

    return undefined;
  }

  /**
   * Clasifica múltiples textos en batch
   */
  public classifyBatch(texts: string[]): IntentClassification[] {
    return texts.map(text => this.classify(text));
  }

  /**
   * Sugiere respuesta basada en la intención
   */
  public suggestResponseType(classification: IntentClassification): {
    needsData: boolean;
    dataType?: string;
    responseStyle: 'informative' | 'empathetic' | 'actionable';
  } {
    const { intent, context } = classification;

    switch (intent) {
      case 'medications':
        return {
          needsData: true,
          dataType: 'medications',
          responseStyle: 'informative'
        };

      case 'vitals':
        return {
          needsData: true,
          dataType: 'vitals',
          responseStyle: 'informative'
        };

      case 'appointments':
        return {
          needsData: true,
          dataType: 'appointments',
          responseStyle: context === 'schedule' ? 'actionable' : 'informative'
        };

      case 'screenings':
        return {
          needsData: true,
          dataType: 'screenings',
          responseStyle: 'informative'
        };

      case 'symptoms':
        return {
          needsData: false,
          responseStyle: 'empathetic'
        };

      case 'reproductive':
        return {
          needsData: false,
          responseStyle: context === 'pregnancy_interruption' ? 'empathetic' : 'informative'
        };

      case 'allergies':
        return {
          needsData: true,
          dataType: 'allergies',
          responseStyle: 'informative'
        };

      case 'progress':
        return {
          needsData: true,
          dataType: 'progress',
          responseStyle: 'informative'
        };

      case 'community':
        return {
          needsData: false,
          responseStyle: 'informative'
        };

      case 'platform':
        return {
          needsData: false,
          responseStyle: 'actionable'
        };

      case 'greeting':
        return {
          needsData: false,
          responseStyle: 'empathetic'
        };

      default:
        return {
          needsData: false,
          responseStyle: 'informative'
        };
    }
  }
}

/**
 * Singleton classifier para uso en la app
 */
export const intentClassifier = new IntentClassifier();
