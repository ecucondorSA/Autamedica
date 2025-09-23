# 🚀 Guía de Deploy - AltaMedica (Cloudflare Pages)

Esta guía documenta el proceso completo para desplegar el monorepo en Cloudflare Pages utilizando OpenNext.

## 📦 Preparación

1. Instalar dependencias globales:
   ```bash
   pnpm install
   pnpm dlx wrangler --version
   ```
2. Autenticarse en Cloudflare:
   ```bash
   wrangler login
   ```
3. Verificar que cada app tenga scripts `build:cloudflare` y `deploy:cloudflare` (ya incluidos en los `package.json`).

## 🏗️ Build local

Para probar la build de cualquier app:
```bash
cd apps/<app>
pnpm build:cloudflare
```
La salida se genera en `.open-next/dist` usando `@opennextjs/cloudflare`.

## 🌐 Deploy manual (Wrangler CLI)

```bash
cd apps/<app>
pnpm deploy:cloudflare
```
Esto ejecuta el build y publica en Cloudflare Pages utilizando el nombre de proyecto configurado (`autamedica-<app>`).

## ⚙️ Variables de entorno

Configurar desde Cloudflare Dashboard → Pages → Project → Settings → Environment variables.

Variables comunes:
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://autamedica.com
NEXT_PUBLIC_APP_URL=https://autamedica.com
NEXT_PUBLIC_API_URL=https://api.autamedica.com
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>
JWT_SECRET=<64c-secret>
JWT_REFRESH_SECRET=<64c-secret>
ENCRYPTION_KEY=<64c-secret>
SESSION_SECRET=<64c-secret>
```

Variables específicas por app:
| App | `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_APP_URL` |
|-----|-----------------------|-----------------------|
| web-app | https://autamedica.com | https://autamedica.com |
| doctors | https://doctors.autamedica.com | https://doctors.autamedica.com |
| patients | https://patients.autamedica.com | https://patients.autamedica.com |
| companies | https://companies.autamedica.com | https://companies.autamedica.com |
| admin | https://admin.autamedica.com | https://admin.autamedica.com |

Agregar también los callbacks OAuth necesarios (ver `scripts/setup-supabase-urls.sh`).

## 📄 Configuración de proyectos

| Proyecto | Build Command | Output Directory |
|----------|---------------|------------------|
| autamedica-web-app | `pnpm build:cloudflare` | `.open-next/dist` |
| autamedica-doctors | `pnpm build:cloudflare` | `.open-next/dist` |
| autamedica-patients | `pnpm build:cloudflare` | `.open-next/dist` |
| autamedica-companies | `pnpm build:cloudflare` | `.open-next/dist` |
| autamedica-admin | `pnpm build:cloudflare` | `.open-next/dist` |

## 🔁 Deploy Automático (CI)

Integrar con GitHub Actions (pendiente) o lanzar manualmente desde CLI. Se recomienda:
1. Validar: `pnpm check:all`
2. Deploy app por app o `pnpm deploy:all`

## 📊 Post-deploy Checklist

- [ ] Certificados SSL activos
- [ ] URLs de Supabase actualizadas (`scripts/setup-supabase-urls.sh`)
- [ ] Variables de entorno OK en cada proyecto
- [ ] Health check (`pnpm health`)
- [ ] Monitoreo habilitado en Cloudflare Dashboard

## 🆘 Troubleshooting

- Revisar logs: `wrangler pages deployments list <proyecto>`
- Reconstruir local: `pnpm build:cloudflare`
- Reconfigurar DNS si el dominio no apunta a Cloudflare (ver `DOMAIN_CONFIGURATION.md`)

## 📚 Recursos

- [CLOUDFLARE_DEPLOYMENT_GUIDE.md](CLOUDFLARE_DEPLOYMENT_GUIDE.md)
- OpenNext + Cloudflare: https://opennext.js.org/cloudflare
- Wrangler CLI docs: https://developers.cloudflare.com/workers/wrangler/
