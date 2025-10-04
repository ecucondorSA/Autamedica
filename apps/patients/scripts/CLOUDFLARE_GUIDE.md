# Configuración de Cloudflare Pages

Este directorio incluye tooling para centralizar la configuración de Pages entre apps (`auth`, `patients`, ...). Todos los comandos se ejecutan desde la raíz del monorepo.

## Scripts

- `cloudflare-pages-prepare.mjs`
  - Revisa variables de entorno y DNS declaradas en `cloudflare-apps.json`.
  - Muestra los comandos de `wrangler` necesarios para crear el proyecto, cargar secretos y desplegar.
  - Valida las variables declaradas en `.env.production` antes de un deploy.

- `deploy-app.mjs`
  - Orquesta preparación, build y despliegue (`pnpm deploy:<app>`).
  - Ejecuta los pasos en orden y corta con error si falta alguna env var.

## Uso rápido

```bash
# Revisar configuración sin desplegar
node apps/patients/scripts/cloudflare-pages-prepare.mjs --app patients

# Validar que estén todas las env vars (falla si falta alguna)
node apps/patients/scripts/cloudflare-pages-prepare.mjs --app patients --validate

# Build + deploy utilizando los scripts existentes
node apps/patients/scripts/deploy-app.mjs --app patients
```

## Variables de entorno

El script lee estas fuentes (en orden) para detectar valores definidos:

1. `apps/<app>/.env.production`
2. `apps/<app>/.env.example`

Para ponerlas en Cloudflare Pages usá:

```bash
wrangler pages project secret put VAR_NAME --project-name=<project>
```

## DNS sugerido

`cloudflare-apps.json` lista los registros recomendados (CNAME → `pages.cloudflare.com`).

## Ajustes necesarios

- Completá `accountId` en `cloudflare-apps.json` para que el equipo sepa qué cuenta usar.
- Agregá apps nuevas editando `cloudflare-apps.json` y, si es necesario, extendé `deploy-app.mjs` con nuevos comandos.

> Nota: los scripts no invocan la API de Cloudflare, sólo generan checklists y validan que `.env.production` esté listo.
