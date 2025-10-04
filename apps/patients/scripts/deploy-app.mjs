#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve('apps/patients/scripts/cloudflare-apps.json');
const PREP_SCRIPT = path.resolve('apps/patients/scripts/cloudflare-pages-prepare.mjs');

function cleanOutputDir(dir) {
  if (!dir) return;
  try {
    const abs = path.resolve(dir);
    if (fs.existsSync(abs)) {
      console.log(`
⚙️  Cleaning output directory ${abs}`);
      fs.rmSync(abs, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`⚠️  Could not clean output directory ${dir}: ${err.message}`);
  }
}

function parseArgs(argv) {
  const args = { app: null, skipBuild: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--app' || arg === '-a') {
      args.app = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === '--skip-build') {
      args.skipBuild = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  if (!args.app) {
    console.error('Missing required --app <name> argument.');
    printHelp();
    process.exit(1);
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node apps/patients/scripts/deploy-app.mjs --app <name> [--skip-build]\n` +
    `Runs Cloudflare env validation, builds the app and triggers the existing deploy script.\n`);
}

function loadConfig(appName) {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw);
  const target = (cfg.apps ?? []).find((app) => app.name === appName);
  if (!target) {
    throw new Error(`App "${appName}" not found in config.`);
  }
  return target;
}

function runStep(title, command, args, options = {}) {
  console.log(`\n▶ ${title}`);
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`${title} failed (exit code ${result.status ?? 'unknown'})`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const appCfg = loadConfig(args.app);
  const outputDir = appCfg.outputDir ? path.resolve(appCfg.outputDir) : null;

  // Step 1: Validate env + DNS status
  runStep(
    `Validating configuration for ${appCfg.name}`,
    'node',
    [PREP_SCRIPT, '--app', appCfg.name, '--validate'],
  );

  // Step 2: Build (unless skipped)
  if (!args.skipBuild) {
    cleanOutputDir(outputDir);
    const buildParts = appCfg.buildCommand.split(' ');
    runStep(`Building ${appCfg.package}`, buildParts[0], buildParts.slice(1), { cwd: process.cwd() });
  } else {
    console.log('⚠️  Build skipped by flag. Make sure artefacts are up to date.');
  }

  // Step 3: Deploy using existing script/command
  const deployParts = appCfg.deployCommand.split(' ');
  runStep(`Deploying ${appCfg.name} to Cloudflare Pages`, deployParts[0], deployParts.slice(1), { cwd: process.cwd() });

  console.log(`\n✅ Deployment pipeline for ${appCfg.name} completed.`);
}

try {
  main();
} catch (err) {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
}
