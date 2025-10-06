/**
 * AutaMedica - k6 Smoke Test
 *
 * Smoke test básico para validar que las aplicaciones pueden
 * manejar carga ligera sin degradarse
 *
 * Perfil de carga:
 * - 10 VUs (virtual users)
 * - 30 segundos de duración
 * - ~50 requests/segundo
 *
 * SLOs validados:
 * - HTTP 200 OK rate > 99.5%
 * - TTFB p95 < 600ms
 * - Request duration p99 < 1000ms
 * - Error rate < 0.5%
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const ttfb = new Trend("ttfb");

// Test configuration
export const options = {
  vus: 10, // 10 concurrent users
  duration: "30s", // run for 30 seconds

  thresholds: {
    // HTTP errors should be less than 0.5%
    errors: ["rate<0.005"],

    // 99% of requests should complete in <1000ms
    http_req_duration: ["p(99)<1000"],

    // 95% of TTFB should be <600ms
    ttfb: ["p(95)<600"],

    // Success rate should be >99.5%
    checks: ["rate>0.995"],
  },

  // Tag requests for better reporting
  tags: {
    project: "autamedica",
    environment: "production",
  },
};

// Test endpoints
const ENDPOINTS = [
  {
    name: "Patients App",
    url: "https://patients.autamedica.com",
    weight: 0.4, // 40% of traffic
  },
  {
    name: "Doctors App",
    url: "https://doctors.autamedica.com",
    weight: 0.4, // 40% of traffic
  },
  {
    name: "Companies App",
    url: "https://companies.autamedica.com",
    weight: 0.2, // 20% of traffic
  },
];

// Helper to select endpoint based on weight
function selectEndpoint() {
  const rand = Math.random();
  let cumulative = 0;

  for (const endpoint of ENDPOINTS) {
    cumulative += endpoint.weight;
    if (rand < cumulative) {
      return endpoint;
    }
  }

  return ENDPOINTS[0];
}

export default function () {
  const endpoint = selectEndpoint();

  // Make request
  const response = http.get(endpoint.url, {
    headers: {
      "User-Agent": "k6-AutaMedica-Smoke/1.0",
    },
    tags: {
      endpoint: endpoint.name,
    },
  });

  // Record TTFB
  ttfb.add(response.timings.waiting);

  // Check response
  const checkResults = check(
    response,
    {
      "status is 200 or 3xx": (r) =>
        r.status === 200 || (r.status >= 300 && r.status < 400),
      "response time < 1000ms": (r) => r.timings.duration < 1000,
      "waiting time (TTFB) < 600ms": (r) => r.timings.waiting < 600,
      "has content": (r) => r.body.length > 0,
    },
    { endpoint: endpoint.name }
  );

  // Record error rate
  errorRate.add(!checkResults);

  // Log failures for debugging
  if (!checkResults) {
    console.error(
      `[${endpoint.name}] Failed: status=${response.status}, duration=${response.timings.duration}ms`
    );
  }

  // Think time: simulate user reading/interacting
  sleep(1);
}

// Setup function (runs once at start)
export function setup() {
  console.log("🚀 Starting AutaMedica Smoke Test");
  console.log(`   VUs: ${options.vus}`);
  console.log(`   Duration: ${options.duration}`);
  console.log(`   Endpoints: ${ENDPOINTS.length}`);
  console.log("");

  return {
    timestamp: new Date().toISOString(),
  };
}

// Teardown function (runs once at end)
export function teardown(data) {
  console.log("");
  console.log("✅ AutaMedica Smoke Test completed");
  console.log(`   Started: ${data.timestamp}`);
  console.log(`   Finished: ${new Date().toISOString()}`);
}

// Summary handler
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    duration: data.state.testRunDurationMs,
    metrics: {
      http_reqs: data.metrics.http_reqs,
      http_req_duration: data.metrics.http_req_duration,
      http_req_failed: data.metrics.http_req_failed,
      checks: data.metrics.checks,
      errors: data.metrics.errors,
      ttfb: data.metrics.ttfb,
    },
    thresholds: data.metrics,
  };

  // Log summary to console
  console.log("\n📊 Test Summary:");
  console.log(`   Total requests: ${data.metrics.http_reqs.values.count}`);
  console.log(
    `   Success rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%`
  );
  console.log(
    `   Error rate: ${(data.metrics.errors ? data.metrics.errors.values.rate * 100 : 0).toFixed(2)}%`
  );
  console.log(
    `   Avg response time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`
  );
  console.log(
    `   p95 response time: ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms`
  );
  console.log(
    `   p99 response time: ${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}ms`
  );

  if (data.metrics.ttfb) {
    console.log(
      `   p95 TTFB: ${data.metrics.ttfb.values["p(95)"].toFixed(2)}ms`
    );
  }

  // Return summary for file output
  return {
    "generated-docs/k6-smoke-report.json": JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
  };
}

// Helper for text summary (fallback if not using default textSummary)
function textSummary(data, options = {}) {
  return JSON.stringify(data, null, 2);
}
