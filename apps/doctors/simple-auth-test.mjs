#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('🏥 Test simplificado de autenticación...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capturar mensajes de consola para debugging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[Browser ${type}]:`, msg.text());
      }
    });

    // Capturar errores de página
    page.on('pageerror', error => {
      console.log('[Page Error]:', error.message);
    });

    // Navegar directamente al dashboard de médicos
    // La middleware debería redirigir a auth si no hay sesión
    console.log('📍 Navegando directamente a doctors dashboard...');
    await page.goto('http://localhost:3001/');

    // Esperar a que redirecte a auth
    await page.waitForTimeout(2000);
    console.log('📍 URL actual:', page.url());
    await page.screenshot({ path: '/tmp/test-1-redirected.png' });

    // Si estamos en la página de auth, hacer login
    if (page.url().includes('localhost:3005')) {
      console.log('✅ Redirigido correctamente a auth');

      // Esperar a que la página cargue
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/test-2-auth-page.png' });

      // Si estamos en select-role, seleccionar médico
      if (page.url().includes('select-role')) {
        console.log('📋 En página de selección de rol, clickeando Médico...');
        await page.click('button:has-text("Médico"), div:has-text("Médico")');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('📍 URL después de seleccionar rol:', page.url());
      }

      // Ahora deberíamos estar en login
      console.log('🔐 Llenando formulario de login...');
      await page.fill('input[type="email"]', 'doctor.test@autamedica.test');
      await page.fill('input[type="password"]', 'TestDoctor2025!');
      await page.screenshot({ path: '/tmp/test-3-filled-form.png' });

      // Submit
      await page.click('button[type="submit"]');
      console.log('✅ Formulario enviado, esperando...');

      // Esperar navegación
      await page.waitForTimeout(5000);
      await page.waitForLoadState('networkidle');

      console.log('📍 URL final:', page.url());
      await page.screenshot({ path: '/tmp/test-4-after-submit.png' });

      // Verificar si hay mensajes de error en la página
      const errorText = await page.textContent('body').catch(() => '');
      if (errorText.toLowerCase().includes('error')) {
        console.log('⚠️  Posible error detectado en la página');
        // Buscar divs de error
        const errorDiv = await page.$('[class*="error"], [class*="Error"], .text-red');
        if (errorDiv) {
          const errorMsg = await errorDiv.textContent();
          console.log('❌ Mensaje de error:', errorMsg);
        }
      }

      // Verificar si llegamos al dashboard
      if (page.url().includes('localhost:3001')) {
        console.log('✅✅✅ ¡Éxito! Estamos en el dashboard de médicos');

        // Buscar botón de cámara
        await page.waitForTimeout(2000);
        const cameraButton = await page.$('button:has-text("cámara")');
        if (cameraButton) {
          console.log('📹 Botón de cámara encontrado!');
        } else {
          console.log('⚠️  Botón de cámara no encontrado, pero estamos en el dashboard');
        }

        await page.screenshot({ path: '/tmp/test-5-dashboard.png', fullPage: true });
      } else {
        console.log('❌ No llegamos al dashboard, URL:', page.url());
      }
    }

    console.log('\n⏳ Manteniendo navegador abierto por 10 segundos...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
