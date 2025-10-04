#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--app' || arg === '-a') {
    options.app = args[i + 1];
    i += 1;
  } else if (arg === '--standalone' && args[i + 1]) {
    options.standaloneDir = args[i + 1];
    i += 1;
  }
}

const cwd = process.cwd();
const appName = options.app ?? path.basename(cwd);
const nextDir = path.resolve(cwd, '.next');
const target = path.join(nextDir, 'required-server-files.json');
const buildIdPath = path.join(nextDir, 'BUILD_ID');
const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
const prerenderManifestPath = path.join(nextDir, 'prerender-manifest.json');

if (!fs.existsSync(nextDir)) {
  console.error('❌ .next directory not found – run `pnpm build` first.');
  process.exit(1);
}

let config = {};
if (fs.existsSync(target)) {
  console.log('ℹ️  required-server-files.json already present.');
  try {
    const existing = JSON.parse(fs.readFileSync(target, 'utf8'));
    config = existing?.config ?? {};
  } catch (error) {
    console.warn(`⚠️  Could not parse existing required-server-files.json: ${error.message}`);
  }
} else {
  try {
    const nextConfigModule = await import(path.resolve(cwd, 'next.config.mjs'));
    config = nextConfigModule?.default ?? {};
    if (config?.webpack) {
      delete config.webpack;
    }
  } catch (error) {
    console.warn(`⚠️  Could not load next.config.mjs: ${error.message}`);
  }

  const payload = {
    version: 1,
    config,
    files: [],
    ignore: [],
  };
  fs.writeFileSync(target, JSON.stringify(payload, null, 2));
  console.log('🛠️  Created placeholder required-server-files.json');
}

if (!fs.existsSync(buildIdPath)) {
  const buildId = Date.now().toString(36);
  fs.writeFileSync(buildIdPath, buildId);
  console.log(`🛠️  Created BUILD_ID ${buildId}`);
} else {
  console.log('ℹ️  BUILD_ID already present.');
}

if (!fs.existsSync(routesManifestPath)) {
  const routesManifest = {
    version: 5,
    basePath: '',
    pages404: true,
    redirects: [],
    headers: [],
    dynamicRoutes: [],
    staticRoutes: [],
    dataRoutes: [],
    rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
  };
  fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
  console.log('🛠️  Created placeholder routes-manifest.json');
} else {
  console.log('ℹ️  routes-manifest.json already present.');
}

if (!fs.existsSync(prerenderManifestPath)) {
  const randomKey = () => crypto.randomBytes(32).toString('hex');
  const prerenderManifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    preview: {
      previewModeId: randomKey(),
      previewModeSigningKey: randomKey(),
      previewModeEncryptionKey: randomKey(),
    },
    notFoundRoutes: [],
  };
  fs.writeFileSync(prerenderManifestPath, JSON.stringify(prerenderManifest, null, 2));
  console.log('🛠️  Created placeholder prerender-manifest.json');
} else {
  console.log('ℹ️  prerender-manifest.json already present.');
}

const standaloneDirFromNext = path.join(nextDir, 'standalone');
const standaloneRoot = options.standaloneDir
  ? path.resolve(cwd, options.standaloneDir)
  : path.join(standaloneDirFromNext, 'apps', appName, '.next');

if (!fs.existsSync(standaloneDirFromNext)) {
  console.log('ℹ️  Next no generó salida `standalone` (posiblemente `output: export`). Se omite la copia.');
} else if (!fs.existsSync(standaloneRoot)) {
  fs.mkdirSync(path.dirname(standaloneRoot), { recursive: true });
  fs.cpSync(nextDir, standaloneRoot, { recursive: true });
  console.log(`🛠️  Created standalone copy of .next directory for ${appName}`);
} else {
  console.log('ℹ️  standalone .next directory already present.');
}
