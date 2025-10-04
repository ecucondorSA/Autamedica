#!/usr/bin/env node

/**
 * AutaMedica Auth SSO Monitoring Script
 * Verifica la salud del sistema de autenticación enterprise
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MONITORING_CONFIG = {
  // URLs a monitorear (con soporte para BASE_URL de environment)
  endpoints: {
    webApp: process.env.BASE_URL || 'https://autamedica-web-app.pages.dev',
    authHub: process.env.AUTH_HUB_URL || 'https://auth.autamedica.com',
    doctors: process.env.DOCTORS_URL || 'https://autamedica-doctors.pages.dev',
    patients: process.env.PATIENTS_URL || 'https://autamedica-patients.pages.dev',
    companies: process.env.COMPANIES_URL || 'https://autamedica-companies.pages.dev'
  },

  // Rutas críticas para verificar redirects
  criticalPaths: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ],

  // Headers de seguridad requeridos
  requiredSecurityHeaders: [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy'
  ],

  // Timeouts
  timeout: 10000,
  retries: 3
};

class AuthMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async run() {
    logger.info('🔒 AutaMedica Auth SSO Monitor v1.0');
    logger.info('=====================================');
    logger.info(`⏰ ${this.results.timestamp}`);
    logger.info('');

    await this.checkAuthRedirects();
    await this.checkSecurityHeaders();
    await this.checkPortalConnectivity();
    await this.checkCookieCompliance();

    this.generateReport();
    this.saveResults();

    return this.results;
  }

  async checkAuthRedirects() {
    logger.info('📍 Verificando redirects de auth...');

    for (const path of MONITORING_CONFIG.criticalPaths) {
      const check = {
        type: 'auth_redirect',
        path,
        timestamp: new Date().toISOString(),
        status: 'running'
      };

      try {
        const result = await this.makeRequest(MONITORING_CONFIG.endpoints.webApp + path, {
          followRedirects: false
        });

        const expectedTarget = 'auth.autamedica.com';
        const actualLocation = result.headers.location || '';

        if (result.statusCode === 301 && actualLocation.includes(expectedTarget)) {
          check.status = 'passed';
          check.message = `✅ ${path} → 301 → ${actualLocation}`;
          this.results.summary.passed++;
        } else {
          check.status = 'failed';
          check.message = `❌ ${path} → ${result.statusCode} → ${actualLocation}`;
          this.results.summary.failed++;
        }

        // Verificar headers de monitoreo
        const sourceHeader = result.headers['x-auth-redirect-source'];
        const targetHeader = result.headers['x-auth-redirect-target'];

        if (sourceHeader === 'web-app' && targetHeader === 'auth-hub') {
          check.monitoring = '✅ Headers de monitoreo presentes';
        } else {
          check.monitoring = '⚠️ Headers de monitoreo faltantes';
          this.results.summary.warnings++;
        }

      } catch (error) {
        check.status = 'failed';
        check.message = `❌ Error: ${error.message}`;
        this.results.summary.failed++;
      }

      this.results.checks.push(check);
      logger.info(`  ${check.message}`);
    }

    this.results.summary.total += MONITORING_CONFIG.criticalPaths.length;
  }

  async checkSecurityHeaders() {
    logger.info('\n🛡️  Verificando headers de seguridad...');

    const check = {
      type: 'security_headers',
      timestamp: new Date().toISOString(),
      status: 'running',
      details: {}
    };

    try {
      const result = await this.makeRequest(MONITORING_CONFIG.endpoints.webApp);

      for (const headerName of MONITORING_CONFIG.requiredSecurityHeaders) {
        const headerValue = result.headers[headerName];

        if (headerValue) {
          check.details[headerName] = {
            status: '✅',
            value: headerValue.substring(0, 100) + (headerValue.length > 100 ? '...' : '')
          };
        } else {
          check.details[headerName] = {
            status: '❌',
            value: 'Missing'
          };
          this.results.summary.failed++;
        }
      }

      // Verificar CSP específico para AutaMedica
      const csp = result.headers['content-security-policy'] || '';
      if (csp.includes('*.autamedica.com') && csp.includes('*.supabase.co')) {
        check.cspCompliance = '✅ CSP configurado para AutaMedica domains';
      } else {
        check.cspCompliance = '⚠️ CSP podría necesitar ajustes para AutaMedica';
        this.results.summary.warnings++;
      }

      check.status = 'completed';
      check.message = 'Security headers verification completed';

    } catch (error) {
      check.status = 'failed';
      check.message = `❌ Error verificando headers: ${error.message}`;
      this.results.summary.failed++;
    }

    this.results.checks.push(check);
    this.results.summary.total++;

    // Log results
    for (const [header, details] of Object.entries(check.details)) {
      logger.info(`  ${details.status} ${header}: ${details.value}`);
    }
    if (check.cspCompliance) {
      logger.info(`  ${check.cspCompliance}`);
    }
  }

  async checkPortalConnectivity() {
    logger.info('\n🌐 Verificando conectividad de portales...');

    const portals = ['doctors', 'patients', 'companies'];

    for (const portal of portals) {
      const check = {
        type: 'portal_connectivity',
        portal,
        timestamp: new Date().toISOString(),
        status: 'running'
      };

      try {
        const url = MONITORING_CONFIG.endpoints[portal];
        const result = await this.makeRequest(url);

        if (result.statusCode >= 200 && result.statusCode < 400) {
          check.status = 'passed';
          check.message = `✅ ${portal} portal: ${result.statusCode}`;
          this.results.summary.passed++;
        } else {
          check.status = 'warning';
          check.message = `⚠️ ${portal} portal: ${result.statusCode} (podría requerir auth)`;
          this.results.summary.warnings++;
        }

      } catch (error) {
        check.status = 'failed';
        check.message = `❌ ${portal} portal: ${error.message}`;
        this.results.summary.failed++;
      }

      this.results.checks.push(check);
      logger.info(`  ${check.message}`);
    }

    this.results.summary.total += portals.length;
  }

  async checkCookieCompliance() {
    logger.info('\n🍪 Verificando compliance de cookies...');

    const check = {
      type: 'cookie_compliance',
      timestamp: new Date().toISOString(),
      status: 'info',
      message: 'ℹ️ Cookie compliance requiere verificación manual en Auth Hub'
    };

    check.requirements = {
      domain: '.autamedica.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'None'
    };

    check.instructions = [
      '1. Verificar que Auth Hub setea am_session con Domain=.autamedica.com',
      '2. Confirmar flags: Secure; HttpOnly; SameSite=None',
      '3. Validar TTL y refresh automático',
      '4. Probar cross-domain SSO entre portales'
    ];

    this.results.checks.push(check);
    this.results.summary.total++;

    logger.info(`  ${check.message}`);
    logger.info('  📋 Requisitos de cookie am_session:');
    for (const [key, value] of Object.entries(check.requirements)) {
      logger.info(`    ${key}: ${value}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, MONITORING_CONFIG.timeout);

      const req = https.get(url, {
        timeout: MONITORING_CONFIG.timeout,
        ...options
      }, (res) => {
        clearTimeout(timeout);

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  generateReport() {
    logger.info('\n📊 RESUMEN DEL MONITOREO');
    logger.info('========================');
    logger.info(`✅ Passed: ${this.results.summary.passed}`);
    logger.info(`❌ Failed: ${this.results.summary.failed}`);
    logger.info(`⚠️ Warnings: ${this.results.summary.warnings}`);
    logger.info(`📊 Total: ${this.results.summary.total}`);

    const successRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(1);
    logger.info(`🎯 Success Rate: ${successRate}%`);

    if (this.results.summary.failed > 0) {
      logger.info('\n🚨 ISSUES TO ADDRESS:');
      this.results.checks
        .filter(check => check.status === 'failed')
        .forEach(check => {
          logger.info(`  • ${check.message}`);
        });
    }

    if (this.results.summary.warnings > 0) {
      logger.info('\n⚠️ WARNINGS:');
      this.results.checks
        .filter(check => check.status === 'warning' || check.monitoring?.includes('⚠️'))
        .forEach(check => {
          const message = check.monitoring || check.message;
          logger.info(`  • ${message}`);
        });
    }
  }

  saveResults() {
    const outputDir = path.join(process.cwd(), 'monitoring-results');
    const outputFile = path.join(outputDir, `auth-monitor-${Date.now()}.json`);

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
      logger.info(`\n💾 Resultados guardados en: ${outputFile}`);
    } catch (error) {
      logger.error(`❌ Error guardando resultados: ${error.message}`);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new AuthMonitor();

  monitor.run()
    .then(() => {
      const exitCode = monitor.results.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      logger.error('❌ Error ejecutando monitor:', error);
      process.exit(1);
    });
}

module.exports = AuthMonitor;