# 🐳 AltaMedica - Docker Setup

Configuración completa de Docker con Supabase local y Playwright para desarrollo y testing.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [Comandos Disponibles](#comandos-disponibles)
- [Servicios](#servicios)
- [Testing con Playwright](#testing-con-playwright)
- [Troubleshooting](#troubleshooting)
- [Variables de Entorno](#variables-de-entorno)

## 🎯 Requisitos

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Node.js**: >= 18 (para scripts locales)
- **pnpm**: >= 9.15.2

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.docker.example .env.docker

# Editar y ajustar las variables según necesidad
# IMPORTANTE: Cambiar JWT_SECRET y POSTGRES_PASSWORD para producción
nano .env.docker
```

### 2. Levantar los Servicios

```bash
# Levantar todo el stack (Supabase + Playwright)
pnpm docker:up

# O solo Supabase (sin Playwright)
pnpm docker:supabase

# O solo Playwright (requiere Supabase corriendo)
pnpm docker:playwright
```

### 3. Verificar Estado de Servicios

```bash
# Health check completo con colores
pnpm docker:health

# Ver status de contenedores
pnpm docker:ps

# Ver logs en tiempo real
pnpm docker:logs
```

### 4. Acceder a los Servicios

Una vez levantados, accede a:

- **Supabase Studio**: http://localhost:3010
  - Usuario: `supabase` (configurable en .env.docker)
  - Password: `this_password_is_insecure_and_should_be_updated` (cambiar en producción)

- **API Gateway (Kong)**: http://localhost:8000

- **Inbucket (Email Testing)**: http://localhost:9000

- **PostgreSQL**: `localhost:5432`
  - Usuario: `postgres`
  - Password: configurado en `.env.docker`

## 🏗️ Arquitectura

### Stack Completo

```
┌─────────────────────────────────────────────┐
│           🌐 Kong API Gateway               │
│              (Port 8000)                    │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐         ┌──────▼──────┐
│  🔐 Auth  │         │  📊 REST    │
│ (GoTrue)  │         │ (PostgREST) │
│ Port 9999 │         │  Port 3000  │
└───────────┘         └─────────────┘
      │                       │
      └───────────┬───────────┘
                  │
          ┌───────▼────────┐
          │  🗄️ PostgreSQL │
          │   Port 5432    │
          └────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐         ┌──────▼──────┐
│📡Realtime │         │ 💾 Storage  │
│ Port 4000 │         │  Port 5000  │
└───────────┘         └─────────────┘
                              │
                      ┌───────▼────────┐
                      │  🖼️ ImgProxy   │
                      │   Port 5001    │
                      └────────────────┘

┌─────────────────────────────────────────────┐
│         🎨 Supabase Studio                  │
│            Port 3010                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         📧 Inbucket (Email Testing)         │
│      SMTP: 2500 | Web: 9000                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         🎭 Playwright (Test Runner)         │
│         (No exposed ports)                  │
└─────────────────────────────────────────────┘
```

## 📜 Comandos Disponibles

### Gestión de Servicios

```bash
# Levantar todos los servicios
pnpm docker:up

# Detener todos los servicios
pnpm docker:down

# Reiniciar servicios
pnpm docker:restart

# Ver logs en tiempo real
pnpm docker:logs

# Ver status de contenedores
pnpm docker:ps

# Health check completo
pnpm docker:health
```

### Build y Limpieza

```bash
# Rebuild completo (limpia todo y reconstruye)
pnpm docker:rebuild

# Limpiar volúmenes y containers
pnpm docker:clean

# Build sin cache
pnpm docker:build
```

### Servicios Específicos

```bash
# Solo stack Supabase (sin Playwright)
pnpm docker:supabase

# Solo Playwright (requiere Supabase)
pnpm docker:playwright
```

### Testing con Playwright

```bash
# Ejecutar todos los tests E2E en Docker
pnpm test:docker

# Ejecutar tests con UI mode
pnpm test:docker:ui

# Ejecutar tests por navegador
pnpm test:docker:chromium
pnpm test:docker:firefox
pnpm test:docker:webkit
```

## 🔧 Servicios

### PostgreSQL (Base de datos)
- **Puerto**: 5432
- **Usuario**: `postgres`
- **Password**: Configurado en `.env.docker`
- **Imagen**: `supabase/postgres:15.6.1.147`

### Kong (API Gateway)
- **Puerto**: 8000 (HTTP), 8443 (HTTPS)
- **Función**: Enruta requests a servicios internos
- **Imagen**: `kong:2.8.1`

### GoTrue (Autenticación)
- **Puerto**: 9999
- **Función**: Gestión de usuarios y auth
- **Healthcheck**: `http://localhost:9999/health`
- **Imagen**: `supabase/gotrue:v2.158.1`

### PostgREST (API REST)
- **Puerto**: 3000 (interno)
- **Función**: API REST automática para PostgreSQL
- **Imagen**: `postgrest/postgrest:v12.2.0`

### Realtime (WebSockets)
- **Puerto**: 4000
- **Función**: Cambios en tiempo real vía WebSockets
- **Imagen**: `supabase/realtime:v2.30.23`

### Storage (Archivos)
- **Puerto**: 5000
- **Función**: Gestión de archivos y multimedia
- **Imagen**: `supabase/storage-api:v1.10.5`

### ImgProxy (Imágenes)
- **Puerto**: 5001
- **Función**: Transformación y optimización de imágenes
- **Imagen**: `darthsim/imgproxy:v3.8.0`

### Meta (Metadatos)
- **Puerto**: 8080
- **Función**: Gestión de metadatos de PostgreSQL
- **Imagen**: `supabase/postgres-meta:v0.83.2`

### Studio (Dashboard)
- **Puerto**: 3010
- **Función**: Dashboard visual de Supabase
- **URL**: http://localhost:3010
- **Imagen**: `supabase/studio:20241028-5f0d7fd`

### Inbucket (Email Testing)
- **Puerto SMTP**: 2500
- **Puerto Web**: 9000
- **Función**: Servidor de email local para testing
- **URL**: http://localhost:9000
- **Imagen**: `inbucket/inbucket:3.0.3`

### Playwright (Test Runner)
- **Función**: Ejecutor de tests E2E
- **Base**: Imagen oficial de Playwright con navegadores
- **Navegadores**: Chromium, Firefox, WebKit

## 🎭 Testing con Playwright

### Ejecutar Tests en Docker

El servicio de Playwright está configurado para ejecutar tests en un ambiente aislado y reproducible.

```bash
# 1. Asegurar que Supabase esté corriendo
pnpm docker:supabase

# 2. Levantar el servicio Playwright
pnpm docker:playwright

# 3. Ejecutar tests
pnpm test:docker
```

### Configuración de Tests

Los tests utilizan las siguientes variables de entorno (configuradas automáticamente):

- `BASE_URL`: `http://host.docker.internal:3000` (apunta a tu app local)
- `NEXT_PUBLIC_SUPABASE_URL`: `http://kong:8000` (Supabase en Docker)
- `CI`: `true` (modo CI habilitado)

### Resultados y Reportes

Los resultados se guardan en tu sistema local:

- **Test Results**: `./test-results/`
- **HTML Report**: `./playwright-report/`
- **Screenshots/Videos**: `./test-output/`

Estos directorios están montados como volúmenes, por lo que los resultados persisten incluso si detienes el contenedor.

## 🔍 Troubleshooting

### Los servicios no levantan

```bash
# Verificar logs
pnpm docker:logs

# Verificar que Docker esté corriendo
docker info

# Limpiar todo y reiniciar
pnpm docker:rebuild
```

### No puedo conectar a PostgreSQL

```bash
# Verificar que el contenedor esté running
pnpm docker:ps

# Verificar health
pnpm docker:health

# Verificar logs de PostgreSQL
docker-compose logs postgres
```

### Tests de Playwright fallan

```bash
# Verificar que la app esté corriendo en localhost:3000
curl http://localhost:3000

# Verificar logs de Playwright
docker-compose logs playwright

# Verificar variables de entorno
docker-compose exec playwright env | grep BASE_URL
```

### Puerto en uso

Si algún puerto ya está siendo usado:

```bash
# Ver qué está usando el puerto (ejemplo puerto 5432)
lsof -i :5432

# O con netstat
netstat -tuln | grep 5432

# Detener servicios conflictivos o cambiar puertos en docker-compose.yml
```

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar todo (containers, volumes, networks)
pnpm docker:clean

# Rebuild completo
pnpm docker:rebuild
```

## 🔐 Variables de Entorno

### Variables Críticas

Estas variables DEBEN cambiarse en producción:

```bash
# Seguridad
JWT_SECRET=<generar con: openssl rand -base64 32>
POSTGRES_PASSWORD=<password seguro>
DASHBOARD_PASSWORD=<password seguro>

# En desarrollo local, los defaults funcionan
```

### Variables de Configuración

```bash
# URLs
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000
SITE_URL=http://localhost:3000

# Email (Inbucket local)
SMTP_HOST=inbucket
SMTP_PORT=2500

# Auth
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true  # Solo desarrollo!
DISABLE_SIGNUP=false
```

### Generar JWT Secret

```bash
# Generar un JWT secret seguro
openssl rand -base64 32

# Copiar output a .env.docker
```

## 📝 Notas Importantes

### Desarrollo vs Producción

- **Auto-confirm emails**: Solo habilitar en desarrollo (`ENABLE_EMAIL_AUTOCONFIRM=true`)
- **JWT Secret**: SIEMPRE cambiar en producción
- **Dashboard password**: SIEMPRE cambiar en producción
- **PostgreSQL password**: Usar password seguro en producción

### Persistencia de Datos

Los datos se persisten en volúmenes de Docker:

- `autamedica-postgres-data`: Base de datos PostgreSQL
- `autamedica-storage-data`: Archivos subidos

Para eliminar todos los datos:

```bash
pnpm docker:clean
```

### Networking

Todos los servicios están en la red `autamedica-network`. Los servicios pueden comunicarse entre sí usando nombres de contenedor:

```javascript
// Desde un servicio Docker, puedes acceder a otro así:
const response = await fetch('http://postgres:5432');
const response = await fetch('http://kong:8000');
```

### Migraciones

Las migraciones de Supabase se ejecutan automáticamente al iniciar PostgreSQL:

- **Directorio**: `./supabase/migrations/`
- **Ejecución**: Automática en `postgres` startup

## 🎓 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Playwright](https://playwright.dev/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🤝 Contribuciones

Para modificar la configuración de Docker:

1. Editar `docker-compose.yml` para servicios
2. Editar `Dockerfile.playwright` para tests
3. Actualizar `.env.docker.example` para nuevas variables
4. Documentar cambios en este README

---

**Última actualización**: 2025-10-07
**Versión Docker Compose**: 3.8
**Versión Supabase**: PostgreSQL 15.6, GoTrue v2.158, etc.
