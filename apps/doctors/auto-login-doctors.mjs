#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('🏥 Iniciando automatización del portal de Médicos...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Ir directamente a login con rol de doctor
    console.log('📍 Paso 1: Navegando a login de médicos...');
    await page.goto('http://localhost:3005/auth/login?role=doctor');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/doctors-1-pre-login.png' });

    // 2. Hacer login
    console.log('🔐 Paso 2: Iniciando sesión...');

    // Verificar que estamos en la página de login correcta
    console.log('📍 URL de login:', page.url());

    await page.fill('input[type="email"]', 'doctor.test@autamedica.test');
    await page.fill('input[type="password"]', 'TestDoctor2025!');
    await page.screenshot({ path: '/tmp/doctors-2-credentials.png' });

    // Wait for any navigation or error after submit
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
    await page.click('button[type="submit"]');
    console.log('✅ Botón submit clickeado');

    // Esperar navegación o timeout
    const navResult = await navigationPromise;
    console.log('🔄 Navegación completada:', navResult ? 'Sí' : 'Timeout (posible SPA)');

    // Esperar estabilización
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    console.log('📍 URL después de submit:', page.url());
    await page.screenshot({ path: '/tmp/doctors-3-after-login.png' });

    // 3. Esperar a que la sesión se establezca y la página cargue completamente
    console.log('🔍 Paso 3: Esperando que se establezca la sesión...');

    // Esperar a que la URL esté en localhost:3001 (doctors app)
    await page.waitForFunction(() => {
      return window.location.hostname === 'localhost' && window.location.port === '3001';
    }, { timeout: 10000 });

    // Dar tiempo para que los tokens se procesen y la sesión se establezca
    await page.waitForTimeout(3000);

    // Marcar onboarding como completado en localStorage
    try {
      await page.evaluate(() => {
        localStorage.setItem('autamedica_doctor_onboarding_completed', 'true');
      });
      console.log('✅ Onboarding marcado como completado en localStorage');
    } catch (error) {
      console.log('⚠️  Error al configurar localStorage:', error.message);
    }

    // Esperar un poco más para que la interfaz se renderice completamente
    await page.waitForTimeout(2000);

    console.log('✅ Dashboard cargado');
    console.log('📍 URL final:', page.url());
    await page.screenshot({ path: '/tmp/doctors-4-dashboard.png' });

    // 4. Explorar el dashboard de médicos
    console.log('🎯 Paso 4: Explorando dashboard de médicos...');

    // Tomar screenshot del estado inicial
    await page.screenshot({ path: '/tmp/doctors-5-dashboard-full.png', fullPage: true });

    // 5. Intentar activar cámara para iniciar videollamada
    console.log('📹 Paso 5: Iniciando videollamada...');
    try {
      // Primero intentar con "Activar cámara directamente"
      let cameraButton = await page.$('button:has-text("Activar cámara directamente")');

      if (!cameraButton) {
        // Si no, buscar "Activar cámara"
        cameraButton = await page.$('button:has-text("Activar cámara")');
      }

      if (!cameraButton) {
        // Si no, buscar "O activar cámara directamente"
        cameraButton = await page.$('button:has-text("O activar cámara")');
      }

      if (cameraButton) {
        console.log('✅ Encontrado botón de cámara, haciendo clic...');
        await cameraButton.click();

        // Esperar a que la cámara se active
        await page.waitForTimeout(3000);

        // Verificar si hay video activo
        const videoElement = await page.$('video');
        if (videoElement) {
          console.log('✅ ¡Videollamada iniciada exitosamente! Se detectó elemento video.');
          await page.screenshot({ path: '/tmp/doctors-6-video-call-active.png' });
        } else {
          console.log('⚠️  Botón clickeado pero no se detectó elemento video');
          await page.screenshot({ path: '/tmp/doctors-6-camera-clicked.png' });
        }
      } else {
        console.log('ℹ️  No se encontró botón de activar cámara');
        await page.screenshot({ path: '/tmp/doctors-6-no-camera-button.png' });
      }
    } catch (error) {
      console.log('⚠️  Error al activar cámara:', error.message);
      await page.screenshot({ path: '/tmp/doctors-6-camera-error.png' });
    }

    // 6. Verificar elementos del dashboard
    console.log('📊 Paso 6: Verificando elementos del dashboard...');
    const pageContent = await page.content();

    if (pageContent.includes('Videoconsulta') || pageContent.includes('videoconsulta')) {
      console.log('✅ Dashboard de videoconsulta detectado');
    }

    if (pageContent.includes('Notas') || pageContent.includes('notas')) {
      console.log('✅ Sección de notas médicas detectada');
    }

    if (pageContent.includes('Prescribir') || pageContent.includes('prescribir')) {
      console.log('✅ Sección de prescripciones detectada');
    }

    console.log('\n✅ Automatización del portal de médicos completada exitosamente!');
    console.log('\n📸 Screenshots guardados en:');
    console.log('   - /tmp/doctors-1-pre-login.png');
    console.log('   - /tmp/doctors-2-credentials.png');
    console.log('   - /tmp/doctors-3-after-login.png');
    console.log('   - /tmp/doctors-4-dashboard.png');
    console.log('   - /tmp/doctors-5-dashboard-full.png');
    console.log('   - /tmp/doctors-6-video-call-active.png (si aplica)');

    // Mantener el navegador abierto por 5 segundos para observar
    console.log('\n⏳ Manteniendo navegador abierto por 5 segundos...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error durante la automatización:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
