# 🏥 Sistema de Anamnesis Interactiva - Características Implementadas

## 📋 **Resumen**

Sistema completo de anamnesis interactiva basado en la metodología de Alvarez con storytelling médico educativo, diseñado para prevenir agotamiento cognitivo y garantizar respuestas de calidad.

---

## ✨ **Características Principales**

### 1️⃣ **Storytelling Médico Educativo**

Cada uno de los **13 pasos** incluye:

- 📖 **Historia introductoria**: Caso real que contextualiza la importancia
- 🎯 **Por qué se pregunta**: Explicación del razonamiento médico
- 👥 **Ejemplos clínicos**: Casos comparativos que muestran cómo cambia el diagnóstico
- 💡 **¿Sabías que...?**: Datos fascinantes sobre medicina y el cuerpo humano

**Beneficio**: El paciente APRENDE medicina mientras completa su anamnesis, convirtiendo una tarea tediosa en una experiencia educativa.

---

### 2️⃣ **Prevención de Agotamiento Cognitivo**

#### **Pausas Obligatorias Automáticas**

- ⏸️ **Frecuencia**: Cada 4 pasos completados
- ⏱️ **Duración**: 30 segundos obligatorios (countdown visible)
- 🧘 **Contenido de la pausa**:
  - Recordatorio de reflexionar sobre respuestas
  - Ejercicio de respiración
  - Recomendación de hidratarse
  - Explicación de por qué es importante la pausa

**Beneficio**: Previene que el usuario responda "en piloto automático", garantizando respuestas reflexivas y precisas.

#### **Diseño Visual de Pausas**

```
┌─────────────────────────────────────┐
│  ⏸️ Pausa para Reflexionar          │
│                                     │
│  ☕ [Icono animado con pulse]       │
│                                     │
│  Has completado X pasos             │
│                                     │
│  💭 Reflexionar - ¿Respondiste      │
│     con honestidad y detalle?       │
│  🧘 Respirar - Relaja tus hombros   │
│  💧 Hidratarte - Bebe agua          │
│  📝 Recordar - Cada detalle importa │
│                                     │
│  ⏱️ Countdown: 30s → 0s             │
│                                     │
│  [Botón deshabilitado hasta 0s]    │
└─────────────────────────────────────┘
```

---

### 3️⃣ **Validación de Calidad de Respuestas**

Componente `ValidadorRespuestas` que detecta:

#### **Respuestas No Válidas**
- ❌ Texto repetido (aaaa, bbbb)
- ❌ Teclado aleatorio (asdfgh, qwerty)
- ❌ Palabras sin sentido (test, prueba)

#### **Respuestas de Baja Calidad**
- ⚠️ Demasiado cortas (< 10 caracteres en textarea)
- ⚠️ Todo en MAYÚSCULAS (dificulta lectura)
- ⚠️ Exceso de signos (!!! ???)
- ⚠️ Texto largo sin puntuación

#### **Feedback en Tiempo Real**

```typescript
<ValidadorRespuestas
  value={userInput}
  fieldType="textarea"
  onWarning={(msg) => setWarning(msg)}
/>
```

Muestra advertencias amigables como:
- "💡 Tu respuesta parece muy breve. Intenta dar más detalles"
- "⚠️ Detectamos una respuesta no válida. Por favor, responde con información real"

**Beneficio**: Garantiza que las respuestas sean útiles para el médico, no solo "relleno" para avanzar.

---

### 4️⃣ **Auto-Guardado Inteligente**

#### **Sistema de Persistencia**

- 💾 **Auto-guardado automático**: Cada 30 segundos
- 💾 **Guardado al avanzar**: Al cambiar de paso
- 💾 **Guardado en pausa**: Antes de mostrar pausa cognitiva
- 💾 **Recuperación automática**: Al recargar la página

#### **Almacenamiento**

```typescript
localStorage.setItem('anamnesis_draft', JSON.stringify({
  data: anamnesisData,        // Todas las respuestas
  currentStep: currentStepIndex, // Paso actual
  lastSaved: new Date().toISOString()
}));
```

#### **Indicador Visual**

```
┌─────────────────────────────┐
│ 💾 Guardando...             │  ← Mientras guarda (azul)
│ ✓ Guardado 15s atrás        │  ← Confirmación (verde)
└─────────────────────────────┘
```

**Beneficio**: El usuario NUNCA pierde su progreso, puede pausar y retomar cuando quiera.

---

### 5️⃣ **Contenido Multimedia Educativo**

Componente `MediaEducativa` para videos e imágenes:

#### **Características**

- 🎥 Soporte para **videos** (YouTube, Vimeo, etc.)
- 🖼️ Soporte para **imágenes** educativas
- 📱 **Modal fullscreen** para mejor visualización
- ✅ **Marcador de "visto"** para tracking de progreso
- ⏱️ **Duración visible** en videos

#### **Ejemplo de Uso**

```typescript
<MediaEducativa
  type="video"
  url="https://youtube.com/embed/..."
  title="Cómo la edad cambia el diagnóstico médico"
  description="Aprende por qué los médicos razonan diferente según tu edad"
  duration="3:45"
/>
```

#### **Diseño Visual**

```
┌────────────────────────────────────────┐
│ [Thumbnail]  🎥 Video educativo        │
│              Cómo la edad cambia...    │
│   [3:45]     Aprende por qué los...   │
│              Click para ver →          │
│              ✓ Vista (si ya se vio)    │
└────────────────────────────────────────┘
```

**Beneficio**: Aumenta engagement y comprensión del usuario mediante contenido visual.

---

### 6️⃣ **Estructura Completa de 13 Pasos**

#### **Filiación (2 pasos)**
1. Edad - "El Primer Detective"
2. Ocupación - "Pistas Escondidas"

#### **Motivo de Consulta (1 paso)**
3. Síntoma Principal - Método ALICIA

#### **Antecedentes Personales (5 pasos)**
4. Enfermedades Previas
5. Medicamentos - Interacciones peligrosas
6. Alergias - Alergia real vs efecto secundario
7. (Parte de paso 8)

#### **Antecedentes Familiares (1 paso)**
7. Historia Familiar - Código genético

#### **Hábitos (1 paso)**
8. Estilo de Vida - Tabaco, alcohol, ejercicio, sueño, dieta

#### **Revisión por Sistemas (4 pasos)**
9. Cardiovascular
10. Respiratorio
11. Digestivo
12. Genitourinario

#### **Resumen Final (1 paso)**
13. Confirmación y Comentarios

---

## 🎯 **Tipos de Campos Implementados**

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `text` | Respuestas cortas | Nombre, ocupación |
| `number` | Valores numéricos | Edad, años fumando |
| `textarea` | Respuestas largas | Descripción de síntomas |
| `boolean` | Sí/No | ¿Fumas? ¿Tienes alergias? |
| `select` | Opción única | Frecuencia de alcohol |
| `multiselect` | Múltiples opciones | Enfermedades crónicas |
| `scale` | Escala 1-10 | Intensidad del dolor |
| `date` | Fechas | Fecha de nacimiento |

**Todos los campos soportan**:
- ✅ Validación (min, max, required)
- ✅ Tooltips educativos
- ✅ Campos condicionales (dependsOn)
- ✅ Notas educativas al completar

---

## 🔧 **Componentes Creados**

### **Componentes Visuales**
1. `StoryCard.tsx` - Muestra las historias educativas
2. `AnamnesisField.tsx` - Renderiza campos con validación
3. `MediaEducativa.tsx` - Videos/imágenes en modal
4. `PausaCognitiva.tsx` - Pausas obligatorias con countdown

### **Componentes de Validación**
5. `ValidadorRespuestas.tsx` - Valida calidad de respuestas

### **Datos**
6. `anamnesis-steps.ts` - Configuración de los 13 pasos
7. `anamnesis.ts` - Tipos TypeScript

### **Página Principal**
8. `(dashboard)/anamnesis/page.tsx` - Orquestador principal

---

## 📊 **Flujo de Usuario**

```
1. Pantalla de Bienvenida
   ↓
2. Explicación del sistema educativo
   ↓
3. [Comenzar Anamnesis]
   ↓
4. Paso 1: Historia + Video + Formulario
   ↓
5. [Guardar automático cada 30s]
   ↓
6. Paso 2, 3, 4...
   ↓
7. [Cada 4 pasos: PAUSA OBLIGATORIA 30s]
   ↓
8. Continuar pasos 5-8...
   ↓
9. [Otra pausa obligatoria]
   ↓
10. Continuar pasos 9-12...
    ↓
11. [Otra pausa obligatoria]
    ↓
12. Paso 13: Confirmación final
    ↓
13. [Finalizar] → Guardar en Supabase
    ↓
14. Borrar borrador local
    ↓
15. Mostrar confirmación
```

---

## 🚀 **Próximos Pasos (Pendientes)**

### **Alta Prioridad**
- [ ] **Integración con Supabase**
  - Crear tabla `anamnesis`
  - Guardar en BD al finalizar
  - Permitir editar anamnesis existente

- [ ] **Agregar URLs reales de videos**
  - Reemplazar placeholder YouTube
  - Crear/buscar videos educativos médicos
  - Agregar imágenes ilustrativas

### **Media Prioridad**
- [ ] **Validación de tiempo de respuesta**
  - Detectar respuestas muy rápidas
  - Advertir si el usuario no leyó la historia

- [ ] **Analytics de completitud**
  - Tracking de campos más abandonados
  - Tiempo promedio por paso
  - Tasa de completitud

### **Baja Prioridad**
- [ ] **Versión móvil optimizada**
- [ ] **Modo oscuro**
- [ ] **Traducción a otros idiomas**

---

## 💡 **Valor Único del Sistema**

### **Para el Paciente**
✅ Aprende medicina mientras completa su historia
✅ Entiende por qué cada pregunta es importante
✅ No pierde progreso gracias al auto-guardado
✅ Pausas lo mantienen concentrado y reflexivo
✅ Experiencia interactiva y multimedia

### **Para el Médico**
✅ Recibe información de ALTA CALIDAD (no respuestas automáticas)
✅ Paciente llega más educado a la consulta
✅ Ahorra tiempo en consulta (ya tiene historia completa)
✅ Paciente entiende mejor las recomendaciones médicas

### **Para la Plataforma**
✅ Diferenciador competitivo único
✅ Engagement alto (educación + salud)
✅ Base de datos médica de calidad
✅ Cumplimiento con estándares médicos (metodología Alvarez)

---

## 📚 **Referencias**

- Metodología de Anamnesis: **Libro de Alvarez**
- Prevención de fatiga cognitiva: Investigación en UX médico
- Validación de calidad: Mejores prácticas en formularios médicos

---

**Creado**: Octubre 2025
**Versión**: 1.0
**Estado**: ✅ Completo (pendiente integración Supabase)
