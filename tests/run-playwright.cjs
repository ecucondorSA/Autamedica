#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

const patchPath = resolve(__dirname, 'patch-vitest-expect.cjs');
const overridesDir = resolve(__dirname, 'module-overrides');
const flag = `--require=${patchPath}`;
const env = { ...process.env };
env.NODE_OPTIONS = env.NODE_OPTIONS ? `${env.NODE_OPTIONS} ${flag}` : flag;
env.NODE_PATH = env.NODE_PATH ? `${overridesDir}:${env.NODE_PATH}` : overridesDir;

const isWin = process.platform === 'win32';
const command = isWin ? 'playwright.cmd' : 'playwright';

const child = spawn(command, ['test'], {
  stdio: 'inherit',
  env,
});

child.on('exit', code => {
  process.exit(code ?? 0);
});
