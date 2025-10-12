import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables desde .env.local para que el runner tenga SUPABASE_* disponibles
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config();

export default defineConfig({
  testDir: 'e2e',
  reporter: 'line',
  timeout: 30_000,
  // Configuración base para todos los proyectos
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
  },
  // Proyectos separados para evitar levantar servicios innecesarios
  projects: [
    {
      name: 'API',
      testMatch: /api-.*\.spec\.ts$/,
      // Solo necesita levantar Patients
      webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3002',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'UI',
      testMatch: /ui-.*\.spec\.ts$/,
      retries: 1,
      workers: 1,
      use: {
        trace: 'on-first-retry',
      },
      // UI requiere Auth y Patients
      webServer: [
        {
          command: 'pnpm dev',
          url: 'http://localhost:3002',
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'pnpm -w --silent --filter @autamedica/auth-app dev',
          url: 'http://localhost:3005',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
    },
  ],
});
