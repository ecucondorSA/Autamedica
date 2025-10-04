import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Browser mode configuration
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium',
          provider: 'playwright',
        }
      ],
      headless: false, // Set to false for debugging, true for CI
      screenshotFailures: true,
      slowMo: 500, // Slow down interactions for visibility
    },

    // Test settings - EXTENDED TIMEOUTS para tests largos
    testTimeout: 300000, // 5 minutos para tests extensos
    hookTimeout: 120000, // 2 minutos para hooks

    // Include test files
    include: [
      'tests/integration/**/*.browser.test.{ts,tsx}',
      'tests/e2e/**/*.browser.test.{ts,tsx}'
    ],

    // Exclude
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**'
    ],

    // Globals
    globals: true,

    // Environment
    environment: 'happy-dom',

    // Coverage (opcional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@autamedica/auth': path.resolve(__dirname, './packages/auth/src'),
      '@autamedica/types': path.resolve(__dirname, './packages/types/src'),
      '@autamedica/shared': path.resolve(__dirname, './packages/shared/src'),
    }
  }
})
