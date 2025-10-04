import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerDir = path.resolve(__dirname, '../.open-next');
const workerPath = path.join(workerDir, '_worker.js');
const originalWorkerPath = path.join(workerDir, 'worker.js');
const routesPath = path.join(workerDir, '_routes.json');

if (!fs.existsSync(workerDir)) {
  console.error('⚠️  Directorio .open-next no encontrado, salteando patch.');
  process.exit(0);
}

if (!fs.existsSync(workerPath)) {
  if (fs.existsSync(originalWorkerPath)) {
    fs.renameSync(originalWorkerPath, workerPath);
    console.log('ℹ️  worker.js renombrado a _worker.js.');
  } else {
    console.error('⚠️  Worker file no encontrado, salteando patch.');
    process.exit(0);
  }
}

let source = fs.readFileSync(workerPath, 'utf8');

const snippetSignature = 'return Response.redirect(new URL(target, request.url), 307);';

if (!source.includes(snippetSignature)) {
  const rewriteSnippet = `            const url = new URL(request.url);\n            if (url.pathname.startsWith(\"/_next/static/\")) {\n                const target = \"/assets\" + url.pathname + url.search;\n                return Response.redirect(new URL(target, request.url), 307);\n            }\n`;

  const pattern = /(async fetch\(request, env, ctx\) {\n)(\s*return runWithCloudflareRequestContext\(request, env, ctx, async \(\) => {\n\s*const response = maybeGetSkewProtectionResponse\(request\);\n\s*if \(response\) {\n\s*return response;\n\s*}\n\s*)(const url = new URL\(request.url\);\n)/;

  if (!pattern.test(source)) {
    console.error('❌ No se encontró el bloque de fetch esperado para aplicar el patch.');
    process.exit(1);
  }

  source = source.replace(pattern, (_, p1, p2, p3) => `${p1}${p2}${rewriteSnippet}`);
  fs.writeFileSync(workerPath, source);
  console.log('✅ _worker.js parcheado (rewrite /_next/static → fetch /assets).');
} else {
  console.log('ℹ️  Patch ya aplicado en _worker.js.');
}

if (!fs.existsSync(routesPath)) {
  fs.writeFileSync(
    routesPath,
    JSON.stringify(
      {
        version: 1,
        include: ['/*'],
        exclude: ['/assets/*', '/_next/static/*']
      },
      null,
      2
    ) + '\n'
  );
  console.log('✅ _routes.json creado.');
}
