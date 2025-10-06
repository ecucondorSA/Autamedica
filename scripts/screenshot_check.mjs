#!/usr/bin/env node
// AutaMedica - Screenshot Check (Playwright)
// Captura screenshots reales de las aplicaciones en producción

import { chromium } from "playwright";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Targets para screenshots
const SCREENSHOT_TARGETS = [
  {
    name: "patients",
    url: "https://patients.autamedica.com",
    waitFor: "domcontentloaded",
    fullPage: true,
  },
  {
    name: "doctors",
    url: "https://doctors.autamedica.com",
    waitFor: "domcontentloaded",
    fullPage: true,
  },
  {
    name: "auth-login-patient",
    url: "https://auth.autamedica.com/auth/login/?role=patient",
    waitFor: "domcontentloaded",
    fullPage: false,
  },
  {
    name: "web-app-landing",
    url: "https://www.autamedica.com",
    waitFor: "domcontentloaded",
    fullPage: true,
  },
];

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function captureScreenshot(browser, target) {
  const { name, url, waitFor, fullPage } = target;

  log(`\n📸 Capturando: ${name}`, "cyan");
  log(`   URL: ${url}`, "cyan");

  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent: "AutaMedica-Agentic-Screenshot/1.0",
    });

    // Navegar a la URL
    await page.goto(url, {
      waitUntil: waitFor,
      timeout: 30000,
    });

    // Esperar un poco más para asegurar renderizado completo
    await page.waitForTimeout(2000);

    // Capturar screenshot
    const screenshotPath = path.join(
      PROJECT_ROOT,
      "generated-docs",
      `${name}-${new Date().toISOString().split("T")[0]}.png`
    );

    await page.screenshot({
      path: screenshotPath,
      fullPage,
    });

    await page.close();

    log(`   ✅ Screenshot guardado: ${path.basename(screenshotPath)}`, "green");

    return {
      success: true,
      name,
      url,
      screenshotPath: path.basename(screenshotPath),
    };
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, "red");
    return {
      success: false,
      name,
      url,
      error: error.message,
    };
  }
}

async function main() {
  log("📸 AutaMedica - Screenshot Check (Playwright)", "cyan");
  log("=" .repeat(60), "cyan");

  // Asegurar directorio de salida
  const docsDir = path.join(PROJECT_ROOT, "generated-docs");
  await fs.mkdir(docsDir, { recursive: true });

  let browser;
  const results = [];
  let failCount = 0;

  try {
    // Lanzar browser headless
    log("\n🚀 Iniciando Chromium headless...", "cyan");
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    // Capturar cada target
    for (const target of SCREENSHOT_TARGETS) {
      const result = await captureScreenshot(browser, target);
      results.push(result);

      if (!result.success) {
        failCount++;
      }
    }
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, "red");
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Resumen
  log("\n" + "=".repeat(60), "cyan");
  log("📊 RESUMEN", "cyan");
  log("=".repeat(60), "cyan");

  for (const result of results) {
    if (result.success) {
      log(`✅ ${result.name} - ${result.screenshotPath}`, "green");
    } else {
      log(`❌ ${result.name} - FAILED: ${result.error}`, "red");
    }
  }

  // Guardar reporte JSON
  const reportPath = path.join(docsDir, "screenshot-check-report.json");
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        summary: {
          total: results.length,
          passed: results.length - failCount,
          failed: failCount,
        },
      },
      null,
      2
    )
  );

  log(`\n📄 Reporte guardado en: ${path.basename(reportPath)}`, "cyan");

  // Exit code
  if (failCount > 0) {
    log(`\n❌ ${failCount} screenshots fallaron`, "red");
    process.exit(1);
  } else {
    log("\n✅ Todos los screenshots capturados exitosamente", "green");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
