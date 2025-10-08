/**
 * Tests para el clasificador de intenciones
 */

import { describe, it, expect } from 'vitest';
import { intentClassifier } from '../intent-classifier';

describe('IntentClassifier', () => {
  describe('Clasificación de intenciones médicas', () => {
    it('debe clasificar correctamente consultas sobre medicamentos', () => {
      const queries = [
        '¿Qué medicamentos debo tomar?',
        'Dame info sobre mis pastillas',
        'Cuáles son mis medicamentos'
      ];

      queries.forEach(query => {
        const result = intentClassifier.classify(query);
        expect(result.intent).toBe('medications');
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('debe clasificar correctamente consultas sobre presión arterial', () => {
      const queries = [
        '¿Cómo está mi presión?',
        'Dame mi tensión arterial',
        'Muéstrame mi PA'
      ];

      queries.forEach(query => {
        const result = intentClassifier.classify(query);
        expect(result.intent).toBe('vitals');
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('debe clasificar correctamente consultas sobre citas', () => {
      const queries = [
        '¿Cuándo es mi próxima cita?',
        'Quiero agendar una consulta',
        'Ver mis turnos médicos'
      ];

      queries.forEach(query => {
        const result = intentClassifier.classify(query);
        expect(result.intent).toBe('appointments');
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('debe clasificar correctamente consultas sobre screenings', () => {
      const queries = [
        'Estado de mis screenings',
        '¿Cuándo me toca el chequeo?',
        'Ver mis exámenes preventivos'
      ];

      queries.forEach(query => {
        const result = intentClassifier.classify(query);
        expect(result.intent).toBe('screenings');
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('debe clasificar correctamente consultas sobre salud reproductiva', () => {
      const queries = [
        'Información sobre IVE/ILE',
        'Necesito un anticonceptivo',
        'Info sobre interrupción del embarazo'
      ];

      queries.forEach(query => {
        const result = intentClassifier.classify(query);
        expect(result.intent).toBe('reproductive');
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    it('debe detectar saludos', () => {
      const greetings = ['Hola', 'Buenos días', 'Hey'];

      greetings.forEach(greeting => {
        const result = intentClassifier.classify(greeting);
        expect(result.intent).toBe('greeting');
      });
    });

    it('debe extraer contexto específico de screenings', () => {
      const queries = [
        { text: 'Info sobre PSA', expectedContext: 'psa' },
        { text: 'Cuándo me toca la colonoscopia', expectedContext: 'colonoscopy' },
        { text: 'Info sobre mamografía', expectedContext: 'mammography' }
      ];

      queries.forEach(({ text, expectedContext }) => {
        const result = intentClassifier.classify(text);
        expect(result.intent).toBe('screenings');
        expect(result.context).toBe(expectedContext);
      });
    });

    it('debe extraer keywords médicas relevantes', () => {
      const result = intentClassifier.classify('Tengo dolor de cabeza y fiebre');
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords).toContain('dolor');
    });
  });

  describe('Sugerencias de respuesta', () => {
    it('debe sugerir tipo de respuesta correcto para medicamentos', () => {
      const classification = intentClassifier.classify('¿Qué medicamentos tomo?');
      const suggestion = intentClassifier.suggestResponseType(classification);

      expect(suggestion.needsData).toBe(true);
      expect(suggestion.dataType).toBe('medications');
      expect(suggestion.responseStyle).toBe('informative');
    });

    it('debe sugerir tipo de respuesta empático para síntomas', () => {
      const classification = intentClassifier.classify('Me duele mucho la cabeza');
      const suggestion = intentClassifier.suggestResponseType(classification);

      expect(suggestion.responseStyle).toBe('empathetic');
    });

    it('debe sugerir tipo de respuesta accionable para agendar citas', () => {
      const classification = intentClassifier.classify('Quiero agendar una consulta');
      const suggestion = intentClassifier.suggestResponseType(classification);

      expect(suggestion.responseStyle).toBe('actionable');
    });
  });

  describe('Batch processing', () => {
    it('debe procesar múltiples queries en batch', () => {
      const queries = [
        '¿Mis medicamentos?',
        '¿Cómo está mi presión?',
        'Próximas citas'
      ];

      const results = intentClassifier.classifyBatch(queries);

      expect(results).toHaveLength(3);
      expect(results[0].intent).toBe('medications');
      expect(results[1].intent).toBe('vitals');
      expect(results[2].intent).toBe('appointments');
    });
  });
});
