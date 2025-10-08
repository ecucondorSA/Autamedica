import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';

console.log('[INFO] Starting intelligent test execution...');

function getChangedFiles() {
  console.log('[INFO] Getting changed files from git...');
  try {
    const output = execSync('git diff --name-only HEAD~1 HEAD').toString();
    const files = output.trim().split('\n').filter(Boolean);
    console.log(`[INFO] Found ${files.length} changed files.`);
    return files;
  } catch (error) {
    console.error('[ERROR] Error getting changed files:', error);
    console.log('[INFO] Falling back to all files...');
    const allFiles = execSync('git ls-files').toString().trim().split('\n').filter(Boolean);
    console.log(`[INFO] Found ${allFiles.length} total files.`);
    return allFiles;
  }
}

function runVitest(files) {
  console.log('\n[INFO] Running intelligent unit tests (Vitest)...');
  try {
    const command = `pnpm vitest related ${files.join(' ')} --run`;
    console.log(`[CMD] ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log('[INFO] Vitest execution finished.');
  } catch (error) {
    console.error('[ERROR] Vitest execution failed.');
  }
}

function runPlaywright(files) {
  console.log('\n[INFO] Running intelligent E2E tests (Playwright)...');
  const testsToRun = new Set();
  const allE2ETests = 'tests/e2e';

  for (const file of files) {
    const parts = file.split(path.sep);
    if (parts.includes('apps')) {
      const appIndex = parts.indexOf('apps');
      if (appIndex !== -1 && parts.length > appIndex + 1) {
        const appName = parts[appIndex + 1];
        const e2eDir = `apps/${appName}/e2e`;
        testsToRun.add(e2eDir);
      }
    }
  }

  if (testsToRun.size === 0) {
    console.log('[INFO] No specific E2E tests to run based on changes. Running all E2E tests as a fallback.');
    testsToRun.add(allE2ETests);
  }

  const existingTests = [...testsToRun].filter(dir => {
    if (fs.existsSync(dir)) {
      const testFiles = globSync(`${dir}/**/*.spec.ts`);
      return testFiles.length > 0;
    }
    return false;
  });

  if (existingTests.length > 0) {
    console.log(`[INFO] Playwright test directories to run: ${existingTests.join(', ')}`);
    try {
      const command = `pnpm playwright test ${existingTests.join(' ')}`;
      console.log(`[CMD] ${command}`);
      execSync(command, { stdio: 'inherit' });
      console.log('[INFO] Playwright execution finished.');
    } catch (error) {
      console.error('[ERROR] Playwright execution failed.');
    }
  } else {
    console.log('[WARN] No existing E2E tests found for the changed applications. Skipping Playwright execution.');
  }
}

const changedFiles = getChangedFiles();
console.log('[INFO] Changed files:', changedFiles);

if (changedFiles.length > 0) {
  runVitest(changedFiles);
  runPlaywright(changedFiles);
} else {
  console.log('[INFO] No changed files detected. Nothing to do.');
}

console.log('[INFO] Intelligent test execution finished.');
