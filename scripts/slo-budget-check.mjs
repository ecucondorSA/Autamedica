#!/usr/bin/env node
/**
 * AutaMedica - SLO Budget Check
 *
 * Verifica que no hayamos excedido el error budget del período
 * Error budget = (1 - SLO) * tiempo del período
 *
 * SLOs definidos:
 * - Availability: 99.9% (error budget: 0.1% = 43.2 min/mes)
 * - Performance: TTFB p95 < 600ms
 * - Success rate: 99.5%
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const DOCS_DIR = path.join(PROJECT_ROOT, "generated-docs");

// SLO Definitions
const SLOS = {
  availability: {
    target: 0.999, // 99.9%
    errorBudget: 0.001, // 0.1%
    periodDays: 30,
  },
  performance: {
    ttfbP95: 600, // ms
    ttfbP99: 1000, // ms
  },
  successRate: {
    target: 0.995, // 99.5%
    errorBudget: 0.005, // 0.5%
  },
};

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

async function loadHealthGateReport() {
  try {
    const reportPath = path.join(DOCS_DIR, "health-gate-report.json");
    const content = await fs.readFile(reportPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    log(`⚠️  No se pudo cargar health-gate-report.json: ${error.message}`, "yellow");
    return null;
  }
}

async function loadFetchCheckReport() {
  try {
    const reportPath = path.join(DOCS_DIR, "fetch-check-report.json");
    const content = await fs.readFile(reportPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    log(`⚠️  No se pudo cargar fetch-check-report.json: ${error.message}`, "yellow");
    return null;
  }
}

function calculateAvailability(healthReport, fetchReport) {
  let totalChecks = 0;
  let successfulChecks = 0;

  // From health gate report
  if (healthReport && healthReport.results) {
    for (const result of healthReport.results) {
      totalChecks += result.totalChecks || 0;
      successfulChecks += result.successCount || 0;
    }
  }

  // From fetch check report
  if (fetchReport && fetchReport.results) {
    for (const result of fetchReport.results) {
      totalChecks++;
      if (result.success) successfulChecks++;
    }
  }

  if (totalChecks === 0) {
    return { availability: 1.0, totalChecks: 0, successfulChecks: 0 };
  }

  return {
    availability: successfulChecks / totalChecks,
    totalChecks,
    successfulChecks,
    failedChecks: totalChecks - successfulChecks,
  };
}

function calculatePerformance(healthReport) {
  const ttfbs = [];

  if (healthReport && healthReport.results) {
    for (const result of healthReport.results) {
      if (result.samples) {
        for (const sample of result.samples) {
          if (sample.ttfb) {
            ttfbs.push(sample.ttfb);
          }
        }
      }
    }
  }

  if (ttfbs.length === 0) {
    return { p95: 0, p99: 0, avg: 0, count: 0 };
  }

  ttfbs.sort((a, b) => a - b);

  const p95Index = Math.floor(ttfbs.length * 0.95);
  const p99Index = Math.floor(ttfbs.length * 0.99);
  const avg = ttfbs.reduce((sum, val) => sum + val, 0) / ttfbs.length;

  return {
    p95: ttfbs[p95Index] || 0,
    p99: ttfbs[p99Index] || 0,
    avg: Math.round(avg),
    min: ttfbs[0],
    max: ttfbs[ttfbs.length - 1],
    count: ttfbs.length,
  };
}

function checkSLOCompliance(metrics) {
  const results = {
    availability: { passed: false, message: "" },
    performance: { passed: false, message: "" },
    overall: { passed: false },
  };

  // Check availability
  const availabilityPercent = (metrics.availability.availability * 100).toFixed(3);
  const availabilityTarget = (SLOS.availability.target * 100).toFixed(1);

  if (metrics.availability.availability >= SLOS.availability.target) {
    results.availability.passed = true;
    results.availability.message = `✅ Availability: ${availabilityPercent}% (target: ${availabilityTarget}%)`;
  } else {
    const errorRate = (1 - metrics.availability.availability) * 100;
    const errorBudget = SLOS.availability.errorBudget * 100;
    results.availability.passed = false;
    results.availability.message = `❌ Availability: ${availabilityPercent}% (target: ${availabilityTarget}%)\n   Error rate: ${errorRate.toFixed(3)}% exceeds budget of ${errorBudget}%`;
  }

  // Check performance
  if (metrics.performance.p95 <= SLOS.performance.ttfbP95 &&
      metrics.performance.p99 <= SLOS.performance.ttfbP99) {
    results.performance.passed = true;
    results.performance.message = `✅ Performance: p95=${metrics.performance.p95}ms, p99=${metrics.performance.p99}ms`;
  } else {
    results.performance.passed = false;
    results.performance.message = `❌ Performance: p95=${metrics.performance.p95}ms (target: <${SLOS.performance.ttfbP95}ms), p99=${metrics.performance.p99}ms (target: <${SLOS.performance.ttfbP99}ms)`;
  }

  results.overall.passed = results.availability.passed && results.performance.passed;

  return results;
}

async function main() {
  log("📊 AutaMedica - SLO Budget Check", "cyan");
  log("=".repeat(60), "cyan");

  // Load reports
  log("\n📄 Loading reports...", "cyan");
  const healthReport = await loadHealthGateReport();
  const fetchReport = await loadFetchCheckReport();

  if (!healthReport && !fetchReport) {
    log("\n⚠️  No reports found - skipping SLO check", "yellow");
    log("   Run health-gate.mjs and node_fetch_check.mjs first", "yellow");
    process.exit(0);
  }

  // Calculate metrics
  log("\n📈 Calculating metrics...", "cyan");
  const availability = calculateAvailability(healthReport, fetchReport);
  const performance = calculatePerformance(healthReport);

  const metrics = {
    availability,
    performance,
  };

  // Log metrics
  log("\n📊 Metrics:", "cyan");
  log(`   Availability: ${(availability.availability * 100).toFixed(3)}%`, "cyan");
  log(`   Checks: ${availability.successfulChecks}/${availability.totalChecks} successful`, "cyan");

  if (performance.count > 0) {
    log(`   Performance (${performance.count} samples):`, "cyan");
    log(`      p95: ${performance.p95}ms`, "cyan");
    log(`      p99: ${performance.p99}ms`, "cyan");
    log(`      avg: ${performance.avg}ms`, "cyan");
    log(`      range: ${performance.min}ms - ${performance.max}ms`, "cyan");
  }

  // Check SLO compliance
  log("\n🎯 SLO Compliance Check:", "cyan");
  const compliance = checkSLOCompliance(metrics);

  log("\n" + (compliance.availability.passed ? colors.green : colors.red) + compliance.availability.message + colors.reset);
  log((compliance.performance.passed ? colors.green : colors.red) + compliance.performance.message + colors.reset);

  // Save report
  const reportPath = path.join(DOCS_DIR, "slo-budget-report.json");
  await fs.mkdir(DOCS_DIR, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    slos: SLOS,
    metrics,
    compliance,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Summary
  log("\n" + "=".repeat(60), "cyan");
  log("📊 SUMMARY", "cyan");
  log("=".repeat(60), "cyan");

  if (compliance.overall.passed) {
    log("\n✅ SLO Budget: WITHIN BUDGET", "green");
    log("   All SLOs are being met", "green");
    process.exit(0);
  } else {
    log("\n❌ SLO Budget: EXCEEDED", "red");
    log("   One or more SLOs are not being met", "red");
    log("\n💡 Actions:", "yellow");
    if (!compliance.availability.passed) {
      log("   - Investigate availability issues", "yellow");
      log("   - Check for deployment problems", "yellow");
    }
    if (!compliance.performance.passed) {
      log("   - Investigate performance degradation", "yellow");
      log("   - Review recent changes", "yellow");
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
