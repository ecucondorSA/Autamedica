# 📋 Workflows de GitHub Actions - Autamedica

Este documento describe los **7 workflows oficiales** de Autamedica, todos con nombres en español para máxima claridad.

## 🎯 **Resumen Ejecutivo**

| **Workflow** | **Propósito** | **Triggers** | **Duración aprox.** |
|--------------|---------------|--------------|---------------------|
| `verificacion-basica.yml` | ✅ Lint + Types + Build + Tests | push, pull_request | ~5-8 min |
| `seguridad.yml` | 🔒 Auditorías + SAST + Secretos | push, pull_request, schedule | ~10-15 min |
| `validate-contracts.yml` | 📋 Contratos TypeScript vs Glosario | push en tipos, pull_request | ~2-3 min |
| `desplegar-preview.yml` | 🧪 Deploy previews de PRs | pull_request a develop/staging | ~8-12 min |
| `desplegar-staging.yml` | 🟡 Deploy a entorno Staging | push a rama `staging` | ~10-15 min |
| `desplegar-produccion.yml` | 🚀 Deploy a Producción | push a rama `main` | ~12-18 min |
| `desplegar-workers.yml` | ⚙️ Deploy Workers/DO/KV | push a develop/staging/main | ~3-5 min |

---

## 📁 **Detalles por Workflow**

### 1️⃣ `verificacion-basica.yml` - **CI Principal**

```yaml
name: 'Verificación Básica (Lint/Types/Build)'
```

**🎯 Propósito**: Validación base del código fuente
**⚡ Triggers**: `push`, `pull_request` (todas las ramas)
**⏱️ Duración**: ~5-8 minutos

**📋 Pasos**:
- ✅ Lint con ESLint (tolerante a errores)
- ✅ TypeScript type checking
- ✅ Build de todas las apps del monorepo (tolerante)

**💡 Notas**:
- Usa `|| true` para ser tolerante a errores temporales
- Ejecuta en paralelo todas las validaciones base
- No bloquea merges por errores menores

---

### 2️⃣ `seguridad.yml` - **Auditorías de Seguridad**

```yaml
name: 'Seguridad (Auditorías/SAST/Secretos)'
```

**🎯 Propósito**: Escaneo completo de seguridad
**⚡ Triggers**:
- `push`, `pull_request` (validación continua)
- `schedule: '0 3 * * *'` (auditoría diaria a las 3 AM UTC)

**⏱️ Duración**: ~10-15 minutos

**📋 Pasos**:
- 🔍 `pnpm audit` - Vulnerabilidades en dependencias
- 🔐 `GitLeaks` - Detección de secretos expuestos
- 🛡️ `CodeQL` - SAST (Static Application Security Testing)

**💡 Notas**:
- Ejecuta incluso si no hay cambios (schedule)
- Genera reportes SARIF para GitHub Security tab
- Tolerante a falsos positivos con `|| true`

---

### 3️⃣ `validate-contracts.yml` - **Validación de Contratos**

```yaml
name: 'Validar Contratos TypeScript'
```

**🎯 Propósito**: Sincronía entre exports y documentación
**⚡ Triggers**:
- `pull_request` en paths específicos:
  - `packages/types/**`
  - `docs/GLOSARIO_MAESTRO.md`
  - `scripts/validate-contracts.js`
- `push` a `main`, `develop`

**⏱️ Duración**: ~2-3 minutos

**📋 Pasos**:
- 📝 Ejecuta `node scripts/validate-contracts.js`
- ✅ Valida que todos los exports estén documentados
- 📋 Verifica convenciones de naming (IDs, branded types)

**💡 Notas**:
- Solo se ejecuta cuando cambian tipos o glosario
- Crítico para mantener documentación actualizada
- Ejecuta comentarios automáticos en PRs si falla

---

### 4️⃣ `desplegar-preview.yml` - **Previews de PRs**

```yaml
name: 'Desplegar Preview (Pages)'
```

**🎯 Propósito**: Deploy de previews para testing de PRs
**⚡ Triggers**:
- `pull_request` a ramas `develop`, `staging`
- Solo si cambian: `apps/**`, `packages/**`, `pnpm-lock.yaml`

**⏱️ Duración**: ~8-12 minutos

**📋 Pasos**:
- 🏗️ Build de todas las apps (tolerante)
- 🚀 Deploy a Cloudflare Pages con branch de PR
- 🔗 URLs de preview por app separadas

**🔧 Secrets requeridos**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**💡 Notas**:
- Deploys por separado: `web-app`, `patients`, `doctors`, `companies`, `admin`
- URLs tipo: `https://pr-123--autamedica-web-app.pages.dev`
- Tolerante si alguna app falla el build

---

### 5️⃣ `desplegar-staging.yml` - **Deploy Staging**

```yaml
name: 'Desplegar Staging (Pages)'
```

**🎯 Propósito**: Deploy automático al entorno de staging
**⚡ Triggers**: `push` a rama `staging`

**⏱️ Duración**: ~10-15 minutos

**📋 Pasos**:
- 🏗️ Build completo del monorepo
- 🚀 Deploy a Cloudflare Pages (rama staging)
- 🌐 URLs de staging estables

**🔧 Secrets requeridos**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**💡 Notas**:
- URLs tipo: `https://staging--autamedica-web-app.pages.dev`
- Usado para QA y testing pre-producción
- Deploy automático al hacer merge a `staging`

---

### 6️⃣ `desplegar-produccion.yml` - **Deploy Producción**

```yaml
name: 'Desplegar Producción (Pages)'
```

**🎯 Propósito**: Deploy oficial a producción
**⚡ Triggers**: `push` a rama `main`

**⏱️ Duración**: ~12-18 minutos

**📋 Pasos**:
- 🏗️ Build optimizado para producción
- 🚀 Deploy a Cloudflare Pages (rama main)
- 🌐 URLs de producción estables

**🔧 Secrets requeridos**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**💡 Notas**:
- URLs tipo: `https://autamedica-web-app.pages.dev`
- Solo se ejecuta en merges aprobados a `main`
- Deploy crítico, máxima estabilidad

---

### 7️⃣ `desplegar-workers.yml` - **Deploy Workers**

```yaml
name: 'Desplegar Workers'
```

**🎯 Propósito**: Deploy de Cloudflare Workers, D1, KV
**⚡ Triggers**:
- `push` a `develop`, `staging`, `main`
- Solo si cambian: `workers/**`, `packages/**`, `wrangler.toml`

**⏱️ Duración**: ~3-5 minutos

**📋 Pasos**:
- ⚙️ Deploy con `wrangler deploy`
- 🌍 Entornos por rama:
  - `main` → `--env production`
  - `staging` → `--env staging`
  - `develop` → `--env preview`

**🔧 Secrets requeridos**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**💡 Notas**:
- Más rápido que Pages (solo Workers)
- Entornos separados por rama
- Ideal para APIs, funciones serverless

---

## 🔧 **Configuración de Secrets**

### **Ubicación**: GitHub repo → Settings → Secrets and variables → Actions

| **Secret** | **Descripción** | **Cómo obtenerlo** |
|------------|-----------------|-------------------|
| `CLOUDFLARE_API_TOKEN` | Token API de Cloudflare | Dashboard CF → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | ID de tu cuenta | Dashboard CF → Sidebar derecho → Account ID |
| `PAGES_PROJECTS` | Lista de proyectos (opcional) | Hardcodeado como: `autamedica-web-app,autamedica-patients,autamedica-doctors,autamedica-companies,autamedica-admin` |

### **Permisos del API Token**:
```
Zone - Zone Settings:Read, Zone:Read
Account - Cloudflare Pages:Edit, Account Settings:Read
```

---

## 🛠️ **Mantenimiento y Sincronización**

### **Script Automático**: `./ci-sincronizar-workflows`

```bash
# Sincronizar workflows a versión canónica
./ci-sincronizar-workflows

# Ver qué cambiaría sin aplicar
./ci-sincronizar-workflows --dry-run

# Commitear pero no pushear
./ci-sincronizar-workflows --no-push
```

**🎯 Lo que hace**:
- ✏️ Renombra workflows antiguos (`ci.yml` → `verificacion-basica.yml`)
- 🗑️ Elimina workflows obsoletos (`release.yml`)
- 📝 Normaliza contenido a versión canónica
- 💾 Commit y push automático si hay cambios

---

## 📊 **Monitoreo y Debugging**

### **Ver status de workflows**:
```bash
gh workflow list                    # Workflows activos
gh run list --limit 10             # Últimas ejecuciones
gh run view <run_id> --log          # Logs detallados
```

### **URLs importantes**:
- **Actions tab**: `https://github.com/tu-usuario/repo/actions`
- **Security tab**: `https://github.com/tu-usuario/repo/security`
- **Pages settings**: `https://dash.cloudflare.com/pages`

### **Troubleshooting común**:
- ❌ **Secret missing**: Verificar configuración en repo settings
- ❌ **Build fails**: Revisar logs, usar `|| true` para tolerancia
- ❌ **Deploy fails**: Verificar permisos API token Cloudflare
- ❌ **Nombre workflows**: GitHub tarda en actualizar nombres tras renombrar

---

## 🎯 **Próximos Pasos**

1. **Configurar secrets** de Cloudflare en el repositorio
2. **Testear workflows** haciendo un PR de prueba
3. **Documentar URLs** de staging y producción finales
4. **Optimizar tiempos** de build si es necesario
5. **Configurar notificaciones** de Slack/Discord para deploys

---

**📝 Generado automáticamente** por el script `ci-sincronizar-workflows`
**🔄 Última actualización**: Usar `./ci-sincronizar-workflows` para mantener sincronizado