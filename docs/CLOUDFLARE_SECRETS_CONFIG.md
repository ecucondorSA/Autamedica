# 🔐 Configuración de Secrets Cloudflare

Los siguientes secrets han sido configurados en GitHub para activar los deployments automáticos:

## ✅ Secrets Configurados

- **CLOUDFLARE_API_TOKEN**: OAuth token con permisos para Pages
- **CLOUDFLARE_ACCOUNT_ID**: `5737682cdee596a0781f795116a3120b`  
- **PAGES_PROJECTS**: Lista de proyectos para deployment automático

## 🎯 Permisos del Token

El token incluye estos scopes necesarios:
- `pages:write` - Para deploying a Cloudflare Pages
- `account:read` - Para leer configuración de cuenta
- `zone:read` - Para leer configuración de zona

## 🚀 Activación

Los workflows de deployment ahora están completamente activos:
- `desplegar-preview.yml` - Deploy de PRs
- `desplegar-staging.yml` - Deploy a staging  
- `desplegar-produccion.yml` - Deploy a producción
- `desplegar-workers.yml` - Deploy de Workers

## ⚠️ Importante

El token OAuth expira el: **2025-09-28T12:04:01.355Z**
Necesitará renovarse después de esa fecha.

