# 🔬 Tests Extensos - Long-Running Integration Tests

Tests automatizados extensivos con interacciones largas, timeouts extendidos y validación detallada de cada paso.

## 🎯 Diferencias con Tests Estándar

| Aspecto | Tests Estándar | Tests Extensos |
|---------|---------------|----------------|
| **Duración** | 30-60 segundos | 2-5 minutos |
| **Timeout** | 30 segundos | 120-300 segundos |
| **Logging** | Básico | Detallado en cada paso |
| **Screenshots** | Solo en fallos | En cada fase |
| **Validaciones** | Esenciales | Exhaustivas |
| **Interacciones** | Rápidas | Con delays realistas |
| **Fases** | 3-5 | 10-15 |

---

## 🚀 Ejecutar Tests Extensos

### Comando Principal

```bash
# Ejecutar tests extensivos con navegador visible
pnpm test:auth:extensive
```

### Comando Watch (Desarrollo)

```bash
# Re-ejecutar en cada cambio
pnpm test:auth:extensive:watch
```

---

## 📋 Tests Implementados

### Test 1: Complete Patient Journey (11 Fases)

**Duración estimada:** 2-3 minutos
**Timeout:** 3 minutos (180 segundos)

**Fases:**

| Fase | Acción | Duración |
|------|--------|----------|
| 1 | Verificar estado inicial limpio | 5s |
| 2 | Navegar a login y verificar elementos | 10s |
| 3 | Realizar login con validación | 15s |
| 4 | Esperar procesamiento de autenticación | 10s |
| 5 | Manejar selección de rol (si aplica) | 5s |
| 6 | Esperar redirect a patients app | 15s |
| 7 | Verificar estado de autenticación | 5s |
| 8 | Esperar carga completa del dashboard | 10s |
| 9 | Verificar contenido del dashboard | 10s |
| 10 | Probar navegación interna (profile) | 10s |
| 11 | Verificar persistencia en reload | 15s |

**Total:** ~110 segundos + buffers = 2-3 minutos

**Lo que verifica:**
- ✅ Cleanup inicial de auth state
- ✅ Presencia de todos los elementos de login
- ✅ Login exitoso con credenciales correctas
- ✅ Procesamiento de token y sesión
- ✅ Selección de rol para nuevos usuarios
- ✅ Redirect correcto a patients app
- ✅ Sesión creada en localStorage/cookies
- ✅ Dashboard carga completamente
- ✅ Contenido correcto del dashboard
- ✅ Navegación interna funciona
- ✅ Sesión persiste en page reload

---

### Test 2: Cross-App Protection Journey (7 Fases)

**Duración estimada:** 3-4 minutos
**Timeout:** 3 minutos (180 segundos)

**Fases:**

| Fase | Acción | Duración |
|------|--------|----------|
| 1 | Login como paciente | 20s |
| 2 | Verificar ubicación en patients app | 5s |
| 3 | Intentar acceder a doctors app (bloqueado) | 15s |
| 4 | Intentar acceder a companies app (bloqueado) | 15s |
| 5 | Intentar acceder a admin app (bloqueado) | 15s |
| 6 | Verificar autenticación persiste | 5s |
| 7 | Verificar acceso legítimo funciona | 10s |

**Total:** ~85 segundos + buffers + 3 intentos de acceso = 3-4 minutos

**Lo que verifica:**
- ✅ Login exitoso como paciente
- ✅ Redirect correcto a patients app
- ✅ Middleware bloquea acceso a doctors app
- ✅ Middleware bloquea acceso a companies app
- ✅ Middleware bloquea acceso a admin app
- ✅ Sesión NO se pierde durante redirects
- ✅ Acceso legítimo sigue funcionando

---

### Test 3: ReturnUrl Journey (4 Fases)

**Duración estimada:** 1-2 minutos
**Timeout:** 2 minutos (120 segundos)

**Fases:**

| Fase | Acción | Duración |
|------|--------|----------|
| 1 | Navegar a login con returnUrl | 8s |
| 2 | Realizar login | 15s |
| 3 | Esperar redirect | 15s |
| 4 | Verificar URL final contiene path correcto | 5s |

**Total:** ~43 segundos + buffers = 1-2 minutos

**Lo que verifica:**
- ✅ returnUrl se preserva en login URL
- ✅ Login procesa correctamente
- ✅ Redirect va a la URL específica (no solo app)
- ✅ Path final es exactamente el solicitado

---

## 🔍 Logging Detallado

Los tests extensos generan logs detallados en cada paso:

```bash
[2025-10-04T16:45:23.123Z] 🚀 Starting new test
[2025-10-04T16:45:23.456Z] 🧹 Starting extensive auth state cleanup...
[2025-10-04T16:45:23.789Z] Found 3 localStorage keys
[2025-10-04T16:45:24.012Z] Found 5 cookies to clear
[2025-10-04T16:45:24.345Z] ✅ Cleanup complete. Remaining localStorage keys: 0
[2025-10-04T16:45:24.678Z] ⏳ Waiting 2000ms - Allow cleanup to propagate
[2025-10-04T16:45:26.901Z] ✅ Wait completed - Allow cleanup to propagate

[2025-10-04T16:45:27.234Z] 🎯 TEST: Complete patient journey with extensive validation
[2025-10-04T16:45:27.567Z] Expected duration: 2-3 minutes

[2025-10-04T16:45:28.890Z] 📋 PHASE 1: Verify initial state
[2025-10-04T16:45:29.123Z] 📍 Navigating to: http://localhost:3000
...
```

**Tipos de logs:**
- 🚀 Inicio de test
- 🧹 Limpieza de estado
- 🎯 Descripción del test
- 📋 Inicio de fase
- 🔍 Búsqueda de elementos
- ✍️ Interacción con formularios
- 🖱️ Clicks
- 🔄 Navegación/Redirects
- ⏳ Esperas
- ✅ Verificaciones exitosas
- ❌ Errores
- 📸 Screenshots
- 📍 Cambios de URL

---

## 📸 Screenshots Automáticos

Los tests extensos capturan screenshots en momentos clave:

```
test-results/screenshots/
├── before-login.png           # Antes de llenar formulario
├── before-submit.png          # Después de llenar, antes de submit
├── content-verification-failed.png  # Si falla verificación de contenido
├── final-page-state.png       # Estado final de cada test
├── test-complete.png          # Al completar test exitosamente
├── on-patients-app.png        # Confirmación en patients app
├── blocked-doctors.png        # Después de bloquear doctors
├── blocked-companies.png      # Después de bloquear companies
└── blocked-admin.png          # Después de bloquear admin
```

**Ubicación:** `test-results/screenshots/`

**Uso:**
- Debugging: Ver exactamente qué pasó en cada paso
- Evidencia: Screenshots sirven como evidencia de que los tests pasaron
- Troubleshooting: Comparar screenshots entre ejecuciones

---

## 🎬 Ejemplo de Ejecución Completa

```bash
$ pnpm test:auth:extensive

 RUN  v3.2.4 /root/altamedica-reboot-fresh

 ✓ tests/integration/auth-extensive.browser.test.ts (3) 287.45s
   ✓ EXTENSIVE Auth Flow - Complete Patient Journey (1) 162.34s
     ✓ Complete patient authentication and app exploration journey 162.34s
       [16:45:23] 🚀 Starting new test
       [16:45:23] 🧹 Starting extensive auth state cleanup...
       [16:45:26] 🎯 TEST: Complete patient journey with extensive validation
       [16:45:27] 📋 PHASE 1: Verify initial state
       [16:45:32] 📋 PHASE 2: Navigate to login page
       [16:45:40] 📋 PHASE 3: Perform login
       [16:45:55] 📋 PHASE 4: Wait for authentication processing
       [16:46:03] 📋 PHASE 5: Wait for redirect to patients app
       [16:46:18] 📋 PHASE 6: Verify authentication state
       [16:46:23] 📋 PHASE 7: Wait for dashboard to fully load
       [16:46:33] 📋 PHASE 8: Verify dashboard content
       [16:46:43] 📋 PHASE 9: Test in-app navigation
       [16:46:56] 📋 PHASE 10: Test session persistence on reload
       [16:47:11] 📋 PHASE 11: Final comprehensive check
       [16:47:25] ✅ TEST COMPLETED SUCCESSFULLY

   ✓ EXTENSIVE Auth Flow - Cross-App Protection Journey (1) 89.23s
     ✓ Patient login and attempt to access all other apps 89.23s
       [16:47:26] 🎯 TEST: Cross-app protection with extensive validation
       [16:47:30] 📋 PHASE 1: Login as patient
       [16:47:50] 📋 PHASE 2: Verify current location
       [16:47:55] 📋 PHASE 3: Attempt unauthorized access to doctors app
       [16:48:10] 📋 PHASE 4: Attempt unauthorized access to companies app
       [16:48:25] 📋 PHASE 5: Attempt unauthorized access to admin app
       [16:48:40] 📋 PHASE 6: Verify authentication persisted
       [16:48:45] 📋 PHASE 7: Verify legitimate access still works
       [16:48:55] ✅ TEST COMPLETED SUCCESSFULLY

   ✓ EXTENSIVE Auth Flow - ReturnUrl Journey (1) 35.88s
     ✓ Login with returnUrl and verify complete redirect flow 35.88s
       [16:48:56] 🎯 TEST: ReturnUrl preservation with extensive validation
       [16:49:00] 📋 PHASE 1: Navigate to login with returnUrl parameter
       [16:49:08] 📋 PHASE 2: Perform login
       [16:49:23] 📋 PHASE 3: Wait for redirect to returnUrl
       [16:49:33] 📋 PHASE 4: Verify final URL matches returnUrl
       [16:49:32] ✅ TEST COMPLETED SUCCESSFULLY

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  16:45:22
   Duration  4m 47s (transform 12ms, setup 45ms, collect 3.2s, tests 287.45s)

  PASS  All tests passed!
```

---

## ⚙️ Configuración

### Timeouts Configurados

En `vitest.browser.config.ts`:

```typescript
testTimeout: 300000,   // 5 minutos por test
hookTimeout: 120000,   // 2 minutos para hooks
slowMo: 500,           // 500ms delay entre interacciones (visibilidad)
```

### Modificar Timeouts

Para hacer los tests aún MÁS largos:

```typescript
// tests/integration/auth-extensive.browser.test.ts
const TIMEOUTS = {
  LONG_NAVIGATION: 120000,   // 2 minutos
  VERY_LONG: 240000,         // 4 minutos
  ULTRA_LONG: 360000,        // 6 minutos
  PAGE_LOAD: 60000,          // 1 minuto
  INTERACTION: 20000,        // 20 segundos
  ANIMATION: 5000            // 5 segundos
}
```

### Agregar Más Delays

```typescript
// Ejemplo: Esperar más tiempo en cada fase
await waitWithLog(10000, 'Extra stabilization time')  // 10 segundos
```

---

## 🐛 Troubleshooting

### Test falla con "timeout exceeded"

**Causa:** El test realmente necesita más tiempo.

**Solución 1:** Aumentar timeout específico
```typescript
test('mi test', async () => {
  // ...
}, 600000) // 10 minutos
```

**Solución 2:** Aumentar timeout global
```typescript
// vitest.browser.config.ts
testTimeout: 600000  // 10 minutos
```

---

### Screenshots no se generan

**Causa:** Directorio `test-results/screenshots/` no existe.

**Solución:**
```bash
mkdir -p test-results/screenshots
```

---

### Navegador se cierra demasiado rápido

**Causa:** Test completó y cerró navegador automáticamente.

**Solución:** Agregar delay antes del final
```typescript
await waitWithLog(30000, 'Keep browser open for inspection')
```

---

### Logs no aparecen en terminal

**Causa:** Reporter de Vitest puede estar ocultándolos.

**Solución:** Usar reporter verbose
```bash
pnpm test:auth:extensive --reporter=verbose
```

---

## 🎯 Cuándo Usar Tests Extensos

### ✅ Usar cuando:

- Debugging de flujos completos
- Validación manual visual necesaria
- Problemas intermitentes que requieren observación
- Documentación con screenshots paso a paso
- Demostración a stakeholders
- Verificación de timing y performance
- Testing de escenarios edge case complejos

### ❌ NO usar cuando:

- CI/CD (demasiado lentos)
- Tests rápidos de regresión
- Pre-commit hooks
- Desarrollo iterativo rápido

---

## 📊 Comparativa

| Característica | Tests Estándar | Tests Extensos |
|---------------|----------------|----------------|
| **Ejecución completa** | ~1 minuto | ~5 minutos |
| **Logs por test** | ~20 líneas | ~200 líneas |
| **Screenshots** | 1-2 | 10-15 |
| **Validaciones** | Esenciales | Exhaustivas |
| **Uso en CI** | ✅ Sí | ❌ No |
| **Debugging** | Básico | ✅ Excelente |
| **Visibilidad** | Media | ✅ Total |

---

## 🚀 Próximos Tests Extensos a Agregar

- [ ] Doctor complete journey (similar a patient)
- [ ] Company admin complete journey
- [ ] Admin platform journey
- [ ] OAuth login flow (Google/GitHub)
- [ ] Password reset complete flow
- [ ] Email verification flow
- [ ] Multi-device session testing
- [ ] Session expiration handling
- [ ] Network failure recovery
- [ ] Offline mode testing

---

## 📚 Referencias

- Tests estándar: `auth-redirects.browser.test.ts`
- Configuración: `vitest.browser.config.ts`
- Helper functions: `setup.ts`
- Estrategia: `/tmp/auth-redirect-testing-strategy-2025.md`

---

**Creado:** 2025-10-04
**Duración típica:** 5-10 minutos para suite completa
**Recomendado para:** Debugging profundo y validación exhaustiva
