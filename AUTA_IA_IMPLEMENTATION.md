# 🤖 Auta IA - Implementación Production-Ready

## ✅ Estado de Implementación

**Versión:** 1.0.0 - Production Ready
**Fecha:** 2025-10-08
**Status:** ✅ Completamente implementado y listo para deployment

---

## 📋 Componentes Implementados

### 1. Base de Datos (Supabase)

**Migración:** `supabase/migrations/20251008_auta_ai_schema.sql`

**Tablas creadas:**
- ✅ `auta_ai_settings` - Configuración personalizada por paciente
- ✅ `auta_conversations` - Conversaciones agrupadas
- ✅ `auta_messages` - Mensajes individuales
- ✅ `auta_ai_usage` - Auditoría de uso y costos

**Seguridad:**
- ✅ RLS (Row Level Security) habilitado en todas las tablas
- ✅ Políticas que permiten acceso solo a paciente y care team
- ✅ Soft deletes para auditoría
- ✅ Funciones de seguridad reutilizables

**Retención automática:**
- ✅ Función `auta_archive_old_conversations()` - Archiva conversaciones antiguas
- ✅ Función `auta_soft_delete_very_old()` - Borra conversaciones muy antiguas (2x retain_days)
- ✅ Trigger automático para crear settings al crear paciente

### 2. Tipos TypeScript

**Archivo:** `packages/types/src/auta-ai.ts`

**Tipos exportados:**
- ✅ `TAutaMessage` - Mensajes individuales
- ✅ `TAutaConversation` - Conversaciones
- ✅ `TAutaAISettings` - Configuración
- ✅ `TAutaAIUsage` - Uso de IA
- ✅ `TAutaChatRequest` - Request API
- ✅ `TAutaChatResponse` - Response API
- ✅ `TPatientContext` - Contexto del paciente

**Validación:**
- ✅ Todos los schemas con Zod
- ✅ Validación en endpoints
- ✅ Type-safety completa

### 3. API Endpoint (Cloudflare Pages Function)

**Archivo:** `apps/patients/functions/api/auta/chat.ts`

**Funcionalidades:**
- ✅ POST /api/auta/chat
- ✅ Validación de request con Zod
- ✅ Persistencia en Supabase (Service Role)
- ✅ Construcción de contexto desde tablas clínicas
- ✅ Integración con OpenAI (o tu provider de IA)
- ✅ Auditoría de tokens y costos
- ✅ Error handling robusto

**Contexto construido desde:**
- ✅ `patient_vital_signs` - Últimas 5 mediciones
- ✅ `patient_screenings` - Chequeos preventivos
- ✅ `appointments` - Próximos turnos

### 4. Hook de React

**Archivo:** `apps/patients/src/hooks/useAutaChat.ts`

**Características:**
- ✅ Manejo de estado de mensajes
- ✅ Loading states y error handling
- ✅ Retry automático con backoff exponencial
- ✅ Optimistic updates
- ✅ Abort controller para cancelar requests
- ✅ Reset de conversación

### 5. Componente UI

**Archivo:** `apps/patients/src/components/chat/AutaChatbot.tsx`

**Mejoras:**
- ✅ UI actualizada con persistencia
- ✅ Indicador de conversación activa
- ✅ Botón "Nueva conversación"
- ✅ Retry button en errores
- ✅ Loading indicators mejorados
- ✅ Scroll automático

---

## 🚀 Deployment

### Variables de Entorno Requeridas

**Cloudflare Pages Environment Variables:**

```env
# Supabase (Service Role - SERVER ONLY)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...xxx

# OpenAI API (o tu provider de IA)
OPENAI_API_KEY=sk-xxx...xxx
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
```

**⚠️ IMPORTANTE:** Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente. Solo en Functions serverless.

### Pasos de Deployment

#### 1. Aplicar Migración SQL

```bash
# Desde la raíz del proyecto
cd /home/edu/Autamedica

# Aplicar migración a Supabase
supabase db push

# O manualmente desde el Dashboard de Supabase:
# 1. Ir a SQL Editor
# 2. Copiar contenido de supabase/migrations/20251008_auta_ai_schema.sql
# 3. Ejecutar
```

#### 2. Build de Types

```bash
# Desde la raíz del proyecto
pnpm --filter @autamedica/types build

# Verificar que los tipos se exportan correctamente
pnpm --filter @autamedica/types typecheck
```

#### 3. Configurar Variables en Cloudflare

```bash
# Opción A: Desde Dashboard
# 1. Ir a Cloudflare Pages > autamedica-patients > Settings > Environment variables
# 2. Agregar todas las variables listadas arriba
# 3. Aplicar cambios

# Opción B: Con Wrangler CLI
wrangler pages secret put SUPABASE_URL
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
wrangler pages secret put OPENAI_API_KEY
# etc...
```

#### 4. Deploy

```bash
# Deploy de patients app
cd apps/patients
pnpm build
wrangler pages deploy .vercel/output/static --project-name autamedica-patients
```

---

## 🔐 Seguridad y Privacidad

### Cumplimiento HIPAA

✅ **Encriptación en reposo** - Supabase encripta automáticamente
✅ **RLS (Row Level Security)** - Acceso solo a datos propios
✅ **Auditoría completa** - Tabla `auta_ai_usage` registra todo
✅ **Soft deletes** - Nunca se pierden datos para auditoría
✅ **Retención configurable** - Por paciente (1-3650 días)
✅ **Consentimiento explícito** - `allow_training` requiere opt-in

### Políticas RLS

**Paciente puede:**
- ✅ Ver sus propias conversaciones
- ✅ Crear nuevas conversaciones
- ✅ Ver/modificar sus settings

**Care Team puede:**
- ✅ Ver conversaciones del paciente asignado
- ✅ Ver settings del paciente asignado
- ❌ NO puede modificar settings sin permiso

**Nadie puede:**
- ❌ Ver conversaciones de otros pacientes
- ❌ Ver settings de otros pacientes
- ❌ Acceder a mensajes borrados

---

## 📊 Métricas y Auditoría

### Queries Útiles

**Últimas 10 conversaciones de un paciente:**
```sql
SELECT * FROM public.auta_conversations
WHERE patient_id = '<PATIENT_UUID>'
ORDER BY last_message_at DESC
LIMIT 10;
```

**Distribución por intent:**
```sql
SELECT intent, COUNT(*) as count
FROM public.auta_messages
WHERE intent IS NOT NULL
GROUP BY intent
ORDER BY count DESC;
```

**Costo total por paciente (último mes):**
```sql
SELECT patient_id, SUM(cost_usd) as total_cost
FROM public.auta_ai_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY patient_id
ORDER BY total_cost DESC;
```

**Tokens promedio por respuesta:**
```sql
SELECT
  AVG(tokens_input) as avg_input,
  AVG(tokens_output) as avg_output,
  AVG(latency_ms) as avg_latency
FROM public.auta_ai_usage
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🧪 Testing

### Pruebas Manuales

**1. Test de Persistencia:**
```bash
# 1. Enviar mensaje en frontend
# 2. Verificar en Supabase que se creó:
#    - 1 conversación en auta_conversations
#    - 2 mensajes en auta_messages (user + assistant)
#    - 1 registro en auta_ai_usage
```

**2. Test de RLS:**
```bash
# 1. Loguearse como Paciente A
# 2. Enviar mensaje
# 3. Loguearse como Paciente B
# 4. Verificar que NO ve conversaciones de Paciente A
```

**3. Test de Retención:**
```bash
# 1. Ejecutar manualmente:
SELECT public.auta_archive_old_conversations();
# 2. Verificar que conversaciones antiguas cambian a status='archived'
```

### Test de Endpoint

```bash
curl -X POST http://localhost:3002/api/auta/chat \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_UUID",
    "message": "¿Cuál es mi presión arterial?"
  }'
```

---

## 🔧 Mantenimiento

### Tareas Programadas (Recomendadas)

**Con pg_cron en Supabase Platform:**

```sql
-- Archivar conversaciones diariamente a las 3:15 AM
SELECT cron.schedule(
  'auta_archive_daily',
  '15 3 * * *',
  $$ SELECT public.auta_archive_old_conversations(); $$
);

-- Soft delete semanal los domingos a las 3:45 AM
SELECT cron.schedule(
  'auta_softdelete_weekly',
  '45 3 * * 0',
  $$ SELECT public.auta_soft_delete_very_old(); $$
);
```

**Sin pg_cron (alternativa con Cloudflare Workers Cron):**
- Crear Worker que llame a función de Supabase via API
- Programar en wrangler.toml

---

## 📝 Próximos Pasos (Opcionales)

### Mejoras Futuras

1. **Memoria Semántica (pgvector):**
   - Agregar embeddings para búsqueda semántica
   - Tabla `auta_memory` para contexto a largo plazo

2. **Analytics Dashboard:**
   - Panel de métricas para admins
   - Gráficos de uso, costos, satisfacción

3. **Export de Datos:**
   - Endpoint GET /api/auta/export
   - Descarga de conversaciones en JSON/PDF

4. **Feedback Loop:**
   - Botones 👍/👎 en mensajes
   - Tabla `auta_feedback` para mejorar modelo

5. **Multi-idioma:**
   - Detectar idioma del paciente
   - Responder en idioma nativo

---

## 🆘 Troubleshooting

### Problema: "Failed to create conversation"

**Causa:** RLS bloqueando creación
**Solución:** Verificar que el usuario autenticado tiene un paciente asociado

```sql
SELECT * FROM public.patients WHERE user_id = auth.uid();
```

### Problema: "AI service unavailable"

**Causa:** API key incorrecta o sin fondos
**Solución:** Verificar en Cloudflare Dashboard que `OPENAI_API_KEY` esté configurada

### Problema: Mensajes no persisten

**Causa:** Service Role Key incorrecta
**Solución:** Verificar en Functions que se usa Service Role y no Anon Key

---

## 📚 Referencias

- [Migración SQL](./supabase/migrations/20251008_auta_ai_schema.sql)
- [Tipos TypeScript](./packages/types/src/auta-ai.ts)
- [API Endpoint](./apps/patients/functions/api/auta/chat.ts)
- [Hook useAutaChat](./apps/patients/src/hooks/useAutaChat.ts)
- [Componente UI](./apps/patients/src/components/chat/AutaChatbot.tsx)

---

## ✅ Checklist de Deployment

- [ ] Migración SQL aplicada en Supabase
- [ ] Variables de entorno configuradas en Cloudflare
- [ ] Types package compilado (`pnpm build`)
- [ ] Patients app deployada
- [ ] Test manual de chat funcionando
- [ ] Verificar RLS con 2 pacientes diferentes
- [ ] Configurar pg_cron para retención automática
- [ ] Documentar en GLOSARIO_MAESTRO.md

---

**Desarrollado por:** E.M Medicina UBA
**Licencia:** Uso interno AutaMedica
**Contacto:** dev@autamedica.com
