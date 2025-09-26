import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['line'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
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
        '--use-file-for-fake-video-capture=/dev/null'
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
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true,
          }
        }
      },
    },
  ],

  /* Web servers for local testing */
  webServer: [
    {
      command: 'pnpm dev --filter=@autamedica/web-app',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '3000'
      }
    },
    {
      command: 'pnpm dev --filter=@autamedica/doctors',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '3001'
      }
    },
    {
      command: 'pnpm dev --filter=@autamedica/patients',
      url: 'http://localhost:3002',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '3002'
      }
    },
    {
      command: 'pnpm dev --filter=@autamedica/companies',
      url: 'http://localhost:3003',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '3003'
      }
    }
  ],

  /* Global timeout */
  timeout: 60 * 1000,

  /* Global expect timeout */
  expect: {
    timeout: 10 * 1000
  }
});