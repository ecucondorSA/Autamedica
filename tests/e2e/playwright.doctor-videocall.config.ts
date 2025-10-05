import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const isMockMode = process.env.MOCK_AUTAMEDICA === '1';

export default defineConfig({
  testDir: path.join(__dirname, '.'),
  testMatch: '**/doctor-login-videocall-flow.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['json', { outputFile: 'test-reports-complete/results.json' }]],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['camera', 'microphone']
  },
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: {
        args: [
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    }
  }],
  timeout: 60000,
  // Disable web servers in mock mode
  webServer: isMockMode ? undefined : undefined
});
