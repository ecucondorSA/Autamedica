#!/usr/bin/env node
/**
 * AutaMedica - Health Gate
 *
 * Verifica health checks con SLOs:
 * - Status 200 OK
 * - Error rate < 0.5%
 * - TTFB < 600ms
 * - Success rate > 99.5%
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Health check endpoints
const HEALTH_ENDPOINTS = [
  {
    name: "Doctors App",
    url: "https://doctors.autamedica.com",
    expectedStatus: [200, 301, 302],
    maxTTFB: 600,
  },
  {
    name: "Patients App",
    url: "https://patients.autamedica.com",
    expectedStatus: [200, 301, 302],
    maxTTFB: 600,
  },
  {
    name: "Companies App",
    url: "https://companies.autamedica.com",
    expectedStatus: [200, 301, 302],
    maxTTFB: 800,
  },
];

// SLO thresholds
const SLO = {
  maxErrorRate: 0.005, // 0.5%
  minSuccessRate: 0.995, // 99.5%
  maxTTFB: 600, // ms
  samples: 10, // Number of checks per endpoint
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

async function checkEndpoint(endpoint) {
  const { name, url, expectedStatus, maxTTFB } = endpoint;

  log(`\n🏥 Checking: ${name}`, "cyan");
  log(`   URL: ${url}`, "cyan");

  const results = {
    name,
    url,
    samples: [],
    totalChecks: SLO.samples,
    successCount: 0,
    errorCount: 0,
    avgTTFB: 0,
    maxTTFBObserved: 0,
    passed: false,
  };

  // Perform multiple checks for statistical significance
  for (let i = 0; i < SLO.samples; i++) {
    try {
      const startTime = Date.now();

      const response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": "AutaMedica-Health-Gate/1.0",
        },
        // Timeout after 3 seconds
        signal: AbortSignal.timeout(3000),
      });

      const ttfb = Date.now() - startTime;
      const status = response.status;
      const success = expectedStatus.includes(status) && ttfb <= maxTTFB;

      results.samples.push({
        attempt: i + 1,
        status,
        ttfb,
        success,
      });

      if (success) {
        results.successCount++;
      } else {
        results.errorCount++;
        log(`   ⚠️  Sample ${i + 1}: Status ${status}, TTFB ${ttfb}ms`, "yellow");
      }

      results.maxTTFBObserved = Math.max(results.maxTTFBObserved, ttfb);

    } catch (error) {
      results.errorCount++;
      results.samples.push({
        attempt: i + 1,
        error: error.message,
        success: false,
      });
      log(`   ❌ Sample ${i + 1}: Error - ${error.message}`, "red");
    }

    // Small delay between checks
    if (i < SLO.samples - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Calculate metrics
  const validSamples = results.samples.filter(s => s.ttfb);
  results.avgTTFB = validSamples.length > 0
    ? Math.round(validSamples.reduce((sum, s) => sum + s.ttfb, 0) / validSamples.length)
    : 0;

  const errorRate = results.errorCount / results.totalChecks;
  const successRate = results.successCount / results.totalChecks;

  // Check against SLOs
  const errorRatePass = errorRate <= SLO.maxErrorRate;
  const successRatePass = successRate >= SLO.minSuccessRate;
  const ttfbPass = results.avgTTFB <= maxTTFB;

  results.passed = errorRatePass && successRatePass && ttfbPass;

  // Log results
  log(`\n   📊 Results (${results.totalChecks} samples):`, "cyan");
  log(`      Success rate: ${(successRate * 100).toFixed(2)}% ${successRatePass ? "✅" : "❌"}`, successRatePass ? "green" : "red");
  log(`      Error rate: ${(errorRate * 100).toFixed(2)}% ${errorRatePass ? "✅" : "❌"}`, errorRatePass ? "green" : "red");
  log(`      Avg TTFB: ${results.avgTTFB}ms ${ttfbPass ? "✅" : "❌"}`, ttfbPass ? "green" : "red");
  log(`      Max TTFB: ${results.maxTTFBObserved}ms`, "cyan");

  return results;
}

async function main() {
  log("🚦 AutaMedica - Health Gate Check", "cyan");
  log("=".repeat(60), "cyan");

  const allResults = [];
  let failedCount = 0;

  // Check all endpoints
  for (const endpoint of HEALTH_ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    allResults.push(result);

    if (!result.passed) {
      failedCount++;
      log(`\n❌ ${endpoint.name} FAILED health gate`, "red");
    } else {
      log(`\n✅ ${endpoint.name} PASSED health gate`, "green");
    }
  }

  // Save report
  const reportPath = path.join(PROJECT_ROOT, "generated-docs", "health-gate-report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    slo: SLO,
    results: allResults,
    summary: {
      total: allResults.length,
      passed: allResults.length - failedCount,
      failed: failedCount,
    },
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Summary
  log("\n" + "=".repeat(60), "cyan");
  log("📊 SUMMARY", "cyan");
  log("=".repeat(60), "cyan");

  log(`\nTotal endpoints: ${report.summary.total}`, "cyan");
  log(`Passed: ${report.summary.passed}`, "green");
  log(`Failed: ${report.summary.failed}`, failedCount > 0 ? "red" : "green");
  log(`\nReport saved: ${path.basename(reportPath)}`, "cyan");

  // Exit with appropriate code
  if (failedCount > 0) {
    log(`\n❌ Health gate FAILED - ${failedCount} endpoint(s) did not meet SLOs`, "red");
    process.exit(1);
  } else {
    log("\n✅ Health gate PASSED - All endpoints meet SLOs", "green");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
