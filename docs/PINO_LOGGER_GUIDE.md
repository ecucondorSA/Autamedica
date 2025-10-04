# 📝 Guía de Uso: Pino Logger

## 🎯 Migración de console.* a Logger Profesional

El proyecto ahora usa **Pino** como sistema de logging estructurado, reemplazando todos los `console.*`.

---

## ✅ ¿Por qué Pino?

- **🚀 Performance**: Hasta 5x más rápido que Winston
- **📊 Structured Logging**: JSON estructurado para análisis
- **🌍 Multi-runtime**: Browser, Node.js, Edge/Cloudflare
- **🔍 Pretty Dev**: Formato legible en desarrollo
- **📈 Producción-ready**: Niveles configurables por entorno

---

## 📦 Importación

```typescript
import { logger } from '@autamedica/shared';
```

---

## 🔧 Uso Básico

### Antes (❌ Obsoleto)
```typescript
console.log('User logged in');
console.error('Failed to connect', error);
console.warn('Rate limit approaching');
```

### Ahora (✅ Correcto)
```typescript
logger.info('User logged in');
logger.error('Failed to connect', { error });
logger.warn('Rate limit approaching', { remaining: 10 });
```

---

## 📚 Métodos Disponibles

### `logger.info(message, data?)`
Logs informativos (desarrollo y producción)

```typescript
logger.info('User registered', { userId: '123', email: 'user@example.com' });
```

### `logger.error(message, data?)`
Errores críticos (siempre se loguean)

```typescript
logger.error('Payment failed', {
  error: err.message,
  orderId: order.id,
  amount: order.total
});
```

### `logger.warn(message, data?)`
Advertencias importantes

```typescript
logger.warn('Cache miss', { key: 'user:123', ttl: 60 });
```

### `logger.debug(message, data?)`
Debugging detallado (solo en desarrollo)

```typescript
logger.debug('Processing webhook', {
  payload,
  headers: req.headers
});
```

---

## 🎨 Context Loggers (Child Loggers)

Para agregar contexto automático a todos los logs:

```typescript
// En un middleware o función
const requestLogger = logger.child({
  requestId: req.id,
  userId: session.userId,
  route: req.url
});

requestLogger.info('Request started');
// → { requestId: 'abc-123', userId: '456', route: '/api/users', msg: 'Request started' }

requestLogger.error('Request failed', { error });
// → { requestId: 'abc-123', userId: '456', route: '/api/users', error: {...}, msg: 'Request failed' }
```

### Ejemplo: Middleware de Next.js

```typescript
// middleware.ts
import { logger } from '@autamedica/shared';

export async function middleware(req: NextRequest) {
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.nextUrl.pathname
  });

  requestLogger.info('Request received');

  try {
    const response = NextResponse.next();
    requestLogger.info('Request completed', { status: response.status });
    return response;
  } catch (error) {
    requestLogger.error('Request failed', { error });
    throw error;
  }
}
```

---

## 🌍 Comportamiento por Entorno

### Development
- Formato **pretty** con colores
- Nivel: `debug` (todos los logs)
- Timestamp legible: `HH:MM:ss`

```
[09:42:15] INFO: User logged in
    userId: "123"
    email: "user@example.com"
```

### Production
- Formato **JSON** estructurado
- Nivel: `info` (sin debug)
- Timestamp ISO 8601

```json
{"level":30,"time":"2025-01-04T09:42:15.123Z","userId":"123","email":"user@example.com","msg":"User logged in"}
```

### Browser
- Fallback a `console.*` (solo en desarrollo)
- Sin logs en producción (excepto errors/warns)

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# Nivel de log (override)
LOG_LEVEL=debug  # debug | info | warn | error

# Entorno
NODE_ENV=production  # development | production
```

---

## 🔄 Migración Automática

### Preview (Dry-run)
```bash
node scripts/migrate-to-logger.mjs
```

### Aplicar cambios
```bash
node scripts/migrate-to-logger.mjs --apply
```

### Migrar archivo específico
```bash
node scripts/migrate-to-logger.mjs --file=apps/web-app/middleware.ts --apply
```

---

## 📊 Estadísticas de Migración

**Última ejecución:**
- ✅ **184 archivos** modificados
- ✅ **1,466 reemplazos** totales
- ✅ console.log (957) → logger.info
- ✅ console.error (395) → logger.error
- ✅ console.warn (102) → logger.warn
- ✅ console.info/debug (12) → logger.*

---

## 🎯 Best Practices

### ✅ DO: Usar data objects

```typescript
// ✅ Correcto - Datos estructurados
logger.info('Payment processed', {
  orderId: order.id,
  amount: order.total,
  currency: order.currency
});
```

### ❌ DON'T: String interpolation

```typescript
// ❌ Incorrecto - Difícil de parsear
logger.info(`Payment processed for order ${order.id} - ${order.total}`);
```

### ✅ DO: Usar child loggers para contexto

```typescript
// ✅ Correcto - Contexto automático
const userLogger = logger.child({ userId: user.id });
userLogger.info('Profile updated');
userLogger.info('Avatar changed');
```

### ❌ DON'T: Repetir contexto

```typescript
// ❌ Incorrecto - Redundante
logger.info('Profile updated', { userId: user.id });
logger.info('Avatar changed', { userId: user.id });
```

---

## 🔍 Debugging en Producción

### Buscar logs específicos

```bash
# Filtrar por nivel
cat logs.json | jq 'select(.level == 50)'  # Errors (50)

# Filtrar por campo
cat logs.json | jq 'select(.userId == "123")'

# Filtrar por mensaje
cat logs.json | jq 'select(.msg | contains("payment"))'
```

### Niveles de Pino

| Nivel | Nombre | Valor |
|-------|--------|-------|
| trace | TRACE  | 10    |
| debug | DEBUG  | 20    |
| info  | INFO   | 30    |
| warn  | WARN   | 40    |
| error | ERROR  | 50    |
| fatal | FATAL  | 60    |

---

## 📌 Checklist de Migración

- [ ] Importar logger en archivos que usen console.*
- [ ] Reemplazar console.log → logger.info
- [ ] Reemplazar console.error → logger.error
- [ ] Reemplazar console.warn → logger.warn
- [ ] Agregar data objects en lugar de strings
- [ ] Usar child loggers para contexto común
- [ ] Verificar que no queden console.* en producción
- [ ] Ejecutar `pnpm lint` para validar

---

## 🚀 Próximos Pasos

1. **Aplicar migración masiva**: `node scripts/migrate-to-logger.mjs --apply`
2. **Verificar builds**: `pnpm build`
3. **Validar linting**: `pnpm lint`
4. **Commit cambios**: `git add . && git commit -m "feat: migrate to Pino logger"`

---

**📖 Más información:**
- [Pino Docs](https://getpino.io/)
- [Best Practices](https://getpino.io/#/docs/best-practices)
- [API Reference](https://getpino.io/#/docs/api)
