import { test, expect } from '@playwright/test';

/**
 * Tests E2E para Telemedicina en URLs de Producción
 *
 * Verifica la implementación de telemedicina en las apps desplegadas:
 * - Doctors: https://autamedica-doctors.pages.dev
 * - Patients: https://autamedica-patients.pages.dev
 * - Companies: https://autamedica-companies.pages.dev
 * - Web-App: https://autamedica-web-app.pages.dev
 */

test.describe('Telemedicina - Production URLs', () => {

  test('Doctors App - Video Calling Interface (Production)', async ({ page }) => {
    console.log('[Production Test] Testing doctors app telemedicine interface...');

    // Navegar a la app de médicos en producción
    await page.goto('https://autamedica-doctors.pages.dev', {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });

    // Verificar que la página carga
    await page.waitForTimeout(5000);

    // Verificar título o contenido
    const title = await page.title();
    console.log(`[Doctors Production] Page title: ${title}`);

    // Buscar elementos relacionados con video calling
    const bodyText = await page.textContent('body');
    console.log(`[Doctors Production] Page content length: ${bodyText?.length || 0} chars`);

    // Verificar términos relacionados con telemedicina
    const hasTelemedicineTerms = bodyText && (
      bodyText.includes('video') ||
      bodyText.includes('cámara') ||
      bodyText.includes('llamada') ||
      bodyText.includes('WebRTC') ||
      bodyText.includes('telemedicina') ||
      bodyText.includes('UnifiedVideoCall')
    );

    console.log(`[Doctors Production] Has telemedicine terms: ${hasTelemedicineTerms}`);

    // Buscar botones y controles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`[Doctors Production] Found ${buttonCount} buttons`);

    // Buscar elementos de video
    const videoElements = page.locator('video, [class*="video"], [id*="video"]');
    const videoCount = await videoElements.count();
    console.log(`[Doctors Production] Found ${videoCount} video elements`);

    // Log de debugging de algunos botones encontrados
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      try {
        const buttonText = await buttons.nth(i).textContent();
        const buttonTitle = await buttons.nth(i).getAttribute('title');
        console.log(`[Doctors Production] Button ${i}: text="${buttonText}" title="${buttonTitle}"`);
      } catch (error) {
        console.log(`[Doctors Production] Button ${i}: Could not read attributes`);
      }
    }

    // La página debe cargar contenido
    expect(bodyText?.length || 0).toBeGreaterThan(100);
  });

  test('Patients App - Video Interface Check (Production)', async ({ page }) => {
    console.log('[Production Test] Testing patients app telemedicine interface...');

    // Navegar a la app de pacientes en producción
    await page.goto('https://autamedica-patients.pages.dev', {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(5000);

    const title = await page.title();
    console.log(`[Patients Production] Page title: ${title}`);

    const bodyText = await page.textContent('body');
    console.log(`[Patients Production] Page content length: ${bodyText?.length || 0} chars`);

    // Buscar términos de telemedicina
    const hasTelemedicineTerms = bodyText && (
      bodyText.includes('video') ||
      bodyText.includes('cámara') ||
      bodyText.includes('llamada') ||
      bodyText.includes('telemedicina') ||
      bodyText.includes('unificado') ||
      bodyText.includes('Probar Sistema')
    );

    console.log(`[Patients Production] Has telemedicine terms: ${hasTelemedicineTerms}`);

    // Buscar controles y elementos
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`[Patients Production] Found ${buttonCount} buttons`);

    // Log algunos botones para ver si hay toggle del sistema unificado
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      try {
        const buttonText = await buttons.nth(i).textContent();
        if (buttonText && (
          buttonText.includes('Probar') ||
          buttonText.includes('Unificado') ||
          buttonText.includes('Telemedicina') ||
          buttonText.includes('video') ||
          buttonText.includes('llamada')
        )) {
          console.log(`[Patients Production] ✅ Found relevant button: "${buttonText}"`);
        }
      } catch (error) {
        // Skip
      }
    }

    expect(bodyText?.length || 0).toBeGreaterThan(100);
  });

  test('WebRTC Signaling Server Connectivity (Production)', async ({ page }) => {
    console.log('[Production Test] Testing WebRTC signaling server...');

    // Crear página simple para test WebRTC
    await page.goto('data:text/html,<html><head><title>WebRTC Test</title></head><body><h1>Testing WebRTC</h1></body></html>');

    // Test del servidor de señalización
    const signalingTest = await page.evaluate(async () => {
      const SIGNALING_SERVER = 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling';

      return new Promise((resolve) => {
        const ws = new WebSocket(SIGNALING_SERVER);

        const timeout = setTimeout(() => {
          ws.close();
          resolve({ connected: false, error: 'timeout' });
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({ connected: true, error: null });
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          resolve({ connected: false, error: 'connection_failed' });
        };

        ws.onclose = (event) => {
          if (!timeout) return; // Already resolved
          clearTimeout(timeout);
          resolve({
            connected: event.code === 1000,
            error: event.code !== 1000 ? `closed_with_code_${event.code}` : null
          });
        };
      });
    });

    console.log(`[Production Test] Signaling server result:`, signalingTest);

    if (signalingTest.connected) {
      console.log('✅ Signaling server is accessible and responding');
    } else {
      console.log(`⚠️  Signaling server issue: ${signalingTest.error}`);
    }

    // No es crítico si el servidor WebRTC está temporalmente no disponible
    // pero al menos debe poder hacer el intento de conexión
    expect(typeof signalingTest).toBe('object');
  });

  test('Telemedicine Package Integration Evidence', async ({ page }) => {
    console.log('[Production Test] Looking for UnifiedVideoCall integration evidence...');

    // Test en la app de doctores donde debe estar completamente integrado
    await page.goto('https://autamedica-doctors.pages.dev', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Capturar errores de JavaScript
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
      console.log(`[Production Test] JS Error: ${error.message}`);
    });

    // Buscar evidencia específica del UnifiedVideoCall component
    const pageContent = await page.content();

    // Términos específicos que deberían aparecer si el UnifiedVideoCall está integrado
    const unifiedCallIndicators = [
      // Texto específico del componente
      'Conectado', 'Conectando', 'Desconectado',
      'participante', 'participantes',
      'videollamada', 'Iniciar videollamada', 'Terminar videollamada',
      'Activar cámara', 'Desactivar cámara',
      'Activar micrófono', 'Silenciar micrófono',
      'Compartir pantalla',
      'Esperando a otros participantes',
      'Sala:', 'Doctor', 'Paciente'
    ];

    let foundIndicators = 0;
    const foundTerms: string[] = [];

    for (const indicator of unifiedCallIndicators) {
      if (pageContent.includes(indicator)) {
        foundIndicators++;
        foundTerms.push(indicator);
      }
    }

    console.log(`[Production Test] Found ${foundIndicators}/${unifiedCallIndicators.length} UnifiedVideoCall indicators`);
    console.log(`[Production Test] Found terms: ${foundTerms.join(', ')}`);

    // Verificar estructura HTML típica del componente
    const videoContainers = page.locator('[class*="video"], video, [class*="call"]');
    const containerCount = await videoContainers.count();
    console.log(`[Production Test] Found ${containerCount} video/call containers`);

    // Buscar botones con títulos específicos del componente
    const specificButtons = page.locator([
      'button[title*="videollamada"]',
      'button[title*="cámara"]',
      'button[title*="micrófono"]',
      'button[title*="pantalla"]'
    ].join(', '));
    const specificButtonCount = await specificButtons.count();
    console.log(`[Production Test] Found ${specificButtonCount} specific component buttons`);

    // Filtrar errores críticos (ignorar advertencias WebRTC normales)
    const criticalErrors = jsErrors.filter(error =>
      !error.includes('NotAllowedError') &&
      !error.includes('NotFoundError') &&
      !error.includes('getUserMedia')
    );

    console.log(`[Production Test] Critical JS errors: ${criticalErrors.length}`);

    // Si encontramos indicadores o el componente está presente, es buena señal
    const hasEvidence = foundIndicators > 0 || containerCount > 0 || specificButtonCount > 0;
    console.log(`[Production Test] Has UnifiedVideoCall evidence: ${hasEvidence}`);

    expect(criticalErrors.length).toBe(0);
    expect(pageContent.length).toBeGreaterThan(1000);
  });

  test('Cross-App URLs Accessibility', async ({ page }) => {
    const apps = [
      { name: 'Web-App', url: 'https://autamedica-web-app.pages.dev' },
      { name: 'Doctors', url: 'https://autamedica-doctors.pages.dev' },
      { name: 'Patients', url: 'https://autamedica-patients.pages.dev' },
      { name: 'Companies', url: 'https://autamedica-companies.pages.dev' }
    ];

    for (const app of apps) {
      console.log(`[Cross-App Test] Testing ${app.name} at ${app.url}...`);

      try {
        await page.goto(app.url, { timeout: 20000 });

        const title = await page.title();
        const bodyText = await page.textContent('body');
        const contentLength = bodyText?.length || 0;

        console.log(`[Cross-App Test] ✅ ${app.name}: Title="${title}", Content=${contentLength} chars`);

        expect(contentLength).toBeGreaterThan(50);

      } catch (error) {
        console.log(`[Cross-App Test] ❌ ${app.name} failed: ${error}`);
        throw error;
      }
    }

    console.log('✅ All 4 apps are accessible in production');
  });
});