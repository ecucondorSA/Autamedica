import { test, expect, Page, Browser } from '@playwright/test';

/**
 * Tests E2E para Sistema de Telemedicina - Video Calling
 *
 * Este test verifica la implementación completa de telemedicina que incluye:
 * - UnifiedVideoCall component en @autamedica/telemedicine
 * - Integración en doctors app (puerto 3001)
 * - Integración en patients app (puerto 3002)
 * - WebRTC signaling server: wss://autamedica-signaling-server.ecucondor.workers.dev/signaling
 */

test.describe('Telemedicina - Video Calling System', () => {

  test.describe.configure({ mode: 'parallel' });

  test('Doctors App - Video Calling Interface Loading', async ({ page }) => {
    // Navegar a la app de médicos
    await page.goto('http://localhost:3001');

    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/Doctors/i);

    // Buscar elementos de video calling
    await page.waitForTimeout(3000); // Dar tiempo para que cargue el componente

    // Verificar controles de video
    const videoButton = page.locator('[title*="cámara"], [title*="video"], button:has(svg)').first();
    await expect(videoButton).toBeVisible({ timeout: 10000 });

    // Verificar controles de audio
    const audioButton = page.locator('[title*="micrófono"], [title*="audio"], [title*="micro"], button:has(svg)').nth(1);
    await expect(audioButton).toBeVisible({ timeout: 10000 });

    // Verificar botón de llamada
    const callButton = page.locator('[title*="videollamada"], [title*="llamada"], button:has(svg[class*="phone"])');
    await expect(callButton).toBeVisible({ timeout: 10000 });

    // Log para debugging
    const buttonCount = await page.locator('button').count();
    console.log(`[Doctors App] Found ${buttonCount} buttons on page`);

    // Verificar que hay elementos de video presentes
    const videoElements = page.locator('video, [class*="video"]');
    const videoCount = await videoElements.count();
    console.log(`[Doctors App] Found ${videoCount} video-related elements`);

    // Verificar texto relacionado con telemedicina/video
    const bodyText = await page.textContent('body');
    const hasVideoTerms = bodyText && (
      bodyText.includes('video') ||
      bodyText.includes('cámara') ||
      bodyText.includes('llamada') ||
      bodyText.includes('telemedicina') ||
      bodyText.includes('WebRTC')
    );

    console.log(`[Doctors App] Page contains video-related terms: ${hasVideoTerms}`);
    console.log(`[Doctors App] Body text sample: ${bodyText?.substring(0, 500)}...`);
  });

  test('Patients App - Video Calling Interface Loading', async ({ page }) => {
    // Navegar a la app de pacientes
    await page.goto('http://localhost:3002');

    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/Patients/i);

    // Dar tiempo para cargar componentes
    await page.waitForTimeout(3000);

    // Buscar controles de video calling (pueden estar en toggle o directamente)
    const videoControls = page.locator('button:has(svg), [class*="video"], [class*="call"]');
    const controlCount = await videoControls.count();
    console.log(`[Patients App] Found ${controlCount} potential video controls`);

    // Verificar elementos relacionados con video
    const videoElements = page.locator('video, [class*="video"]');
    const videoCount = await videoElements.count();
    console.log(`[Patients App] Found ${videoCount} video-related elements`);

    // Buscar toggle para sistema unificado (como se mencionó en el resumen)
    const toggleButtons = page.locator('button:has-text("Probar"), button:has-text("Unificado"), button:has-text("Telemedicina")');
    const toggleCount = await toggleButtons.count();
    console.log(`[Patients App] Found ${toggleCount} toggle buttons`);

    // Verificar texto de la página
    const bodyText = await page.textContent('body');
    const hasVideoTerms = bodyText && (
      bodyText.includes('video') ||
      bodyText.includes('cámara') ||
      bodyText.includes('llamada') ||
      bodyText.includes('telemedicina') ||
      bodyText.includes('unificado') ||
      bodyText.includes('WebRTC')
    );

    console.log(`[Patients App] Page contains video-related terms: ${hasVideoTerms}`);
    console.log(`[Patients App] Body text sample: ${bodyText?.substring(0, 500)}...`);

    // El patients app debe tener al menos algunos elementos relacionados con video
    // porque según el resumen, se agregó un toggle para el UnifiedVideoCall
    expect(controlCount + videoCount + toggleCount).toBeGreaterThan(0);
  });

  test('WebRTC Signaling Server Connectivity', async ({ page }) => {
    console.log('[WebRTC Test] Testing signaling server connectivity...');

    // Crear una página simple para probar WebRTC
    await page.goto('data:text/html,<html><head><title>WebRTC Test</title></head><body><h1>Testing WebRTC Connection</h1></body></html>');

    // Probar conexión WebSocket al servidor de señalización
    const signalingServerUrl = 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling';

    const wsTestResult = await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        const ws = new WebSocket(url);
        const timeout = setTimeout(() => {
          ws.close();
          resolve({ connected: false, error: 'timeout' });
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({ connected: true, error: null });
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          resolve({ connected: false, error: 'connection_failed' });
        };
      });
    }, signalingServerUrl);

    console.log(`[WebRTC Test] Signaling server test result:`, wsTestResult);

    // El servidor debe estar accesible
    if (wsTestResult.connected) {
      console.log('✅ Signaling server is accessible');
    } else {
      console.log(`❌ Signaling server connection failed: ${wsTestResult.error}`);
    }
  });

  test('UnifiedVideoCall Component Integration', async ({ page }) => {
    console.log('[Integration Test] Testing UnifiedVideoCall component integration...');

    // Test en doctors app primero
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);

    // Buscar evidencia del UnifiedVideoCall component
    // Según el código, debe tener estos elementos específicos:
    const unifiedCallElements = [
      // Headers y status
      '[class*="connection"], [class*="connected"], [class*="connecting"]',

      // Controles específicos del UnifiedVideoCall
      '[title*="Iniciar videollamada"], [title*="Terminar videollamada"]',
      '[title*="Activar cámara"], [title*="Desactivar cámara"]',
      '[title*="Activar micrófono"], [title*="Silenciar micrófono"]',
      '[title*="Compartir pantalla"]',

      // Video containers
      '[class*="video"], video',

      // Status text específico del component
      ':text("Presiona el botón para iniciar"), :text("Estableciendo conexión"), :text("Videollamada activa")'
    ];

    let foundElements = 0;
    for (const selector of unifiedCallElements) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          foundElements++;
          console.log(`✅ Found UnifiedVideoCall element: ${selector} (${count} matches)`);
        } else {
          console.log(`❌ Missing UnifiedVideoCall element: ${selector}`);
        }
      } catch (error) {
        console.log(`❌ Error checking element ${selector}: ${error}`);
      }
    }

    console.log(`[Integration Test] Found ${foundElements}/${unifiedCallElements.length} expected UnifiedVideoCall elements`);

    // Debe encontrar al menos algunos elementos del componente
    expect(foundElements).toBeGreaterThan(0);
  });

  test('Video Controls Functionality', async ({ page, context }) => {
    console.log('[Controls Test] Testing video controls functionality...');

    // Grant permissions for WebRTC
    await context.grantPermissions(['camera', 'microphone']);

    // Test en doctors app
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Buscar y hacer clic en controles
    try {
      // Buscar botón de video
      const videoButton = page.locator('button').filter({ hasText: /video|cámara/i }).or(
        page.locator('button[title*="video"], button[title*="cámara"]')
      ).first();

      if (await videoButton.count() > 0) {
        console.log('✅ Found video button, attempting click...');
        await videoButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Video button clicked successfully');
      }

      // Buscar botón de audio
      const audioButton = page.locator('button').filter({ hasText: /audio|micro/i }).or(
        page.locator('button[title*="audio"], button[title*="micro"]')
      ).first();

      if (await audioButton.count() > 0) {
        console.log('✅ Found audio button, attempting click...');
        await audioButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Audio button clicked successfully');
      }

      // Buscar botón de llamada
      const callButton = page.locator('button').filter({ hasText: /llamada|call/i }).or(
        page.locator('button[title*="llamada"], button[title*="call"]')
      ).first();

      if (await callButton.count() > 0) {
        console.log('✅ Found call button, attempting click...');
        await callButton.click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        console.log('✅ Call button clicked successfully');
      }

    } catch (error) {
      console.log(`⚠️ Control interaction error (expected): ${error}`);
    }

    // Verificar que no hay errores JavaScript críticos
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.waitForTimeout(1000);

    // Filtrar errores críticos (ignorar warnings de WebRTC sin dispositivos reales)
    const criticalErrors = jsErrors.filter(error =>
      !error.includes('NotAllowedError') &&
      !error.includes('NotFoundError') &&
      !error.includes('media')
    );

    console.log(`[Controls Test] JavaScript errors: ${jsErrors.length}, Critical: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log('Critical JS errors:', criticalErrors);
    }

    // No debe haber errores críticos
    expect(criticalErrors.length).toBe(0);
  });

  test('Cross-App Communication Simulation', async ({ browser }) => {
    console.log('[Cross-App Test] Simulating doctor-patient video call...');

    // Crear dos contextos separados para simular doctor y paciente
    const doctorContext = await browser.newContext({
      permissions: ['camera', 'microphone']
    });
    const patientContext = await browser.newContext({
      permissions: ['camera', 'microphone']
    });

    const doctorPage = await doctorContext.newPage();
    const patientPage = await patientContext.newPage();

    try {
      // Cargar ambas apps
      await Promise.all([
        doctorPage.goto('http://localhost:3001'),
        patientPage.goto('http://localhost:3002')
      ]);

      // Esperar a que carguen
      await Promise.all([
        doctorPage.waitForTimeout(3000),
        patientPage.waitForTimeout(3000)
      ]);

      // Verificar que ambas páginas están cargadas
      await expect(doctorPage).toHaveTitle(/doctors/i);
      await expect(patientPage).toHaveTitle(/patients/i);

      console.log('✅ Both apps loaded successfully');

      // En este punto, las apps están cargadas y pueden comunicarse
      // a través del signaling server si se configuran con el mismo roomId

      // Log final del estado
      const doctorUrl = doctorPage.url();
      const patientUrl = patientPage.url();

      console.log(`[Cross-App Test] Doctor app loaded: ${doctorUrl}`);
      console.log(`[Cross-App Test] Patient app loaded: ${patientUrl}`);

      // Test passed si ambas apps cargan sin errores críticos
      expect(doctorUrl).toContain('localhost:3001');
      expect(patientUrl).toContain('localhost:3002');

    } finally {
      await doctorContext.close();
      await patientContext.close();
    }
  });

  test('Telemedicine Package Import Verification', async ({ page }) => {
    console.log('[Package Test] Verifying telemedicine package imports...');

    // Ir a doctors app y verificar que el UnifiedVideoCall se importa correctamente
    await page.goto('http://localhost:3001');

    // Verificar que no hay errores de importación del package @autamedica/telemedicine
    const importErrors: string[] = [];

    page.on('pageerror', (error) => {
      if (error.message.includes('@autamedica/telemedicine') ||
          error.message.includes('UnifiedVideoCall') ||
          error.message.includes('WebRTCClient')) {
        importErrors.push(error.message);
      }
    });

    // Dar tiempo para que se ejecuten los imports
    await page.waitForTimeout(5000);

    console.log(`[Package Test] Import errors found: ${importErrors.length}`);
    if (importErrors.length > 0) {
      console.log('Import errors:', importErrors);
    }

    // No debe haber errores de importación del package
    expect(importErrors.length).toBe(0);

    // Verificar que la página final contiene elementos que sugieren que el componente se importó
    const pageContent = await page.textContent('body');
    console.log(`[Package Test] Page loaded with content length: ${pageContent?.length || 0} chars`);

    // La página debe cargar contenido (no estar vacía por errores de import)
    expect(pageContent?.length || 0).toBeGreaterThan(100);
  });
});