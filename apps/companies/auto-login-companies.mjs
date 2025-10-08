#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('🏢 Iniciando automatización del portal de Empresas...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Ir a la página de login
    console.log('📍 Paso 1: Navegando a login de empresas...');
    await page.goto('http://localhost:3005/auth/login?portal=empresa');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/companies-1-pre-login.png' });

    // 2. Seleccionar rol de empresa
    console.log('🏢 Paso 2: Seleccionando rol de administrador de empresa...');
    const empresaButton = await page.locator('text=Administrador de Empresa').first();
    await empresaButton.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/companies-2-role-selected.png' });

    // 3. Hacer login
    console.log('🔐 Paso 3: Iniciando sesión...');
    await page.fill('input[type="email"]', 'empresa.test@autamedica.test');
    await page.fill('input[type="password"]', 'TestEmpresa2025!');
    await page.screenshot({ path: '/tmp/companies-3-credentials.png' });

    await page.click('button[type="submit"]');
    console.log('⏳ Esperando redirección...');
    await page.waitForLoadState('networkidle');

    // Esperar a que la redirección complete
    await page.waitForTimeout(2000);

    console.log('📍 URL actual:', page.url());
    await page.screenshot({ path: '/tmp/companies-4-after-login.png' });

    // 4. Verificar si hay modal de onboarding y cerrarlo
    console.log('🔍 Paso 4: Verificando modal de onboarding...');

    // Marcar onboarding como completado en localStorage
    await page.evaluate(() => {
      localStorage.setItem('autamedica_company_onboarding_completed', 'true');
    });

    // Recargar para aplicar el cambio de localStorage
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('✅ Dashboard sin onboarding');
    await page.screenshot({ path: '/tmp/companies-5-dashboard.png' });

    // 5. Explorar el Centro de Control de Crisis
    console.log('🚨 Paso 5: Explorando Centro de Control de Crisis...');

    // Tomar screenshot del estado inicial (Crisis Control)
    await page.screenshot({ path: '/tmp/companies-6-crisis-control.png', fullPage: true });

    // 6. Verificar elementos del dashboard de crisis
    console.log('📊 Paso 6: Verificando elementos del dashboard de crisis...');
    const crisisContent = await page.content();

    if (crisisContent.includes('Crisis') || crisisContent.includes('crisis')) {
      console.log('✅ Centro de Control de Crisis detectado');
    }

    if (crisisContent.includes('Incidente') || crisisContent.includes('incidente')) {
      console.log('✅ Gestión de incidentes detectada');
    }

    if (crisisContent.includes('Alerta') || crisisContent.includes('alerta')) {
      console.log('✅ Sistema de alertas detectado');
    }

    // 7. Cambiar a Marketplace (si existe el toggle)
    console.log('💼 Paso 7: Intentando cambiar a Marketplace...');
    try {
      // Buscar botón o toggle de Marketplace
      const marketplaceButton = await page.$('button:has-text("Marketplace")');
      if (marketplaceButton) {
        console.log('✅ Encontrado botón de Marketplace, haciendo clic...');
        await marketplaceButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '/tmp/companies-7-marketplace.png', fullPage: true });

        const marketplaceContent = await page.content();
        if (marketplaceContent.includes('Marketplace') || marketplaceContent.includes('marketplace')) {
          console.log('✅ Marketplace cargado correctamente');
        }

        // Volver a Crisis Control
        const crisisButton = await page.$('button:has-text("Crisis")');
        if (crisisButton) {
          console.log('↩️  Volviendo a Crisis Control...');
          await crisisButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '/tmp/companies-8-back-to-crisis.png' });
        }
      } else {
        console.log('ℹ️  No se encontró botón de Marketplace, puede estar en sección diferente');
      }
    } catch (error) {
      console.log('⚠️  Error al cambiar a Marketplace:', error.message);
    }

    console.log('\n✅ Automatización del portal de empresas completada exitosamente!');
    console.log('\n📸 Screenshots guardados en:');
    console.log('   - /tmp/companies-1-pre-login.png');
    console.log('   - /tmp/companies-2-role-selected.png');
    console.log('   - /tmp/companies-3-credentials.png');
    console.log('   - /tmp/companies-4-after-login.png');
    console.log('   - /tmp/companies-5-dashboard.png');
    console.log('   - /tmp/companies-6-crisis-control.png');
    console.log('   - /tmp/companies-7-marketplace.png (si aplica)');
    console.log('   - /tmp/companies-8-back-to-crisis.png (si aplica)');

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
