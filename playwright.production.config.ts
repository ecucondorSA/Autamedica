import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración Playwright para tests de producción
 * - No levanta servidores locales
 * - Testa directamente las URLs desplegadas
 * - Optimizado para CI/CD y verificación rápida
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['line'],
    ['json', { outputFile: 'test-results/production-results.json' }]
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Use headless mode for faster execution */
    headless: true,

    /* Permissions for WebRTC testing */
    permissions: ['camera', 'microphone'],

    /* Browser context options for WebRTC */
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-video-capture=/dev/null',
        '--allow-running-insecure-content',
        '--disable-web-security'
      ]
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--use-file-for-fake-video-capture=/dev/null',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      },
    }
  ],

  /* NO web servers - testing production URLs directly */
  webServer: undefined,

  /* Global timeout */
  timeout: 60 * 1000,

  /* Global expect timeout */
  expect: {
    timeout: 15 * 1000
  }
});