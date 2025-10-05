import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración simplificada para tests de Doctor Login + Videollamada
 * Sin web servers automáticos - usa servicios existentes
 */

export default defineConfig({
  testDir: './',
  testMatch: '**/doctor-login-videocall-flow.spec.ts',
  
  // Timeouts optimizados para WebRTC
  timeout: 60 * 1000, // 60 segundos por test
  expect: {
    timeout: 10 * 1000, // 10 segundos para expectaciones
  },
  
  // Configuración de retry para tests de WebRTC
  retries: 1,
  
  // Workers para tests paralelos
  workers: 1,
  
  // Reporter para capturar logs detallados
  reporter: [
    ['html', { outputFolder: 'playwright-report-doctor-videocall' }],
    ['json', { outputFile: 'test-results-doctor-videocall.json' }],
    ['line']
  ],
  
  // Configuración global para todos los tests
  use: {
    // Base URL para tests - usar servicios existentes
    baseURL: 'http://localhost:3001', // Usar doctors app que está corriendo
    
    // Configuración de trace para debugging
    trace: 'on-first-retry',
    
    // Screenshots y videos para debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Configuración de viewport para videollamadas
    viewport: { width: 1280, height: 720 },
    
    // Configuración de geolocation (para tests de telemedicina)
    geolocation: { latitude: -0.2299, longitude: -78.5249 }, // Quito, Ecuador
    
    // Configuración de timezone
    timezoneId: 'America/Guayaquil',
    
    // Configuración de locale
    locale: 'es-EC',
    
    // Configuración de permisos para WebRTC
    permissions: ['camera', 'microphone', 'geolocation'],
    
    // Configuración de user agent
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Configuración de headers
    extraHTTPHeaders: {
      'Accept-Language': 'es-EC,es;q=0.9,en;q=0.8',
    },
    
    // Configuración de ignore HTTPS errors para desarrollo
    ignoreHTTPSErrors: true,
    
    // Configuración de action timeout
    actionTimeout: 10000,
    
    // Configuración de navigation timeout
    navigationTimeout: 30000,
  },

  // Configuración de proyectos para diferentes escenarios
  projects: [
    {
      name: 'doctor-videocall-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para Chrome
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--enable-features=WebRTC',
            '--autoplay-policy=no-user-gesture-required',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
    }
  ],

  // NO usar web servers automáticos - usar servicios existentes
  webServer: undefined,
});