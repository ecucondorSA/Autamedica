# Manual Testing - Autenticación y Redirección

## 🎯 Propósito

Este directorio contiene scripts manuales para probar el flujo de autenticación y redirección sin necesidad de frameworks complejos como Playwright.

## 🚀 Uso Rápido

### Método 1: Ejecutar desde DevTools Console

1. **Abrir Chrome DevTools**
   - Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux)
   - Presiona `Cmd+Option+I` (Mac)

2. **Ir a la pestaña Console**

3. **Cargar el script**
   ```javascript
   // Copiar y pegar el contenido completo de test-auth-redirects.js
   // O usar este atajo:
   const script = document.createElement('script');
   script.src = 'http://localhost:3000/tests/manual/test-auth-redirects.js';
   document.head.appendChild(script);
   ```

4. **Ejecutar tests**
   ```javascript
   // Ver ayuda
   showHelp()

   // Ejecutar todos los tests
   testAllRedirects()

   // O ejecutar tests individuales
   testPatientRedirect()
   testDoctorRedirect()
   testCompanyRedirect()
   testAdminRedirect()
   ```

### Método 2: Bookmarklet (Más rápido)

1. **Crear un nuevo bookmark** en tu navegador

2. **Nombre**: `AutaMedica Test Auth`

3. **URL**: Pegar este código
   ```javascript
   javascript:(function(){const script=document.createElement('script');script.src='http://localhost:3000/tests/manual/test-auth-redirects.js';document.head.appendChild(script);})();
   ```

4. **Uso**: Click en el bookmark desde cualquier página de AutaMedica para cargar el testing script

---

## 📋 Comandos Disponibles

### Tests de Redirección

```javascript
// Ejecutar suite completa
testAllRedirects()

// Tests individuales por rol
testPatientRedirect()    // Test redirect de paciente
testDoctorRedirect()     // Test redirect de doctor
testCompanyRedirect()    // Test redirect de empresa
testAdminRedirect()      // Test redirect de admin
```

### Tests de Middleware

```javascript
// Verificar que el middleware bloquea accesos no autorizados
testMiddlewareProtection()
```

### Tests de Navegación

```javascript
// Test de preservación del parámetro returnUrl
testReturnUrl()

// Test de selección de rol para nuevos usuarios
testRoleSelection()
```

### Utilidades

```javascript
// Ver ayuda completa
showHelp()

// Limpiar datos de tests (logout, localStorage, etc.)
cleanupTests()
```

---

## 🧪 Escenarios de Prueba

### Escenario 1: Login Normal de Paciente

**Objetivo:** Verificar que un paciente se redirige correctamente a `localhost:3003`

```javascript
// 1. Navegar a login
window.location.href = 'http://localhost:3000/auth/login'

// 2. Ejecutar test
testPatientRedirect()

// 3. Completar login manualmente con:
//    Email: patient@dev.local
//    Password: password123

// 4. El script detectará automáticamente la redirección
```

**Resultado esperado:**
```
✅ ¡Redirección exitosa! Usuario patient redirigido a http://localhost:3003
📍 URL actual: http://localhost:3003/
```

---

### Escenario 2: Login de Doctor

**Objetivo:** Verificar que un doctor se redirige a `localhost:3002`

```javascript
testDoctorRedirect()

// Completar login con:
// Email: doctor@dev.local
// Password: password123
```

**Resultado esperado:**
```
✅ ¡Redirección exitosa! Usuario doctor redirigido a http://localhost:3002
```

---

### Escenario 3: Middleware Bloquea Acceso No Autorizado

**Objetivo:** Verificar que un paciente no puede acceder al portal de doctores

**Pasos:**
1. Login como paciente
   ```javascript
   testPatientRedirect()
   // Completar login como patient@dev.local
   ```

2. Una vez redirigido a patients (localhost:3003), intentar acceder a doctors
   ```javascript
   window.location.href = 'http://localhost:3002/dashboard'
   ```

3. **Resultado esperado:** Deberías ser redirigido automáticamente de vuelta a `localhost:3003`

---

### Escenario 4: Preservación de returnUrl

**Objetivo:** Verificar que después del login, el usuario es redirigido a la URL solicitada

```javascript
testReturnUrl()
```

**Pasos manuales:**
1. El script te redirigirá a login con un `returnUrl` en la query string
2. Completa el login como paciente
3. Deberías ser redirigido a `http://localhost:3003/profile` (no a `/dashboard`)

**Resultado esperado:**
```
URL final: http://localhost:3003/profile
```

---

### Escenario 5: Selección de Rol (Nuevo Usuario)

**Objetivo:** Verificar que usuarios sin rol asignado pueden seleccionar su rol

```javascript
testRoleSelection()
```

**Pasos manuales:**
1. Ir a `/auth/register`
2. Registrar un nuevo usuario
3. Deberías ver la pantalla de selección de rol
4. Seleccionar "Patient"
5. Deberías ser redirigido a `localhost:3003`

---

## 📊 Resultados Esperados

Cuando ejecutas `testAllRedirects()`, deberías ver algo como:

```
============================================================
🚀 EJECUTANDO SUITE COMPLETA DE TESTS DE REDIRECCIÓN
============================================================

────────────────────────────────────────────────────────────
🧪 Iniciando test de redirección para: PATIENT
📧 Email: patient@dev.local
🎯 Destino esperado: http://localhost:3003
✅ ¡Redirección exitosa!

────────────────────────────────────────────────────────────
🧪 Iniciando test de redirección para: DOCTOR
📧 Email: doctor@dev.local
🎯 Destino esperado: http://localhost:3002
✅ ¡Redirección exitosa!

────────────────────────────────────────────────────────────
🧪 Iniciando test de redirección para: COMPANY
📧 Email: company@dev.local
🎯 Destino esperado: http://localhost:3004
✅ ¡Redirección exitosa!

────────────────────────────────────────────────────────────
🧪 Iniciando test de redirección para: ADMIN
📧 Email: admin@dev.local
🎯 Destino esperado: http://localhost:3005
✅ ¡Redirección exitosa!

============================================================
📊 RESUMEN DE RESULTADOS
============================================================

✅ PATIENT: PASSED
✅ DOCTOR: PASSED
✅ COMPANY: PASSED
✅ ADMIN: PASSED

📈 Total: 4/4 tests passed
```

---

## 🔐 Credenciales de Test

| Rol | Email | Password | Destino Esperado |
|-----|-------|----------|------------------|
| **Patient** | `patient@dev.local` | `password123` | `localhost:3003` |
| **Doctor** | `doctor@dev.local` | `password123` | `localhost:3002` |
| **Company** | `company@dev.local` | `password123` | `localhost:3004` |
| **Admin** | `admin@dev.local` | `password123` | `localhost:3005` |

---

## 🐛 Troubleshooting

### El script no se carga

**Problema:** "script.src is not defined"

**Solución:**
```javascript
// Método alternativo: Copiar y pegar el código completo
// 1. Abrir test-auth-redirects.js
// 2. Copiar TODO el contenido
// 3. Pegar en DevTools Console
// 4. Presionar Enter
```

---

### Los usuarios de test no existen

**Problema:** "Invalid login credentials"

**Solución:**
```bash
# Crear usuarios de test en Supabase (ejecutar desde terminal)
# O usar usuarios reales que ya existen en la base de datos
```

**Opción rápida:**
Modifica el script con usuarios que SÍ existen en tu base de datos:
```javascript
const TEST_USERS = {
  patient: {
    email: 'tu_paciente_real@example.com',  // ← Cambiar aquí
    password: 'tu_password_real',           // ← Cambiar aquí
    expectedApp: URLS.patients,
    role: 'patient'
  },
  // ... resto de usuarios
}
```

---

### La redirección no se detecta

**Problema:** "Timeout: No se detectó redirección después de 30 segundos"

**Posibles causas:**
1. **No completaste el login:** Asegúrate de ingresar email y password y hacer click en "Sign in"
2. **Error en el login:** Verifica que las credenciales sean correctas
3. **Middleware no configurado:** Revisa que el middleware esté activo en la app

**Debug:**
```javascript
// Ver estado actual de autenticación
const supabase = window.supabase || window.__supabase
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    console.log('Sesión actual:', data)
  })
}
```

---

### Redirección incorrecta

**Problema:** El usuario es redirigido, pero a la app incorrecta

**Debug:**
```javascript
// 1. Verificar el rol en user_metadata
const supabase = window.supabase || window.__supabase
supabase.auth.getUser().then(({ data }) => {
  console.log('User metadata:', data.user.user_metadata)
  console.log('Rol asignado:', data.user.user_metadata?.role)
})

// 2. Verificar el mapeo de roles en el middleware
// Ver packages/auth/src/types.ts línea 79
console.log('ROLE_APP_MAPPING:', {
  patient: 'patients',
  doctor: 'doctors',
  company: 'companies',
  company_admin: 'companies',
  organization_admin: 'admin',
  admin: 'admin',
  platform_admin: 'admin'
})
```

---

## 📚 Referencias

- **Flujo de autenticación:** Ver `/tmp/auth-redirect-testing-strategy-2025.md`
- **Middleware:** `packages/auth/src/middleware/auth.ts`
- **Redirect utils:** `packages/auth/src/utils/redirect.ts`
- **Callback handler:** `apps/auth/src/app/auth/callback/route.ts`

---

## 🎬 Video Tutorial

### Grabación de pantalla recomendada:

1. **Preparación** (5 seg)
   - Abrir `http://localhost:3000/auth/login`
   - Abrir DevTools (F12)
   - Ir a pestaña Console

2. **Cargar script** (10 seg)
   - Copiar contenido de `test-auth-redirects.js`
   - Pegar en Console
   - Presionar Enter

3. **Ejecutar test** (30 seg)
   - Ejecutar `testPatientRedirect()`
   - Completar login con credenciales de test
   - Observar la redirección automática
   - Ver logs de éxito en console

4. **Cleanup** (5 seg)
   - Ejecutar `cleanupTests()`
   - Recargar la página

---

## ✅ Checklist de Testing

Antes de dar por completo el testing, verifica que:

- [ ] Patient redirects to `localhost:3003`
- [ ] Doctor redirects to `localhost:3002`
- [ ] Company redirects to `localhost:3004`
- [ ] Admin redirects to `localhost:3005`
- [ ] Middleware blocks unauthorized access
- [ ] ReturnUrl is preserved after login
- [ ] New users can select their role
- [ ] Invalid roles default to patient
- [ ] Logout clears session correctly

---

**¿Dudas?** Consulta el documento completo de estrategia en `/tmp/auth-redirect-testing-strategy-2025.md`
