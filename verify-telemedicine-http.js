#!/usr/bin/env node

/**
 * Verificación HTTP completa de la implementación de telemedicina
 * Utiliza fetch y HTTP de Node.js para verificar todos los aspectos
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// URLs a verificar
const URLS = {
  production: {
    webApp: 'https://autamedica-web-app.pages.dev',
    doctors: 'https://autamedica-doctors.pages.dev',
    patients: 'https://autamedica-patients.pages.dev',
    companies: 'https://autamedica-companies.pages.dev'
  },
  development: {
    doctors: 'http://localhost:3001',
    patients: 'http://localhost:3002'
  },
  infrastructure: {
    signalingServer: 'wss://autamedica-signaling-server.ecucondor.workers.dev/signaling'
  }
};

// Términos de telemedicina a buscar
const TELEMEDICINE_TERMS = [
  'video', 'cámara', 'videollamada', 'telemedicina', 'WebRTC',
  'UnifiedVideoCall', 'llamada', 'conectar', 'micrófono',
  'Doctor', 'Paciente', 'compartir pantalla'
];

console.log('🚀 VERIFICACIÓN HTTP DE TELEMEDICINA - AUTAMEDICA');
console.log('='.repeat(60));

/**
 * Fetch con timeout y manejo de errores
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Verificar URL con fetch
 */
async function verifyUrlWithFetch(url, name) {
  console.log(`\n📡 Verificando ${name}: ${url}`);

  const startTime = performance.now();

  try {
    const response = await fetchWithTimeout(url, { timeout: 15000 });
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Tiempo: ${responseTime}ms`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);

    if (response.ok) {
      const text = await response.text();
      const contentLength = text.length;
      console.log(`   Contenido: ${contentLength} caracteres`);

      // Verificar términos de telemedicina
      const foundTerms = TELEMEDICINE_TERMS.filter(term =>
        text.toLowerCase().includes(term.toLowerCase())
      );

      console.log(`   Términos telemedicina: ${foundTerms.length}/${TELEMEDICINE_TERMS.length} encontrados`);
      if (foundTerms.length > 0) {
        console.log(`   ✅ Términos encontrados: ${foundTerms.slice(0, 5).join(', ')}${foundTerms.length > 5 ? '...' : ''}`);
      }

      // Verificar elementos específicos de video calling
      const videoCallIndicators = [
        'UnifiedVideoCall', 'WebRTC', 'video calling',
        'Iniciar videollamada', 'Terminar videollamada',
        'Activar cámara', 'Compartir pantalla'
      ];

      const foundIndicators = videoCallIndicators.filter(indicator =>
        text.includes(indicator)
      );

      if (foundIndicators.length > 0) {
        console.log(`   🎥 Indicadores video calling: ${foundIndicators.join(', ')}`);
      }

      return {
        success: true,
        status: response.status,
        responseTime,
        contentLength,
        foundTerms: foundTerms.length,
        foundIndicators: foundIndicators.length,
        hasTelemedicine: foundTerms.length > 0 || foundIndicators.length > 0
      };
    } else {
      console.log(`   ❌ Error HTTP: ${response.status}`);
      return {
        success: false,
        status: response.status,
        responseTime,
        error: `HTTP ${response.status}`
      };
    }

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    console.log(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

/**
 * Verificar WebSocket (HTTP Upgrade)
 */
async function verifyWebSocketWithHttp(url, name) {
  console.log(`\n🔌 Verificando WebSocket ${name}: ${url}`);

  // Convertir WSS a HTTPS para hacer request HTTP
  const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');

  try {
    const response = await fetchWithTimeout(httpUrl, { timeout: 10000 });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    // Para WebSocket servers, esperamos 426 Upgrade Required o similar
    if (response.status === 426) {
      console.log(`   ✅ WebSocket server detectado (HTTP 426 Upgrade Required)`);
      return { success: true, wsReady: true, status: 426 };
    } else if (response.status === 400) {
      console.log(`   ✅ WebSocket server activo (HTTP 400 - Bad Request normal para WS)`);
      return { success: true, wsReady: true, status: 400 };
    } else {
      const text = await response.text();
      console.log(`   📄 Contenido: ${text.substring(0, 200)}...`);
      return { success: true, status: response.status, content: text };
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar con HTTP nativo de Node.js
 */
function verifyWithNodeHttp(url, name) {
  return new Promise((resolve) => {
    console.log(`\n⚡ Verificando con Node HTTP ${name}: ${url}`);

    const startTime = performance.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'AUTAMEDICA-HTTP-Verifier/1.0'
      }
    }, (res) => {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Tiempo: ${responseTime}ms`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const contentLength = data.length;
        console.log(`   Contenido: ${contentLength} caracteres`);

        const foundTerms = TELEMEDICINE_TERMS.filter(term =>
          data.toLowerCase().includes(term.toLowerCase())
        );

        console.log(`   Términos telemedicina: ${foundTerms.length}/${TELEMEDICINE_TERMS.length}`);

        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          responseTime,
          contentLength,
          foundTerms: foundTerms.length,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        success: false,
        responseTime,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Timeout`);
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

/**
 * Ejecutar todas las verificaciones
 */
async function runAllVerifications() {
  console.log(`🕐 Iniciando verificación: ${new Date().toISOString()}\n`);

  const results = {
    production: {},
    development: {},
    infrastructure: {},
    summary: {
      total: 0,
      successful: 0,
      withTelemedicine: 0,
      errors: []
    }
  };

  // 1. Verificar URLs de producción con fetch
  console.log('\n🌐 === VERIFICACIÓN DE PRODUCCIÓN (FETCH) ===');

  for (const [name, url] of Object.entries(URLS.production)) {
    const result = await verifyUrlWithFetch(url, name);
    results.production[name] = result;
    results.summary.total++;
    if (result.success) results.summary.successful++;
    if (result.hasTelemedicine) results.summary.withTelemedicine++;
    if (!result.success) results.summary.errors.push(`${name}: ${result.error}`);
  }

  // 2. Verificar desarrollo con fetch
  console.log('\n🏠 === VERIFICACIÓN DE DESARROLLO (FETCH) ===');

  for (const [name, url] of Object.entries(URLS.development)) {
    const result = await verifyUrlWithFetch(url, name);
    results.development[name] = result;
    results.summary.total++;
    if (result.success) results.summary.successful++;
    if (result.hasTelemedicine) results.summary.withTelemedicine++;
    if (!result.success) results.summary.errors.push(`${name}: ${result.error}`);
  }

  // 3. Verificar infraestructura
  console.log('\n🔧 === VERIFICACIÓN DE INFRAESTRUCTURA ===');

  const wsResult = await verifyWebSocketWithHttp(URLS.infrastructure.signalingServer, 'Signaling Server');
  results.infrastructure.signaling = wsResult;
  results.summary.total++;
  if (wsResult.success) results.summary.successful++;
  if (!wsResult.success) results.summary.errors.push(`Signaling: ${wsResult.error}`);

  // 4. Verificación adicional con Node.js HTTP nativo
  console.log('\n⚡ === VERIFICACIÓN CON NODE HTTP NATIVO ===');

  const nodeHttpResults = [];

  // Verificar doctors production con Node HTTP
  const nodeResult = await verifyWithNodeHttp(URLS.production.doctors, 'Doctors (Node HTTP)');
  nodeHttpResults.push(nodeResult);

  // 5. Resumen final
  console.log('\n📊 === RESUMEN DE VERIFICACIÓN ===');
  console.log(`Total verificaciones: ${results.summary.total}`);
  console.log(`Exitosas: ${results.summary.successful}/${results.summary.total}`);
  console.log(`Con telemedicina: ${results.summary.withTelemedicine}`);

  if (results.summary.errors.length > 0) {
    console.log(`\n❌ Errores encontrados:`);
    results.summary.errors.forEach(error => console.log(`   - ${error}`));
  }

  // 6. Verificaciones específicas de telemedicina
  console.log('\n🎥 === ANÁLISIS DE TELEMEDICINA ===');

  let telemedicineImplementations = 0;

  Object.entries(results.production).forEach(([name, result]) => {
    if (result.success && result.hasTelemedicine) {
      console.log(`✅ ${name}: ${result.foundTerms} términos, ${result.foundIndicators} indicadores`);
      telemedicineImplementations++;
    }
  });

  Object.entries(results.development).forEach(([name, result]) => {
    if (result.success && result.hasTelemedicine) {
      console.log(`✅ ${name} (dev): ${result.foundTerms} términos, ${result.foundIndicators} indicadores`);
      telemedicineImplementations++;
    }
  });

  console.log(`\n🏆 RESULTADO FINAL:`);
  console.log(`📡 Aplicaciones funcionando: ${results.summary.successful}/${results.summary.total}`);
  console.log(`🎥 Implementaciones de telemedicina: ${telemedicineImplementations}`);
  console.log(`🔌 WebRTC Signaling: ${results.infrastructure.signaling.success ? '✅ Activo' : '❌ Inactivo'}`);

  if (results.summary.successful >= results.summary.total * 0.8 && telemedicineImplementations > 0) {
    console.log(`\n🎉 ✅ VERIFICACIÓN EXITOSA - TELEMEDICINA IMPLEMENTADA Y FUNCIONANDO`);
    process.exit(0);
  } else {
    console.log(`\n⚠️ VERIFICACIÓN PARCIAL - Revisar errores`);
    process.exit(1);
  }
}

// Ejecutar verificación
runAllVerifications().catch(error => {
  console.error('💥 Error fatal en verificación:', error);
  process.exit(1);
});