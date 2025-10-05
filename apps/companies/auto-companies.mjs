#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('🏢 Automatización Companies - Acceso al portal empresarial...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capturar mensajes de consola
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`[Browser error]:`, msg.text());
      }
    });

    // Navegar al dashboard de empresas
    console.log('📍 Navegando al portal de empresas...');
    await page.goto('http://localhost:3004/');
    await page.waitForTimeout(2000);

    console.log('📍 URL actual:', page.url());

    // Verificar si fuimos redirigidos a auth
    if (page.url().includes('localhost:3005')) {
      console.log('✅ Redirigido a autenticación');

      // Esperar que cargue la página de auth
      await page.waitForLoadState('networkidle');

      // Login
      console.log('🔐 Iniciando sesión como administrador de empresa...');
      await page.fill('input[type="email"]', 'company.test@autamedica.test');
      await page.fill('input[type="password"]', 'TestCompany2025!');
      await page.click('button[type="submit"]');

      console.log('⏳ Esperando redirección al dashboard...');

      // Esperar a llegar al dashboard (puerto 3004)
      await page.waitForFunction(() => {
        return window.location.hostname === 'localhost' &&
               window.location.port === '3004';
      }, { timeout: 15000 });

      await page.waitForTimeout(3000);
      console.log('✅ Llegamos al dashboard de empresas');
      console.log('📍 URL:', page.url());
    }

    // Captura del dashboard
    await page.screenshot({ path: '/tmp/companies-dashboard.png', fullPage: true });

    // Buscar elementos característicos del dashboard de empresas
    console.log('\n🔍 Explorando dashboard de empresas...');

    // Buscar botones o enlaces de marketplace
    const marketplaceButton = await page.locator('button:has-text("marketplace")').first();
    if (await marketplaceButton.count() > 0) {
      console.log('✅ Botón de Marketplace encontrado');
      await marketplaceButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/companies-marketplace.png', fullPage: true });
      console.log('📸 Captura de Marketplace guardada');
    }

    // Buscar elementos de gestión de crisis
    const crisisElements = await page.locator('text=/crisis|emergency|emergencia/i').all();
    if (crisisElements.length > 0) {
      console.log(`✅ Encontrados ${crisisElements.length} elementos relacionados con gestión de crisis`);
    }

    // Buscar métricas o estadísticas
    const metricsElements = await page.locator('[class*="metric"], [class*="stat"], [class*="card"]').all();
    console.log(`📊 Elementos de métricas/estadísticas encontrados: ${metricsElements.length}`);

    console.log('\n✅✅✅ ¡ÉXITO! Portal de empresas accesible y funcional');

    await page.screenshot({ path: '/tmp/companies-final-state.png', fullPage: true });

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
