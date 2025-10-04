#!/usr/bin/env node

/**
 * 🔍 AutaMedica Visual Analyzer
 * Análisis avanzado de estado visual de las aplicaciones
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APPS = [
  { name: 'web-app', url: 'http://localhost:3000', port: 3000 },
  { name: 'doctors', url: 'http://localhost:3001', port: 3001 },
  { name: 'patients', url: 'http://localhost:3002', port: 3002 },
  { name: 'companies', url: 'http://localhost:3003', port: 3003 }
];

async function analyzeVisualState() {
  logger.info('🔍 Analizando estado visual de aplicaciones...\n');

  const browser = await chromium.launch({ headless: true });

  for (const app of APPS) {
    logger.info(`📱 Analizando ${app.name} (${app.url})...`);

    try {
      // Verificar que el servidor esté corriendo
      const response = await fetch(app.url);
      if (!response.ok) {
        logger.info(`  ⚠️  HTTP ${response.status} - Servidor con problemas`);
        continue;
      }

      const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
      });

      await page.goto(app.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Análisis de contenido
      const pageAnalysis = await page.evaluate(() => {
        const stats = {
          title: document.title,
          hasH1: !!document.querySelector('h1'),
          hasNavigation: !!document.querySelector('nav'),
          buttonCount: document.querySelectorAll('button').length,
          linkCount: document.querySelectorAll('a').length,
          imageCount: document.querySelectorAll('img').length,
          hasErrors: !!document.querySelector('.error, [class*="error"]'),
          textVisible: document.body.innerText.length > 0,
          backgroundColor: getComputedStyle(document.body).backgroundColor,
          hasLoader: !!document.querySelector('[class*="loading"], .spinner'),
          contentHeight: document.body.scrollHeight,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };

        // Verificar si hay elementos principales visibles
        const mainElements = document.querySelectorAll('main, [role="main"], .main-content');
        stats.hasMainContent = mainElements.length > 0;

        // Verificar colores de tema si es patients app
        if (window.location.port === '3002') {
          const themeButtons = document.querySelectorAll('[class*="theme"], [data-theme]');
          stats.themeButtonsCount = themeButtons.length;

          // Verificar si los elementos tienen color
          const coloredElements = document.querySelectorAll('[style*="color"], [class*="text-"]');
          stats.coloredElementsCount = coloredElements.length;
        }

        return stats;
      });

      // Mostrar análisis
      logger.info(`  ✅ Cargado correctamente`);
      logger.info(`  📄 Título: "${pageAnalysis.title}"`);
      logger.info(`  🎨 Fondo: ${pageAnalysis.backgroundColor}`);
      logger.info(`  📏 Contenido: ${pageAnalysis.contentHeight}px de alto`);
      logger.info(`  🔗 Elementos: ${pageAnalysis.buttonCount} botones, ${pageAnalysis.linkCount} enlaces`);

      if (pageAnalysis.hasMainContent) {
        logger.info(`  ✅ Contenido principal detectado`);
      } else {
        logger.info(`  ⚠️  Sin contenido principal detectado`);
      }

      if (pageAnalysis.textVisible) {
        logger.info(`  ✅ Texto visible en la página`);
      } else {
        logger.info(`  ❌ Sin texto visible`);
      }

      if (app.name === 'patients') {
        logger.info(`  🎨 Temas: ${pageAnalysis.themeButtonsCount} selectores de tema`);
        logger.info(`  🌈 Elementos coloreados: ${pageAnalysis.coloredElementsCount}`);
      }

      if (pageAnalysis.hasErrors) {
        logger.info(`  ❌ Errores detectados en la página`);
      }

      if (pageAnalysis.hasLoader) {
        logger.info(`  🔄 Elementos de carga detectados`);
      }

      await page.close();

    } catch (error) {
      logger.info(`  ❌ Error: ${error.message}`);
    }

    logger.info(''); // Espacio entre apps
  }

  await browser.close();
  logger.info('📊 Análisis visual completado');
}

async function quickHealthCheck() {
  logger.info('⚡ Health Check Rápido...\n');

  const results = [];

  for (const app of APPS) {
    try {
      const start = Date.now();
      const response = await fetch(app.url);
      const loadTime = Date.now() - start;

      results.push({
        app: app.name,
        status: response.status,
        ok: response.ok,
        loadTime,
        url: app.url
      });

    } catch (error) {
      results.push({
        app: app.name,
        status: 'offline',
        ok: false,
        loadTime: 0,
        url: app.url,
        error: error.message
      });
    }
  }

  // Mostrar resultados
  results.forEach(result => {
    const statusIcon = result.ok ? '✅' : '❌';
    const status = result.ok ? `HTTP ${result.status}` : result.status;
    const timing = result.loadTime > 0 ? ` (${result.loadTime}ms)` : '';

    logger.info(`${statusIcon} ${result.app}: ${status}${timing}`);

    if (!result.ok && result.error) {
      logger.info(`   └─ Error: ${result.error}`);
    }
  });

  logger.info('');
  return results;
}

// CLI Interface
const command = process.argv[2];

switch (command) {
  case 'analyze':
    analyzeVisualState();
    break;
  case 'health':
    quickHealthCheck();
    break;
  case 'full':
    quickHealthCheck().then(() => analyzeVisualState());
    break;
  default:
    logger.info(`
🔍 AutaMedica Visual Analyzer

Comandos:
  health    # Health check rápido de servidores
  analyze   # Análisis detallado del contenido visual
  full      # Health check + análisis completo

Ejemplos:
  # Verificar que los servidores estén corriendo
  node visual-analyzer.js health

  # Análisis completo del contenido
  node visual-analyzer.js analyze

  # Todo junto
  node visual-analyzer.js full
`);
}