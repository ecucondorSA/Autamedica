# 🎯 Configuración Final Cloudflare Pages - Next.js Monorepo

**Fecha:** 2025-09-30 22:05:00
**Framework:** Next.js 15.5.4
**Monorepo:** Turborepo

---

## 📊 Resumen: 2 Opciones Oficiales

Según [documentación oficial de Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/):

| Opción | Adapter | Build Output | Configuración |
|--------|---------|--------------|---------------|
| **A: Full Next.js** | `@cloudflare/next-on-pages` | `.vercel/output/static` | ✅ RECOMENDADO |
| **B: Static Export** | ninguno | `out` | ⚠️ Solo SSG, sin API routes |

---

## ✅ OPCIÓN A: Full Next.js (RECOMENDADO)

### Características
- ✅ Soporte completo Next.js (SSR, ISR, API routes)
- ✅ Middleware support
- ✅ Edge runtime optimizado
- ✅ Adapter oficial Cloudflare

### 1. Instalar Adapter Oficial

```bash
cd apps/web-app
pnpm add -D @cloudflare/next-on-pages
pnpm remove @opennextjs/cloudflare
```

### 2. Actualizar package.json

```json
{
  "scripts": {
    "build": "next build",
    "build:cloudflare": "cd ../.. && pnpm build:packages:core && cd apps/web-app && npx @cloudflare/next-on-pages@1",
    "deploy:cloudflare": "pnpm build:cloudflare && wrangler pages deploy .vercel/output/static --project-name=autamedica-web-app"
  }
}
```

### 3. Actualizar wrangler.toml

```toml
name = "autamedica-web-app"
compatibility_date = "2024-01-01"

# Cloudflare Pages con next-on-pages
pages_build_output_dir = ".vercel/output/static"

[pages]
compatibility_date = "2024-01-01"
```

### 4. Configurar en Cloudflare Dashboard

```yaml
Framework preset: Next.js
Build command: cd apps/web-app && pnpm install && pnpm run build:cloudflare
Build output directory: apps/web-app/.vercel/output/static
Root directory: (empty)
Branch: main
```

### 5. Environment Variables (Ya configuradas ✅)

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Opcionales:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_NODE_ENV=production`

---

## ⚠️ OPCIÓN B: Static Export (Más Simple, Limitado)

### Características
- ✅ Más rápido de configurar
- ❌ NO soporta API routes
- ❌ NO soporta SSR/ISR
- ✅ Solo páginas estáticas

### 1. Actualizar next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← Habilitar static export
  images: {
    unoptimized: true, // ← Requerido para static export
  },
};

export default nextConfig;
```

### 2. Actualizar package.json

```json
{
  "scripts": {
    "build:cloudflare": "cd ../.. && pnpm build:packages:core && cd apps/web-app && pnpm build"
  }
}
```

### 3. Actualizar wrangler.toml

```toml
name = "autamedica-web-app"
pages_build_output_dir = "out"
```

### 4. Configurar en Dashboard

```yaml
Framework preset: Next.js (Static HTML Export)
Build command: cd apps/web-app && pnpm install && pnpm run build:cloudflare
Build output directory: apps/web-app/out
```

---

## 🎯 Recomendación: OPCIÓN A

**Razones:**

1. ✅ **Sistema de autenticación** - Necesitas middleware para auth
2. ✅ **API routes** - `/auth/callback` requiere server-side processing
3. ✅ **Future-proof** - Más flexibilidad para futuras features
4. ✅ **Adapter oficial** - `@cloudflare/next-on-pages` es mantenido por Cloudflare

---

## 📋 Pasos para Aplicar OPCIÓN A

### Paso 1: Actualizar Dependencias

```bash
cd /root/altamedica-reboot-fresh/apps/web-app

# Remover adapter antiguo
pnpm remove @opennextjs/cloudflare

# Instalar adapter oficial
pnpm add -D @cloudflare/next-on-pages
```

### Paso 2: Actualizar Archivos

#### apps/web-app/package.json
```json
{
  "scripts": {
    "build:cloudflare": "cd ../.. && pnpm build:packages:core && cd apps/web-app && npx @cloudflare/next-on-pages@1"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.13.16"
  }
}
```

#### apps/web-app/wrangler.toml
```toml
name = "autamedica-web-app"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[pages]
compatibility_date = "2024-01-01"
```

### Paso 3: Commit y Push

```bash
git add .
git commit -m "feat(cloudflare): usar adapter oficial @cloudflare/next-on-pages

- Cambiar de @opennextjs/cloudflare a @cloudflare/next-on-pages
- Actualizar build output a .vercel/output/static
- Seguir documentación oficial de Cloudflare Pages"

git push origin main
```

### Paso 4: Configurar Dashboard

En `dash.cloudflare.com`:

```
1. Workers & Pages → autamedica-web-app
2. Settings → Builds & deployments → Build configuration
3. Edit:
   - Framework: Next.js
   - Build command: cd apps/web-app && pnpm install && pnpm run build:cloudflare
   - Build output: apps/web-app/.vercel/output/static
4. Save
5. Deployments → Retry deployment
```

---

## 🚀 Build Esperado

### Con @cloudflare/next-on-pages

```bash
✅ Installing dependencies
✅ Building packages core (cached)
✅ Running: npx @cloudflare/next-on-pages@1
   ▲ @cloudflare/next-on-pages CLI v1.13.16
   ⚙ Preparing project...
   ⚙ Building Next.js app...
   ✓ Next.js build completed
   ⚙ Generating Pages Functions...
   ✓ Pages Functions generated
   ⚙ Compiling...
   ✓ Compilation complete
   ⚙ Generating output...
   ✓ Output generated at .vercel/output/static
✅ Deploying to Cloudflare edge
✅ Success! https://autamedica-web-app.pages.dev
```

---

## 🔍 Monorepo Configuration

### Build Watch Paths (Opcional - Optimización)

Para evitar builds innecesarios cuando cambian otros apps:

En Cloudflare Dashboard:
```
Settings → Builds & deployments → Build watch paths

Include:
  apps/web-app/**
  packages/types/**
  packages/shared/**
  packages/auth/**
  packages/hooks/**
  packages/tailwind-config/**

Exclude:
  apps/doctors/**
  apps/patients/**
  apps/companies/**
  apps/admin/**
```

---

## 📚 Variables de Entorno del Sistema

Cloudflare inyecta automáticamente:

| Variable | Valor | Uso |
|----------|-------|-----|
| `CI` | `true` | Detectar CI environment |
| `CF_PAGES` | `1` | Detectar Cloudflare Pages |
| `CF_PAGES_COMMIT_SHA` | `<hash>` | Commit actual |
| `CF_PAGES_BRANCH` | `main` | Branch actual |
| `CF_PAGES_URL` | `https://...pages.dev` | URL del deployment |

---

## 🐛 Troubleshooting

### Error: "Could not find a production build in .vercel/output"

**Causa:** Build de Next.js falló antes de @cloudflare/next-on-pages
**Solución:**
```bash
# Probar build localmente
cd apps/web-app
pnpm build  # Debe completar exitosamente primero
npx @cloudflare/next-on-pages@1
```

### Error: "Module not found: @autamedica/tailwind-config"

**Causa:** Packages no compilados
**Solución:** Asegurar que `build:packages:core` esté en el build command

### Error: "Worker size exceeded"

**Causa:** Bundle muy grande para Worker
**Solución:**
```javascript
// next.config.mjs
export default {
  experimental: {
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
};
```

---

## 📊 Comparación Final

| Aspecto | @cloudflare/next-on-pages | @opennextjs/cloudflare | Static Export |
|---------|---------------------------|------------------------|---------------|
| Oficial | ✅ Cloudflare | ⚠️ Community | ✅ Next.js nativo |
| SSR/ISR | ✅ | ✅ | ❌ |
| API Routes | ✅ | ✅ | ❌ |
| Middleware | ✅ | ✅ | ❌ |
| Complejidad | 🟢 Media | 🟡 Alta | 🟢 Baja |
| Mantenimiento | 🟢 Activo | 🟡 Community | 🟢 Next.js |
| **Recomendación** | ✅ **MEJOR** | ⚠️ No recomendado | ⚠️ Solo SSG |

---

## 🎯 Próximos Pasos INMEDIATOS

1. ✅ Push commit actual (wrangler.toml ya corregido)
2. ⏳ Cambiar a `@cloudflare/next-on-pages` (Paso 1-3 arriba)
3. ⏳ Configurar dashboard con nueva configuración
4. ⏳ Verificar deployment exitoso

---

**Última actualización:** 2025-09-30 22:05:00
**Estado:** Commit `0b8be14` listo para push
**Acción recomendada:** Aplicar OPCIÓN A (adapter oficial)
