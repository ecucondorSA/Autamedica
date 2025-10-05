#!/usr/bin/env node
/**
 * Auditoría detallada del portal de doctors con Playwright
 * Captura screenshots y analiza el dashboard completo
 */

import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Configuración
const DOCTORS_URL = 'http://localhost:3001/';
const AUTH_URL = 'http://localhost:3005';
const DOCTOR_EMAIL = 'doctor.test@autamedica.test';
const DOCTOR_PASSWORD = 'TestDoctor2025!';
const SCREENSHOTS_DIR = '/tmp/playwright_audit';

// Crear directorio para screenshots
try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (e) {
  // Directory exists
}

async function takeScreenshotAndAnalyze(page, stepName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📸 STEP: ${stepName}`);
  console.log('='.repeat(60));
  console.log(`URL: ${page.url()}`);
  console.log(`Title: ${await page.title()}`);

  // Screenshot
  const screenshotPath = join(SCREENSHOTS_DIR, `${stepName.replace(/\s+/g, '_')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✅ Screenshot: ${screenshotPath}`);

  // HTML
  const htmlPath = join(SCREENSHOTS_DIR, `${stepName.replace(/\s+/g, '_')}.html`);
  const html = await page.content();
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`✅ HTML: ${htmlPath}`);

  return { url: page.url(), title: await page.title() };
}

async function analyzePageStructure(page) {
  console.log('\n📊 ANÁLISIS DE ESTRUCTURA');
  console.log('='.repeat(60));

  const structure = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().substring(0, 100),
      id: b.id,
      className: b.className,
      ariaLabel: b.getAttribute('aria-label'),
      dataTestId: b.getAttribute('data-testid'),
      visible: b.offsetParent !== null
    }));

    const videos = document.querySelectorAll('video').length;
    const canvases = document.querySelectorAll('canvas').length;
    const iframes = document.querySelectorAll('iframe').length;

    return { buttons, videos, canvases, iframes };
  });

  console.log(`\n📌 Elementos encontrados:`);
  console.log(`   Botones: ${structure.buttons.length}`);
  console.log(`   Videos: ${structure.videos}`);
  console.log(`   Canvas: ${structure.canvases}`);
  console.log(`   Iframes: ${structure.iframes}`);

  console.log(`\n🔘 Listado de botones:`);
  structure.buttons.forEach((btn, i) => {
    if (i < 20) { // Primeros 20 botones
      console.log(`   ${i + 1}. "${btn.text}" (id: ${btn.id}, visible: ${btn.visible})`);
    }
  });

  return structure;
}

async function searchVideoElements(page) {
  console.log('\n🎥 BÚSQUEDA DE ELEMENTOS DE VIDEO');
  console.log('='.repeat(60));

  const videoElements = await page.evaluate(() => {
    const selectors = [
      'button:has-text("video")',
      'button:has-text("llamada")',
      'button:has-text("cámara")',
      'button:has-text("camera")',
      '[data-video]',
      '[data-call]',
      '[data-camera]',
      '[data-testid*="video"]',
      '[data-testid*="call"]',
      '[data-testid*="camera"]',
      '[class*="video"]',
      '[class*="call"]',
      '[class*="camera"]',
      '[aria-label*="video" i]',
      '[aria-label*="llamada" i]',
      'video',
      'canvas'
    ];

    const found = [];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          found.push({
            selector,
            tag: el.tagName,
            text: el.textContent?.substring(0, 100).trim(),
            id: el.id,
            className: el.className,
            ariaLabel: el.getAttribute('aria-label'),
            visible: el.offsetParent !== null
          });
        });
      } catch (e) {
        // Selector no válido, ignorar
      }
    });

    return found;
  });

  console.log(`\n✅ Elementos relacionados con video: ${videoElements.length}`);
  videoElements.forEach((el, i) => {
    console.log(`   ${i + 1}. [${el.tag}] "${el.text}" (selector: ${el.selector})`);
  });

  return videoElements;
}

async function main() {
  console.log('🏥 AUDITORÍA DETALLADA DEL PORTAL DE DOCTORS\n');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const context = await browser.newContext({
    permissions: ['camera', 'microphone']
  });

  const page = await context.newPage();

  // Capturar errores de consola
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser error]: ${msg.text()}`);
    }
  });

  try {
    // Paso 1: Navegar al portal
    console.log('📍 Paso 1: Navegando al portal de doctors...');
    await page.goto(DOCTORS_URL, { waitUntil: 'networkidle' });
    await takeScreenshotAndAnalyze(page, '01_initial_load');

    // Paso 2: Verificar redirección a auth
    if (page.url().includes('localhost:3005') || page.url().includes('/auth/login')) {
      console.log('\n✅ Redirigido a autenticación');
      await takeScreenshotAndAnalyze(page, '02_auth_redirect');

      // Paso 3: Login
      console.log('\n📍 Paso 3: Iniciando sesión...');
      await page.fill('input[type="email"]', DOCTOR_EMAIL);
      await page.fill('input[type="password"]', DOCTOR_PASSWORD);
      await takeScreenshotAndAnalyze(page, '03_before_login');

      await Promise.all([
        page.waitForURL('**/localhost:3001/**', { timeout: 30000 }),
        page.click('button[type="submit"]')
      ]);

      console.log('⏳ Esperando que cargue el dashboard...');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Dar tiempo para que cargue todo

      await takeScreenshotAndAnalyze(page, '04_after_login');
    }

    // Paso 4: Analizar el dashboard
    console.log('\n📍 Paso 4: Analizando el dashboard de doctors...');
    await takeScreenshotAndAnalyze(page, '05_dashboard');

    const structure = await analyzePageStructure(page);
    const videoElements = await searchVideoElements(page);

    // Guardar resultados en JSON
    const results = {
      timestamp: new Date().toISOString(),
      currentUrl: page.url(),
      title: await page.title(),
      structure,
      videoElements
    };

    const resultsPath = join(SCREENSHOTS_DIR, 'audit_results.json');
    writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n✅ Resultados guardados en: ${resultsPath}`);

    // Paso 5: Intentar buscar y clickear botón de video si existe
    console.log('\n📍 Paso 5: Buscando botón de videollamada...');

    if (videoElements.length > 0) {
      console.log(`\n✅ Encontrados ${videoElements.length} elementos relacionados con video`);
      console.log('Intentando localizar el primer elemento clickeable...');

      // Intentar varios selectores
      const selectors = [
        'button[aria-label*="camera" i]',
        'button[aria-label*="video" i]',
        'button[data-testid*="camera"]',
        'button[data-testid*="video"]',
        'button:has-text("cámara")',
        'button:has-text("camera")',
        'button:has-text("video")'
      ];

      let found = false;
      for (const selector of selectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            console.log(`\n✅ Botón encontrado con selector: ${selector}`);
            await takeScreenshotAndAnalyze(page, '06_before_video_click');

            await element.click();
            console.log('✅ Click realizado');

            await page.waitForTimeout(3000);
            await takeScreenshotAndAnalyze(page, '07_after_video_click');

            found = true;
            break;
          }
        } catch (e) {
          // Selector no encontró nada, continuar
        }
      }

      if (!found) {
        console.log('⚠️  No se pudo encontrar un botón clickeable de video');
      }
    } else {
      console.log('⚠️  No se encontraron elementos relacionados con video');
    }

    console.log(`\n✅ AUDITORÍA COMPLETADA`);
    console.log(`📁 Revisa los archivos en: ${SCREENSHOTS_DIR}`);

    // Mantener navegador abierto para inspección manual
    console.log('\n⏳ Manteniendo navegador abierto por 15 segundos para inspección manual...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ Error durante la auditoría:', error);
    await takeScreenshotAndAnalyze(page, 'ERROR');
  } finally {
    await browser.close();
    console.log('\n🏁 Navegador cerrado');
  }
}

main().catch(console.error);
