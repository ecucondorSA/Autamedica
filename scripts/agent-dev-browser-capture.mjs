#!/usr/bin/env node

/**
 * AGENT-DEV Browser Capture Tool
 *
 * Captura toda la información relevante del navegador de manera sencilla
 * para debugging y análisis de desarrollo
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3002'; // Patients app por defecto
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'generated-docs/browser-captures';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`)
};

// Estructura de datos capturados
const capturedData = {
  metadata: {
    url: TARGET_URL,
    timestamp: new Date().toISOString(),
    userAgent: null
  },
  console: {
    logs: [],
    errors: [],
    warnings: [],
    summary: { total: 0, errors: 0, warnings: 0, logs: 0 }
  },
  network: {
    requests: [],
    summary: {
      total: 0,
      failed: 0,
      slow: 0, // > 500ms
      avgDuration: 0,
      totalBytes: 0
    }
  },
  performance: {
    metrics: null,
    resources: [],
    webVitals: {
      LCP: null,
      FID: null,
      CLS: null,
      FCP: null,
      TTFB: null
    }
  },
  security: {
    state: null,
    headers: {},
    issues: []
  },
  coverage: {
    js: { total: 0, unused: 0, percentage: 0 },
    css: { total: 0, unused: 0, percentage: 0 }
  },
  accessibility: {
    tree: null,
    violations: []
  }
};

async function captureBrowserData() {
  log.section('🚀 AGENT-DEV Browser Capture Starting');
  log.info(`Target URL: ${TARGET_URL}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (AGENT-DEV) Playwright/1.40'
  });

  const page = await context.newPage();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. CONSOLE CAPTURE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('1️⃣  Capturing Console Messages');

  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: Date.now()
    };

    capturedData.console.summary.total++;

    if (msg.type() === 'error') {
      capturedData.console.errors.push(entry);
      capturedData.console.summary.errors++;
      log.error(`Console Error: ${entry.text.substring(0, 80)}...`);
    } else if (msg.type() === 'warning') {
      capturedData.console.warnings.push(entry);
      capturedData.console.summary.warnings++;
      log.warn(`Console Warning: ${entry.text.substring(0, 80)}...`);
    } else {
      capturedData.console.logs.push(entry);
      capturedData.console.summary.logs++;
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. NETWORK CAPTURE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('2️⃣  Capturing Network Activity');

  const requestTimes = new Map();

  page.on('request', request => {
    requestTimes.set(request.url(), Date.now());
  });

  page.on('response', async response => {
    const url = response.url();
    const startTime = requestTimes.get(url);
    const duration = startTime ? Date.now() - startTime : 0;

    const requestData = {
      url,
      method: response.request().method(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      contentType: response.headers()['content-type'] || 'unknown',
      duration,
      timestamp: Date.now(),
      fromCache: false, // Not available in all Playwright versions
      timing: null
    };

    // Intentar obtener tamaño
    try {
      const body = await response.body().catch(() => null);
      if (body) {
        requestData.size = body.length;
        capturedData.network.summary.totalBytes += body.length;
      }
    } catch (e) {
      // Ignorar errores de body
    }

    capturedData.network.requests.push(requestData);
    capturedData.network.summary.total++;

    if (response.status() >= 400) {
      capturedData.network.summary.failed++;
      log.error(`Failed Request: ${response.status()} ${url}`);
    }

    if (duration > 500) {
      capturedData.network.summary.slow++;
      log.warn(`Slow Request: ${duration}ms ${url}`);
    }

    log.info(`${requestData.method} ${response.status()} ${url.substring(0, 60)}... (${duration}ms)`);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. START COVERAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('3️⃣  Starting Code Coverage');

  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. NAVIGATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('4️⃣  Navigating to Target');

  let response;
  try {
    response = await page.goto(TARGET_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    log.success(`Navigation complete: ${response.status()} ${response.statusText()}`);
  } catch (error) {
    log.error(`Navigation failed: ${error.message}`);
    throw error;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. SECURITY HEADERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('5️⃣  Analyzing Security Headers');

  const headers = response.headers();
  capturedData.security.headers = headers;

  const securityHeaders = {
    'strict-transport-security': headers['strict-transport-security'],
    'content-security-policy': headers['content-security-policy'],
    'x-frame-options': headers['x-frame-options'],
    'x-content-type-options': headers['x-content-type-options'],
    'x-xss-protection': headers['x-xss-protection'],
    'referrer-policy': headers['referrer-policy']
  };

  Object.entries(securityHeaders).forEach(([header, value]) => {
    if (value) {
      log.success(`${header}: ${value.substring(0, 60)}...`);
    } else {
      log.warn(`${header}: MISSING`);
      capturedData.security.issues.push(`Missing header: ${header}`);
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. PERFORMANCE METRICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('6️⃣  Collecting Performance Metrics');

  // Wait a bit for metrics to stabilize
  await page.waitForTimeout(2000);

  const perfMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
    const cls = performance.getEntriesByType('layout-shift');

    return {
      navigation: navigation ? {
        domInteractive: navigation.domInteractive,
        domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
        loadEventEnd: navigation.loadEventEnd,
        responseStart: navigation.responseStart,
        domComplete: navigation.domComplete
      } : null,

      paint: paint.map(p => ({ name: p.name, startTime: p.startTime })),

      lcp: lcp ? {
        renderTime: lcp.renderTime,
        loadTime: lcp.loadTime,
        size: lcp.size
      } : null,

      cls: cls.reduce((sum, entry) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value;
        }
        return sum;
      }, 0),

      resources: performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        type: r.initiatorType,
        duration: r.duration,
        transferSize: r.transferSize,
        decodedBodySize: r.decodedBodySize
      })),

      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    };
  });

  capturedData.performance.metrics = perfMetrics;

  // Extract Web Vitals
  const fcp = perfMetrics.paint.find(p => p.name === 'first-contentful-paint');
  capturedData.performance.webVitals = {
    LCP: perfMetrics.lcp ? perfMetrics.lcp.renderTime : null,
    CLS: perfMetrics.cls,
    FCP: fcp ? fcp.startTime : null,
    TTFB: perfMetrics.navigation ? perfMetrics.navigation.responseStart : null
  };

  // Log Web Vitals
  const webVitals = capturedData.performance.webVitals;
  if (webVitals.LCP) {
    const lcpStatus = webVitals.LCP < 2500 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT';
    log.info(`LCP: ${webVitals.LCP.toFixed(0)}ms ${lcpStatus}`);
  }
  if (webVitals.CLS !== null) {
    const clsStatus = webVitals.CLS < 0.1 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT';
    log.info(`CLS: ${webVitals.CLS.toFixed(3)} ${clsStatus}`);
  }
  if (webVitals.FCP) {
    const fcpStatus = webVitals.FCP < 1800 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT';
    log.info(`FCP: ${webVitals.FCP.toFixed(0)}ms ${fcpStatus}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. COVERAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('7️⃣  Analyzing Code Coverage');

  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);

  // Calcular JS coverage
  let jsTotalBytes = 0;
  let jsUsedBytes = 0;

  for (const entry of jsCoverage || []) {
    if (entry && entry.text) {
      jsTotalBytes += entry.text.length;
      if (entry.ranges) {
        for (const range of entry.ranges) {
          jsUsedBytes += range.end - range.start;
        }
      }
    }
  }

  capturedData.coverage.js = {
    total: jsTotalBytes,
    unused: jsTotalBytes - jsUsedBytes,
    percentage: jsTotalBytes > 0 ? ((jsTotalBytes - jsUsedBytes) / jsTotalBytes * 100).toFixed(1) : 0
  };

  // Calcular CSS coverage
  let cssTotalBytes = 0;
  let cssUsedBytes = 0;

  for (const entry of cssCoverage || []) {
    if (entry && entry.text) {
      cssTotalBytes += entry.text.length;
      if (entry.ranges) {
        for (const range of entry.ranges) {
          cssUsedBytes += range.end - range.start;
        }
      }
    }
  }

  capturedData.coverage.css = {
    total: cssTotalBytes,
    unused: cssTotalBytes - cssUsedBytes,
    percentage: cssTotalBytes > 0 ? ((cssTotalBytes - cssUsedBytes) / cssTotalBytes * 100).toFixed(1) : 0
  };

  if (jsTotalBytes > 0 || cssTotalBytes > 0) {
    log.info(`JS Coverage: ${capturedData.coverage.js.percentage}% unused (${(capturedData.coverage.js.unused / 1024).toFixed(1)}KB wasted)`);
    log.info(`CSS Coverage: ${capturedData.coverage.css.percentage}% unused (${(capturedData.coverage.css.unused / 1024).toFixed(1)}KB wasted)`);
  } else {
    log.warn('Coverage data not available');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. ACCESSIBILITY TREE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('8️⃣  Capturing Accessibility Tree');

  try {
    const a11ySnapshot = await page.accessibility.snapshot();
    capturedData.accessibility.tree = a11ySnapshot;

    // Buscar violations comunes
    const violations = [];

    function checkNode(node, path = '') {
      const currentPath = path ? `${path} > ${node.role}` : node.role;

      // Check 1: Botones/links sin nombre
      if (['button', 'link'].includes(node.role) && !node.name) {
        violations.push({
          type: 'missing-accessible-name',
          role: node.role,
          path: currentPath,
          severity: 'critical'
        });
      }

      // Check 2: Imágenes sin alt
      if (node.role === 'img' && !node.name) {
        violations.push({
          type: 'missing-alt-text',
          role: node.role,
          path: currentPath,
          severity: 'serious'
        });
      }

      // Check 3: Form inputs sin label
      if (['textbox', 'combobox', 'checkbox'].includes(node.role) && !node.name) {
        violations.push({
          type: 'missing-form-label',
          role: node.role,
          path: currentPath,
          severity: 'critical'
        });
      }

      // Recursivo para children
      if (node.children) {
        node.children.forEach(child => checkNode(child, currentPath));
      }
    }

    if (a11ySnapshot) {
      checkNode(a11ySnapshot);
    }

    capturedData.accessibility.violations = violations;

    if (violations.length > 0) {
      log.warn(`Found ${violations.length} accessibility violations`);
      violations.slice(0, 5).forEach(v => {
        log.error(`  ${v.severity.toUpperCase()}: ${v.type} (${v.role})`);
      });
    } else {
      log.success('No accessibility violations found');
    }
  } catch (error) {
    log.warn(`Accessibility tree capture failed: ${error.message}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. SCREENSHOT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  log.section('9️⃣  Taking Screenshot');

  const screenshotPath = join(OUTPUT_DIR, `screenshot-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  log.success(`Screenshot saved: ${screenshotPath}`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. CLEANUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await browser.close();

  // Calculate average network duration
  if (capturedData.network.requests.length > 0) {
    const totalDuration = capturedData.network.requests.reduce((sum, r) => sum + r.duration, 0);
    capturedData.network.summary.avgDuration = Math.round(totalDuration / capturedData.network.requests.length);
  }

  return capturedData;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE REPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateReport(data) {
  log.section('📊 Generating Report');

  const timestamp = new Date(data.metadata.timestamp).toLocaleString();

  let report = `# 🔍 AGENT-DEV Browser Capture Report

**URL**: ${data.metadata.url}
**Timestamp**: ${timestamp}

---

## 📋 Summary

| Metric | Value | Status |
|--------|-------|--------|
| Console Errors | ${data.console.summary.errors} | ${data.console.summary.errors === 0 ? '✅' : '⚠️'} |
| Console Warnings | ${data.console.summary.warnings} | ${data.console.summary.warnings === 0 ? '✅' : '⚠️'} |
| Network Requests | ${data.network.summary.total} | ℹ️ |
| Failed Requests | ${data.network.summary.failed} | ${data.network.summary.failed === 0 ? '✅' : '❌'} |
| Slow Requests (>500ms) | ${data.network.summary.slow} | ${data.network.summary.slow === 0 ? '✅' : '⚠️'} |
| Avg Request Duration | ${data.network.summary.avgDuration}ms | ${data.network.summary.avgDuration < 300 ? '✅' : '⚠️'} |
| Total Bytes Transferred | ${(data.network.summary.totalBytes / 1024 / 1024).toFixed(2)} MB | ℹ️ |
| Security Issues | ${data.security.issues.length} | ${data.security.issues.length === 0 ? '✅' : '⚠️'} |
| Accessibility Violations | ${data.accessibility.violations.length} | ${data.accessibility.violations.length === 0 ? '✅' : '❌'} |

---

## ⚡ Web Vitals

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **LCP** (Largest Contentful Paint) | ${data.performance.webVitals.LCP ? data.performance.webVitals.LCP.toFixed(0) + 'ms' : 'N/A'} | < 2500ms | ${data.performance.webVitals.LCP && data.performance.webVitals.LCP < 2500 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'} |
| **CLS** (Cumulative Layout Shift) | ${data.performance.webVitals.CLS !== null ? data.performance.webVitals.CLS.toFixed(3) : 'N/A'} | < 0.1 | ${data.performance.webVitals.CLS !== null && data.performance.webVitals.CLS < 0.1 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'} |
| **FCP** (First Contentful Paint) | ${data.performance.webVitals.FCP ? data.performance.webVitals.FCP.toFixed(0) + 'ms' : 'N/A'} | < 1800ms | ${data.performance.webVitals.FCP && data.performance.webVitals.FCP < 1800 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'} |
| **TTFB** (Time to First Byte) | ${data.performance.webVitals.TTFB ? data.performance.webVitals.TTFB.toFixed(0) + 'ms' : 'N/A'} | < 600ms | ${data.performance.webVitals.TTFB && data.performance.webVitals.TTFB < 600 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'} |

---

## 🔒 Security Headers

| Header | Present | Value |
|--------|---------|-------|
`;

  const securityHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'referrer-policy'
  ];

  securityHeaders.forEach(header => {
    const value = data.security.headers[header];
    const present = value ? '✅' : '❌';
    const displayValue = value ? value.substring(0, 50) + '...' : 'MISSING';
    report += `| ${header} | ${present} | \`${displayValue}\` |\n`;
  });

  report += `\n---\n\n## 📦 Code Coverage\n\n`;
  report += `| Type | Total | Unused | Percentage | Status |\n`;
  report += `|------|-------|--------|------------|--------|\n`;
  report += `| JavaScript | ${(data.coverage.js.total / 1024).toFixed(1)} KB | ${(data.coverage.js.unused / 1024).toFixed(1)} KB | ${data.coverage.js.percentage}% | ${parseFloat(data.coverage.js.percentage) < 40 ? '✅' : '⚠️'} |\n`;
  report += `| CSS | ${(data.coverage.css.total / 1024).toFixed(1)} KB | ${(data.coverage.css.unused / 1024).toFixed(1)} KB | ${data.coverage.css.percentage}% | ${parseFloat(data.coverage.css.percentage) < 40 ? '✅' : '⚠️'} |\n`;

  if (data.console.errors.length > 0) {
    report += `\n---\n\n## ❌ Console Errors\n\n`;
    data.console.errors.slice(0, 10).forEach((error, i) => {
      report += `### Error ${i + 1}\n\n`;
      report += `- **Message**: \`${error.text}\`\n`;
      report += `- **Location**: ${error.location.url}:${error.location.lineNumber}\n\n`;
    });
  }

  if (data.network.summary.failed > 0) {
    report += `\n---\n\n## ❌ Failed Network Requests\n\n`;
    const failedRequests = data.network.requests.filter(r => r.status >= 400);
    failedRequests.slice(0, 10).forEach((req, i) => {
      report += `${i + 1}. **${req.status}** ${req.method} ${req.url}\n`;
    });
  }

  if (data.network.summary.slow > 0) {
    report += `\n---\n\n## ⚠️ Slow Network Requests (>500ms)\n\n`;
    const slowRequests = data.network.requests
      .filter(r => r.duration > 500)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    slowRequests.forEach((req, i) => {
      report += `${i + 1}. **${req.duration}ms** ${req.method} ${req.url}\n`;
    });
  }

  if (data.security.issues.length > 0) {
    report += `\n---\n\n## 🔒 Security Issues\n\n`;
    data.security.issues.forEach((issue, i) => {
      report += `${i + 1}. ${issue}\n`;
    });
  }

  if (data.accessibility.violations.length > 0) {
    report += `\n---\n\n## ♿ Accessibility Violations\n\n`;

    const critical = data.accessibility.violations.filter(v => v.severity === 'critical');
    const serious = data.accessibility.violations.filter(v => v.severity === 'serious');

    if (critical.length > 0) {
      report += `### Critical (${critical.length})\n\n`;
      critical.slice(0, 10).forEach((v, i) => {
        report += `${i + 1}. **${v.type}**: ${v.role} at \`${v.path}\`\n`;
      });
      report += `\n`;
    }

    if (serious.length > 0) {
      report += `### Serious (${serious.length})\n\n`;
      serious.slice(0, 10).forEach((v, i) => {
        report += `${i + 1}. **${v.type}**: ${v.role} at \`${v.path}\`\n`;
      });
    }
  }

  report += `\n---\n\n*Generated by AGENT-DEV on ${timestamp}*\n`;

  return report;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(async () => {
  try {
    // Ensure output directory exists
    const fs = await import('fs');
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Capture data
    const data = await captureBrowserData();

    // Save raw JSON
    const jsonPath = join(OUTPUT_DIR, `capture-${Date.now()}.json`);
    writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    log.success(`Raw data saved: ${jsonPath}`);

    // Generate and save report
    const report = generateReport(data);
    const reportPath = join(OUTPUT_DIR, `report-${Date.now()}.md`);
    writeFileSync(reportPath, report);
    log.success(`Report saved: ${reportPath}`);

    log.section('✨ AGENT-DEV Browser Capture Complete');

    console.log(`\n${colors.bright}📂 Files generated:${colors.reset}`);
    console.log(`  - ${jsonPath}`);
    console.log(`  - ${reportPath}`);
    console.log(`\n${colors.bright}📊 Quick Stats:${colors.reset}`);
    console.log(`  - Console Errors: ${data.console.summary.errors}`);
    console.log(`  - Failed Requests: ${data.network.summary.failed}`);
    console.log(`  - Security Issues: ${data.security.issues.length}`);
    console.log(`  - Accessibility Violations: ${data.accessibility.violations.length}`);
    console.log(`  - LCP: ${data.performance.webVitals.LCP ? data.performance.webVitals.LCP.toFixed(0) + 'ms' : 'N/A'}`);

    process.exit(0);
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
})();
