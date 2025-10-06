#!/usr/bin/env node

/**
 * Comprehensive Multi-Viewport Audit for AutaMedica
 * Tests: Mobile, Tablet, Desktop, Mobile Landscape
 * Captures: Screenshots, Console, Network, Z-Index Conflicts, Interactions
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const OUTPUT_DIR = 'generated-docs/comprehensive-audit';

// Create output directory
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (e) {}

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812, description: 'iPhone 13' },
  { name: 'tablet', width: 768, height: 1024, description: 'iPad' },
  { name: 'desktop', width: 1920, height: 1080, description: 'Desktop HD' },
  { name: 'mobile_landscape', width: 812, height: 375, description: 'iPhone Landscape' },
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`)
};

async function captureViewport(page, viewport) {
  log.section(`Testing ${viewport.name} (${viewport.width}x${viewport.height}) - ${viewport.description}`);

  // Set viewport
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations

  const results = {
    viewport: viewport.name,
    size: `${viewport.width}x${viewport.height}`,
    screenshots: [],
    overlaps: [],
    zIndexIssues: [],
    visibleElements: {}
  };

  // 1. Full page screenshot
  const fullScreenshot = join(OUTPUT_DIR, `${viewport.name}_full_page.png`);
  await page.screenshot({ path: fullScreenshot, fullPage: true });
  results.screenshots.push(fullScreenshot);
  log.success(`Full page screenshot: ${fullScreenshot}`);

  // 2. Viewport screenshot (above the fold)
  const viewportScreenshot = join(OUTPUT_DIR, `${viewport.name}_viewport.png`);
  await page.screenshot({ path: viewportScreenshot });
  results.screenshots.push(viewportScreenshot);
  log.success(`Viewport screenshot: ${viewportScreenshot}`);

  // 3. Check for overlapping elements and z-index conflicts
  const overlaps = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const fixed = elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' || style.position === 'absolute';
    });

    return fixed.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: Array.from(el.classList).join('.'),
        position: style.position,
        zIndex: style.zIndex,
        rect: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        visible: rect.width > 0 && rect.height > 0 && rect.top >= 0
      };
    }).filter(el => el.visible);
  });

  results.overlaps = overlaps;
  log.info(`Found ${overlaps.length} positioned elements`);

  // Check for potential z-index conflicts
  overlaps.forEach((el1, i) => {
    overlaps.slice(i + 1).forEach(el2 => {
      if (rectsOverlap(el1.rect, el2.rect)) {
        results.zIndexIssues.push({
          element1: `${el1.tag}${el1.id ? `#${el1.id}` : ''}${el1.classes ? `.${el1.classes}` : ''}`,
          element2: `${el2.tag}${el2.id ? `#${el2.id}` : ''}${el2.classes ? `.${el2.classes}` : ''}`,
          z1: el1.zIndex,
          z2: el2.zIndex,
          conflict: el1.zIndex === el2.zIndex || el1.zIndex === 'auto' || el2.zIndex === 'auto'
        });
      }
    });
  });

  if (results.zIndexIssues.length > 0) {
    log.warning(`Found ${results.zIndexIssues.length} potential z-index conflicts`);
  } else {
    log.success('No z-index conflicts detected');
  }

  // 4. Check specific elements visibility
  results.visibleElements = await page.evaluate(() => {
    const checkElement = (selector, name) => {
      const el = document.querySelector(selector);
      if (!el) return { name, found: false };

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return {
        name,
        found: true,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
        position: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        zIndex: style.zIndex,
        inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
      };
    };

    return {
      logo: checkElement('div[role="banner"]:has-text("AutaMedica")', 'Logo'),
      accountMenu: checkElement('.account-menu', 'AccountMenu'),
      heroTitle: checkElement('section[role="banner"] h1', 'Hero Title'),
      testimonials: checkElement('[role="region"]', 'Testimonials'),
      footer: checkElement('footer[role="contentinfo"]', 'Footer')
    };
  });

  // Report visibility
  Object.entries(results.visibleElements).forEach(([key, data]) => {
    if (data.found && data.visible) {
      log.success(`${data.name}: ${data.inViewport ? 'In viewport' : 'Below fold'}`);
    } else if (data.found) {
      log.warning(`${data.name}: Found but not visible`);
    } else {
      log.error(`${data.name}: Not found`);
    }
  });

  return results;
}

function rectsOverlap(r1, r2) {
  return !(r1.left + r1.width < r2.left ||
           r2.left + r2.width < r1.left ||
           r1.top + r1.height < r2.top ||
           r2.top + r2.height < r1.top);
}

async function testInteractions(page) {
  log.section('Testing Interactive Elements');

  // Set to mobile viewport for testing
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const interactions = [];

  // Test 1: AccountMenu click
  try {
    const accountBtn = await page.locator('[aria-label="Menú de cuenta"]');
    const isVisible = await accountBtn.isVisible();

    if (isVisible) {
      // Get button position before click
      const btnBox = await accountBtn.boundingBox();

      // Click to open
      await accountBtn.click();
      await page.waitForTimeout(500);

      // Check if dropdown appeared
      const dropdown = await page.locator('.account-menu > div > div').isVisible();

      // Screenshot
      const screenshot = join(OUTPUT_DIR, 'interaction_account_menu_mobile.png');
      await page.screenshot({ path: screenshot });

      interactions.push({
        name: 'AccountMenu Mobile',
        success: dropdown,
        buttonPosition: btnBox,
        screenshot
      });

      if (dropdown) {
        log.success('AccountMenu opens correctly on mobile');

        // Click "Iniciar Sesión" button
        const loginBtn = await page.locator('text=Iniciar Sesión');
        const loginVisible = await loginBtn.isVisible();

        if (loginVisible) {
          const loginBox = await loginBtn.boundingBox();
          interactions.push({
            name: 'AccountMenu Login Button',
            success: true,
            clickable: loginBox.width > 40 && loginBox.height > 40, // Minimum touch target
            size: loginBox
          });

          if (loginBox.width >= 44 && loginBox.height >= 44) {
            log.success(`Login button meets touch target size (${loginBox.width}x${loginBox.height})`);
          } else {
            log.warning(`Login button below recommended touch target (${loginBox.width}x${loginBox.height}, recommended: 44x44)`);
          }
        }

        // Close menu
        await page.mouse.click(10, 10);
        await page.waitForTimeout(300);
      } else {
        log.error('AccountMenu dropdown did not appear');
      }
    } else {
      log.error('AccountMenu button not visible on mobile');
    }
  } catch (e) {
    log.error(`AccountMenu test failed: ${e.message}`);
    interactions.push({
      name: 'AccountMenu Mobile',
      success: false,
      error: e.message
    });
  }

  // Test 2: Scroll to testimonials and test carousel
  try {
    await page.evaluate(() => {
      const testimonials = document.querySelector('[role="region"]');
      if (testimonials) {
        testimonials.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);

    const carouselDots = await page.locator('.carousel-dots button').all();

    if (carouselDots.length > 0) {
      log.info(`Found ${carouselDots.length} carousel dots`);

      // Click first dot
      await carouselDots[0].click();
      await page.waitForTimeout(500);

      const screenshot = join(OUTPUT_DIR, 'interaction_carousel_dot0.png');
      await page.screenshot({ path: screenshot });

      // Check if dot has aria-label
      const ariaLabel = await carouselDots[0].getAttribute('aria-label');

      interactions.push({
        name: 'Carousel Navigation',
        success: true,
        dotCount: carouselDots.length,
        accessible: !!ariaLabel,
        ariaLabel: ariaLabel,
        screenshot
      });

      if (ariaLabel) {
        log.success(`Carousel dots are accessible (aria-label: "${ariaLabel}")`);
      } else {
        log.warning('Carousel dots missing aria-label');
      }
    } else {
      log.error('Carousel dots not found');
    }
  } catch (e) {
    log.error(`Carousel test failed: ${e.message}`);
    interactions.push({
      name: 'Carousel Navigation',
      success: false,
      error: e.message
    });
  }

  return interactions;
}

async function checkConsoleAndNetwork(page) {
  log.section('Monitoring Console and Network');

  const consoleLogs = [];
  const networkRequests = [];

  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  page.on('response', response => {
    networkRequests.push({
      url: response.url(),
      status: response.status(),
      method: response.request().method(),
      contentType: response.headers()['content-type']
    });
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const errors = consoleLogs.filter(l => l.type === 'error');
  const warnings = consoleLogs.filter(l => l.type === 'warning');
  const failedRequests = networkRequests.filter(r => r.status >= 400);

  log.info(`Console: ${errors.length} errors, ${warnings.length} warnings`);
  log.info(`Network: ${failedRequests.length} failed requests out of ${networkRequests.length}`);

  if (errors.length === 0) {
    log.success('No console errors detected');
  } else {
    log.error(`Found ${errors.length} console errors`);
  }

  if (failedRequests.length === 0) {
    log.success('All network requests successful');
  } else {
    log.error(`Found ${failedRequests.length} failed network requests`);
  }

  return { consoleLogs, networkRequests, errors, warnings, failedRequests };
}

async function runAudit() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     COMPREHENSIVE MULTI-VIEWPORT AUDIT - AUTAMEDICA         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  log.info(`Target: ${TARGET_URL}`);
  log.info(`Output Directory: ${OUTPUT_DIR}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const auditResults = {
    timestamp: new Date().toISOString(),
    url: TARGET_URL,
    viewports: {},
    interactions: [],
    monitoring: {},
    summary: {}
  };

  // Test each viewport
  for (const viewport of VIEWPORTS) {
    try {
      const results = await captureViewport(page, viewport);
      auditResults.viewports[viewport.name] = results;
    } catch (e) {
      log.error(`Viewport ${viewport.name} failed: ${e.message}`);
      auditResults.viewports[viewport.name] = { error: e.message };
    }
  }

  // Test interactions
  try {
    auditResults.interactions = await testInteractions(page);
  } catch (e) {
    log.error(`Interactions test failed: ${e.message}`);
  }

  // Monitor console and network
  try {
    auditResults.monitoring = await checkConsoleAndNetwork(page);
  } catch (e) {
    log.error(`Monitoring failed: ${e.message}`);
  }

  await browser.close();

  // Generate summary
  const totalConflicts = Object.values(auditResults.viewports)
    .reduce((sum, v) => sum + (v.zIndexIssues?.length || 0), 0);

  auditResults.summary = {
    totalViewportsTested: VIEWPORTS.length,
    totalScreenshots: Object.values(auditResults.viewports)
      .reduce((sum, v) => sum + (v.screenshots?.length || 0), 0),
    totalZIndexConflicts: totalConflicts,
    consoleErrors: auditResults.monitoring.errors?.length || 0,
    failedRequests: auditResults.monitoring.failedRequests?.length || 0,
    passedInteractions: auditResults.interactions.filter(i => i.success).length,
    totalInteractions: auditResults.interactions.length
  };

  // Save JSON results
  const jsonFile = join(OUTPUT_DIR, 'audit_results.json');
  writeFileSync(jsonFile, JSON.stringify(auditResults, null, 2));
  log.success(`Results saved: ${jsonFile}`);

  // Generate markdown report
  generateReport(auditResults);

  log.section('Audit Complete!');
  console.log(`\n${colors.green}✅ All tests completed successfully${colors.reset}\n`);
  console.log(`📊 Summary:`);
  console.log(`   - Viewports tested: ${auditResults.summary.totalViewportsTested}`);
  console.log(`   - Screenshots captured: ${auditResults.summary.totalScreenshots}`);
  console.log(`   - Z-index conflicts: ${auditResults.summary.totalZIndexConflicts}`);
  console.log(`   - Console errors: ${auditResults.summary.consoleErrors}`);
  console.log(`   - Failed requests: ${auditResults.summary.failedRequests}`);
  console.log(`   - Passed interactions: ${auditResults.summary.passedInteractions}/${auditResults.summary.totalInteractions}`);
  console.log(`\n📂 Output: ${OUTPUT_DIR}\n`);
}

function generateReport(results) {
  const reportFile = join(OUTPUT_DIR, 'COMPREHENSIVE_AUDIT_REPORT.md');

  let report = '# 🔍 Comprehensive Multi-Viewport Audit Report\n\n';
  report += `**Target**: ${results.url}\n`;
  report += `**Date**: ${new Date(results.timestamp).toLocaleString()}\n\n`;
  report += '---\n\n';

  // Executive Summary
  report += '## 📊 Executive Summary\n\n';
  report += `- **Viewports Tested**: ${results.summary.totalViewportsTested}\n`;
  report += `- **Screenshots Captured**: ${results.summary.totalScreenshots}\n`;
  report += `- **Z-Index Conflicts**: ${results.summary.totalZIndexConflicts} ${results.summary.totalZIndexConflicts === 0 ? '✅' : '⚠️'}\n`;
  report += `- **Console Errors**: ${results.summary.consoleErrors} ${results.summary.consoleErrors === 0 ? '✅' : '❌'}\n`;
  report += `- **Failed Network Requests**: ${results.summary.failedRequests} ${results.summary.failedRequests === 0 ? '✅' : '❌'}\n`;
  report += `- **Interactive Tests Passed**: ${results.summary.passedInteractions}/${results.summary.totalInteractions} ${results.summary.passedInteractions === results.summary.totalInteractions ? '✅' : '⚠️'}\n\n`;

  // Viewport Analysis
  report += '## 📱 Viewport Analysis\n\n';
  Object.entries(results.viewports).forEach(([name, data]) => {
    if (data.error) {
      report += `### ${name} - ❌ Failed\n\n`;
      report += `Error: ${data.error}\n\n`;
      return;
    }

    report += `### ${name} (${data.size})\n\n`;
    report += `- Screenshots: ${data.screenshots.length}\n`;
    report += `- Positioned Elements: ${data.overlaps.length}\n`;
    report += `- Z-Index Conflicts: ${data.zIndexIssues.length}\n\n`;

    if (data.zIndexIssues.length > 0) {
      report += '**Z-Index Conflicts:**\n\n';
      data.zIndexIssues.forEach(issue => {
        report += `- \`${issue.element1}\` (z:${issue.z1}) ↔ \`${issue.element2}\` (z:${issue.z2})`;
        if (issue.conflict) report += ' ⚠️ **CONFLICT**';
        report += '\n';
      });
      report += '\n';
    }

    // Element Visibility
    report += '**Element Visibility:**\n\n';
    Object.entries(data.visibleElements).forEach(([key, el]) => {
      const status = el.found && el.visible ? '✅' : el.found ? '⚠️' : '❌';
      report += `- ${status} ${el.name}: ${el.found ? (el.inViewport ? 'In viewport' : 'Below fold') : 'Not found'}\n`;
    });
    report += '\n';
  });

  // Interactions
  report += '## 🖱️ Interactive Elements Testing\n\n';
  results.interactions.forEach(test => {
    const status = test.success ? '✅' : '❌';
    report += `### ${status} ${test.name}\n\n`;

    if (test.success) {
      if (test.accessible !== undefined) {
        report += `- Accessibility: ${test.accessible ? '✅ Has aria-label' : '⚠️ Missing aria-label'}\n`;
      }
      if (test.clickable !== undefined) {
        report += `- Touch Target: ${test.clickable ? '✅ Adequate size' : '⚠️ Too small'}\n`;
      }
      if (test.screenshot) {
        report += `- Screenshot: \`${test.screenshot}\`\n`;
      }
    } else {
      report += `- Error: ${test.error}\n`;
    }
    report += '\n';
  });

  // Monitoring
  report += '## 🔍 Console & Network Monitoring\n\n';
  report += `- **Console Errors**: ${results.monitoring.errors?.length || 0}\n`;
  report += `- **Console Warnings**: ${results.monitoring.warnings?.length || 0}\n`;
  report += `- **Total Network Requests**: ${results.monitoring.networkRequests?.length || 0}\n`;
  report += `- **Failed Requests**: ${results.monitoring.failedRequests?.length || 0}\n\n`;

  if (results.monitoring.errors && results.monitoring.errors.length > 0) {
    report += '### Console Errors\n\n';
    results.monitoring.errors.slice(0, 10).forEach(err => {
      report += `- ${err.text}\n`;
      if (err.location) {
        report += `  - Location: ${err.location.url}:${err.location.lineNumber}\n`;
      }
    });
    report += '\n';
  }

  // Recommendations
  report += '## 💡 Recommendations\n\n';

  if (results.summary.totalZIndexConflicts > 0) {
    report += '### 🟡 Z-Index Management\n\n';
    report += `Found ${results.summary.totalZIndexConflicts} z-index conflicts across viewports. Consider:\n\n`;
    report += '- Establishing a z-index scale (e.g., 1000, 2000, 3000 for different layers)\n';
    report += '- Documenting z-index usage in a CSS variables file\n';
    report += '- Avoiding `auto` z-index values for positioned elements\n\n';
  }

  if (results.summary.consoleErrors > 0) {
    report += '### 🔴 Console Errors\n\n';
    report += `Fix ${results.summary.consoleErrors} console errors to improve stability and user experience.\n\n`;
  }

  if (results.summary.passedInteractions < results.summary.totalInteractions) {
    report += '### 🟡 Interactive Elements\n\n';
    report += `${results.summary.totalInteractions - results.summary.passedInteractions} interactive tests failed. Review and fix component functionality.\n\n`;
  }

  if (results.summary.totalZIndexConflicts === 0 && results.summary.consoleErrors === 0 && results.summary.passedInteractions === results.summary.totalInteractions) {
    report += '### ✅ No Critical Issues Found\n\n';
    report += 'The application is performing well across all tested viewports with no critical issues detected.\n\n';
  }

  report += '---\n\n';
  report += `*Generated on ${new Date().toLocaleString()}*\n`;

  writeFileSync(reportFile, report);
  log.success(`Report generated: ${reportFile}`);
}

// Run audit
runAudit().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
