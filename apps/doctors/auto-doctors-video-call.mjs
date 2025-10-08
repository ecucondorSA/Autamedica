#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('🏥 Automatización Doctors - Inicio de videollamada...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext({
      // Permitir permisos de cámara y micrófono
      permissions: ['camera', 'microphone']
    });
    const page = await context.newPage();

    // Capturar mensajes de consola
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`[Browser error]:`, msg.text());
      }
    });

    // Navegar al dashboard de médicos
    console.log('📍 Navegando al dashboard de médicos...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });

    console.log('📍 URL actual:', page.url());

    // Verificar si fuimos redirigidos a auth
    if (page.url().includes('localhost:3005')) {
      console.log('✅ Redirigido a autenticación');

      // Login
      console.log('🔐 Iniciando sesión como médico...');
      await page.fill('input[type="email"]', 'doctor.test@autamedica.test');
      await page.fill('input[type="password"]', 'TestDoctor2025!');

      console.log('⏳ Esperando redirección al dashboard...');
      // Click submit and wait for navigation to complete
      await Promise.all([
        page.waitForURL('**/localhost:3001/**', { timeout: 30000 }),
        page.click('button[type="submit"]')
      ]);

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('✅ Llegamos al dashboard de médicos');
      console.log('📍 URL:', page.url());
    } else {
      console.log('✅ Ya estamos en el dashboard (sesión activa)');
    }

    // Ahora estamos en el dashboard, buscar el botón de cámara/video
    console.log('\n🎥 Buscando botón de iniciar videollamada...');

    // Esperar un poco más para que cargue completamente
    await page.waitForTimeout(2000);

    // Buscar el botón de "activar cámara" o similar
    const cameraButton = await page.locator('button:has-text("activar cámara")').first();

    if (await cameraButton.count() > 0) {
      console.log('✅ Botón de cámara encontrado!');
      await page.screenshot({ path: '/tmp/doctors-before-camera-click.png' });

      console.log('📹 Clickeando botón para activar cámara...');
      await cameraButton.click();

      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/doctors-after-camera-click.png' });

      console.log('✅✅✅ ¡ÉXITO! Videollamada iniciada');

      // Verificar si hay elementos de video activos
      const videoElements = await page.$$('video');
      console.log(`📹 Elementos de video encontrados: ${videoElements.length}`);

    } else {
      console.log('⚠️  Botón de cámara no encontrado');
      console.log('🔍 Buscando otros botones relacionados con video...');

      // Intentar buscar otros selectores
      const altButtons = [
        'button:has-text("video")',
        'button:has-text("call")',
        'button:has-text("llamada")',
        'button:has-text("cámara")',
        '[data-testid="video-button"]',
        '[aria-label*="video"]'
      ];

      for (const selector of altButtons) {
        const btn = await page.locator(selector).first();
        if (await btn.count() > 0) {
          console.log(`✅ Encontrado botón alternativo: ${selector}`);
          await btn.click();
          await page.waitForTimeout(2000);
          console.log('✅ Botón clickeado');
          break;
        }
      }
    }

    await page.screenshot({ path: '/tmp/doctors-final-state.png', fullPage: true });

    console.log('\n⏳ Manteniendo navegador abierto por 5 segundos...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
