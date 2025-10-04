#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const NEXT_DIR = path.resolve('.next');
const TARGET = path.join(NEXT_DIR, 'required-server-files.json');
const BUILD_ID_PATH = path.join(NEXT_DIR, 'BUILD_ID');
const ROUTES_MANIFEST_PATH = path.join(NEXT_DIR, 'routes-manifest.json');
const PRERENDER_MANIFEST_PATH = path.join(NEXT_DIR, 'prerender-manifest.json');

if (!fs.existsSync(NEXT_DIR)) {
  console.error('❌ .next directory not found – run `pnpm build` first.');
  process.exit(1);
}

let config = {};
if (fs.existsSync(TARGET)) {
  console.log('ℹ️  required-server-files.json already present.');
  try {
    config = JSON.parse(fs.readFileSync(TARGET, 'utf8')).config ?? {};
  } catch (err) {
    console.warn(`⚠️  Could not parse existing required-server-files.json: ${err.message}`);
  }
} else {
  try {
    const nextConfigModule = await import(path.resolve('next.config.mjs'));
    config = nextConfigModule?.default ?? {};
    if (config?.webpack) {
      delete config.webpack;
    }
  } catch (err) {
    console.warn(`⚠️  Could not load next.config.mjs: ${err.message}`);
  }

  const payload = {
    version: 1,
    config,
    files: [],
    ignore: []
  };
  fs.writeFileSync(TARGET, JSON.stringify(payload, null, 2));
  console.log('🛠️  Created placeholder required-server-files.json');
}

if (!fs.existsSync(BUILD_ID_PATH)) {
  const buildId = Date.now().toString(36);
  fs.writeFileSync(BUILD_ID_PATH, buildId);
  console.log(`🛠️  Created BUILD_ID ${buildId}`);
} else {
  console.log('ℹ️  BUILD_ID already present.');
}

if (!fs.existsSync(ROUTES_MANIFEST_PATH)) {
  const routesManifest = {
    version: 5,
    basePath: '',
    pages404: true,
    redirects: [],
    headers: [],
    dynamicRoutes: [],
    staticRoutes: [],
    dataRoutes: [],
    rewrites: { beforeFiles: [], afterFiles: [], fallback: [] }
  };
  fs.writeFileSync(ROUTES_MANIFEST_PATH, JSON.stringify(routesManifest, null, 2));
  console.log('🛠️  Created placeholder routes-manifest.json');
} else {
  console.log('ℹ️  routes-manifest.json already present.');
}

if (!fs.existsSync(PRERENDER_MANIFEST_PATH)) {
  const randomKey = () => crypto.randomBytes(32).toString('hex');
  const prerenderManifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    preview: {
      previewModeId: randomKey(),
      previewModeSigningKey: randomKey(),
      previewModeEncryptionKey: randomKey()
    },
    notFoundRoutes: []
  };
  fs.writeFileSync(PRERENDER_MANIFEST_PATH, JSON.stringify(prerenderManifest, null, 2));
  console.log('🛠️  Created placeholder prerender-manifest.json');
} else {
  console.log('ℹ️  prerender-manifest.json already present.');
}

// Detect app name from current directory
const appName = path.basename(path.resolve('.'));
const STANDALONE_NEXT_DIR = path.join(NEXT_DIR, 'standalone', 'apps', appName, '.next');
if (!fs.existsSync(STANDALONE_NEXT_DIR)) {
  fs.mkdirSync(path.dirname(STANDALONE_NEXT_DIR), { recursive: true });
  fs.cpSync(NEXT_DIR, STANDALONE_NEXT_DIR, { recursive: true });
  console.log(`🛠️  Created standalone copy of .next directory for ${appName}`);
} else {
  console.log('ℹ️  standalone .next directory already present.');
}
