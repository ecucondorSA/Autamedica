# Integration Tests - Vitest Browser Mode

Tests automatizados para el flujo de autenticación y redirección usando Vitest Browser Mode + Playwright.

## 📚 **Documentación Disponible**

- **🚀 [Quick Start](#-quick-start)** - Cómo ejecutar tests localmente
- **📋 [Tests Implementados](#-tests-implementados)** - Lista de tests estándar
- **🔬 [Tests Extensivos](./EXTENSIVE_TESTS.md)** - Tests largos con validación exhaustiva
- **🎯 [GitHub Actions](./GITHUB_ACTIONS.md)** - Ejecutar tests en CI/CD, PRs e Issues

---

## 🚀 Quick Start

### Prerequisitos

1. **Servidores en ejecución:**
   ```bash
   # Terminal 1: Auth app
   cd apps/auth && pnpm dev

   # Terminal 2: Patients app
   cd apps/patients && pnpm dev

   # Terminal 3: Doctors app (opcional, para tests completos)
   cd apps/doctors && pnpm dev
   ```

2. **Usuarios de test en la base de datos:**
   - `patient@dev.local` / `password123`
   - `doctor@dev.local` / `password123`
   - `company@dev.local` / `password123`
   - `admin@dev.local` / `password123`

### Ejecutar Tests

```bash
# Ejecutar todos los tests (headless)
pnpm test:auth

# Ejecutar con navegador visible (debugging)
pnpm test:auth:browser

# Watch mode (re-ejecuta en cambios)
pnpm test:auth:watch

# Modo debug interactivo
pnpm test:auth:debug

# CI/CD mode (headless, sin UI)
pnpm test:auth:ci
```

---

## 📋 Tests Implementados

### ✅ Role-Based Redirects

| Test | Descripción | Timeout |
|------|-------------|---------|
| `patient logs in and redirects to patients app` | Verifica redirect a `localhost:3003` | 30s |
| `doctor logs in and redirects to doctors app` | Verifica redirect a `localhost:3002` | 30s |
| `company user logs in and redirects to companies app` | Verifica redirect a `localhost:3004` | 30s |
| `admin logs in and redirects to admin app` | Verifica redirect a `localhost:3005` | 30s |

### 🛡️ Middleware Protection

| Test | Descripción | Timeout |
|------|-------------|---------|
| `patient cannot access doctors app` | Middleware redirige paciente fuera de doctors | 30s |
| `doctor cannot access patients app` | Middleware redirige doctor fuera de patients | 30s |

### 🔗 ReturnUrl Preservation

| Test | Descripción | Timeout |
|------|-------------|---------|
| `user is redirected to returnUrl after login` | Preserva `returnUrl` query param | 30s |
| `invalid returnUrl is ignored` | Rechaza URLs externas maliciosas | 30s |

### 🔒 Session Management

| Test | Descripción | Timeout |
|------|-------------|---------|
| `logged out user redirected to login` | Rutas protegidas requieren auth | 15s |
| `session persists across reloads` | Session no se pierde al recargar | 30s |

### ❌ Error Handling

| Test | Descripción | Timeout |
|------|-------------|---------|
| `invalid credentials show error` | Muestra error con credenciales incorrectas | 15s |
| `missing email shows validation` | Valida campos requeridos | 15s |

---

## 🎬 Ejemplo de Ejecución

```bash
$ pnpm test:auth:browser

 ✓ tests/integration/auth-redirects.browser.test.ts (8) 67.42s
   ✓ Authentication Flow - Role-Based Redirects (4) 48.21s
     ✓ patient logs in and redirects to patients app 12.34s
     ✓ doctor logs in and redirects to doctors app 11.87s
     ✓ company user logs in and redirects to companies app 12.01s
     ✓ admin logs in and redirects to admin app 11.99s
   ✓ Middleware Protection (2) 19.21s
     ✓ patient cannot access doctors app 9.45s
     ✓ doctor cannot access patients app 9.76s

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  16:45:23
   Duration  68.12s (transform 0ms, setup 1ms, collect 234ms, tests 67.42s)
```

---

## 🛠️ Configuración

### Variables de Entorno (Opcional)

Crea un archivo `.env.test` en la raíz:

```bash
# URLs (por defecto usa localhost)
AUTH_URL=http://localhost:3000
PATIENTS_URL=http://localhost:3003
DOCTORS_URL=http://localhost:3002
COMPANIES_URL=http://localhost:3004
ADMIN_URL=http://localhost:3005

# Credenciales de test (por defecto usa @dev.local)
TEST_PATIENT_EMAIL=patient@dev.local
TEST_PATIENT_PASSWORD=password123

TEST_DOCTOR_EMAIL=doctor@dev.local
TEST_DOCTOR_PASSWORD=password123

TEST_COMPANY_EMAIL=company@dev.local
TEST_COMPANY_PASSWORD=password123

TEST_ADMIN_EMAIL=admin@dev.local
TEST_ADMIN_PASSWORD=password123
```

### Configuración de Vitest

El archivo `vitest.browser.config.ts` controla:

- **Browser provider**: Playwright (Chromium)
- **Headless mode**: `false` por defecto (visible para debugging)
- **Timeout**: 30 segundos por test
- **Screenshots**: Captura automática en fallos

---

## 🐛 Troubleshooting

### Los tests fallan con "Navigation timeout"

**Causa:** Los servidores no están corriendo o las apps tardan en cargar.

**Solución:**
```bash
# Verificar que los servidores estén corriendo
lsof -i :3000  # Auth
lsof -i :3003  # Patients
lsof -i :3002  # Doctors

# Iniciar servidores faltantes
pnpm dev  # En la raíz (inicia todos)
```

---

### Los tests fallan con "Invalid credentials"

**Causa:** Los usuarios de test no existen en la base de datos.

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor o psql
-- Crear usuarios de test (ajustar según tu schema)

INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('patient@dev.local', crypt('password123', gen_salt('bf')), NOW(), '{"role": "patient"}'::jsonb),
  ('doctor@dev.local', crypt('password123', gen_salt('bf')), NOW(), '{"role": "doctor"}'::jsonb);
```

O usa usuarios que ya existen en tu base de datos y actualiza `setup.ts`.

---

### El navegador no se abre (headless mode)

**Causa:** Playwright está en modo headless.

**Solución:**
```bash
# Usar el script específico para modo visual
pnpm test:auth:browser

# O modificar vitest.browser.config.ts:
# headless: false
```

---

### Error "page is not defined"

**Causa:** Vitest Browser Mode no está configurado correctamente.

**Solución:**
```bash
# Reinstalar dependencias
pnpm install -D @vitest/browser playwright

# Verificar imports en el test
# Debe ser: import { page } from '@vitest/browser/context'
```

---

## 📊 CI/CD Integration

### GitHub Actions

```yaml
name: Auth Tests

on: [push, pull_request]

jobs:
  test-auth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium

      - name: Start dev servers
        run: |
          pnpm dev &
          sleep 30  # Esperar que los servidores inicien

      - name: Run auth tests
        run: pnpm test:auth:ci

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-results/
```

---

## 🎯 Próximos Tests a Implementar

- [ ] Role selection para nuevos usuarios
- [ ] OAuth login (Google, GitHub)
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] MFA (Multi-Factor Authentication)
- [ ] Session expiration handling
- [ ] Cross-app navigation
- [ ] Deep linking preservation

---

## 📚 Referencias

- [Vitest Browser Mode Docs](https://vitest.dev/guide/browser/)
- [Playwright API](https://playwright.dev/docs/api/class-page)
- [Testing Library](https://testing-library.com/)
- [Estrategia de Testing 2025](/tmp/auth-redirect-testing-strategy-2025.md)

---

## ✅ Checklist Pre-Test

Antes de ejecutar los tests, verifica:

- [ ] Servidores dev corriendo (auth, patients, doctors, etc.)
- [ ] Base de datos con usuarios de test
- [ ] Variables de entorno configuradas (si usas custom)
- [ ] Playwright browsers instalados (`pnpm exec playwright install`)
- [ ] Puerto 3000-3005 disponibles (no usados por otros procesos)

---

**¿Problemas?** Consulta la estrategia completa en `/tmp/auth-redirect-testing-strategy-2025.md` o el manual testing en `tests/manual/README.md`
