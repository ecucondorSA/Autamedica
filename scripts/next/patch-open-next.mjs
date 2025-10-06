#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dir' || arg === '-d') {
    options.outputDir = args[i + 1];
    i += 1;
  }
}

const cwd = process.cwd();
const workerDir = path.resolve(cwd, options.outputDir ?? '.open-next');
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
const securityHeadersSignature = 'function addSecurityHeaders(response)';

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

// Add security headers function
if (!source.includes(securityHeadersSignature)) {
  const securityHeadersFunc = `
function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co; connect-src 'self' https://gtyvdircfhmdjiaelqkg.supabase.co https://*.supabase.co wss://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
`;

  // Insert before export default
  source = source.replace(/export default {/, `${securityHeadersFunc}\nexport default {`);

  // Wrap the final return in the fetch handler
  source = source.replace(
    /(\s+)(\/\/ @ts-expect-error: resolved by wrangler build\n\s+const { handler } = await import\("\.\/server-functions\/default\/handler\.mjs"\);\n\s+return handler\(reqOrResp, env, ctx, request\.signal\);)/,
    '$1// @ts-expect-error: resolved by wrangler build\n$1const { handler } = await import("./server-functions/default/handler.mjs");\n$1const handlerResponse = await handler(reqOrResp, env, ctx, request.signal);\n$1return addSecurityHeaders(handlerResponse);'
  );

  fs.writeFileSync(workerPath, source);
  console.log('✅ Security headers agregados al Worker.');
} else {
  console.log('ℹ️  Security headers ya están presentes.');
}

if (!fs.existsSync(routesPath)) {
  fs.writeFileSync(
    routesPath,
    JSON.stringify(
      {
        version: 1,
        include: ['/*'],
        exclude: ['/assets/*'],
      },
      null,
      2,
    ) + '\n',
  );
  console.log('✅ _routes.json creado.');
}
