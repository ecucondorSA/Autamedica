# 🚀 GitHub Actions - Tests de Autenticación

Guía completa para ejecutar tests de autenticación en GitHub Actions a través de workflows, PRs, Issues y manualmente.

---

## 📋 **Workflows Disponibles**

### 1. 🔐 **Auth Tests** (Automático)

**Archivo:** `.github/workflows/auth-tests.yml`

**Cuándo se ejecuta:**
- ✅ Push a `main` o `develop`
- ✅ Pull Requests que modifiquen:
  - Apps de autenticación (`apps/web-app`, `apps/auth`)
  - Apps de usuarios (`apps/patients`, `apps/doctors`)
  - Packages de auth (`packages/auth`, `packages/types`)
  - Tests (`tests/integration/**`)

**Jobs incluidos:**

#### **🚀 Tests Rápidos** (siempre)
- Ejecuta tests estándar en 10-15 minutos
- 12 tests de autenticación y redirección
- Headless mode (sin UI)
- Screenshots en caso de fallos

#### **🔬 Tests Extensivos** (solo en `main` o manual)
- Ejecuta tests exhaustivos en 20-30 minutos
- 3 tests con múltiples fases (11, 7, 4 fases)
- Validación profunda de cada paso
- Screenshots en cada fase
- Solo en merges a `main` o ejecución manual

**Ver resultados:**
```
GitHub → Actions → 🔐 Auth Tests
```

---

### 2. 🎮 **Auth Tests - Manual**

**Archivo:** `.github/workflows/auth-tests-manual.yml`

**Ejecución:**
Solo manual a través de GitHub UI

**Opciones personalizables:**

| Opción | Descripción | Valores | Default |
|--------|-------------|---------|---------|
| **test_type** | Tipo de tests | `quick`, `extensive`, `both` | `quick` |
| **apps_to_test** | Apps a incluir | CSV: `web-app,patients,doctors` | `web-app,patients,doctors` |
| **headless** | Modo headless | `true` / `false` | `true` |
| **upload_artifacts** | Subir resultados | `true` / `false` | `true` |

**Cómo ejecutar:**

1. Ve a **GitHub → Actions**
2. Selecciona **🎮 Auth Tests - Manual**
3. Click en **Run workflow**
4. Configura las opciones:
   ```
   Tipo de tests: extensive
   Apps a incluir: web-app,patients,doctors,companies,admin
   Modo headless: true
   Subir artifacts: true
   ```
5. Click **Run workflow**

**Casos de uso:**
- ✅ Testing antes de deploy importante
- ✅ Validar fix de bug específico
- ✅ Testing de todas las apps simultáneamente
- ✅ Generar screenshots para documentación

---

### 3. 🎯 **Auth Tests - Issue/PR Trigger**

**Archivo:** `.github/workflows/auth-tests-issue-trigger.yml`

**Ejecución:**
Automática cuando se usan **keywords** en Issues o PRs

**Keywords para tests rápidos:**
```
/test-auth
/run-auth-tests
test authentication
probar autenticación
```

**Keywords para tests extensivos:**
```
/test-auth-extensive
/test-auth-full
test authentication extensive
prueba completa de auth
```

**Ejemplo en Issue:**

```markdown
## Bug en login de pacientes

El usuario no es redirigido correctamente después del login.

/test-auth

CC @team
```

**Ejemplo en PR:**

```markdown
## Fix: Corregir redirección post-login

Este PR corrige el bug de redirección.

/test-auth-extensive

Por favor revisar que todos los flujos funcionen.
```

**Qué sucede:**

1. **Reacción automática**: 🚀 en el comentario/issue
2. **Comentario inicial**:
   ```
   🧪 Iniciando tests de autenticación (quick)...
   Ver progreso → [link]
   ```
3. **Ejecución de tests**: Según el keyword usado
4. **Comentario final** con resultados:
   ```
   ✅ Tests de autenticación (quick) - ✅

   ✅ Todos los tests pasaron exitosamente

   ### Resultados:
   - ✅ Role-Based Redirects
   - ✅ Middleware Protection
   - ✅ ReturnUrl Preservation
   ...

   📸 Screenshots disponibles en artifacts
   ```

---

## 🔐 **Configuración de Secrets**

Para que los workflows funcionen, necesitas configurar estos **secrets** en GitHub:

**GitHub → Settings → Secrets and variables → Actions**

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | `eyJhbGc...` (opcional) |

**Cómo agregar:**

1. Ve a **GitHub → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Agrega cada secret con su valor correspondiente
4. Click **Add secret**

---

## 📸 **Artifacts - Screenshots y Resultados**

Todos los workflows suben **artifacts** que puedes descargar:

**Ubicación:**
```
GitHub → Actions → [Workflow específico] → [Run] → Artifacts
```

**Artifacts generados:**

| Artifact | Contenido | Retención |
|----------|-----------|-----------|
| `test-screenshots-quick` | Screenshots de tests rápidos | 7 días |
| `test-screenshots-extensive` | Screenshots de tests extensivos | 30 días |
| `test-results-extensive` | Resultados completos JSON | 30 días |
| `test-screenshots-manual-*` | Screenshots de ejecución manual | 14 días |

**Estructura de screenshots:**
```
test-results/screenshots/
├── before-login.png
├── before-submit.png
├── content-verification-failed.png
├── final-page-state.png
├── test-complete.png
├── on-patients-app.png
├── blocked-doctors.png
├── blocked-companies.png
└── blocked-admin.png
```

---

## 🎬 **Ejemplos de Uso**

### **Ejemplo 1: Validar PR antes de merge**

**En el PR:**
```markdown
## [PR] Refactorizar sistema de auth

Cambios:
- Nuevo hook `useAuthRedirect`
- Mejorar manejo de roles
- Tests actualizados

/test-auth-extensive

Por favor validar que no haya regresiones.
```

**Resultado:**
- ✅ Ejecuta tests extensivos automáticamente
- ✅ Comenta en el PR con resultados
- ✅ Sube screenshots como artifacts

---

### **Ejemplo 2: Testing manual antes de deploy**

**GitHub Actions:**
1. Actions → 🎮 Auth Tests - Manual
2. Run workflow:
   ```
   test_type: both
   apps_to_test: web-app,patients,doctors,companies,admin
   headless: true
   upload_artifacts: true
   ```
3. Esperar resultados (~30 min para ambos)
4. Descargar screenshots si es necesario

---

### **Ejemplo 3: Reportar bug con tests automáticos**

**Crear Issue:**
```markdown
## 🐛 Bug: Doctor no puede acceder a su dashboard

**Pasos para reproducir:**
1. Login como doctor
2. Redirige a página en blanco

**Comportamiento esperado:**
Debería redirigir a `localhost:3002/dashboard`

/test-auth

Ejecutar tests para verificar el problema.
```

**Resultado:**
- ✅ Tests se ejecutan automáticamente
- ✅ Issue recibe comentario con resultados
- ✅ Screenshots ayudan a diagnosticar

---

## 📊 **Status Badges**

Agregar badges al README para mostrar estado de tests:

```markdown
[![Auth Tests](https://github.com/tu-org/autamedica/workflows/Auth%20Tests/badge.svg)](https://github.com/tu-org/autamedica/actions/workflows/auth-tests.yml)
```

---

## 🚨 **Troubleshooting**

### **Tests fallan con "Failed to connect to browser"**

**Causa:** Playwright no está instalado correctamente.

**Solución:** El workflow ya incluye `pnpm exec playwright install chromium --with-deps`

---

### **Tests fallan con "Navigation timeout"**

**Causa:** Servidores no iniciaron a tiempo.

**Solución:** El workflow espera 60 segundos. Si falla, revisar:
```yaml
- name: 🚀 Start dev servers
  run: |
    sleep 60  # ← Aumentar si es necesario
```

---

### **No se suben artifacts**

**Causa:** `upload_artifacts: false` o tests cancelados.

**Solución:** Verificar que:
- `if: always()` esté configurado en step de upload
- Tests completen (no se cancelen manualmente)

---

### **Keywords no activan workflow**

**Causa:** Typo en keyword o workflow deshabilitado.

**Solución:**
- Verificar keywords exactas (case-insensitive)
- Verificar que workflow esté enabled en GitHub Actions

---

## 🎯 **Best Practices**

### **1. Tests en PRs**

✅ **DO:**
- Usar `/test-auth` para PRs pequeños
- Usar `/test-auth-extensive` para PRs críticos
- Esperar resultados antes de merge

❌ **DON'T:**
- Mergear sin tests verdes
- Ejecutar tests extensivos en cada commit

### **2. Tests Manuales**

✅ **DO:**
- Ejecutar antes de deploys importantes
- Usar `headless: true` en CI
- Configurar solo apps necesarias

❌ **DON'T:**
- Ejecutar con `headless: false` en CI
- Incluir todas las apps si no es necesario

### **3. Artifacts**

✅ **DO:**
- Descargar screenshots cuando tests fallan
- Revisar logs completos en caso de error
- Usar screenshots para documentación

❌ **DON'T:**
- Ignorar artifacts cuando hay fallos
- Dejar artifacts sin revisar por semanas

---

## 📚 **Referencias**

- **Tests estándar:** `tests/integration/auth-redirects.browser.test.ts`
- **Tests extensivos:** `tests/integration/auth-extensive.browser.test.ts`
- **Documentación tests:** `tests/integration/EXTENSIVE_TESTS.md`
- **Configuración Vitest:** `vitest.browser.config.ts`
- **Workflow principal:** `.github/workflows/auth-tests.yml`

---

## 🎉 **Resumen Rápido**

| Acción | Comando / Método |
|--------|------------------|
| **Tests automáticos en PR** | Push o `/test-auth` en comentario |
| **Tests extensivos en PR** | `/test-auth-extensive` en comentario |
| **Tests manuales personalizados** | Actions → 🎮 Manual → Run workflow |
| **Ver resultados** | Actions → [Workflow] → [Run] |
| **Descargar screenshots** | Actions → [Run] → Artifacts |
| **Configurar secrets** | Settings → Secrets → Actions |

---

**Creado:** 2025-10-04
**Workflows:** 3 (Automático, Manual, Issue/PR Trigger)
**Estado:** ✅ Production Ready
