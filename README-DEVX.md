# 🚀 DevX Guide - AutaMedica Monorepo

Guía rápida de Developer Experience para el equipo de AutaMedica.

---

## 📦 Monorepo Hardening (Implementado)

### ✅ Mejoras Críticas

1. **Module Resolution Fix** - Doctors app ya no falla en CI
2. **CI Matriz por App** - Un app fallido no bloquea el resto
3. **Pre-push Rápido** - Validación solo de archivos cambiados
4. **Supabase peerDependency** - Sin duplicación de bundle

---

## 🏗️ Arquitectura del Build

### Separación de Concerns

```
packages/           → Librerías compartidas
  ├── types/        → Contratos TypeScript
  ├── shared/       → Utilities
  ├── auth/         → Sistema autenticación
  ├── hooks/        → React hooks
  └── telemedicine/ → WebRTC core

apps/               → Aplicaciones independientes
  ├── web-app/      → Landing + Gateway
  ├── auth/         → Portal autenticación
  ├── doctors/      → Portal médicos
  ├── patients/     → Portal pacientes
  └── companies/    → Portal empresarial
```

### Regla de Oro

**Apps NO dependen de Apps** - Solo de `packages/`

---

## ⚡ Scripts Rápidos

### Build Paralelo por App

```bash
# Build todas las apps (continúa aunque falle una)
pnpm build:all

# TypeCheck todas las apps (no-bail)
pnpm typecheck:all

# Lint todas las apps (no-bail)
pnpm lint:all
```

**Ventaja:** Ver qué apps fallan exactamente sin bloquear el resto.

### Pre-push Incremental

```bash
# Solo valida archivos staged
pnpm prepush

# Internamente ejecuta:
# 1. pnpm lint:changed  → ESLint solo archivos .ts/.tsx/.js/.jsx cambiados
# 2. pnpm typecheck:fast → TypeCheck rápido sin emit
```

**Velocidad:** De 15+ minutos → segundos.

### Bypass Hook (Emergencias)

```bash
# Solo en casos excepcionales (ej. errors pre-existentes no bloqueantes)
HUSKY=0 git push
```

⚠️ **Usar con responsabilidad** - Los hooks existen por algo.

---

## 🔧 CI/CD Workflow

### Nueva Estrategia: Matriz de Apps

**Antes:** Build fallaba si 1 app tenía error → bloqueo total

**Ahora:** Cada app en job independiente con `fail-fast: false`

```yaml
build-apps:
  strategy:
    fail-fast: false
    matrix:
      app: [web-app, auth, doctors, patients, companies, admin]
  steps:
    - name: Build packages
      run: pnpm build:packages
    - name: Build app ${{ matrix.app }}
      run: pnpm --filter "@autamedica/${{ matrix.app }}" build
```

**Resultado:**
- ✅ 5 apps exitosas → Deployment continúa
- ❌ 1 app falla → Se identifica exactamente cuál

### Debug Logging Automático

Cada job de CI incluye:

```bash
📦 Verificando generación de dist/...
✅ packages/hooks/dist/index.js (142B)
✅ packages/telemedicine/dist/index.js (1.1K)
```

**Beneficio:** Identificar problemas de module resolution inmediatamente.

---

## 📚 Supabase peerDependency

### Por Qué

**Antes:** Cada package tenía su propia copia de `@supabase/supabase-js`

**Problema:**
- Bundle duplicado (+300KB)
- Dependency drift (una app en v2.45, otra en v2.57)
- Singleton issues (múltiples instancias de Supabase client)

### Cómo Funciona Ahora

**Packages (`@autamedica/auth`, `@autamedica/telemedicine`):**
```json
{
  "peerDependencies": {
    "@supabase/supabase-js": "^2.51.0"
  },
  "peerDependenciesMeta": {
    "@supabase/supabase-js": { "optional": false }
  }
}
```

**Apps (doctors, auth, patients, companies):**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.0",
    "@autamedica/auth": "workspace:*"
  }
}
```

**Ventaja:**
- ✅ Una sola versión de Supabase por app
- ✅ Apps controlan la versión exacta
- ✅ Packages solo declaran compatibilidad

---

## 🧪 Validación Local

### Antes de Hacer Push

```bash
# 1. Build packages críticos
pnpm build:packages:core

# 2. Build app específica
pnpm --filter @autamedica/doctors build

# 3. Validar TypeScript
pnpm typecheck:fast

# 4. Lint solo lo cambiado
pnpm lint:changed
```

### Test Completo (Opcional)

```bash
# Ejecuta todo el workflow local
tools/build-all.sh build
```

**Output esperado:**
```
📦 App: web-app
   ✅ web-app: SUCCESS

📦 App: doctors
   ✅ doctors: SUCCESS

...

========================================
✅ Todas las apps completaron 'build' exitosamente
```

---

## 🔍 Troubleshooting

### Error: "Can't resolve '@autamedica/hooks'"

**Causa:** Package no construido antes del app build.

**Fix:**
```bash
pnpm --filter @autamedica/hooks clean
pnpm --filter @autamedica/hooks build
pnpm --filter @autamedica/doctors build
```

### Error: "Reached heap limit Allocation failed"

**Causa:** ESLint ejecutándose en todo el codebase.

**Fix Temporal:**
```bash
HUSKY=0 git push
```

**Fix Permanente:** El `lint:changed` ya está implementado, pero requiere ajuste si detecta 0 archivos.

### Build OK local, falla en CI

**Verificar:**

1. **Turbo cache:** A veces causa drift
   ```bash
   rm -rf .turbo node_modules/.cache
   pnpm install
   pnpm build
   ```

2. **Node version:** CI usa Node 22, verificar local
   ```bash
   node --version  # Debe ser 20.x o 22.x
   ```

3. **Logs de CI:** Buscar el debug logging de dist/
   ```
   📦 Verificando generación de dist/...
   ```

---

## 🎯 Checklist Pre-Deployment

- [ ] `pnpm build:packages` exitoso
- [ ] `pnpm build:all` sin errores críticos (warnings ok)
- [ ] `pnpm typecheck:fast` sin errores
- [ ] `pnpm docs:validate` contratos OK
- [ ] Tests unitarios pasan (si aplica)

---

## 📖 Referencias

- **Estructura Monorepo:** `CLAUDE.md`
- **Contratos TypeScript:** `docs/GLOSARIO_MAESTRO.md`
- **Deployment Guide:** `docs/SECURE_DEPLOYMENT_GUIDE.md`
- **Programming Methodology:** `docs/PROGRAMMING_METHODOLOGY.md`

---

## 🆘 Comandos de Emergencia

```bash
# Limpieza completa
rm -rf node_modules .turbo .next dist packages/*/dist apps/*/.next
pnpm install
pnpm build:packages
pnpm build:apps

# Revert pre-push hook (temporal)
echo '#!/bin/sh' > .husky/pre-push
chmod +x .husky/pre-push

# Ver qué está staged
git diff --name-only --cached

# Ver logs CI en tiempo real
gh run watch
```

---

**Última actualización:** Octubre 2025 - Monorepo Hardening v2
**Mantenedor:** Claude Code + Equipo AutaMedica

🚀 Happy coding!
