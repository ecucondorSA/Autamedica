#!/usr/bin/env node

/**
 * 🏥 Docker Health Check - AltaMedica
 * Verifica el estado de todos los servicios Docker
 */

import { execSync } from 'child_process';

const SERVICES = [
  {
    name: 'PostgreSQL',
    container: 'autamedica-postgres',
    port: 5432,
    healthCheck: 'postgres:5432',
  },
  {
    name: 'Kong (API Gateway)',
    container: 'autamedica-kong',
    port: 8000,
    healthCheck: 'http://localhost:8000',
  },
  {
    name: 'GoTrue (Auth)',
    container: 'autamedica-auth',
    port: 9999,
    healthCheck: 'http://localhost:9999/health',
  },
  {
    name: 'PostgREST (API)',
    container: 'autamedica-rest',
    port: 3000,
    healthCheck: 'rest:3000',
  },
  {
    name: 'Realtime',
    container: 'autamedica-realtime',
    port: 4000,
    healthCheck: 'http://localhost:4000/api/health',
  },
  {
    name: 'Storage',
    container: 'autamedica-storage',
    port: 5000,
    healthCheck: 'http://localhost:5000/status',
  },
  {
    name: 'ImgProxy',
    container: 'autamedica-imgproxy',
    port: 5001,
    healthCheck: 'imgproxy:5001',
  },
  {
    name: 'Meta',
    container: 'autamedica-meta',
    port: 8080,
    healthCheck: 'meta:8080',
  },
  {
    name: 'Studio (Dashboard)',
    container: 'autamedica-studio',
    port: 3010,
    healthCheck: 'http://localhost:3010',
  },
  {
    name: 'Inbucket (Email)',
    container: 'autamedica-inbucket',
    port: 9000,
    healthCheck: 'http://localhost:9000',
  },
  {
    name: 'Playwright',
    container: 'autamedica-playwright',
    port: null,
    healthCheck: null,
  },
];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function exec(command, silent = false) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) {
      console.error(`${COLORS.red}Error ejecutando: ${command}${COLORS.reset}`);
    }
    return null;
  }
}

function checkContainerStatus(containerName) {
  const result = exec(
    `docker inspect --format='{{.State.Status}}' ${containerName} 2>/dev/null`,
    true
  );
  return result ? result.trim() : null;
}

function checkContainerHealth(containerName) {
  const result = exec(
    `docker inspect --format='{{.State.Health.Status}}' ${containerName} 2>/dev/null`,
    true
  );
  return result && result.trim() !== '<no value>' ? result.trim() : null;
}

function getContainerUptime(containerName) {
  const result = exec(
    `docker inspect --format='{{.State.StartedAt}}' ${containerName} 2>/dev/null`,
    true
  );
  if (!result) return null;

  const startTime = new Date(result.trim());
  const now = new Date();
  const uptimeMs = now - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  if (uptimeSeconds < 60) return `${uptimeSeconds}s`;
  if (uptimeSeconds < 3600) return `${Math.floor(uptimeSeconds / 60)}m`;
  return `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
}

function printHeader() {
  console.log('\n' + COLORS.bright + COLORS.cyan + '='.repeat(70) + COLORS.reset);
  console.log(COLORS.bright + COLORS.cyan + '🐳 AltaMedica - Docker Health Check' + COLORS.reset);
  console.log(COLORS.bright + COLORS.cyan + '='.repeat(70) + COLORS.reset + '\n');
}

function printServiceStatus(service, status, health, uptime) {
  const statusIcon = status === 'running' ? '✅' : '❌';
  const healthIcon = health === 'healthy' ? '💚' : health === 'unhealthy' ? '💔' : '⚪';

  let statusColor = COLORS.green;
  if (status !== 'running') statusColor = COLORS.red;
  else if (health === 'unhealthy') statusColor = COLORS.yellow;

  console.log(`${statusIcon} ${healthIcon} ${COLORS.bright}${service.name}${COLORS.reset}`);
  console.log(`   Container: ${statusColor}${service.container}${COLORS.reset}`);
  console.log(`   Status: ${statusColor}${status || 'not running'}${COLORS.reset}`);

  if (health) {
    console.log(`   Health: ${statusColor}${health}${COLORS.reset}`);
  }

  if (uptime) {
    console.log(`   Uptime: ${COLORS.cyan}${uptime}${COLORS.reset}`);
  }

  if (service.port) {
    console.log(`   Port: ${COLORS.blue}${service.port}${COLORS.reset}`);
  }

  console.log('');
}

function printSummary(results) {
  const total = results.length;
  const running = results.filter(r => r.status === 'running').length;
  const healthy = results.filter(r => r.health === 'healthy').length;
  const unhealthy = results.filter(r => r.health === 'unhealthy').length;

  console.log(COLORS.bright + COLORS.cyan + '='.repeat(70) + COLORS.reset);
  console.log(COLORS.bright + '📊 Resumen:' + COLORS.reset);
  console.log(`   Total servicios: ${total}`);
  console.log(`   ${COLORS.green}Running: ${running}${COLORS.reset}`);
  console.log(`   ${COLORS.green}Healthy: ${healthy}${COLORS.reset}`);
  if (unhealthy > 0) {
    console.log(`   ${COLORS.red}Unhealthy: ${unhealthy}${COLORS.reset}`);
  }
  console.log(COLORS.bright + COLORS.cyan + '='.repeat(70) + COLORS.reset + '\n');
}

function printQuickCommands() {
  console.log(COLORS.bright + '🔧 Comandos útiles:' + COLORS.reset);
  console.log(`   ${COLORS.cyan}pnpm docker:logs${COLORS.reset}       - Ver logs de todos los servicios`);
  console.log(`   ${COLORS.cyan}pnpm docker:ps${COLORS.reset}         - Ver status de contenedores`);
  console.log(`   ${COLORS.cyan}pnpm docker:restart${COLORS.reset}    - Reiniciar todos los servicios`);
  console.log(`   ${COLORS.cyan}pnpm docker:up${COLORS.reset}         - Levantar todos los servicios`);
  console.log(`   ${COLORS.cyan}pnpm docker:down${COLORS.reset}       - Detener todos los servicios`);
  console.log('');
}

async function main() {
  printHeader();

  // Verificar que Docker esté corriendo
  const dockerRunning = exec('docker info 2>/dev/null', true);
  if (!dockerRunning) {
    console.log(`${COLORS.red}❌ Docker no está corriendo${COLORS.reset}\n`);
    process.exit(1);
  }

  const results = [];

  for (const service of SERVICES) {
    const status = checkContainerStatus(service.container);
    const health = checkContainerHealth(service.container);
    const uptime = getContainerUptime(service.container);

    results.push({ service, status, health, uptime });
    printServiceStatus(service, status, health, uptime);
  }

  printSummary(results);
  printQuickCommands();

  // Exit code basado en servicios críticos
  const criticalServices = ['autamedica-postgres', 'autamedica-kong', 'autamedica-auth'];
  const criticalRunning = results.filter(
    r => criticalServices.includes(r.service.container) && r.status === 'running'
  ).length;

  if (criticalRunning !== criticalServices.length) {
    console.log(`${COLORS.red}⚠️  Servicios críticos no están corriendo${COLORS.reset}\n`);
    process.exit(1);
  }

  console.log(`${COLORS.green}✅ Todos los servicios críticos están corriendo${COLORS.reset}\n`);
  process.exit(0);
}

main().catch(error => {
  console.error(`${COLORS.red}Error: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
