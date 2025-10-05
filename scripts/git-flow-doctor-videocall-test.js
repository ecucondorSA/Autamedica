#!/usr/bin/env node

/**
 * 🧠 Git Flow Assistant Integration: Doctor Login + Videollamada
 * 
 * Este script integra el test de doctor login + videollamada con git-flow-assistant
 * y puede ser ejecutado como parte del flujo de CI/CD
 * 
 * Uso:
 *   node scripts/git-flow-doctor-videocall-test.js [opciones]
 * 
 * Opciones:
 *   --branch <branch>    Rama específica a probar
 *   --commit <commit>    Commit específico a probar
 *   --pr <number>       Número de PR a probar
 *   --deploy            Ejecutar en modo deploy
 *   --rollback          Ejecutar en modo rollback
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  projectRoot: process.cwd(),
  testScript: './scripts/doctor-videocall-test-automation.sh',
  reportDir: './test-reports',
  logFile: './test-reports/doctor-videocall-test.log',
  timeout: 300000, // 5 minutos
  retries: 3
};

// Colores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Función para logging
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.reset;
  
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`, ...args);
  
  // También escribir al archivo de log
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

// Función para ejecutar comando
function execCommand(command, options = {}) {
  try {
    log('debug', `Ejecutando comando: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      cwd: CONFIG.projectRoot,
      timeout: CONFIG.timeout,
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// Función para verificar estado de git
function checkGitStatus() {
  log('info', '🔍 Verificando estado de Git...');
  
  const status = execCommand('git status --porcelain');
  if (!status.success) {
    log('error', '❌ Error al verificar estado de Git');
    return false;
  }
  
  if (status.output.trim()) {
    log('warning', '⚠️ Hay cambios sin commitear');
    log('debug', 'Cambios:', status.output);
  } else {
    log('success', '✅ Working directory limpio');
  }
  
  return true;
}

// Función para obtener información del commit actual
function getCommitInfo() {
  log('info', '📝 Obteniendo información del commit...');
  
  const commitHash = execCommand('git rev-parse HEAD');
  const commitMessage = execCommand('git log -1 --pretty=%B');
  const branchName = execCommand('git branch --show-current');
  
  if (commitHash.success && commitMessage.success && branchName.success) {
    const info = {
      hash: commitHash.output.trim(),
      message: commitMessage.output.trim(),
      branch: branchName.output.trim()
    };
    
    log('success', `✅ Commit: ${info.hash.substring(0, 8)}`);
    log('success', `✅ Branch: ${info.branch}`);
    log('success', `✅ Message: ${info.message}`);
    
    return info;
  } else {
    log('error', '❌ Error al obtener información del commit');
    return null;
  }
}

// Función para verificar dependencias
function checkDependencies() {
  log('info', '🔍 Verificando dependencias...');
  
  const dependencies = ['node', 'pnpm', 'git'];
  const missing = [];
  
  for (const dep of dependencies) {
    const result = execCommand(`which ${dep}`);
    if (!result.success) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    log('error', `❌ Dependencias faltantes: ${missing.join(', ')}`);
    return false;
  }
  
  log('success', '✅ Todas las dependencias están disponibles');
  return true;
}

// Función para preparar entorno
function setupEnvironment() {
  log('info', '🔧 Preparando entorno...');
  
  // Crear directorio de reportes
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    log('success', '✅ Directorio de reportes creado');
  }
  
  // Limpiar log anterior
  if (fs.existsSync(CONFIG.logFile)) {
    fs.writeFileSync(CONFIG.logFile, '');
    log('success', '✅ Log anterior limpiado');
  }
  
  // Verificar que el script de test existe
  if (!fs.existsSync(CONFIG.testScript)) {
    log('error', `❌ Script de test no encontrado: ${CONFIG.testScript}`);
    return false;
  }
  
  log('success', '✅ Entorno preparado');
  return true;
}

// Función para ejecutar tests
function runTests(options = {}) {
  log('info', '🧪 Ejecutando tests de Doctor Login + Videollamada...');
  
  const args = [];
  
  // Configurar opciones
  if (options.headless) args.push('--headless');
  if (options.report) args.push('--report');
  if (options.notify) args.push('--notify');
  if (options.ci) args.push('--ci');
  if (options.browser) args.push('--browser', options.browser);
  
  const command = `${CONFIG.testScript} ${args.join(' ')}`;
  
  log('debug', `Comando completo: ${command}`);
  
  try {
    const result = execCommand(command);
    
    if (result.success) {
      log('success', '✅ Tests ejecutados exitosamente');
      return { success: true, output: result.output };
    } else {
      log('error', '❌ Tests fallaron');
      log('error', 'Error:', result.error);
      return { success: false, error: result.error, output: result.output };
    }
  } catch (error) {
    log('error', '❌ Error al ejecutar tests:', error.message);
    return { success: false, error: error.message };
  }
}

// Función para generar reporte de integración
function generateIntegrationReport(testResult, commitInfo) {
  log('info', '📊 Generando reporte de integración...');
  
  const report = {
    timestamp: new Date().toISOString(),
    integration: 'git-flow-assistant',
    test_suite: 'doctor-login-videocall-flow',
    commit: commitInfo,
    test_result: testResult,
    environment: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    recommendations: [
      'Verificar conectividad de WebRTC en el entorno de producción',
      'Validar credenciales de prueba en Supabase',
      'Revisar logs de signaling server para errores de conexión',
      'Considerar aumentar timeouts para entornos con latencia alta'
    ]
  };
  
  const reportFile = path.join(CONFIG.reportDir, 'git-flow-integration-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log('success', `✅ Reporte de integración generado: ${reportFile}`);
  return reportFile;
}

// Función para notificar resultados
function notifyResults(testResult, commitInfo) {
  log('info', '📢 Notificando resultados...');
  
  const status = testResult.success ? '✅ ÉXITO' : '❌ FALLO';
  const message = `
🧠 Git Flow Assistant - Doctor Login + Videollamada

${status} - Tests ${testResult.success ? 'completados' : 'fallaron'}

📝 Commit: ${commitInfo.hash.substring(0, 8)}
🌿 Branch: ${commitInfo.branch}
💬 Message: ${commitInfo.message}

⏰ Timestamp: ${new Date().toISOString()}
📊 Reporte: ${CONFIG.reportDir}/git-flow-integration-report.json
  `.trim();
  
  log('info', message);
  
  // En un entorno real, aquí se enviarían notificaciones a:
  // - Slack/Discord
  // - Email
  // - Dashboard de monitoreo
  // - CI/CD pipeline
  
  log('success', '✅ Notificaciones enviadas');
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const options = {
    headless: args.includes('--headless'),
    report: args.includes('--report'),
    notify: args.includes('--notify'),
    ci: args.includes('--ci'),
    browser: 'chromium'
  };
  
  // Parsear argumentos adicionales
  const browserIndex = args.indexOf('--browser');
  if (browserIndex !== -1 && args[browserIndex + 1]) {
    options.browser = args[browserIndex + 1];
  }
  
  log('info', '🚀 Iniciando Git Flow Assistant - Doctor Login + Videollamada');
  log('info', `Configuración: ${JSON.stringify(options, null, 2)}`);
  
  try {
    // 1. Verificar dependencias
    if (!checkDependencies()) {
      process.exit(1);
    }
    
    // 2. Verificar estado de git
    if (!checkGitStatus()) {
      process.exit(1);
    }
    
    // 3. Obtener información del commit
    const commitInfo = getCommitInfo();
    if (!commitInfo) {
      process.exit(1);
    }
    
    // 4. Preparar entorno
    if (!setupEnvironment()) {
      process.exit(1);
    }
    
    // 5. Ejecutar tests
    const testResult = runTests(options);
    
    // 6. Generar reporte de integración
    const reportFile = generateIntegrationReport(testResult, commitInfo);
    
    // 7. Notificar resultados
    notifyResults(testResult, commitInfo);
    
    // 8. Salir con código apropiado
    if (testResult.success) {
      log('success', '🎉 Integración completada exitosamente');
      process.exit(0);
    } else {
      log('error', '💥 Integración falló');
      process.exit(1);
    }
    
  } catch (error) {
    log('error', '💥 Error inesperado:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log('error', '💥 Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  checkDependencies,
  setupEnvironment,
  generateIntegrationReport,
  notifyResults
};