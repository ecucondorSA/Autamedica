# 🔧 AGENT-DEV - Developer Browser Capture Tool

## 🎯 Propósito

**AGENT-DEV** es tu agente de desarrollo personal que captura TODA la información del navegador de manera sencilla y automática.

### ¿Qué Captura?

1. ✅ **Console Messages** (logs, errors, warnings)
2. ✅ **Network Requests** (timing, headers, status)
3. ✅ **Performance Metrics** (Web Vitals: LCP, CLS, FCP)
4. ✅ **Security Headers** (HSTS, CSP, XFO, etc.)
5. ✅ **Code Coverage** (JS y CSS no usado)
6. ✅ **Screenshots** (página completa)

---

## 🚀 Uso Rápido

### **Comando Básico**
```bash
pnpm dev:capture
```

Captura información del navegador en `http://localhost:3002` (Patients app por defecto)

### **Capturas por App**
```bash
# Patients portal
pnpm dev:capture:patients

# Doctors portal
pnpm dev:capture:doctors

# Producción
pnpm dev:capture:prod
```

### **URL Personalizada**
```bash
TARGET_URL=https://doctors.autamedica.com pnpm dev:capture
```

---

## 📊 Salida Generada

Cada captura genera **3 archivos** en `generated-docs/browser-captures/`:

### 1. **JSON Completo** (`capture-{timestamp}.json`)
Datos crudos con toda la información capturada:

```json
{
  "metadata": {
    "url": "http://localhost:3002",
    "timestamp": "2025-10-06T10:30:00.000Z"
  },
  "console": {
    "errors": [...],
    "warnings": [...],
    "summary": { "total": 45, "errors": 2, "warnings": 5 }
  },
  "network": {
    "requests": [...],
    "summary": {
      "total": 87,
      "failed": 0,
      "slow": 3,
      "avgDuration": 245
    }
  },
  "performance": {
    "webVitals": {
      "LCP": 1234,
      "CLS": 0.08,
      "FCP": 892
    }
  },
  "security": {
    "headers": {...},
    "issues": []
  },
  "coverage": {
    "js": { "percentage": 41.3 },
    "css": { "percentage": 56.9 }
  }
}
```

### 2. **Reporte Markdown** (`report-{timestamp}.md`)
Reporte visual con tablas y estado de cada métrica:

```markdown
# 🔍 AGENT-DEV Browser Capture Report

## 📋 Summary
| Metric | Value | Status |
|--------|-------|--------|
| Console Errors | 2 | ⚠️ |
| Failed Requests | 0 | ✅ |
| Slow Requests | 3 | ⚠️ |
| Security Issues | 0 | ✅ |

## ⚡ Web Vitals
| Metric | Value | Status |
|--------|-------|--------|
| LCP | 1234ms | ✅ GOOD |
| CLS | 0.08 | ✅ GOOD |
| FCP | 892ms | ✅ GOOD |
```

### 3. **Screenshot** (`screenshot-{timestamp}.png`)
Captura de pantalla completa de la página

---

## 🎨 Salida de Terminal

Mientras captura, verás output colorizado en tiempo real:

```
━━━ 🚀 AGENT-DEV Browser Capture Starting ━━━

ℹ Target URL: http://localhost:3002

━━━ 1️⃣  Capturing Console Messages ━━━

✗ Console Error: Uncaught TypeError: Cannot read property 'id'...
⚠ Console Warning: React Hook useEffect has a missing dependency...

━━━ 2️⃣  Capturing Network Activity ━━━

ℹ GET 200 http://localhost:3002/_next/static/chunks/main.js (156ms)
⚠ Slow Request: 567ms http://localhost:3002/api/patients
✗ Failed Request: 404 http://localhost:3002/api/missing

━━━ 5️⃣  Analyzing Security Headers ━━━

✓ strict-transport-security: max-age=31536000; includeSubDomains...
⚠ content-security-policy: MISSING

━━━ 6️⃣  Collecting Performance Metrics ━━━

ℹ LCP: 1234ms ✅ GOOD
ℹ CLS: 0.080 ✅ GOOD
ℹ FCP: 892ms ✅ GOOD

━━━ 7️⃣  Analyzing Code Coverage ━━━

ℹ JS Coverage: 41.3% unused (234.5KB wasted)
ℹ CSS Coverage: 56.9% unused (89.2KB wasted)

━━━ ✨ AGENT-DEV Browser Capture Complete ━━━

📂 Files generated:
  - generated-docs/browser-captures/capture-1696598400000.json
  - generated-docs/browser-captures/report-1696598400000.md

📊 Quick Stats:
  - Console Errors: 2
  - Failed Requests: 0
  - Security Issues: 1
  - LCP: 1234ms
```

---

## 🔍 Casos de Uso

### **1. Debugging en Desarrollo**
```bash
# Levanta tu app
pnpm dev --filter @autamedica/patients

# En otra terminal, captura info
pnpm dev:capture:patients
```

**Resultado**: Identificas que tienes 2 console errors y 41% de JS no usado.

### **2. Validación Pre-Deploy**
```bash
# Build de producción
pnpm build

# Captura local
pnpm dev:capture

# Compara con producción
pnpm dev:capture:prod
```

**Resultado**: Validas que no introduces nuevos errores antes de deployar.

### **3. Análisis de Performance**
```bash
pnpm dev:capture:prod
```

**Resultado**: Obtienes Web Vitals reales de producción:
- LCP: 1234ms ✅ GOOD
- CLS: 0.08 ✅ GOOD
- Coverage: 41% JS no usado → Oportunidad de optimización

### **4. Auditoría de Seguridad**
```bash
pnpm dev:capture:prod
```

**Resultado**: Validas que todos los security headers están presentes:
- HSTS ✅
- CSP ⚠️ MISSING
- XFO ✅
- XCTO ✅

### **5. CI/CD Integration**
```bash
# En GitHub Actions
- name: Capture browser data
  run: TARGET_URL=${{ env.DEPLOY_URL }} pnpm dev:capture

- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: browser-capture
    path: generated-docs/browser-captures/
```

---

## 📋 Información Capturada Detallada

### **Console API**
```javascript
{
  type: 'error',
  text: 'Uncaught TypeError: Cannot read property...',
  location: {
    url: 'http://localhost:3002/dashboard.js',
    lineNumber: 42,
    columnNumber: 15
  },
  timestamp: 1696598400000
}
```

### **Network API**
```javascript
{
  url: 'https://gtyvdircfhmdjiaelqkg.supabase.co/rest/v1/patients',
  method: 'GET',
  status: 200,
  headers: {
    'content-type': 'application/json',
    'strict-transport-security': 'max-age=31536000'
  },
  duration: 245,
  size: 15420,
  fromCache: false
}
```

### **Performance Metrics**
```javascript
{
  webVitals: {
    LCP: 1234,    // Largest Contentful Paint (ms)
    CLS: 0.08,    // Cumulative Layout Shift (score)
    FCP: 892,     // First Contentful Paint (ms)
    TTFB: 234     // Time to First Byte (ms)
  },
  navigation: {
    domInteractive: 1245,
    domContentLoadedEventEnd: 1567,
    loadEventEnd: 2890
  }
}
```

### **Security Headers**
```javascript
{
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'",
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'x-xss-protection': '1; mode=block',
  'referrer-policy': 'strict-origin-when-cross-origin'
}
```

### **Code Coverage**
```javascript
{
  js: {
    total: 567890,      // bytes
    unused: 234567,     // bytes
    percentage: 41.3    // %
  },
  css: {
    total: 156789,
    unused: 89234,
    percentage: 56.9
  }
}
```

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `TARGET_URL` | URL a capturar | `http://localhost:3002` |
| `OUTPUT_DIR` | Directorio de salida | `generated-docs/browser-captures` |

**Ejemplo:**
```bash
TARGET_URL=https://doctors.autamedica.com \
OUTPUT_DIR=/tmp/captures \
pnpm dev:capture
```

---

## 🎯 Thresholds y Validación

### **Web Vitals**
| Métrica | Good | Needs Improvement | Poor |
|---------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | < 1.8s | 1.8s - 3s | > 3s |
| TTFB | < 600ms | 600ms - 1.5s | > 1.5s |

### **Network**
- **Slow Request**: > 500ms
- **Failed Request**: Status >= 400

### **Code Coverage**
- **Good**: < 40% unused
- **Needs Improvement**: 40-60% unused
- **Poor**: > 60% unused

---

## 🔧 Integración con Agentes

### **agent_security**
```bash
# Captura datos
pnpm dev:capture:prod

# agent_security analiza:
# - Security headers presentes
# - Sin mixed content
# - CORS configurado correctamente
```

### **agent_qa**
```bash
# Captura datos
pnpm dev:capture:patients

# agent_qa valida:
# - Web Vitals dentro de thresholds
# - No errores en console
# - No requests fallidos
```

### **agent_code**
```bash
# Captura coverage
pnpm dev:capture

# agent_code sugiere:
# - Code splitting para reducir unused code
# - Lazy loading de componentes
# - Tree shaking optimization
```

---

## 📚 Referencias

- **Chrome DevTools Protocol**: https://chromedevtools.github.io/devtools-protocol/
- **Web Vitals**: https://web.dev/vitals/
- **Playwright API**: https://playwright.dev/docs/api/class-page

---

## 🚀 Próximos Pasos

1. **Ejecuta tu primera captura**:
   ```bash
   pnpm dev:capture:patients
   ```

2. **Revisa el reporte generado**:
   ```bash
   cat generated-docs/browser-captures/report-*.md
   ```

3. **Analiza los datos**:
   - ¿Tienes console errors? → Fixearlos
   - ¿Requests lentos? → Optimizar
   - ¿Security headers faltantes? → Agregarlos
   - ¿Mucho código no usado? → Code splitting

4. **Automatiza**:
   - Agrega a pre-deploy hooks
   - Integra con CI/CD
   - Compara capturas antes/después

---

**Última actualización**: 2025-10-06
**Versión**: 1.0.0
