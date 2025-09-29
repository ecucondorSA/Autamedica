# 🚀 Instrucciones para Aplicar la Migración

## ⚡ Método Más Rápido (CLI Manual)

**Para aplicar la migración inmediatamente:**

### 1. Abre el SQL Editor de Supabase:
```
https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new
```

### 2. Copia y pega todo el contenido del archivo:
```
apply-migration-direct.sql
```

### 3. Haz click en "Run" (botón azul)

### 4. Deberías ver el mensaje:
```
Migración completada exitosamente!
```

## ✅ Verificación Post-Migración

Después de aplicar la migración, verifica que funciona:

```bash
node scripts/test-call-flow.js
```

Si ves "🎉 All tests passed!", la migración fue exitosa.

## 🧪 Testing del Flujo E2E

Una vez aplicada la migración:

1. **Doctors App** (http://localhost:4001):
   - Click "Llamar a Paciente"
   - Debe mostrar logs detallados en consola
   - Debe navegar a `/call/room_xxx?callId=xxx&waiting=true`

2. **Patients App** (http://localhost:4002):
   - Debe aparecer modal "Llamada entrante"
   - Click "Aceptar" → navega a `/call/room_xxx`

## 🐛 Si Hay Problemas

### Error: "function create_call does not exist"
- La migración no se aplicó correctamente
- Reintenta los pasos 1-3 arriba

### Error: "permission denied"
- Las políticas RLS pueden estar bloqueando
- La migración incluye políticas permisivas para testing

### Error de conexión
- Verifica que las variables de entorno estén correctas:
  ```bash
  echo $NEXT_PUBLIC_SUPABASE_URL
  echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
  ```

## 📄 Contenido de la Migración

La migración incluye:
- ✅ Extensiones necesarias (uuid-ossp, pgcrypto)
- ✅ Enum `call_status` con todos los estados
- ✅ Tabla `calls` con constraints e índices
- ✅ Tabla `call_events` para telemetría
- ✅ Funciones `create_call()` y `update_call_status()`
- ✅ Políticas RLS permisivas para testing
- ✅ Queries de verificación

## 🎯 Después de la Migración

Una vez aplicada exitosamente, el sistema estará 100% funcional:
- El botón "Llamar a Paciente" funcionará
- Se creará registro en DB
- Se enviará invitación via signaling
- Flujo E2E "doctor llama → paciente acepta → conexión" completo

¡Solo falta este paso para completar el sistema! 🚀