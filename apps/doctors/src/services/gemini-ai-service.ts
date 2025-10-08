/**
 * Servicio de Google Gemini AI para análisis médico
 * Alternativa a Anthropic Claude
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { featureFlags } from '@autamedica/shared/config/feature-flags';
import type { MedicalAnalysis, AnalysisRequest } from './ai-analysis-service';

/**
 * Servicio de Análisis Médico con Google Gemini
 */
export class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly model = 'gemini-2.5-flash-preview-05-20'; // Más rápido y económico
  // private readonly model = 'gemini-2.5-pro-preview-03-25'; // Más potente

  constructor() {
    // Solo inicializar si NO estamos en modo mock y tenemos API key
    if (!featureFlags.USE_MOCK_AI && process.env.GOOGLE_AI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      console.log('✅ GeminiAIService inicializado con Gemini 2.5');
    } else if (featureFlags.USE_MOCK_AI) {
      console.log('⚠️  GeminiAIService en modo MOCK (desarrollo)');
    } else {
      console.warn('⚠️  GeminiAIService: No API key found');
    }
  }

  /**
   * Analizar datos médicos con Gemini
   */
  async analyzeMedicalData(
    request: AnalysisRequest
  ): Promise<MedicalAnalysis> {
    // Modo mock
    if (featureFlags.USE_MOCK_AI || !this.genAI) {
      return this.getMockAnalysis(request);
    }

    // Modo producción con Gemini
    return this.getRealAnalysis(request);
  }

  /**
   * Análisis real con Gemini
   */
  private async getRealAnalysis(
    request: AnalysisRequest
  ): Promise<MedicalAnalysis> {
    if (!this.genAI) {
      throw new Error('Gemini AI client not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: this.model });
    const prompt = this.buildMedicalPrompt(request);

    try {
      const startTime = Date.now();

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Baja temperatura para consistencia
          maxOutputTokens: 4096,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_MEDICAL',
            threshold: 'BLOCK_NONE', // Permitir contenido médico
          },
        ],
      });

      const response = await result.response;
      const text = response.text();
      const processingTime = Date.now() - startTime;

      // Parsear respuesta JSON
      const analysis = this.parseGeminiResponse(text);

      return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...analysis,
        metadata: {
          modelUsed: this.model,
          tokensUsed: {
            input: response.usageMetadata?.promptTokenCount || 0,
            output: response.usageMetadata?.candidatesTokenCount || 0,
          },
          processingTimeMs: processingTime,
        },
      };
    } catch (error) {
      console.error('Error al analizar con Gemini:', error);

      // Fallback a mock
      console.warn('Usando análisis mock como fallback');
      return this.getMockAnalysis(request);
    }
  }

  /**
   * Construir prompt médico estructurado
   */
  private buildMedicalPrompt(request: AnalysisRequest): string {
    const { data, context } = request;

    let prompt = `Eres un asistente médico especializado certificado.
Tu función es analizar datos médicos y proporcionar análisis clínicos preliminares.

IMPORTANTE:
- NO diagnostiques condiciones específicas
- Proporciona análisis basado en evidencia
- Recomienda seguimiento médico apropiado
- Usa lenguaje médico preciso pero comprensible
- Indica nivel de severidad y confianza

DATOS DEL PACIENTE:
`;

    // Síntomas
    if (data.symptoms && data.symptoms.length > 0) {
      prompt += `\nSÍNTOMAS REPORTADOS:\n`;
      data.symptoms.forEach((symptom, i) => {
        prompt += `${i + 1}. ${symptom}\n`;
      });
    }

    // Signos vitales
    if (data.vitals && Object.keys(data.vitals).length > 0) {
      prompt += `\nSIGNOS VITALES:\n`;
      Object.entries(data.vitals).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Resultados de laboratorio
    if (data.labResults && data.labResults.length > 0) {
      prompt += `\nRESULTADOS DE LABORATORIO:\n`;
      data.labResults.forEach((result, i) => {
        prompt += `${i + 1}. ${JSON.stringify(result)}\n`;
      });
    }

    // Historial médico
    if (data.medicalHistory) {
      prompt += `\nHISTORIAL MÉDICO:\n${data.medicalHistory}\n`;
    }

    // Medicaciones actuales
    if (data.currentMedications && data.currentMedications.length > 0) {
      prompt += `\nMEDICACIONES ACTUALES:\n`;
      data.currentMedications.forEach((med, i) => {
        prompt += `${i + 1}. ${med}\n`;
      });
    }

    // Contexto adicional
    if (context) {
      prompt += `\nCONTEXTO ADICIONAL:\n${context}\n`;
    }

    prompt += `\nProporciona un análisis médico en formato JSON con la siguiente estructura:
{
  "summary": "Resumen conciso del análisis",
  "recommendations": ["Recomendación 1", "Recomendación 2", ...],
  "severity": "low|medium|high|critical",
  "confidence": 0-100,
  "keyFindings": ["Hallazgo 1", "Hallazgo 2", ...]
}

SOLO responde con el JSON, sin texto adicional.`;

    return prompt;
  }

  /**
   * Parsear respuesta de Gemini
   */
  private parseGeminiResponse(responseText: string): Partial<MedicalAnalysis> {
    try {
      // Intentar extraer JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          summary: parsed.summary || 'Análisis completado',
          recommendations: parsed.recommendations || [],
          severity: parsed.severity || 'low',
          confidence: parsed.confidence || 70,
        };
      }

      // Si no hay JSON válido, usar texto directo
      return {
        summary: responseText.substring(0, 500),
        recommendations: ['Revisar análisis detallado'],
        severity: 'medium',
        confidence: 60,
      };
    } catch (error) {
      console.error('Error parseando respuesta de Gemini:', error);

      return {
        summary: 'Error parseando análisis',
        recommendations: ['Revisar manualmente los datos'],
        severity: 'low',
        confidence: 0,
      };
    }
  }

  /**
   * Análisis mock para desarrollo
   */
  private getMockAnalysis(request: AnalysisRequest): MedicalAnalysis {
    const { symptoms = [] } = request.data;

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      summary: `[MOCK - GEMINI] Análisis simulado de ${symptoms.length} síntomas. Sistema Gemini AI en modo desarrollo.`,
      recommendations: [
        'Monitorear evolución clínica',
        'Evaluación presencial recomendada',
        'Seguimiento en 48 horas',
        '[MOCK DATA - Configurar GOOGLE_AI_API_KEY en producción]',
      ],
      severity: this.calculateMockSeverity(symptoms.length),
      confidence: 78,
      metadata: {
        modelUsed: 'gemini-mock-dev',
      },
    };
  }

  /**
   * Calcular severidad mock
   */
  private calculateMockSeverity(
    symptomCount: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (symptomCount === 0) return 'low';
    if (symptomCount <= 2) return 'low';
    if (symptomCount <= 4) return 'medium';
    if (symptomCount <= 6) return 'high';
    return 'critical';
  }

  /**
   * Verificar si el servicio está en modo producción
   */
  isProductionMode(): boolean {
    return !featureFlags.USE_MOCK_AI && this.genAI !== null;
  }

  /**
   * Obtener información del servicio
   */
  getServiceInfo() {
    return {
      provider: 'Google Gemini',
      mode: featureFlags.USE_MOCK_AI ? 'mock' : 'production',
      modelUsed: featureFlags.USE_MOCK_AI ? 'gemini-mock' : this.model,
      apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY,
      clientInitialized: !!this.genAI,
      features: {
        multimodal: true,
        vision: true,
        longContext: true, // 1M tokens
        thinking: true, // Gemini 2.5 Pro tiene modo thinking
      },
    };
  }

  /**
   * Análisis con imágenes (multimodal)
   * Feature única de Gemini
   */
  async analyzeWithImage(
    request: AnalysisRequest,
    imageBase64: string,
    imageMimeType: string = 'image/jpeg'
  ): Promise<MedicalAnalysis> {
    if (!this.genAI || featureFlags.USE_MOCK_AI) {
      return this.getMockAnalysis(request);
    }

    const model = this.genAI.getGenerativeModel({ model: this.model });
    const prompt = this.buildMedicalPrompt(request);

    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      });

      const response = await result.response;
      const text = response.text();
      const analysis = this.parseGeminiResponse(text);

      return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...analysis,
        metadata: {
          modelUsed: this.model,
          tokensUsed: {
            input: response.usageMetadata?.promptTokenCount || 0,
            output: response.usageMetadata?.candidatesTokenCount || 0,
          },
          multimodal: true,
        },
      };
    } catch (error) {
      console.error('Error en análisis multimodal con Gemini:', error);
      return this.getMockAnalysis(request);
    }
  }
}

// Singleton instance
let geminiServiceInstance: GeminiAIService | null = null;

/**
 * Obtener instancia única del servicio
 */
export function getGeminiAIService(): GeminiAIService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiAIService();
  }
  return geminiServiceInstance;
}
