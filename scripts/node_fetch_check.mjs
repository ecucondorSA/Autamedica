#!/usr/bin/env node
// AutaMedica - Node Fetch Check
// Verifica fetch real a URLs de producción

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// URLs a verificar (producción real)
const URLS_TO_CHECK = [
  {
    name: "Patients App",
    url: "https://patients.autamedica.com",
    expectedStatus: [200, 301, 302, 307],
    checkHeaders: true,
  },
  {
    name: "Doctors App",
    url: "https://doctors.autamedica.com",
    expectedStatus: [200, 301, 302, 307],
    checkHeaders: true,
  },
  {
    name: "Auth Login (Patient)",
    url: "https://auth.autamedica.com/auth/login/?role=patient",
    expectedStatus: [200, 301, 302, 307, 308],
    checkHeaders: false,
  },
  {
    name: "Web App Landing",
    url: "https://autamedica.com",
    expectedStatus: [200, 301, 302, 307, 308],
    checkHeaders: true,
  },
  {
    name: "Web App Landing (www)",
    url: "https://www.autamedica.com",
    expectedStatus: [200, 301, 302, 307, 308],
    checkHeaders: false,
  },
  {
    name: "Companies App",
    url: "https://companies.autamedica.com",
    expectedStatus: [200, 301, 302, 307],
    checkHeaders: false,
  },
];

// Security headers que deben estar presentes
const REQUIRED_HEADERS = [
  "x-frame-options",
  "x-content-type-options",
  "strict-transport-security",
];

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function checkUrl(urlConfig) {
  const { name, url, expectedStatus, checkHeaders } = urlConfig;

  log(`\n🔍 Checking: ${name}`, "cyan");
  log(`   URL: ${url}`, "blue");

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual", // No seguir redirects automáticamente
      headers: {
        "User-Agent": "AutaMedica-Agentic-Checker/1.0",
      },
    });

    const status = response.status;
    const isStatusOk = expectedStatus.includes(status);

    if (isStatusOk) {
      log(`   ✅ Status: ${status}`, "green");
    } else {
      log(`   ❌ Status: ${status} (esperado: ${expectedStatus.join(", ")})`, "red");
      return { success: false, name, url, status, expected: expectedStatus };
    }

    // Verificar headers de seguridad si está habilitado
    if (checkHeaders) {
      log(`   🔒 Verificando security headers...`, "cyan");
      const missingHeaders = [];

      for (const header of REQUIRED_HEADERS) {
        const headerValue = response.headers.get(header);
        if (headerValue) {
          log(`      ✅ ${header}: ${headerValue.substring(0, 50)}`, "green");
        } else {
          log(`      ⚠️  ${header}: MISSING`, "yellow");
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length > 0) {
        log(`   ⚠️  Headers faltantes: ${missingHeaders.join(", ")}`, "yellow");
      }
    }

    // Verificar redirect location si es redirect
    if ([301, 302, 307, 308].includes(status)) {
      const location = response.headers.get("location");
      if (location) {
        log(`   🔗 Redirect to: ${location}`, "blue");
      }
    }

    return { success: true, name, url, status };
  } catch (error) {
    log(`   ❌ Fetch error: ${error.message}`, "red");
    return { success: false, name, url, error: error.message };
  }
}

async function main() {
  log("🌐 AutaMedica - Node Fetch Check", "cyan");
  log("=" .repeat(60), "cyan");

  const results = [];
  let failCount = 0;

  for (const urlConfig of URLS_TO_CHECK) {
    const result = await checkUrl(urlConfig);
    results.push(result);

    if (!result.success) {
      failCount++;
    }
  }

  // Resumen
  log("\n" + "=".repeat(60), "cyan");
  log("📊 RESUMEN", "cyan");
  log("=".repeat(60), "cyan");

  for (const result of results) {
    if (result.success) {
      log(`✅ ${result.name} - Status ${result.status}`, "green");
    } else {
      log(`❌ ${result.name} - FAILED`, "red");
      if (result.error) {
        log(`   Error: ${result.error}`, "red");
      }
    }
  }

  // Guardar reporte
  const reportPath = path.join(PROJECT_ROOT, "generated-docs", "fetch-check-report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
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

  log(`\n📄 Reporte guardado en: ${reportPath}`, "blue");

  // Exit code
  if (failCount > 0) {
    log(`\n❌ ${failCount} checks fallaron`, "red");
    process.exit(1);
  } else {
    log("\n✅ Todos los checks pasaron", "green");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
