# 🌐 Configuración de Dominios - AltaMedica (Cloudflare Pages)

Esta guía resume cómo están configurados los dominios productivos y de preview para cada aplicación desplegada en Cloudflare Pages.

## 📋 Resumen de Proyectos Cloudflare Pages

| App | Proyecto Cloudflare | URL Preview | Dominio Productivo |
|-----|---------------------|-------------|--------------------|
| 🌐 **Web-App** | autamedica-web-app | https://autamedica-web-app.pages.dev | https://autamedica.com |
| 👨‍⚕️ **Doctors** | autamedica-doctors | https://autamedica-doctors.pages.dev | https://doctors.autamedica.com |
| 👤 **Patients** | autamedica-patients | https://autamedica-patients.pages.dev | https://patients.autamedica.com |
| 🏢 **Companies** | autamedica-companies | https://autamedica-companies.pages.dev | https://companies.autamedica.com |
| ⚙️ **Admin** | autamedica-admin | https://autamedica-admin.pages.dev | https://admin.autamedica.com |

## 🔧 Configuración en Cloudflare Pages

Para cada proyecto, en **Pages → Settings → Builds & deployments**:

```
Root Directory: apps/<app>
Build Command: pnpm build:cloudflare
Environment Variables:
  NODE_VERSION=20
  PNPM_HOME=/root/.local/share/pnpm
  NEXT_PUBLIC_APP_URL=https://<dominio-productivo>
Include output directory: .open-next/dist
```

## 🌍 DNS con Cloudflare

1. Entra a [Cloudflare Dashboard](https://dash.cloudflare.com/) → `autamedica.com`
2. Crea un registro CNAME por cada subdominio apuntando a `pages.dev`

| Subdominio | Tipo | Valor | TTL | Proxy |
|------------|------|-------|-----|-------|
| `@` | CNAME | `autamedica-web-app.pages.dev` | Auto | Proxied |
| `doctors` | CNAME | `autamedica-doctors.pages.dev` | Auto | Proxied |
| `patients` | CNAME | `autamedica-patients.pages.dev` | Auto | Proxied |
| `companies` | CNAME | `autamedica-companies.pages.dev` | Auto | Proxied |
| `admin` | CNAME | `autamedica-admin.pages.dev` | Auto | Proxied |

> 💡 **Tip:** Activa HTTPS automático y Always Use HTTPS desde el dashboard de Cloudflare.

## ✅ Checklist después del deploy

- [ ] Certificados SSL activos en cada subdominio
- [ ] `NEXT_PUBLIC_APP_URL` configurado en cada proyecto
- [ ] Comprobado redirect `www.autamedica.com → autamedica.com`
- [ ] `robots.txt` y `sitemap.xml` servidos correctamente
- [ ] Monitoreo habilitado en Cloudflare Analytics

## 📎 Recursos rápidos

- Guía principal: [CLOUDFLARE_DEPLOYMENT_GUIDE.md](CLOUDFLARE_DEPLOYMENT_GUIDE.md)
- Validación de seguridad: `pnpm security:check`
- Deploy manual por app: `cd apps/<app> && pnpm deploy:cloudflare`
- Ver logs: `wrangler pages deployments list <proyecto>`

## 🆘 Soporte

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Contacto técnico interno: `infra@autamedica.com`
