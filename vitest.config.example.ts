/**
 * AutaMedica - Vitest Configuration (Example with Coverage Thresholds)
 *
 * Este es un ejemplo de configuración de Vitest con coverage thresholds
 * configurados para el Impact Pack.
 *
 * Para usar:
 * 1. Copiar a tu package: `cp vitest.config.example.ts packages/[nombre]/vitest.config.ts`
 * 2. Ajustar thresholds según necesidad del package
 * 3. Ejecutar: `vitest --coverage`
 *
 * Los thresholds fallarán el build si no se cumplen.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Environment
    environment: "node", // Cambiar a 'happy-dom' o 'jsdom' para tests de UI

    // Coverage configuration
    coverage: {
      provider: "v8", // Más rápido que istanbul

      // Reporters
      reporter: ["text", "html", "json", "lcov"],

      // Coverage thresholds (Quality Gate)
      thresholds: {
        // Coverage mínimo global
        lines: 70, // 70% de líneas cubiertas
        branches: 60, // 60% de branches cubiertos
        functions: 70, // 70% de funciones cubiertas
        statements: 70, // 70% de statements cubiertos

        // Auto-update thresholds (usar con cuidado)
        autoUpdate: false, // true para auto-incrementar thresholds
      },

      // Includes y excludes
      include: [
        "src/**/*.{ts,tsx,js,jsx}",
        "lib/**/*.{ts,tsx,js,jsx}",
      ],

      exclude: [
        "src/**/*.test.{ts,tsx,js,jsx}",
        "src/**/*.spec.{ts,tsx,js,jsx}",
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "**/*.config.{ts,js}",
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
      ],

      // Configuraciones adicionales
      all: true, // Incluir archivos no testeados en reporte
      clean: true, // Limpiar coverage anterior
      skipFull: false, // Mostrar archivos con 100% de coverage
    },

    // Test globals
    globals: true, // Habilita describe, it, expect sin imports

    // Timeouts
    testTimeout: 10000, // 10s por test
    hookTimeout: 10000, // 10s por hook (beforeEach, etc.)

    // Parallel execution
    threads: true, // Ejecutar tests en paralelo
    maxConcurrency: 5, // Max tests en paralelo

    // Retry failed tests
    retry: 0, // No retry por defecto (cambiar a 1-2 si tests flaky)

    // Watch mode
    watch: false, // Solo en modo watch (vitest watch)

    // Mock reset
    clearMocks: true, // Limpiar mocks entre tests
    mockReset: true, // Reset mocks entre tests
    restoreMocks: true, // Restaurar implementaciones originales

    // Setup files
    // setupFiles: ['./tests/setup.ts'],

    // Include/exclude
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
});
