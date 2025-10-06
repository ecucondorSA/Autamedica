# 🔍 Chrome DevTools - Estructuras de Datos para Agentes

## 📊 Información Disponible en Chrome DevTools

### 1. **Console API** (Logs y Errores)

#### **Estructura de Mensajes de Console**
```javascript
{
  type: 'log' | 'error' | 'warning' | 'info' | 'debug',
  text: string,
  timestamp: number,
  url: string,           // Archivo que generó el log
  lineNumber: number,
  columnNumber: number,
  stackTrace: {
    callFrames: [
      {
        functionName: string,
        scriptId: string,
        url: string,
        lineNumber: number,
        columnNumber: number
      }
    ]
  },
  args: Array<any>,      // Argumentos del console.log
  level: 'verbose' | 'info' | 'warning' | 'error'
}
```

#### **Ejemplo Real**
```javascript
// Console Error:
{
  type: 'error',
  text: 'Uncaught TypeError: Cannot read property "id" of undefined',
  timestamp: 1696598400000,
  url: 'https://patients.autamedica.com/_next/static/chunks/pages/dashboard.js',
  lineNumber: 42,
  columnNumber: 15,
  stackTrace: {
    callFrames: [
      { functionName: 'PatientDashboard', url: '...', lineNumber: 42 },
      { functionName: 'renderComponent', url: '...', lineNumber: 156 }
    ]
  },
  level: 'error'
}
```

**🎯 Utilidad para Agentes:**
- `agent_security`: Detectar errores de seguridad (XSS, CORS)
- `agent_qa`: Validar que no hay errores en producción
- `agent_code`: Identificar código problemático

---

### 2. **Network API** (Requests y Responses)

#### **Estructura de Request**
```javascript
{
  requestId: string,
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ...',
    'User-Agent': '...',
    // ... más headers
  },
  postData: string | undefined,  // Body del request
  timestamp: number,
  initiator: {
    type: 'script' | 'parser' | 'other',
    stack: {
      callFrames: [...]
    },
    url: string  // Quién inició el request
  },

  // Response data:
  response: {
    status: number,
    statusText: string,
    headers: {
      'content-type': 'application/json',
      'x-frame-options': 'DENY',        // 🔒 Security header
      'strict-transport-security': '...', // 🔒 HSTS
      'content-security-policy': '...',   // 🔒 CSP
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'cache-control': 'no-store',
      // ... más headers
    },
    mimeType: string,
    connectionReused: boolean,
    connectionId: number,
    remoteIPAddress: string,
    remotePort: number,
    fromDiskCache: boolean,
    fromServiceWorker: boolean,
    encodedDataLength: number,  // Bytes transferidos
    decodedBodyLength: number,  // Bytes descomprimidos
    timing: {
      requestTime: number,
      proxyStart: number,
      proxyEnd: number,
      dnsStart: number,
      dnsEnd: number,
      connectStart: number,
      connectEnd: number,
      sslStart: number,
      sslEnd: number,
      workerStart: number,
      workerReady: number,
      sendStart: number,
      sendEnd: number,
      pushStart: number,
      pushEnd: number,
      receiveHeadersEnd: number
    }
  },

  // Métricas de rendimiento:
  metrics: {
    duration: number,        // ms totales
    blocked: number,         // ms bloqueado
    dns: number,            // ms DNS lookup
    connecting: number,      // ms estableciendo conexión
    ssl: number,            // ms SSL handshake
    sending: number,         // ms enviando request
    waiting: number,         // ms esperando respuesta (TTFB)
    receiving: number,       // ms recibiendo datos
    size: number,           // Bytes totales
    transferSize: number    // Bytes transferidos (con compresión)
  }
}
```

#### **Ejemplo Real: API Request**
```javascript
{
  requestId: '1234.56',
  url: 'https://gtyvdircfhmdjiaelqkg.supabase.co/rest/v1/patients?select=*',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  response: {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-frame-options': 'SAMEORIGIN',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'content-security-policy': "default-src 'self'",
      'access-control-allow-origin': 'https://patients.autamedica.com'
    }
  },
  metrics: {
    duration: 245,      // 245ms total
    dns: 12,
    connecting: 35,
    ssl: 89,
    waiting: 78,        // TTFB = 78ms
    receiving: 31,
    size: 15420,        // 15.4KB
    transferSize: 3210  // 3.2KB (gzipped)
  }
}
```

**🎯 Utilidad para Agentes:**
- `agent_security`:
  - ✅ Verificar headers de seguridad presentes
  - ✅ Detectar requests sin HTTPS
  - ✅ Validar CORS correcto
  - ✅ Identificar secrets en URLs
- `agent_qa`:
  - ✅ Detectar requests lentos (>500ms)
  - ✅ Validar status codes correctos
  - ✅ Verificar compresión activa
- `agent_dns_deploy`:
  - ✅ Validar CDN funcionando
  - ✅ Verificar cache headers

---

### 3. **Performance API** (Métricas Web Vitals)

#### **Estructura de Performance Metrics**
```javascript
{
  // Core Web Vitals:
  LCP: {  // Largest Contentful Paint
    value: number,        // ms
    element: HTMLElement, // Elemento más grande
    url: string,         // Imagen/recurso
    renderTime: number,
    loadTime: number
  },

  FID: {  // First Input Delay
    value: number,        // ms
    name: 'pointerdown' | 'keydown' | 'click',
    startTime: number,
    processingStart: number,
    processingEnd: number,
    duration: number,
    cancelable: boolean
  },

  CLS: {  // Cumulative Layout Shift
    value: number,        // score (0-1)
    entries: [
      {
        value: number,
        sources: [
          {
            node: HTMLElement,
            previousRect: DOMRect,
            currentRect: DOMRect
          }
        ],
        hadRecentInput: boolean
      }
    ]
  },

  // Otras métricas importantes:
  FCP: number,  // First Contentful Paint (ms)
  TTFB: number, // Time to First Byte (ms)

  // Navigation Timing:
  navigationTiming: {
    fetchStart: number,
    domainLookupStart: number,
    domainLookupEnd: number,
    connectStart: number,
    connectEnd: number,
    secureConnectionStart: number,
    requestStart: number,
    responseStart: number,
    responseEnd: number,
    domInteractive: number,
    domContentLoadedEventStart: number,
    domContentLoadedEventEnd: number,
    domComplete: number,
    loadEventStart: number,
    loadEventEnd: number
  },

  // Resource Timing (por recurso):
  resources: [
    {
      name: string,  // URL del recurso
      entryType: 'resource',
      startTime: number,
      duration: number,
      initiatorType: 'script' | 'css' | 'img' | 'fetch' | 'xmlhttprequest',
      nextHopProtocol: 'h2' | 'h3' | 'http/1.1',
      renderBlockingStatus: 'blocking' | 'non-blocking',
      transferSize: number,
      encodedBodySize: number,
      decodedBodySize: number,
      serverTiming: [
        {
          name: string,
          duration: number,
          description: string
        }
      ]
    }
  ],

  // Memory Usage (si está disponible):
  memory: {
    usedJSHeapSize: number,      // Bytes
    totalJSHeapSize: number,     // Bytes
    jsHeapSizeLimit: number      // Bytes
  }
}
```

#### **Ejemplo Real: Web Vitals**
```javascript
{
  LCP: {
    value: 1234,  // 1.234s - ✅ GOOD (<2.5s)
    element: '<img src="hero.jpg">',
    url: 'https://patients.autamedica.com/images/hero.jpg'
  },
  FID: {
    value: 45,    // 45ms - ✅ GOOD (<100ms)
    name: 'pointerdown'
  },
  CLS: {
    value: 0.08   // 0.08 - ✅ GOOD (<0.1)
  },
  FCP: 892,       // 0.892s - ✅ GOOD (<1.8s)
  TTFB: 234,      // 234ms - ✅ GOOD (<600ms)

  navigationTiming: {
    domInteractive: 1245,
    domContentLoadedEventEnd: 1567,
    loadEventEnd: 2890
  },

  resources: [
    {
      name: 'https://patients.autamedica.com/_next/static/chunks/main.js',
      duration: 156,
      transferSize: 45678,
      encodedBodySize: 123456,
      decodedBodySize: 567890,
      renderBlockingStatus: 'blocking'  // ⚠️ Blocking render!
    }
  ]
}
```

**🎯 Utilidad para Agentes:**
- `agent_qa`:
  - ✅ Validar Core Web Vitals dentro de límites
  - ✅ Detectar recursos que bloquean render
  - ✅ Identificar layout shifts problemáticos
  - ✅ Validar tiempos de carga
- `agent_dns_deploy`:
  - ✅ Verificar métricas en producción después de deploy

---

### 4. **Security API** (Headers y Políticas)

#### **Estructura de Security Info**
```javascript
{
  securityState: 'secure' | 'insecure' | 'neutral',

  certificate: {
    protocol: 'TLS 1.3',
    keyExchange: 'X25519',
    cipher: 'AES_128_GCM',
    subject: string,
    issuer: string,
    validFrom: number,
    validTo: number,
    subjectAlternativeNames: string[]
  },

  securityHeaders: {
    'Strict-Transport-Security': {
      present: boolean,
      value: string,
      maxAge: number,
      includeSubDomains: boolean,
      preload: boolean,
      score: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    },

    'Content-Security-Policy': {
      present: boolean,
      directives: {
        'default-src': string[],
        'script-src': string[],
        'style-src': string[],
        'img-src': string[],
        'connect-src': string[],
        'font-src': string[],
        'frame-ancestors': string[],
        'upgrade-insecure-requests': boolean
      },
      violations: number,
      score: string
    },

    'X-Frame-Options': {
      present: boolean,
      value: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM',
      score: string
    },

    'X-Content-Type-Options': {
      present: boolean,
      value: 'nosniff',
      score: string
    },

    'X-XSS-Protection': {
      present: boolean,
      value: string,
      mode: 'block' | 'report',
      score: string
    },

    'Referrer-Policy': {
      present: boolean,
      value: string,
      score: string
    },

    'Permissions-Policy': {
      present: boolean,
      features: {
        camera: string,
        microphone: string,
        geolocation: string,
        payment: string
      }
    }
  },

  mixedContent: {
    hasInsecure: boolean,
    insecureRequests: [
      {
        url: string,
        type: 'image' | 'script' | 'stylesheet' | 'media'
      }
    ]
  },

  corsIssues: [
    {
      request: string,
      issue: string,
      status: 'blocked' | 'warning'
    }
  ]
}
```

#### **Ejemplo Real: Security Check**
```javascript
{
  securityState: 'secure',

  certificate: {
    protocol: 'TLS 1.3',
    subject: '*.autamedica.com',
    validTo: 1735689600000,  // 2025-01-01
    issuer: "Let's Encrypt"
  },

  securityHeaders: {
    'Strict-Transport-Security': {
      present: true,
      value: 'max-age=31536000; includeSubDomains; preload',
      maxAge: 31536000,      // 1 año
      includeSubDomains: true,
      preload: true,
      score: 'A+'            // ✅ EXCELENTE
    },

    'Content-Security-Policy': {
      present: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],  // ⚠️ unsafe-inline
        'img-src': ["'self'", 'data:', 'https:'],
        'frame-ancestors': ["'none'"]
      },
      violations: 0,
      score: 'B'             // ⚠️ Mejorable (unsafe-inline)
    },

    'X-Frame-Options': {
      present: true,
      value: 'DENY',
      score: 'A+'            // ✅ EXCELENTE
    },

    'X-Content-Type-Options': {
      present: true,
      value: 'nosniff',
      score: 'A+'            // ✅ EXCELENTE
    }
  },

  mixedContent: {
    hasInsecure: false,      // ✅ No mixed content
    insecureRequests: []
  },

  corsIssues: []             // ✅ No CORS issues
}
```

**🎯 Utilidad para Agentes:**
- `agent_security`:
  - ✅ Validar todos los security headers presentes
  - ✅ Detectar mixed content (HTTP en HTTPS)
  - ✅ Identificar CSP débil
  - ✅ Validar certificado SSL válido
  - ✅ Detectar CORS misconfiguration
- `agent_dns_deploy`:
  - ✅ Verificar headers después de deploy

---

### 5. **Coverage API** (Código Usado vs No Usado)

#### **Estructura de Coverage Data**
```javascript
{
  css: [
    {
      url: string,
      text: string,          // CSS completo
      ranges: [
        {
          start: number,     // Byte offset inicio
          end: number,       // Byte offset fin
          count: number      // Veces usado (0 = no usado)
        }
      ],
      unusedBytes: number,
      totalBytes: number,
      unusedPercentage: number
    }
  ],

  js: [
    {
      url: string,
      scriptId: string,
      text: string,          // JavaScript completo
      ranges: [
        {
          start: number,
          end: number,
          count: number      // Veces ejecutado
        }
      ],
      functions: [
        {
          functionName: string,
          ranges: [...],
          isBlockCoverage: boolean
        }
      ],
      unusedBytes: number,
      totalBytes: number,
      unusedPercentage: number
    }
  ],

  summary: {
    totalBytes: number,
    unusedBytes: number,
    unusedPercentage: number,
    byType: {
      css: { unused: number, total: number },
      js: { unused: number, total: number }
    }
  }
}
```

#### **Ejemplo Real: Coverage Analysis**
```javascript
{
  css: [
    {
      url: 'https://patients.autamedica.com/styles.css',
      totalBytes: 156789,
      unusedBytes: 89234,
      unusedPercentage: 56.9  // ⚠️ 57% CSS no usado!
    }
  ],

  js: [
    {
      url: 'https://patients.autamedica.com/main.js',
      totalBytes: 567890,
      unusedBytes: 234567,
      unusedPercentage: 41.3  // ⚠️ 41% JS no usado!
    }
  ],

  summary: {
    totalBytes: 724679,
    unusedBytes: 323801,
    unusedPercentage: 44.7   // ⚠️ 45% código total no usado
  }
}
```

**🎯 Utilidad para Agentes:**
- `agent_code`:
  - ✅ Identificar código muerto
  - ✅ Sugerir code splitting
  - ✅ Optimizar bundle size
- `agent_qa`:
  - ✅ Validar que no hay demasiado código no usado

---

### 6. **Accessibility API** (ARIA y A11y)

#### **Estructura de Accessibility Tree**
```javascript
{
  violations: [
    {
      id: string,
      impact: 'critical' | 'serious' | 'moderate' | 'minor',
      description: string,
      help: string,
      helpUrl: string,
      nodes: [
        {
          html: string,
          target: string[],  // CSS selector
          failureSummary: string,
          any: [...],
          all: [...],
          none: [...]
        }
      ]
    }
  ],

  passes: [...],  // Tests que pasaron
  incomplete: [...],  // Tests que requieren revisión manual

  summary: {
    violations: number,
    passes: number,
    incomplete: number,
    inapplicable: number
  }
}
```

#### **Ejemplo Real: A11y Violations**
```javascript
{
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must have sufficient color contrast',
      help: 'Ensure text has sufficient contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
      nodes: [
        {
          html: '<button class="btn-primary">Submit</button>',
          target: ['.btn-primary'],
          failureSummary: 'Contrast ratio 2.1:1 (expected 4.5:1)',
          impact: 'serious'
        }
      ]
    },
    {
      id: 'aria-required-attr',
      impact: 'critical',
      description: 'Required ARIA attributes must be provided',
      nodes: [
        {
          html: '<div role="dialog">...</div>',
          target: ['[role="dialog"]'],
          failureSummary: 'Missing aria-label or aria-labelledby'
        }
      ]
    }
  ],

  summary: {
    violations: 2,
    passes: 47,
    incomplete: 3
  }
}
```

**🎯 Utilidad para Agentes:**
- `agent_qa`:
  - ✅ Validar accesibilidad WCAG 2.1 AA
  - ✅ Detectar violaciones críticas
  - ✅ Asegurar ARIA correcto

---

## 🛠️ Cómo Capturar Esta Data con Playwright

### **1. Console Messages**
```javascript
page.on('console', msg => {
  console.log({
    type: msg.type(),
    text: msg.text(),
    location: msg.location()
  });
});
```

### **2. Network Requests**
```javascript
page.on('request', request => {
  console.log({
    url: request.url(),
    method: request.method(),
    headers: request.headers()
  });
});

page.on('response', response => {
  console.log({
    url: response.url(),
    status: response.status(),
    headers: response.headers()
  });
});
```

### **3. Performance Metrics**
```javascript
const metrics = await page.evaluate(() => {
  return {
    LCP: performance.getEntriesByType('largest-contentful-paint')[0],
    FCP: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint'),
    resources: performance.getEntriesByType('resource'),
    navigation: performance.getEntriesByType('navigation')[0]
  };
});
```

### **4. Security Headers**
```javascript
const response = await page.goto('https://patients.autamedica.com');
const headers = response.headers();

const securityHeaders = {
  hsts: headers['strict-transport-security'],
  csp: headers['content-security-policy'],
  xfo: headers['x-frame-options'],
  xcto: headers['x-content-type-options']
};
```

### **5. Coverage**
```javascript
await page.coverage.startJSCoverage();
await page.coverage.startCSSCoverage();

// ... navegación ...

const [jsCoverage, cssCoverage] = await Promise.all([
  page.coverage.stopJSCoverage(),
  page.coverage.stopCSSCoverage()
]);
```

### **6. Accessibility**
```javascript
import { injectAxe, checkA11y } from 'axe-playwright';

await injectAxe(page);
const results = await checkA11y(page, null, {
  detailedReport: true,
  detailedReportOptions: { html: true }
});
```

---

## 🎯 Integración con tus Agentes

### **agent_security Script**
```javascript
// scripts/security-audit.mjs
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Capturar todo
const securityData = {
  console: [],
  network: [],
  headers: null,
  mixed: []
};

page.on('console', msg => securityData.console.push(msg));
page.on('response', r => securityData.network.push(r));

const response = await page.goto('https://patients.autamedica.com');
securityData.headers = response.headers();

// Analizar y reportar
console.log('Security Audit Results:', securityData);
```

### **agent_qa Script**
```javascript
// scripts/performance-audit.mjs
import { chromium } from 'playwright';

const page = await chromium.newPage();
await page.goto('https://patients.autamedica.com');

const metrics = await page.evaluate(() => ({
  LCP: performance.getEntriesByType('largest-contentful-paint')[0],
  CLS: performance.getEntriesByType('layout-shift')
}));

// Validar thresholds
if (metrics.LCP?.renderTime > 2500) {
  console.error('❌ LCP > 2.5s - FAILED');
}
```

---

**Última actualización**: 2025-10-06
**Versión**: 1.0.0
