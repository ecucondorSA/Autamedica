# 🚨 FASE 1: Cleanup de Proyectos Cloudflare

**Fecha:** 2025-09-30
**Status:** 🟡 PENDIENTE - Requiere acción manual en Dashboard

---

## ✅ Completado

### 1. Workflow `desplegar-produccion.yml` PAUSADO

```bash
gh workflow disable desplegar-produccion.yml
```

**Verificación:**
```bash
$ gh workflow list | grep -i "desplegar producción"
# No aparece en la lista = está deshabilitado ✅
```

**Workflows activos restantes:**
- Deploy Auth to Cloudflare Pages
- Desplegar Preview (Pages)
- Desplegar Staging (Pages)
- Desplegar Workers

---

## 🔴 ACCIÓN REQUERIDA: Limpiar Proyectos Cloudflare Duplicados

### Proyectos a Eliminar/Desconectar

#### 1. **autamedica-reboot-fresh** 🚨

**Estado:**
- Conectado a GitHub (Auto-deploy ENABLED)
- 12+ deployments consecutivos FALLANDO
- Último: commit 6dc7fc5 - FAILED

**Razón del problema:**
- El workflow despliega desde root (`.`) en lugar de `apps/web-app`
- Cloudflare intenta buildear el monorepo completo
- No encuentra Next.js app válida
- Build falla pero se repite en cada push

**Acción:**
```
1. Ir a: dash.cloudflare.com
2. Workers & Pages → autamedica-reboot-fresh
3. Settings → Git → Disconnect repository
4. Opcionalmente: Delete project (si no se usará)
```

**URL del proyecto:**
https://dash.cloudflare.com/5737682cdee596a0781f795116a3120b/pages/view/autamedica-reboot-fresh

---

#### 2. **autamedicaweb** 🚨

**Estado:**
- Conectado a GitHub (Auto-deploy ENABLED)
- 7+ deployments consecutivos FALLANDO
- Último: commit fb31406 - FAILED

**Mismo problema que autamedica-reboot-fresh**

**Acción:**
```
1. Ir a: dash.cloudflare.com
2. Workers & Pages → autamedicaweb
3. Settings → Git → Disconnect repository
4. Opcionalmente: Delete project (si no se usará)
```

**URL del proyecto:**
https://dash.cloudflare.com/5737682cdee596a0781f795116a3120b/pages/view/autamedicaweb

---

### Proyectos VÁLIDOS (NO TOCAR) ✅

Estos proyectos están funcionando correctamente con deployments manuales:

| Proyecto | URL | Estado | Usar para |
|----------|-----|--------|-----------|
| **autamedica-web-app** | www.autamedica.com | ✅ Producción | Landing + Auth |
| **autamedica-doctors** | autamedica-doctors.pages.dev | ✅ Producción | Portal Médicos |
| **autamedica-patients** | autamedica-patients.pages.dev | ✅ Producción | Portal Pacientes |
| **autamedica-companies** | autamedica-companies.pages.dev | ✅ Producción | Portal Empresas |

---

### Proyectos OPCIONALES a Revisar ⚠️

#### 3. **autamedica-admin**
- Último deployment: hace 2 días
- Estado: SIN CONTENIDO (no hay app funcional)
- Decisión: ¿Mantener para futuro o eliminar?

#### 4. **autamedica-auth**
- Último deployment: hace 4 horas
- Estado: NO SE USA (auth está en web-app)
- Decisión: ¿Eliminar?

#### 5. **autamedica** (sin sufijo)
- Último deployment: hace 4 días
- Estado: OBSOLETO
- Decisión: ¿Eliminar?

---

## 📋 Checklist de Verificación

### Antes de continuar a FASE 2:

- [ ] `autamedica-reboot-fresh` - Git desconectado o proyecto eliminado
- [ ] `autamedicaweb` - Git desconectado o proyecto eliminado
- [ ] Verificar que NO hay más deployments automáticos fallando:
  ```bash
  wrangler pages deployment list --project-name autamedica-web-app
  # Solo debe mostrar deployments antiguos exitosos
  ```
- [ ] Confirmar que workflow está pausado:
  ```bash
  gh workflow list | grep "Desplegar Producción"
  # No debe aparecer nada
  ```

### URLs de producción siguen funcionando:

- [ ] https://www.autamedica.com - Responde 200 OK
- [ ] https://autamedica-doctors.pages.dev - Responde 200 OK
- [ ] https://autamedica-patients.pages.dev - Responde 200 OK
- [ ] https://autamedica-companies.pages.dev - Responde 200 OK

**Verificación:**
```bash
for url in "https://www.autamedica.com" \
           "https://autamedica-doctors.pages.dev" \
           "https://autamedica-patients.pages.dev" \
           "https://autamedica-companies.pages.dev"; do
  echo "Testing: $url"
  curl -I "$url" 2>&1 | grep "HTTP/"
done
```

---

## 🚀 Próximos Pasos (FASE 2)

Una vez completado este cleanup:

1. ✅ Corregir `.github/workflows/desplegar-produccion.yml`
2. ✅ Corregir `.github/workflows/secrets-scan.yml`
3. ✅ Re-habilitar workflows corregidos
4. ✅ Smoke test de deployments automáticos

Ver: `ANALISIS_GITHUB_CLOUDFLARE.md` para detalles completos.

---

## ⚠️ Notas Importantes

### ¿Por qué se crearon proyectos duplicados?

El workflow `.github/workflows/desplegar-produccion.yml` tenía:

```yaml
PAGES_PROJECTS: autamedica-web-app,autamedica-patients,autamedica-doctors,autamedica-companies,autamedica-admin

for p in "${PROJS[@]}"; do
  wrangler pages deploy . --project-name "$p" --branch "main" || true
done
```

**Problemas:**
1. Despliega "." (root) - no apps específicas
2. `|| true` oculta errores
3. Wrangler crea proyectos automáticamente si no existen
4. GitHub integration se activó automáticamente en algunos proyectos

**Resultado:**
- Proyectos válidos (manuales): autamedica-web-app, doctors, patients, companies
- Proyectos duplicados (automáticos fallando): autamedica-reboot-fresh, autamedicaweb

### ¿Es seguro eliminar los proyectos duplicados?

**SÍ** - Los proyectos duplicados están **vacíos** (builds fallan) y no tienen tráfico.

Las URLs de producción funcionan desde los proyectos **manuales** originales:
- `autamedica-web-app` (manual) → www.autamedica.com ✅
- `autamedica-reboot-fresh` (automático) → NADA (builds fallan) ❌

Eliminar los duplicados **no afecta producción**.

---

**Última actualización:** 2025-09-30 23:45:00
**Requiere:** Acceso al Dashboard de Cloudflare
**Tiempo estimado:** 5 minutos
