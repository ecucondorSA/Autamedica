# 🤖 MCP Supabase - Guía de Configuración

**Model Context Protocol (MCP)** para acceso seguro a Supabase sin hardcodear credenciales.

---

## 🎯 ¿Qué es MCP Supabase?

MCP (Model Context Protocol) es un protocolo que permite a **agentes AI** (como Claude, GitHub Actions, etc.) acceder a recursos externos (bases de datos, APIs) de forma segura mediante **tokens temporales** y **endpoints controlados**.

### Ventajas de MCP vs Credentials Directas

| Aspecto | MCP Supabase | Credentials Directas |
|---------|--------------|----------------------|
| **Seguridad** | ✅ Tokens rotables, scoped | ❌ Passwords estáticos |
| **Auditoría** | ✅ Log centralizado | ⚠️ Manual |
| **Revocación** | ✅ Inmediata | ❌ Requiere cambio de password |
| **Scope** | ✅ Permisos granulares | ❌ All-or-nothing |
| **CI/CD** | ✅ Ideal para workflows | ⚠️ Expone secrets |

---

## 🏗️ Arquitectura MCP en AutaMedica

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions / Claude Code / Local Scripts           │
│                                                         │
│  export SUPABASE_MCP_TOKEN="bearer_token"              │
│  export SUPABASE_MCP_ENDPOINT="https://mcp.example.com"│
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTPS + Bearer Auth
                  ▼
┌─────────────────────────────────────────────────────────┐
│ MCP Supabase Server (Middleware)                       │
│                                                         │
│  • Valida token                                        │
│  • Verifica scope (read-only, write, admin)           │
│  • Rate limiting                                       │
│  • Audit logging                                       │
│  • Transforma queries si es necesario                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Pooled Connection + SERVICE_ROLE_KEY
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL (gtyvdircfhmdjiaelqkg)            │
│                                                         │
│  • Ejecuta query con RLS bypass (service role)        │
│  • Retorna resultados                                 │
│  • Logs en audit_logs table                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup MCP Supabase (3 Métodos)

### Método 1: Supabase MCP Oficial (Si existe)

```bash
# 1. Instalar Supabase MCP CLI
npm install -g @supabase/mcp-server

# 2. Inicializar
supabase-mcp init --project-ref gtyvdircfhmdjiaelqkg

# 3. Generar token
supabase-mcp token create --scope "db:read,db:write" --expires 30d

# 4. Exportar
export SUPABASE_MCP_ENDPOINT="https://mcp.supabase.co/v1"
export SUPABASE_MCP_TOKEN="mcp_xxxxxxxxxxxxxxxxxx"
```

### Método 2: Self-Hosted MCP Server (Cloudflare Worker)

Puedes crear tu propio MCP server con un Cloudflare Worker:

```typescript
// workers/mcp-supabase/src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Validar Bearer Token
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.MCP_SECRET_TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Parse request
    const { action, query } = await request.json();

    // 3. Ejecutar en Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    if (action === 'db:query') {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: query
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ data });
    }

    return new Response('Invalid action', { status: 400 });
  }
};
```

**Deploy**:
```bash
cd workers/mcp-supabase
wrangler deploy

# Obtener URL:
# https://mcp-supabase.tu-cuenta.workers.dev
```

**Configurar secrets**:
```bash
wrangler secret put MCP_SECRET_TOKEN
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
```

### Método 3: GitHub Actions Direct (Sin MCP Server)

Si solo necesitas MCP para CI/CD, usa secrets de GitHub directamente:

```yaml
# .github/workflows/test-db.yml
jobs:
  db-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check RLS
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          psql "$DATABASE_URL" -f scripts/check_rls.sql
```

---

## 🔧 Usar el Script de RLS Check

Una vez configurado MCP (o Supabase CLI), ejecuta:

```bash
# Opción 1: Con MCP configurado
export SUPABASE_MCP_ENDPOINT="https://mcp.supabase.co/v1"
export SUPABASE_MCP_TOKEN="mcp_tu_token_aqui"
bash scripts/check-rls-with-mcp.sh

# Opción 2: Con Supabase CLI
supabase login
bash scripts/check-rls-with-mcp.sh

# Opción 3: Con DATABASE_URL directo
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.gtyvdircfhmdjiaelqkg.supabase.co:5432/postgres"
bash scripts/check-rls-with-mcp.sh
```

El script **auto-detecta** qué método usar en este orden:
1. MCP Supabase (si `SUPABASE_MCP_*` están definidos)
2. Supabase CLI (si está autenticado)
3. PostgreSQL directo (si `DATABASE_URL` está definido)

---

## 📊 Output Esperado

```
🔍 AutaMedica - RLS Verification Tool
======================================

🤖 Método: MCP Supabase
Endpoint: https://mcp.supabase.co/v1

Ejecutando query via MCP...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RLS STATUS EN TABLAS SENSIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 tablename          | rls_enabled | status
--------------------+-------------+-------------
 appointments       | t           | ✅ ENABLED
 audit_logs         | t           | ✅ ENABLED
 companies          | t           | ✅ ENABLED
 company_members    | t           | ✅ ENABLED
 doctors            | t           | ✅ ENABLED
 medical_records    | t           | ✅ ENABLED
 patient_care_team  | t           | ✅ ENABLED
 patients           | t           | ✅ ENABLED
 profiles           | t           | ✅ ENABLED
 roles              | t           | ✅ ENABLED
 user_roles         | t           | ✅ ENABLED
(11 rows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. POLICIES POR TABLA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 tablename          | policy_count | policies
--------------------+--------------+-----------------------------------
 medical_records    | 5            | read_own, insert_doctor, ...
 appointments       | 4            | read_participant, update_doctor
 patients           | 3            | read_own, read_care_team, ...
 doctors            | 3            | read_public, update_own, ...
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. TABLAS SIN RLS (POTENCIAL RIESGO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 tablename         | warning
-------------------+-----------
 health_centers    | ⚠️ NO RLS
 specialties       | ⚠️ NO RLS
(2 rows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. TOTAL DE POLICIES ACTIVAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 total_policies | tables_with_policies
----------------+---------------------
 28             | 11
(1 row)

✅ Query ejecutado via MCP Supabase
📄 Resultado guardado en: generated-docs/rls-check-mcp-20251006_115200.txt
```

---

## 🔐 Seguridad MCP

### Best Practices

1. **Tokens con Expiración**:
   ```bash
   # Crear token con 30 días de vida
   mcp token create --expires 30d
   ```

2. **Scopes Mínimos**:
   ```bash
   # Solo lectura para CI/CD
   mcp token create --scope "db:read"

   # Lectura + escritura para deployments
   mcp token create --scope "db:read,db:write"
   ```

3. **Rate Limiting**:
   - MCP server debe implementar rate limiting (ej: 100 req/min)

4. **Audit Logging**:
   - Todas las queries via MCP deben quedar en `audit_logs`

5. **IP Allowlist** (opcional):
   - Restringir MCP endpoint a IPs conocidas (GitHub Actions, Cloudflare Workers)

### Rotación de Tokens

```bash
# 1. Crear nuevo token
NEW_TOKEN=$(mcp token create --scope "db:read,db:write" --expires 30d)

# 2. Actualizar secret en GitHub
gh secret set SUPABASE_MCP_TOKEN --body "$NEW_TOKEN"

# 3. Verificar deployment exitoso

# 4. Revocar token antiguo
mcp token revoke <OLD_TOKEN_ID>
```

---

## 📚 Referencias

- **MCP Spec**: https://modelcontextprotocol.org/
- **Supabase Service Role**: https://supabase.com/docs/guides/auth/service-role
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **GitHub Actions Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## 🎯 Próximos Pasos

1. **Decidir método de MCP**:
   - ¿Supabase MCP oficial existe?
   - ¿Self-hosted con Cloudflare Worker?
   - ¿Direct DATABASE_URL para ahora?

2. **Ejecutar RLS check**:
   ```bash
   bash scripts/check-rls-with-mcp.sh
   ```

3. **Integrar en CI/CD**:
   - Agregar step de RLS check en `.github/workflows/autamedica-agentic.yml`

4. **Documentar findings**:
   - Actualizar `TEST_RUN_REPORT.md` con resultados de RLS

---

**Generado**: 2025-10-06
**Proyecto**: AutaMedica
**Autor**: Claude Code + Eduardo
