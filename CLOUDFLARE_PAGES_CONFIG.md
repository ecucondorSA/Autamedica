# Cloudflare Pages Configuration

## Build Configuration for autamedica-web-app

**IMPORTANTE:** Configurar en Cloudflare Pages Dashboard:
https://dash.cloudflare.com/[account-id]/pages/view/autamedica-web-app/settings/builds

### Build Settings

```
Framework preset: Next.js
Build command: cd apps/web-app && pnpm build:cloudflare
Build output directory: apps/web-app/out
Root directory: (leave empty - monorepo root)
```

### Environment Variables

**Production:**
```
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://autamedica.com
SKIP_ENV_VALIDATION=true
NODE_ENV=production
```

### Build Command Explained

`cd apps/web-app && pnpm build:cloudflare`

Ejecuta internamente:
1. `cd ../.. && pnpm build:packages:core` - Build solo packages core (types, shared, auth, hooks, tailwind-config)
2. `pnpm turbo run build --filter=@autamedica/web-app --no-deps` - Build web-app sin dependencias hermanas

### Importante

- ✅ **NO** incluye `[build]` en wrangler.toml (no soportado por Pages)
- ✅ Build command aislado evita errores en otras apps
- ✅ Flag `--no-deps` previene build de apps no relacionadas
- ✅ Solo buildea lo necesario para web-app

### Verificar Deployment

```bash
# Ver deployments
wrangler pages deployment list --project-name=autamedica-web-app

# Ver logs en tiempo real
wrangler pages deployment tail --project-name=autamedica-web-app
```
