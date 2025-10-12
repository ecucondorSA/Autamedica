/**
 * Servicio principal de IA con ONNX Runtime
 * Orquesta tokenización, clasificación de intenciones y generación de respuestas
 */

import * as ort from 'onnxruntime-web';
import { medicalTokenizer } from './tokenizer';
import { intentClassifier, type MedicalIntent, type IntentClassification } from './intent-classifier';
import { medicalQA, type PatientContext, type MedicalResponse } from './medical-qa';
import { logger, getClientEnvOrDefault, getOptionalClientEnv } from '@autamedica/shared';
import { loadVocab, wordPieceTokenize, type Vocab } from './wordpiece-tokenizer';

/**
 * Configuración del servicio ONNX
 */
export interface ONNXServiceConfig {
  modelPath?: string;
  useWebGL?: boolean;
  useWasm?: boolean;
  numThreads?: number;
}

/**
 * Estado de carga del modelo
 */
export type ModelLoadingState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Servicio principal de IA médica
 */
export class ONNXService {
  private session: ort.InferenceSession | null = null;
  private loadingState: ModelLoadingState = 'idle';
  private config: ONNXServiceConfig;
  private vocab: Vocab | null = null;
  private labels: string[] | null = null;
  private maxLen = 128;

  constructor(config: ONNXServiceConfig = {}) {
    this.config = {
      useWebGL: true,
      useWasm: true,
      numThreads: 4,
      ...config
    };

    this.configureONNXRuntime();
  }

  /**
   * Configura ONNX Runtime Web
   */
  private configureONNXRuntime(): void {
    // Configurar execution providers (WebGL > WASM > CPU)
    const executionProviders: ort.InferenceSession.ExecutionProviderConfig[] = [];

    if (this.config.useWebGL) {
      executionProviders.push('webgl');
    }

    if (this.config.useWasm) {
      executionProviders.push('wasm');
    }

    // Fallback a CPU si nada más está disponible
    executionProviders.push('cpu');

    // Configurar número de threads para WASM
    if (this.config.numThreads) {
      ort.env.wasm.numThreads = this.config.numThreads;
    }

    // Modo de desarrollo/producción
    if (process.env.NODE_ENV === 'development') {
      ort.env.logLevel = 'verbose';
    } else {
      ort.env.logLevel = 'warning';
    }
  }

  /**
   * Carga un modelo ONNX (preparado para futuro uso)
   */
  public async loadModel(modelPath: string): Promise<void> {
    if (this.loadingState === 'loading') {
      throw new Error('Model is already being loaded');
    }

    if (this.loadingState === 'ready') {
      // logger.info('Model already loaded');
      return;
    }

    try {
      this.loadingState = 'loading';

      // Cargar modelo desde la ruta especificada
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: this.config.useWebGL
          ? ['webgl', 'wasm', 'cpu']
          : ['wasm', 'cpu'],
        graphOptimizationLevel: 'all',
        enableCpuMemArena: true,
        enableMemPattern: true,
        executionMode: 'parallel'
      });

      this.loadingState = 'ready';
      // Intentar cargar labels y vocab desde el mismo directorio del modelo
      try {
        const base = modelPath.includes('/') ? modelPath.substring(0, modelPath.lastIndexOf('/')) : '.';
        // labels.json
        const labelsRes = await fetch(`${base}/labels.json`, { cache: 'force-cache' });
        if (labelsRes.ok) {
          this.labels = await labelsRes.json();
        }
        // vocab.txt (WordPiece)
        try {
          this.vocab = await loadVocab(`${base}/vocab.txt`);
        } catch {
          this.vocab = null; // si no existe, fallback a reglas
        }
      } catch (e) {
        logger.warn('No se pudieron cargar labels/vocab para ONNX', (e as any)?.message || e);
      }
      // logger.info('✅ ONNX model loaded successfully');
    } catch (error) {
      this.loadingState = 'error';
      logger.error('❌ Failed to load ONNX model:', error);
      throw error;
    }
  }

  /**
   * Ejecuta inferencia con el modelo ONNX (para uso futuro)
   */
  private async runInference(inputTensor: ort.Tensor): Promise<ort.Tensor> {
    if (!this.session) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      const feeds: Record<string, ort.Tensor> = {
        input: inputTensor
      };

      const results = await this.session.run(feeds);
      return results[Object.keys(results)[0]];
    } catch (error) {
      logger.error('Error running inference:', error);
      throw error;
    }
  }

  /**
   * Procesa una query del paciente y genera respuesta
   * (Actualmente usa clasificación basada en reglas, preparado para ONNX)
   */
  public async processQuery(
    query: string,
    patientContext: PatientContext
  ): Promise<{
    classification: IntentClassification;
    response: MedicalResponse;
    processingTime: number;
  }> {
    const startTime = performance.now();

    // 1. Clasificar intención
    const classification = await this.classifyIntent(query);

    // 2. Generar respuesta contextual
    const response = medicalQA.generateResponse(classification, patientContext);

    const processingTime = performance.now() - startTime;

    return {
      classification,
      response,
      processingTime
    };
  }

  /**
   * Clasifica la intención del usuario
   * (Híbrido: reglas ahora, ONNX en el futuro)
   */
  private async classifyIntent(query: string): Promise<IntentClassification> {
    // Si modelo + vocab + labels están listos, usar ONNX
    if (this.loadingState === 'ready' && this.session && this.vocab && this.labels?.length) {
      try {
        const { inputIds, attentionMask, tokenTypeIds } = wordPieceTokenize(query, this.vocab, this.maxLen);
        const feeds: Record<string, ort.Tensor> = {};
        // Nombres comunes de entradas; probamos variantes
        feeds['input_ids'] = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(n => BigInt(n))), [1, this.maxLen]);
        feeds['attention_mask'] = new ort.Tensor('int64', BigInt64Array.from(attentionMask.map(n => BigInt(n))), [1, this.maxLen]);
        // Algunos modelos no usan token_type_ids
        try { feeds['token_type_ids'] = new ort.Tensor('int64', BigInt64Array.from(tokenTypeIds.map(n => BigInt(n))), [1, this.maxLen]); } catch {}

        const results = await this.session.run(feeds);
        // Tomar el primer output como logits
        const firstKey = Object.keys(results)[0];
        const logits = results[firstKey].data as Float32Array | number[];
        const arr = Array.from(logits as any);
        // Softmax
        const max = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(v => v / sum);
        // Top label
        let topIdx = 0;
        let topProb = probs[0] ?? 0;
        for (let i = 1; i < probs.length; i++) {
          if (probs[i] > topProb) { topProb = probs[i]; topIdx = i; }
        }
        const label = (this.labels[topIdx] || 'unknown') as MedicalIntent;
        const keywords = medicalTokenizer.extractMedicalKeywords(query);
        return { intent: label, confidence: topProb, keywords };
      } catch (e) {
        logger.warn('Fallo clasificación ONNX. Usando reglas.', (e as any)?.message || e);
      }
    }
    // Fallback a reglas
    return intentClassifier.classify(query);
  }

  /**
   * Extrae embeddings de un texto (preparado para uso futuro)
   */
  public async extractEmbeddings(text: string): Promise<Float32Array | null> {
    if (this.loadingState !== 'ready' || !this.session) {
      logger.warn('Model not ready, cannot extract embeddings');
      return null;
    }

    try {
      const features = medicalTokenizer.extractFeatures(text);
      const inputTensor = new ort.Tensor(
        'int64',
        BigInt64Array.from(features.tokens.map(t => BigInt(t))),
        [1, features.tokens.length]
      );

      const output = await this.runInference(inputTensor);

      if (output.type === 'float32') {
        return output.data as Float32Array;
      }

      return null;
    } catch (error) {
      logger.error('Error extracting embeddings:', error);
      return null;
    }
  }

  /**
   * Calcula similitud entre dos textos usando embeddings
   */
  public async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const emb1 = await this.extractEmbeddings(text1);
    const emb2 = await this.extractEmbeddings(text2);

    if (!emb1 || !emb2) {
      // Fallback a similitud basada en keywords
      const keywords1 = medicalTokenizer.extractMedicalKeywords(text1);
      const keywords2 = medicalTokenizer.extractMedicalKeywords(text2);

      const intersection = keywords1.filter(k => keywords2.includes(k));
      const union = [...new Set([...keywords1, ...keywords2])];

      return union.length > 0 ? intersection.length / union.length : 0;
    }

    // Cosine similarity
    return this.cosineSimilarity(emb1, emb2);
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Obtiene estado del servicio
   */
  public getStatus(): {
    state: ModelLoadingState;
    hasModel: boolean;
  } {
    return {
      state: this.loadingState,
      hasModel: this.session !== null
    };
  }

  /**
   * Libera recursos del modelo
   */
  public async dispose(): Promise<void> {
    if (this.session) {
      await this.session.release();
      this.session = null;
      this.loadingState = 'idle';
      // logger.info('🗑️ ONNX session disposed');
    }
  }

  /**
   * Precarga recursos de ONNX Runtime
   */
  public static async preload(): Promise<void> {
    try {
      // Precarga WASM files
      await ort.env.wasm.proxy;
      // logger.info('✅ ONNX Runtime WASM preloaded');
    } catch (error) {
      logger.warn('⚠️ Failed to preload ONNX Runtime:', error);
    }
  }
}

/**
 * Instancia singleton del servicio
 */
let onnxServiceInstance: ONNXService | null = null;

/**
 * Obtiene o crea instancia del servicio ONNX
 */
export function getONNXService(config?: ONNXServiceConfig): ONNXService {
  if (!onnxServiceInstance) {
    onnxServiceInstance = new ONNXService(config);
  }
  return onnxServiceInstance;
}

/**
 * Hook para precarga de ONNX en la app
 */
export async function initializeONNX(): Promise<void> {
  await ONNXService.preload();
  const svc = getONNXService();
  // Carga perezosa del modelo si el flag está activo
  const flag = (getOptionalClientEnv?.('NEXT_PUBLIC_AUTA_ONNX') || '').toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'on') {
    const modelPath = getClientEnvOrDefault?.('NEXT_PUBLIC_AUTA_ONNX_MODEL', '/models/intent.onnx');
    try {
      await svc.loadModel(modelPath);
      logger.info?.('Auta ONNX model loaded', { modelPath });
    } catch (e) {
      logger.warn?.('Auta ONNX model failed to load. Falling back to reglas.', (e as any)?.message || e);
    }
  }
}
