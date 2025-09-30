# ⚠️ CONFIGURACIÓN REQUERIDA EN CLOUDFLARE DASHBOARD

## Problema Actual

El build command en Cloudflare Pages está usando un comando viejo:
```bash
cd ../.. && pnpm build:packages && pnpm build --filter ./apps/web-app
```

Este comando dispara el build de **TODAS** las apps (incluyendo patients, doctors, companies) 
porque Turborepo tiene `dependsOn: ["^build"]` en turbo.json.

## ✅ Solución: Actualizar en Dashboard

Ve a: `dash.cloudflare.com` → Workers & Pages → `autamedica-web-app` → Settings → Builds & deployments

**Build configuration correcta:**

```yaml
Framework preset: Next.js
Build command: cd apps/web-app && pnpm install && pnpm run build:cloudflare
Build output directory: apps/web-app/.vercel/output/static
Root directory: (vacío)
Node version: 20
```

## Explicación

El script `build:cloudflare` en `apps/web-app/package.json` hace:

```json
{
  "build:cloudflare": "cd ../.. && pnpm build:packages:core && cd apps/web-app && npx @cloudflare/next-on-pages@1"
}
```

Esto:
1. ✅ Buildea SOLO los packages core necesarios (types, shared, auth, hooks, tailwind-config, telemedicine, ui, utils)
2. ✅ NO buildea otras apps (patients, doctors, companies, admin)
3. ✅ Ejecuta el adaptador oficial de Cloudflare
4. ✅ Genera output en `.vercel/output/static`

## Variables de entorno (ya configuradas ✅)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Sobre "vercel build"

El mensaje `⚡️ The Vercel build (pnpm dlx vercel build) command failed` es NORMAL.
Es parte del proceso interno de `@cloudflare/next-on-pages` - el adaptador 
usa el build engine de Vercel para luego adaptarlo a Cloudflare Workers.

## Build Watch Paths (opcional - optimización)

Para evitar builds innecesarios:

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

**Actualizado:** 2025-09-30 23:10:00
