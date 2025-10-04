#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve('apps/patients/scripts/cloudflare-apps.json');

function parseArgs(argv) {
  const args = { app: null, validate: false }; 
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--app' || arg === '-a') {
      args.app = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === '--validate' || arg === '-v') {
      args.validate = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node apps/patients/scripts/cloudflare-pages-prepare.mjs [options]\n\n` +
    `Options:\n` +
    `  --app, -a <name>   Only analyze the provided app (patients, auth, etc.).\n` +
    `  --validate, -v     Exit with code 1 if required env vars are missing.\n` +
    `  --help, -h         Show this message.\n\n` +
    `Examples:\n` +
    `  node apps/patients/scripts/cloudflare-pages-prepare.mjs --app patients\n` +
    `  node apps/patients/scripts/cloudflare-pages-prepare.mjs --validate\n`);
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Cloudflare config not found at ${CONFIG_PATH}`);
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { path: filePath, vars: {}, missing: true };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (!key) continue;
    vars[key] = rest.join('=').trim();
  }
  return { path: filePath, vars, missing: false };
}

function dedupe(values) {
  return Array.from(new Set(values));
}

function collectEnvKeys(envFiles) {
  const envData = envFiles.map(parseEnvFile);
  const keys = envData.flatMap((entry) => Object.keys(entry.vars));
  return { keys: dedupe(keys), envData };
}

function reportApp(config, options) {
  const { envFiles = [] } = config;
  const { keys, envData } = collectEnvKeys(envFiles);
  const missingFiles = envData.filter((entry) => entry.missing);

  const missingVars = [];
  const resolved = keys.map((key) => {
    for (const entry of envData) {
      if (entry.vars[key]) {
        return { key, value: entry.vars[key], source: entry.path };
      }
    }
    missingVars.push(key);
    return { key, value: '', source: null };
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`⚙️  Cloudflare Pages Prep – ${config.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`• Project: ${config.projectName}`);
  console.log(`• Package: ${config.package}`);
  console.log(`• Directory: ${config.directory}`);
  console.log(`• Output dir: ${config.outputDir}`);
  console.log(`• Domain: ${config.domain}`);
  console.log(`• Build: ${config.buildCommand}`);
  console.log(`• Deploy: ${config.deployCommand}`);

  if (missingFiles.length > 0) {
    console.log(`\n⚠️  Missing env files:`);
    for (const entry of missingFiles) {
      console.log(`   - ${entry.path}`);
    }
  }

  console.log(`\n🔐 Required environment variables:`);
  for (const item of resolved) {
    if (item.value) {
      console.log(`   • ${item.key}  (from ${item.source})`);
    } else {
      console.log(`   • ${item.key}  ❌ missing value`);
    }
  }

  if ((config.dns ?? []).length > 0) {
    console.log(`\n🌐 DNS checklist:`);
    for (const record of config.dns) {
      console.log(`   • ${record.type} ${record.name} → ${record.target}`);
    }
  }

  console.log(`\n🛠️  Wrangler commands:`);
  console.log(`   # 1) Ensure project exists`);
  console.log(`   wrangler pages project create ${config.projectName} --production-branch=main`);
  console.log(`\n   # 2) Push env vars/secrets`);
  for (const key of resolved.map((item) => item.key)) {
    console.log(`   wrangler pages project secret put ${key} --project-name=${config.projectName}`);
  }
  console.log(`\n   # 3) Deploy build output`);
  console.log(`   wrangler pages deploy ${config.outputDir} --project-name=${config.projectName}`);

  if (options.validate && (missingVars.length > 0 || missingFiles.length > 0)) {
    const reasons = [];
    if (missingFiles.length > 0) reasons.push('env files');
    if (missingVars.length > 0) reasons.push('env values');
    throw new Error(`Validation failed for ${config.name}: missing ${reasons.join(' & ')}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = readConfig();
  const apps = cfg.apps ?? [];

  if (apps.length === 0) {
    console.log('No apps defined in config.');
    return;
  }

  const targetApps = args.app
    ? apps.filter((app) => app.name === args.app)
    : apps;

  if (targetApps.length === 0) {
    console.error(`App "${args.app}" not found in config.`);
    process.exit(1);
  }

  let validationError = null;
  for (const app of targetApps) {
    try {
      reportApp(app, { validate: args.validate });
    } catch (err) {
      validationError = err;
      console.error(`\n❌ ${err.message}`);
    }
  }

  if (validationError) {
    process.exit(1);
  }
}

main();
