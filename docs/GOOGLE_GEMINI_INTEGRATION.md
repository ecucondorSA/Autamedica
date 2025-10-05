# 🤖 Integración de Google Gemini AI

## 📋 Resumen

Se ha integrado **Google Gemini AI** como proveedor alternativo/complementario a Anthropic Claude para análisis médico con IA.

### Ventajas de Gemini

✅ **Multimodal**: Análisis de imágenes médicas nativo
✅ **Contexto Largo**: Hasta 1M tokens de contexto
✅ **Económico**: Gemini Flash es más económico que Claude
✅ **Thinking Mode**: Gemini 2.5 Pro puede "pensar" antes de responder
✅ **Rápido**: Gemini Flash es extremadamente rápido

---

## 🔑 API Key Proporcionada

```
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo
```

**Modelos Disponibles**:
- `gemini-2.5-pro-preview-03-25` - Máxima capacidad, thinking mode
- `gemini-2.5-flash-preview-05-20` - Rápido y económico (recomendado)

---

## 📦 Archivos Creados

### 1. **Servicio de Gemini AI**

**Ubicación**: `apps/doctors/src/services/gemini-ai-service.ts`

```typescript
import { getGeminiAIService } from '@/services/gemini-ai-service';

const geminiService = getGeminiAIService();

// Análisis de texto
const analysis = await geminiService.analyzeMedicalData({
  patientId: 'uuid',
  data: {
    symptoms: ['fiebre', 'tos'],
    vitals: { temperature: 38.5 },
  },
});

// Análisis con imágenes (feature única de Gemini)
const imageAnalysis = await geminiService.analyzeWithImage(
  request,
  imageBase64,
  'image/jpeg'
);
```

### 2. **Servicio Unificado de AI**

**Ubicación**: `apps/doctors/src/services/unified-ai-service.ts`

Abstrae el proveedor y selecciona automáticamente entre Anthropic y Google:

```typescript
import { getUnifiedAIService } from '@/services/unified-ai-service';

const aiService = getUnifiedAIService();

// Usa automáticamente el proveedor disponible
const analysis = await aiService.analyzeMedicalData(request);

// Comparar ambos proveedores
const comparison = await aiService.compareAnalysis(request);
console.log(`Agreement: ${comparison.comparison.agreement}%`);
```

### 3. **Feature Flags Actualizados**

**Ubicación**: `packages/shared/src/config/feature-flags.ts`

```typescript
import { featureFlags, getAIProvider } from '@autamedica/shared/config/feature-flags';

// Nuevo flags
featureFlags.AI_PROVIDER // 'anthropic' | 'google' | 'auto'
featureFlags.USE_ANTHROPIC_AI // true si Anthropic está configurado
featureFlags.USE_GOOGLE_AI // true si Google está configurado

// Helper function
const provider = getAIProvider(); // Devuelve 'anthropic' | 'google' | null
```

---

## ⚙️ Configuración

### Variables de Entorno

Actualizar archivos `.env`:

#### Desarrollo (`.env.development.example`)

```bash
# AI Services - Ambos proveedores disponibles
ANTHROPIC_API_KEY=sk-ant-your-dev-key
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo

# Selección de proveedor: 'anthropic' | 'google' | 'auto'
NEXT_PUBLIC_AI_PROVIDER=auto
```

#### Producción (`.env.production.example`)

```bash
# AI Services - Seleccionar proveedor
ANTHROPIC_API_KEY=sk-ant-your-production-key
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo

# Proveedor preferido (auto selecciona automáticamente)
NEXT_PUBLIC_AI_PROVIDER=auto

# Desactivar mocks
NEXT_PUBLIC_USE_MOCK_AI=false
```

### En Vercel/Cloudflare

**Settings > Environment Variables**:

```bash
# Para usar Google Gemini
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo
NEXT_PUBLIC_AI_PROVIDER=google

# O para auto-selección
NEXT_PUBLIC_AI_PROVIDER=auto
```

---

## 🚀 Uso en Producción

### Opción 1: Auto-Selección (Recomendado)

El sistema selecciona automáticamente el proveedor disponible:

```bash
# .env.production
NEXT_PUBLIC_AI_PROVIDER=auto
ANTHROPIC_API_KEY=sk-ant-key  # Prioridad 1
GOOGLE_AI_API_KEY=AIzaSy...   # Prioridad 2
```

**Lógica de selección**:
1. Si `NEXT_PUBLIC_AI_PROVIDER=anthropic` → Usa Claude
2. Si `NEXT_PUBLIC_AI_PROVIDER=google` → Usa Gemini
3. Si `NEXT_PUBLIC_AI_PROVIDER=auto`:
   - Verifica Anthropic primero
   - Si no está disponible, usa Google
   - Si ninguno, usa mocks

### Opción 2: Proveedor Específico

Forzar uso de Google Gemini:

```bash
NEXT_PUBLIC_AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo
```

### Opción 3: Ambos Proveedores

Configurar ambos y permitir cambio dinámico:

```typescript
import { getUnifiedAIService } from '@/services/unified-ai-service';

const aiService = getUnifiedAIService();

// Cambiar a Google
aiService.switchProvider('google');

// Análisis
const analysis = await aiService.analyzeMedicalData(request);

// Ver info de proveedores
const info = aiService.getProvidersInfo();
console.log('Proveedor actual:', info.current);
console.log('Disponibles:', info.providers);
```

---

## 🆚 Comparación: Claude vs Gemini

| Feature | Anthropic Claude | Google Gemini |
|---------|------------------|---------------|
| **Modelo Actual** | Claude 4.5 Sonnet | Gemini 2.5 Flash/Pro |
| **Contexto** | 200K tokens | 1M tokens |
| **Multimodal** | Sí (con configuración) | Sí (nativo) |
| **Thinking Mode** | No | Sí (Pro) |
| **Velocidad** | Rápido | Muy rápido (Flash) |
| **Costo** | $$$ | $$ (Flash) |
| **Especialización** | General + Código | General + Multimodal |

### Cuándo usar cada uno

**Usar Anthropic Claude**:
- Análisis de texto complejos
- Razonamiento médico detallado
- Generación de informes extensos

**Usar Google Gemini**:
- Análisis de imágenes médicas (rayos X, etc.)
- Contextos muy largos (historiales completos)
- Respuestas rápidas
- Reducir costos

---

## 💡 Casos de Uso

### Caso 1: Análisis de Texto Simple

```typescript
import { getUnifiedAIService } from '@/services/unified-ai-service';

const aiService = getUnifiedAIService();

const analysis = await aiService.analyzeMedicalData({
  patientId: 'patient-uuid',
  data: {
    symptoms: ['dolor de cabeza', 'fiebre', 'fatiga'],
    vitals: {
      temperature: 38.2,
      heartRate: 85,
      bloodPressure: '120/80',
    },
  },
  context: 'Paciente con historial de migrañas',
});

console.log('Resumen:', analysis.summary);
console.log('Severidad:', analysis.severity);
console.log('Recomendaciones:', analysis.recommendations);
```

### Caso 2: Análisis de Imágenes Médicas (Solo Gemini)

```typescript
import { getGeminiAIService } from '@/services/gemini-ai-service';

const geminiService = getGeminiAIService();

// Convertir imagen a base64
const imageBase64 = await imageToBase64(rayXImage);

const analysis = await geminiService.analyzeWithImage(
  {
    patientId: 'patient-uuid',
    data: {
      symptoms: ['dolor torácico'],
    },
    context: 'Radiografía de tórax',
  },
  imageBase64,
  'image/jpeg'
);

console.log('Hallazgos:', analysis.summary);
```

### Caso 3: Validación Cruzada

```typescript
import { getUnifiedAIService } from '@/services/unified-ai-service';

const aiService = getUnifiedAIService();

// Ejecutar análisis con ambos proveedores
const comparison = await aiService.compareAnalysis({
  patientId: 'patient-uuid',
  data: { /* datos del paciente */ },
});

if (comparison.comparison.agreement < 70) {
  console.warn('⚠️  Discrepancia entre proveedores');
  console.log('Diferencias:', comparison.comparison.differences);

  // Mostrar ambos análisis al médico para revisión
  console.log('Claude dice:', comparison.anthropic?.summary);
  console.log('Gemini dice:', comparison.google?.summary);
}
```

---

## 📊 Monitoreo

Ver qué proveedor está activo:

```bash
# En consola del navegador o logs del servidor
import { getUnifiedAIService } from '@/services/unified-ai-service';

const aiService = getUnifiedAIService();
const info = aiService.getProvidersInfo();

console.log(JSON.stringify(info, null, 2));
```

Output:
```json
{
  "current": "google",
  "providers": {
    "anthropic": {
      "available": false,
      "mode": "mock",
      "model": "mock-model"
    },
    "google": {
      "available": true,
      "mode": "production",
      "model": "gemini-2.5-flash-preview-05-20",
      "features": {
        "multimodal": true,
        "vision": true,
        "longContext": true,
        "thinking": false
      }
    }
  }
}
```

---

## 🔧 Instalación de Dependencias

```bash
cd /root/Autamedica

# Instalar SDK de Google Gemini
pnpm add @google/generative-ai

# Ya está incluido en package.json
```

---

## ✅ Checklist de Deployment

- [x] Servicio de Gemini AI creado
- [x] Servicio unificado creado
- [x] Feature flags actualizados
- [ ] API key de Google configurada en .env
- [ ] Variables de entorno en Vercel/Cloudflare
- [ ] Testing con ambos proveedores
- [ ] Documentación actualizada

---

## 🎯 Siguiente Paso

**Configurar la API key en tu entorno**:

```bash
cd /root/Autamedica

# Desarrollo
cp .env.development.example .env.local
nano .env.local

# Agregar:
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo
NEXT_PUBLIC_AI_PROVIDER=google

# Probar
pnpm dev
```

**En producción (Vercel/Cloudflare)**:

Settings > Environment Variables > Add:
```
GOOGLE_AI_API_KEY=AIzaSyDctTrQFsDylXfIP87lgkHqEo4EBNi7eNo
NEXT_PUBLIC_AI_PROVIDER=auto
```

---

## 📞 Soporte

- **Documentación Google AI**: https://ai.google.dev/docs
- **Modelos disponibles**: https://ai.google.dev/models
- **Precios**: https://ai.google.dev/pricing

¿Necesitas ayuda adicional con la integración?
