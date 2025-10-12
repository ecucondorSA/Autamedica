/**
 * Feature Flags Configuration
 *
 * Controla qué features están activas en cada ambiente.
 * Usa variables de entorno para configurar mocks vs servicios reales.
 *
 * @module feature-flags
 */

/**
 * Feature flags basados en variables de entorno
 * Permite activar/desactivar mocks y servicios por ambiente
 */
const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on', 'enable', 'enabled']);
const FALSY_VALUES = new Set(['0', 'false', 'no', 'off', 'disable', 'disabled']);

function readBooleanFlag(...names: Array<string | undefined>): boolean {
  for (const name of names) {
    if (!name) continue;
    const raw = process.env[name];
    if (typeof raw !== 'string') continue;

    const normalized = raw.trim().toLowerCase();
    if (!normalized) continue;
    if (TRUTHY_VALUES.has(normalized)) return true;
    if (FALSY_VALUES.has(normalized)) return false;

    // Cualquier otro valor no vacío se considera activado para no bloquear configuraciones personalizadas.
    return true;
  }
  return false;
}
export const featureFlags = {
  // ===================
  // Video/Telemedicine
  // ===================

  /** Usar mock de video stream en lugar de WebRTC real */
  USE_MOCK_VIDEO: readBooleanFlag('NEXT_PUBLIC_USE_MOCK_VIDEO', 'NEXT_PUBLIC_MOCK_VIDEO'),

  /** Usar LiveKit para video calling real */
  USE_LIVEKIT: readBooleanFlag('NEXT_PUBLIC_USE_LIVEKIT', 'NEXT_PUBLIC_LIVEKIT'),

  // ===================
  // Medical Data
  // ===================

  /** Usar datos médicos simulados en lugar de Supabase */
  USE_MOCK_MEDICAL_DATA: readBooleanFlag('NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA'),

  // ===================
  // AI Services
  // ===================

  /** Usar análisis de IA simulados */
  USE_MOCK_AI: readBooleanFlag('NEXT_PUBLIC_USE_MOCK_AI'),

  /** Proveedor de AI a usar: 'anthropic' | 'google' | 'auto' */
  AI_PROVIDER: (process.env.NEXT_PUBLIC_AI_PROVIDER || 'auto') as 'anthropic' | 'google' | 'auto',

  /** Verificar si Anthropic Claude está disponible */
  USE_ANTHROPIC_AI: typeof process.env.ANTHROPIC_API_KEY !== 'undefined' &&
                     process.env.ANTHROPIC_API_KEY !== '',

  /** Verificar si Google Gemini está disponible */
  USE_GOOGLE_AI: typeof process.env.GOOGLE_AI_API_KEY !== 'undefined' &&
                  process.env.GOOGLE_AI_API_KEY !== '',

  /** Verificar si algún AI real está disponible */
  USE_REAL_AI: (typeof process.env.ANTHROPIC_API_KEY !== 'undefined' &&
                process.env.ANTHROPIC_API_KEY !== '') ||
               (typeof process.env.GOOGLE_AI_API_KEY !== 'undefined' &&
                process.env.GOOGLE_AI_API_KEY !== ''),

  // ===================
  // Environment Detection
  // ===================

  /** Ambiente de producción */
  IS_PRODUCTION: process.env.NODE_ENV === 'production' &&
                 process.env.NEXT_PUBLIC_ENV === 'production',

  /** Ambiente de desarrollo */
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development' ||
                  process.env.NEXT_PUBLIC_ENV === 'development',

  /** Ambiente de staging */
  IS_STAGING: process.env.NEXT_PUBLIC_ENV === 'staging',

  /** Modo de testing (E2E, etc.) */
  IS_TESTING: process.env.NODE_ENV === 'test' ||
              process.env.MOCK_AUTAMEDICA === '1',
} as const;

export type FeatureFlags = typeof featureFlags;

/**
 * Helper function para verificar si estamos en modo mock
 */
export function isMockMode(): boolean {
  return featureFlags.USE_MOCK_VIDEO ||
         featureFlags.USE_MOCK_MEDICAL_DATA ||
         featureFlags.USE_MOCK_AI;
}

/**
 * Helper function para verificar si estamos en producción real
 */
export function isProductionMode(): boolean {
  return featureFlags.IS_PRODUCTION && !isMockMode();
}

/**
 * Seleccionar proveedor de AI automáticamente
 */
export function getAIProvider(): 'anthropic' | 'google' | null {
  if (featureFlags.USE_MOCK_AI) {
    return null; // Modo mock
  }

  // Si se especificó proveedor manualmente
  if (featureFlags.AI_PROVIDER !== 'auto') {
    return featureFlags.AI_PROVIDER;
  }

  // Auto-selección: preferir Anthropic, luego Google
  if (featureFlags.USE_ANTHROPIC_AI) {
    return 'anthropic';
  }
  if (featureFlags.USE_GOOGLE_AI) {
    return 'google';
  }

  return null;
}

/**
 * Validación de configuración - lanza error si hay inconsistencias
 */
export function validateFeatureFlags(): void {
  const warnings: string[] = [];

  // Verificar que producción no tenga mocks
  if (featureFlags.IS_PRODUCTION && isMockMode()) {
    warnings.push(
      '⚠️  WARNING: Mocks están activos en ambiente de PRODUCCIÓN'
    );
  }

  // Verificar que LiveKit esté configurado si no usamos mocks
  if (!featureFlags.USE_MOCK_VIDEO && !featureFlags.USE_LIVEKIT) {
    warnings.push(
      '⚠️  WARNING: Video real requiere LiveKit configurado (USE_LIVEKIT=true)'
    );
  }

  // Verificar que AI real tenga al menos una API key
  if (!featureFlags.USE_MOCK_AI && !featureFlags.USE_REAL_AI) {
    warnings.push(
      '⚠️  WARNING: AI real requiere ANTHROPIC_API_KEY o GOOGLE_AI_API_KEY configurada'
    );
  }

  // Log warnings en consola (solo en desarrollo)
  if (warnings.length > 0 && !featureFlags.IS_PRODUCTION) {
    console.warn('\n🚨 Feature Flags Warnings:\n');
    warnings.forEach(warning => console.warn(warning));
    console.warn('\n');
  }

  // En producción, lanzar error si hay problemas críticos
  if (featureFlags.IS_PRODUCTION && isMockMode()) {
    throw new Error(
      'FATAL: Mocks cannot be active in production environment. ' +
      'Check NEXT_PUBLIC_USE_MOCK_* environment variables.'
    );
  }
}

/**
 * Log de configuración actual (útil para debugging)
 */
export function logFeatureFlags(): void {
  if (featureFlags.IS_PRODUCTION) {
    // En producción solo log si hay problemas
    return;
  }

  console.log('\n🎛️  Feature Flags Configuration:\n');
  console.log('Environment:', {
    production: featureFlags.IS_PRODUCTION,
    staging: featureFlags.IS_STAGING,
    development: featureFlags.IS_DEVELOPMENT,
    testing: featureFlags.IS_TESTING,
  });
  console.log('\nMocks:', {
    video: featureFlags.USE_MOCK_VIDEO,
    medicalData: featureFlags.USE_MOCK_MEDICAL_DATA,
    ai: featureFlags.USE_MOCK_AI,
  });
  console.log('\nReal Services:', {
    livekit: featureFlags.USE_LIVEKIT,
    aiProvider: getAIProvider(),
    anthropicAI: featureFlags.USE_ANTHROPIC_AI,
    googleAI: featureFlags.USE_GOOGLE_AI,
  });
  console.log('\n');
}

// Auto-validar en import (solo en cliente/server, no en build time)
if (typeof window !== 'undefined' || typeof process !== 'undefined') {
  try {
    validateFeatureFlags();
  } catch (error) {
    console.error('Feature Flags Validation Error:', error);
  }
}
