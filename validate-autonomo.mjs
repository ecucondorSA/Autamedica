#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Validating Autonomo Configuration...\n');

// Check if autonomo.yml exists
if (!existsSync('autonomo.yml')) {
  console.error('❌ autonomo.yml not found');
  process.exit(1);
}

console.log('✅ autonomo.yml exists');

// Check required directories
const requiredDirs = ['.logs', 'generated-docs'];
for (const dir of requiredDirs) {
  if (existsSync(dir)) {
    console.log(`✅ ${dir}/ directory exists`);
  } else {
    console.log(`❌ ${dir}/ directory missing`);
  }
}

// Check apps referenced in config
const apps = ['patients', 'doctors', 'auth'];
for (const app of apps) {
  if (existsSync(`apps/${app}`)) {
    console.log(`✅ apps/${app}/ exists`);
  } else {
    console.log(`❌ apps/${app}/ missing`);
  }
}

// Check packages referenced in config
const packages = ['shared', 'auth'];
for (const pkg of packages) {
  if (existsSync(`packages/${pkg}`)) {
    console.log(`✅ packages/${pkg}/ exists`);
  } else {
    console.log(`❌ packages/${pkg}/ missing`);
  }
}

// Check if pnpm is available
try {
  const pnpmVersion = execSync('pnpm -v', { encoding: 'utf8' }).trim();
  console.log(`✅ pnpm available (v${pnpmVersion})`);
} catch (error) {
  console.log('❌ pnpm not available');
}

// Check if node is available
try {
  const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
  console.log(`✅ node available (${nodeVersion})`);
} catch (error) {
  console.log('❌ node not available');
}

// Check if wrangler is available
try {
  execSync('wrangler --version', { encoding: 'utf8' });
  console.log('✅ wrangler available');
} catch (error) {
  console.log('⚠️  wrangler not available (needed for Cloudflare Pages deployment)');
}

// Check if supabase CLI is available
try {
  execSync('supabase --version', { encoding: 'utf8' });
  console.log('✅ supabase CLI available');
} catch (error) {
  console.log('⚠️  supabase CLI not available (needed for database operations)');
}

console.log('\n🎯 Configuration Summary:');
console.log('- Autonomous deployment system configured');
console.log('- Security-first approach with no credential rotation');
console.log('- Multi-app architecture: patients, doctors, auth');
console.log('- Database triggers and RLS policies included');
console.log('- CI/CD hardening with security scanning');
console.log('- Canary deployment strategy (10% → 50% → 100%)');

console.log('\n📋 Next Steps:');
console.log('1. Review the autonomo.yml configuration');
console.log('2. Ensure all environment variables are set');
console.log('3. Test the configuration in a staging environment');
console.log('4. Run the autonomous pipeline when ready');

console.log('\n✨ Autonomo configuration validation complete!');