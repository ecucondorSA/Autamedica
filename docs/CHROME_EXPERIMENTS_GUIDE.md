# 🧪 Chrome DevTools Experiments - Guía para AGENT-DEV

## 📋 Resumen

Chrome DevTools ofrece **funcionalidades experimentales** que pueden mejorar significativamente las capacidades de debugging y análisis de AGENT-DEV.

**Tu configuración actual** (según la imagen compartida):
- ✅ **Accessibility tree view**: Habilitado
- ✅ **Highlights violations**: Habilitado

---

## 🎯 Experimentos Recomendados

### **Categoría 1: ESTABLES - Habilitar Ahora** ✅

#### 1. **"Performance panel: show postMessage dispatch and handling flows"**

**Qué hace:**
- Muestra el flujo de mensajes `postMessage` entre windows/iframes/workers
- Útil para debugging de comunicación cross-origin

**Para AGENT-DEV:**
```javascript
// Capturar postMessage events
page.on('console', msg => {
  if (msg.text().includes('postMessage')) {
    // Detectar comunicación iframe
  }
});
```

**Casos de uso:**
- Debugging de iframes (ej: Stripe payment forms)
- Workers communication
- Cross-origin messaging

---

#### 2. **"Performance panel: enable saving traces as .gz"**

**Qué hace:**
- Comprime performance traces para ahorrar espacio
- Reduce tamaño de archivos en ~70%

**Para AGENT-DEV:**
```bash
# Antes: trace.json (5.2MB)
# Después: trace.json.gz (1.5MB)
```

**Casos de uso:**
- Guardar múltiples traces sin llenar disco
- Compartir traces con el equipo
- CI/CD artifacts optimization

---

#### 3. **"Performance panel: enable new, more powerful A-A in trace view"**

**Qué hace:**
- Análisis mejorado de traces
- Mejor detección de long tasks
- Sugerencias de optimización automáticas

**Para AGENT-DEV:**
- Análisis más preciso de bottlenecks
- Mejor identificación de código bloqueante

---

### **Categoría 2: ÚTILES - Considerar** 🔄

#### 4. **"Protocol Monitor"**

**Qué hace:**
- Muestra todos los mensajes del Chrome DevTools Protocol
- Útil para debugging de automation con Playwright

**Para AGENT-DEV:**
```javascript
// Ver exactamente qué comandos envía Playwright
// Útil cuando algo no funciona como esperado
```

**Casos de uso:**
- Debugging de scripts Playwright
- Entender qué hace Playwright internamente
- Optimizar performance de automation

---

#### 5. **"Group sources into authored and deployed trees"**

**Qué hace:**
- Separa código fuente original (authored) del código deployado (bundled)
- Mejor organización en Sources panel

**Para AGENT-DEV:**
- Más fácil encontrar archivos originales
- Mejor debugging de código TypeScript/JSX

---

### **Categoría 3: UNSTABLE - Solo Debugging Avanzado** ⚠️

#### 6. **"Performance panel: show all events"**

**Qué hace:**
- Muestra TODOS los eventos del browser (no solo los principales)
- Incluye eventos internos de rendering, compositing, painting

**Para AGENT-DEV:**
```javascript
// Capturar eventos detallados
const allEvents = performance.getEntries();
// Incluye: navigation, resource, paint, mark, measure, longtask, etc.
```

**⚠️ Warning:** Genera MUCHA data. Usar solo para debugging profundo.

**Casos de uso:**
- Debugging de jank (stuttering)
- Investigación de rendering issues
- Performance forensics

---

#### 7. **"Performance panel: V8 runtime call stats"**

**Qué hace:**
- Muestra estadísticas internas del engine V8
- Tiempo en parsing, compilation, GC, execution

**Para AGENT-DEV:**
```javascript
{
  parse: 123ms,        // Tiempo parseando JavaScript
  compile: 45ms,       // Tiempo compilando
  gc: 89ms,           // Garbage collection
  execute: 567ms,      // Tiempo ejecutando
  optimize: 23ms       // Optimización JIT
}
```

**Casos de uso:**
- Optimización de bundle size
- Detectar código no optimizable por V8
- Memory leak investigation

---

#### 8. **"Performance panel: Enable collecting enhanced traces"**

**Qué hace:**
- Captura información adicional en traces
- Más context sobre cada frame
- Call stacks más completos

**⚠️ Warning:** Traces mucho más grandes (2-3x).

**Casos de uso:**
- Debugging profundo de performance issues
- Análisis post-mortem de production issues
- Research de rendering pipeline

---

## 🛠️ Cómo Habilitar

### **Paso 1: Abrir Experiments**
```
Chrome DevTools → Settings (⚙️) → Experiments
```

### **Paso 2: Habilitar Features**

**Recomendado para AGENT-DEV:**
```
✅ Enable full accessibility tree view (YA HABILITADO)
✅ Highlights violating nodes (YA HABILITADO)
✅ Performance: show postMessage flows
✅ Performance: save traces as .gz
✅ Performance: new A-A in trace view
✅ Protocol Monitor (opcional)
```

**Solo para debugging avanzado:**
```
⚠️ Performance: show all events
⚠️ Performance: V8 runtime call stats
⚠️ Performance: enhanced traces
```

### **Paso 3: Reload DevTools**
```
Cerrar y reabrir Chrome DevTools
```

---

## 📊 Integración con AGENT-DEV

### **Accessibility Tree** (Ya implementado)

```javascript
// agent-dev-browser-capture.mjs
const a11ySnapshot = await page.accessibility.snapshot();

// Detecta violations:
// - Botones sin nombre
// - Imágenes sin alt
// - Form inputs sin label
```

### **Performance Traces** (Próximo)

```javascript
// Capturar performance trace
await page.tracing.start({ screenshots: true, categories: ['devtools.timeline'] });
await page.goto(TARGET_URL);
await page.tracing.stop();

// Analizar trace
const trace = JSON.parse(fs.readFileSync('trace.json'));
const longTasks = trace.filter(e => e.dur > 50000); // > 50ms
```

### **Protocol Monitor** (Próximo)

```javascript
// Ver mensajes CDP
const client = await page.context().newCDPSession(page);
client.on('*', (method, params) => {
  console.log(`CDP: ${method}`, params);
});
```

---

## 🎯 Beneficios para AutaMedica

### **1. Compliance HIPAA/WCAG**
```
✅ Accessibility tree view
  → Valida compliance WCAG 2.1 AA
  → Detecta violaciones antes de deploy
  → Asegura accesibilidad para todos los usuarios
```

### **2. Performance Médica Critical**
```
✅ Performance panel enhancements
  → Detecta long tasks que afectan UX
  → Optimiza tiempo de carga para emergencias
  → Reduce frustración de médicos/pacientes
```

### **3. Security Auditing**
```
✅ Highlights violations
  → Detecta elementos inseguros en DOM
  → Valida CSP compliance
  → Identifica XSS vulnerabilities
```

### **4. Developer Experience**
```
✅ Protocol Monitor + enhanced traces
  → Debugging más rápido
  → Menos tiempo perdido en issues
  → Mejor productividad del equipo
```

---

## 📈 Roadmap de Integración

### **Fase 1: Completado** ✅
- [x] Accessibility tree capture
- [x] A11y violations detection
- [x] Basic security headers validation

### **Fase 2: Próxima** 🔄
- [ ] Performance traces capture
- [ ] Long tasks detection
- [ ] V8 runtime stats analysis

### **Fase 3: Avanzada** 📅
- [ ] Protocol Monitor integration
- [ ] Enhanced traces for production debugging
- [ ] Full CDP access for advanced scenarios

---

## 🚀 Quick Start

### **Habilitar Features Recomendadas**

1. Abre Chrome DevTools
2. Settings → Experiments
3. Habilita:
   - ✅ Performance: show postMessage flows
   - ✅ Performance: save traces as .gz
   - ✅ Performance: new A-A in trace view
4. Reload DevTools
5. Ejecuta `pnpm dev:capture:patients`

### **Ver Resultados**

```bash
$ cat generated-docs/browser-captures/report-*.md

## ♿ Accessibility Violations
### Critical (2)
1. **missing-accessible-name**: button at `main > button`
2. **missing-form-label**: textbox at `form > textbox`
```

---

## 📚 Referencias

- **Chrome DevTools Protocol**: https://chromedevtools.github.io/devtools-protocol/
- **Accessibility Tree**: https://developer.chrome.com/docs/devtools/accessibility/reference#pane
- **Performance API**: https://developer.mozilla.org/en-US/docs/Web/API/Performance_API
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 💡 Tips

### **Debugging de Accesibilidad**
```
DevTools → Elements → Accessibility pane
→ Ver cómo screen readers interpretan tu página
```

### **Performance Profiling**
```
DevTools → Performance → Record
→ Captura trace mientras usas la app
→ Analiza con "show all events" habilitado
```

### **Protocol Debugging**
```
DevTools → More tools → Protocol Monitor
→ Ver todos los comandos CDP
→ Útil para debugging de Playwright scripts
```

---

**Última actualización**: 2025-10-06
**Versión**: 1.0.0
