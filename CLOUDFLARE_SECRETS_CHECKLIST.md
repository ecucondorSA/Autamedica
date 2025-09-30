# ✅ Checklist: Variables de Entorno Cloudflare Pages

**Proyecto:** autamedica-web-app
**Dashboard:** Settings → Environment variables

---

## 🔐 Variables Configuradas

- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Variables Adicionales Recomendadas

### Producción (Production)

| Variable | Valor | Necesaria | Estado |
|----------|-------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gtyvdircfhmdjiaelqkg.supabase.co` | ✅ Crítica | ✅ Configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Crítica | ✅ Configurada |
| `NEXT_PUBLIC_NODE_ENV` | `production` | ⚠️ Recomendada | ⏳ Pendiente |
| `NEXT_PUBLIC_APP_URL` | `https://autamedica.com` | ⚠️ Recomendada | ⏳ Pendiente |
| `NODE_ENV` | `production` | ⚠️ Recomendada | ⏳ Pendiente |
| `SKIP_ENV_VALIDATION` | `true` | 📝 Opcional | ⏳ Pendiente |

### Preview (Opcional - para PRs)

| Variable | Valor | Necesaria |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | (mismo que production) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (mismo que production) | ✅ |
| `NEXT_PUBLIC_NODE_ENV` | `preview` | ⚠️ |
| `NEXT_PUBLIC_APP_URL` | `https://[hash].autamedica-web-app.pages.dev` | ⚠️ |

---

## 🚀 Configuración Recomendada

### Opción A: Mínimo Funcional (Ya tienes esto ✅)

Solo las 2 variables críticas que ya configuraste:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Esto debería ser suficiente para que el build funcione.**

### Opción B: Configuración Completa (Recomendada)

Agregar estas 3 adicionales en **Production**:

```bash
# En Cloudflare Dashboard → autamedica-web-app → Settings → Environment variables

# Click "Add variable" para cada una:

1. NEXT_PUBLIC_NODE_ENV
   Value: production
   Environment: Production

2. NEXT_PUBLIC_APP_URL
   Value: https://autamedica.com
   Environment: Production

3. NODE_ENV
   Value: production
   Environment: Production
```

---

## 🔍 Verificar Valores Correctos

### ANON_KEY Válida

Verifica que la `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea la **correcta** y no contenga:
- ❌ `REPLACE_WITH_ROTATED_KEY`
- ❌ Texto placeholder
- ✅ Debe empezar con: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...`

### URL Correcta

```
✅ CORRECTO: https://gtyvdircfhmdjiaelqkg.supabase.co
❌ INCORRECTO: https://gtyvdircfhmdjiaelqkg.supabase.co/
                                                        ^ sin barra final
```

---

## 🎯 Próximos Pasos

1. **Verificar build actual:**
   ```
   Dashboard → Deployments → Ver último deployment
   ```

2. **Si build es exitoso con solo las 2 variables:**
   - ✅ Deploy está funcionando
   - 📝 Opcional: Agregar las 3 adicionales para mejor configuración

3. **Si build falla:**
   - 🔍 Ver logs completos en Cloudflare
   - ⚠️ Agregar las variables adicionales (NODE_ENV mínimo)
   - 🔄 Retry deployment

---

## 📊 Estado del Deployment

**Después de agregar los secretos, el deployment debería:**

```
✅ Clone repository
✅ Install dependencies
✅ Build packages:core (cached)
✅ Build web-app (Next.js)
   → Conecta a Supabase con las variables configuradas
   → Genera páginas estáticas
✅ Deploy to Cloudflare edge
```

**URL esperada:** `https://autamedica-web-app.pages.dev`

---

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solución:** Verifica que la variable esté en el scope "Production" (no solo Preview)

### Error: "Failed to initialize Supabase client"
**Solución:** Verifica que ANON_KEY sea válida (no el placeholder)

### Error: "process.env is not defined"
**Solución:** Agrega `NODE_ENV=production` a las variables

### Build funciona pero la app no conecta a Supabase
**Solución:** Verifica que las variables tengan el prefijo `NEXT_PUBLIC_` (son client-side)

---

## 📚 Referencias

- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Client Setup](https://supabase.com/docs/reference/javascript/initializing)

---

**Última actualización:** 2025-09-30 21:50:00
**Estado:** 2/5 variables configuradas ✅
**Próximo:** Verificar deployment en dashboard
