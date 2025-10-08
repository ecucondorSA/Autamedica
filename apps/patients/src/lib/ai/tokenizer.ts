/**
 * Tokenizer para procesamiento de texto médico
 * Optimizado para queries de pacientes en español
 */

export interface TokenizerConfig {
  maxLength: number;
  vocabSize: number;
}

export class MedicalTokenizer {
  private maxLength: number;
  private vocabSize: number;
  private vocabulary: Map<string, number>;
  private reverseVocab: Map<number, string>;

  constructor(config: TokenizerConfig) {
    this.maxLength = config.maxLength;
    this.vocabSize = config.vocabSize;
    this.vocabulary = new Map();
    this.reverseVocab = new Map();
    this.initializeVocabulary();
  }

  /**
   * Inicializa vocabulario médico básico en español
   */
  private initializeVocabulary(): void {
    // Tokens especiales
    const specialTokens = [
      '[PAD]', '[UNK]', '[CLS]', '[SEP]', '[MASK]'
    ];

    // Palabras médicas comunes
    const medicalWords = [
      // Síntomas
      'dolor', 'fiebre', 'tos', 'náusea', 'mareo', 'cansancio', 'presión', 'tensión',
      // Medicamentos
      'medicamento', 'pastilla', 'píldora', 'dosis', 'tratamiento', 'receta',
      // Partes del cuerpo
      'cabeza', 'pecho', 'estómago', 'corazón', 'pulmón', 'sangre',
      // Consultas
      'cita', 'consulta', 'doctor', 'médico', 'turno', 'agendar',
      // Preventivo
      'screening', 'chequeo', 'análisis', 'estudio', 'examen', 'mamografía', 'colonoscopia',
      // Reproductivo
      'embarazo', 'anticonceptivo', 'ive', 'ile', 'interrupción', 'aborto',
      // Palabras comunes
      'tengo', 'necesito', 'quiero', 'puedo', 'cuándo', 'dónde', 'cómo', 'qué',
      'mi', 'mis', 'tu', 'sus', 'el', 'la', 'los', 'las', 'un', 'una',
      'está', 'están', 'es', 'son', 'hay', 'tiene', 'tener',
      'por', 'para', 'con', 'sin', 'sobre', 'entre', 'desde', 'hasta',
      'hola', 'gracias', 'ayuda', 'información', 'ver', 'mostrar', 'saber'
    ];

    let index = 0;

    // Agregar tokens especiales
    for (const token of specialTokens) {
      this.vocabulary.set(token, index);
      this.reverseVocab.set(index, token);
      index++;
    }

    // Agregar palabras médicas
    for (const word of medicalWords) {
      this.vocabulary.set(word, index);
      this.reverseVocab.set(index, word);
      index++;
    }
  }

  /**
   * Normaliza texto para procesamiento
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^\w\s]/g, ' ') // Reemplazar puntuación con espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Tokeniza texto en IDs de vocabulario
   */
  public encode(text: string): number[] {
    const normalized = this.normalizeText(text);
    const words = normalized.split(' ');

    const tokens: number[] = [this.vocabulary.get('[CLS]')!];

    for (const word of words) {
      if (tokens.length >= this.maxLength - 1) break;

      const tokenId = this.vocabulary.get(word) ?? this.vocabulary.get('[UNK]')!;
      tokens.push(tokenId);
    }

    tokens.push(this.vocabulary.get('[SEP]')!);

    // Padding hasta maxLength
    while (tokens.length < this.maxLength) {
      tokens.push(this.vocabulary.get('[PAD]')!);
    }

    return tokens;
  }

  /**
   * Convierte IDs a texto
   */
  public decode(tokens: number[]): string {
    return tokens
      .map(id => this.reverseVocab.get(id) ?? '[UNK]')
      .filter(token => !['[PAD]', '[CLS]', '[SEP]', '[UNK]'].includes(token))
      .join(' ');
  }

  /**
   * Extrae features de texto para clasificación
   */
  public extractFeatures(text: string): {
    tokens: number[];
    attentionMask: number[];
    length: number;
  } {
    const tokens = this.encode(text);
    const attentionMask = tokens.map(t =>
      t === this.vocabulary.get('[PAD]')! ? 0 : 1
    );

    return {
      tokens,
      attentionMask,
      length: attentionMask.reduce((sum, val) => sum + val, 0)
    };
  }

  /**
   * Detecta keywords médicas en el texto
   */
  public extractMedicalKeywords(text: string): string[] {
    const normalized = this.normalizeText(text);
    const words = normalized.split(' ');

    return words.filter(word => {
      const tokenId = this.vocabulary.get(word);
      // Filtra palabras que están en vocabulario médico (no comunes ni especiales)
      return tokenId !== undefined &&
             tokenId > 5 && // Después de tokens especiales
             tokenId < 60;  // Dentro de palabras médicas
    });
  }
}

/**
 * Singleton tokenizer para uso en la app
 */
export const medicalTokenizer = new MedicalTokenizer({
  maxLength: 128,
  vocabSize: 1000
});
