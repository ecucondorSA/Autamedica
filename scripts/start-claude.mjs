#!/usr/bin/env node

/**
 * Script de inicio para sesiones de desarrollo con Claude
 * Ejecuta todos los procesos necesarios para desarrollo y validación en tiempo real
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

console.log('🏥 Autamedica - Iniciando sesión de desarrollo con Claude\n');

// Lista de procesos a ejecutar en paralelo
const processes = [];

function startProcess(name, command, args = [], options = {}) {
  console.log(`🚀 Iniciando ${name}...`);

  const child = spawn(command, args, {
    stdio: 'pipe',
    cwd: join(__dirname, '..'),
    ...options
  });

  child.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.trim()) {
      console.log(`[${name}] ${output}`);
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.trim()) {
      console.error(`[${name}] ${output}`);
    }
  });

  child.on('exit', (code) => {
    console.log(`[${name}] Proceso terminado con código ${code}`);
  });

  child.on('error', (error) => {
    console.error(`[${name}] Error: ${error.message}`);
  });

  processes.push({ name, child });
  return child;
}

async function main() {
  console.log('📋 Iniciando procesos de desarrollo:\n');

  // 1. Validación inicial de políticas
  console.log('🔍 Ejecutando validación inicial de políticas...');
  try {
    const { spawnSync } = await import('node:child_process');
    const validation = spawnSync('pnpm', ['run', 'policies:validate'], {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: join(__dirname, '..')
    });

    if (validation.status === 0) {
      console.log('✅ Validación de políticas inicial: PASÓ\n');
    } else {
      console.log('⚠️  Validación de políticas inicial: FALLÓ (continuando...)\n');
      console.log(validation.stdout);
      console.log(validation.stderr);
    }
  } catch (error) {
    console.log('⚠️  Error en validación inicial (continuando...):', error.message);
  }

  // 2. TypeScript Watch Mode para todos los packages
  startProcess(
    'TypeScript Watch',
    'node',
    ['scripts/watch-types.mjs']
  );

  // 3. Desarrollo con Turbo (hot reload)
  startProcess(
    'Dev Server',
    'pnpm',
    ['dev']
  );

  // 4. ESLint en modo watch (si está disponible)
  // Nota: algunos proyectos no tienen watch mode para ESLint, pero intentamos
  try {
    startProcess(
      'ESLint Watch',
      'pnpm',
      ['run', 'watch:lint']
    );
  } catch (error) {
    console.log('ℹ️  ESLint watch mode no disponible');
  }

  console.log('\n✅ Todos los procesos de desarrollo iniciados');
  console.log('\n📊 Procesos activos:');
  processes.forEach(({ name }) => {
    console.log(`  🔄 ${name}`);
  });

  console.log('\n💡 Comandos útiles mientras desarrollas:');
  console.log('  pnpm run policies:validate    # Validar políticas del monorepo');
  console.log('  pnpm run check:all           # Validación completa (lint + type + policies)');
  console.log('  pnpm run lint                # Solo ESLint');
  console.log('  pnpm run type-check          # Solo TypeScript check');
  console.log('  pnpm run vercel:validate     # Validar configuración de deployment');
  console.log('  pnpm run pre-deploy          # Validación pre-deployment completa');

  console.log('\n🎯 Claude está listo para desarrollar con validación en tiempo real');
  console.log('💡 Presiona Ctrl+C para detener todos los procesos\n');
}

// Manejar señales para limpiar procesos
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo todos los procesos...');
  processes.forEach(({ name, child }) => {
    console.log(`  ⏹️  Deteniendo ${name}...`);
    child.kill('SIGTERM');
  });

  // Dar tiempo para que los procesos se cierren limpiamente
  setTimeout(() => {
    console.log('👋 Sesión de Claude finalizada');
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Señal SIGTERM recibida, deteniendo procesos...');
  processes.forEach(({ name, child }) => {
    console.log(`  ⏹️  Deteniendo ${name}...`);
    child.kill('SIGTERM');
  });
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  processes.forEach(({ child }) => child.kill('SIGTERM'));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promise rechazada no manejada:', reason);
  processes.forEach(({ child }) => child.kill('SIGTERM'));
  process.exit(1);
});

main().catch(error => {
  console.error('💥 Error iniciando sesión de Claude:', error);
  process.exit(1);
});