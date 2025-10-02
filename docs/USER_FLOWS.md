# Flujos de Usuario - Portal de Pacientes

## 📋 Tabla de Contenidos

- [1. Flujo de Anamnesis (Historia Clínica)](#1-flujo-de-anamnesis)
- [2. Flujo de Telemedicina (Videollamadas)](#2-flujo-de-telemedicina)
- [3. Flujo de Comunidad de Pacientes](#3-flujo-de-comunidad)
- [4. Flujo de Salud Preventiva](#4-flujo-de-salud-preventiva)

---

## 1. Flujo de Anamnesis (Historia Clínica)

### 🎯 Objetivo
Permitir a los pacientes completar su historia clínica de forma guiada, educativa y con auto-guardado automático.

### 📍 Ruta
```
http://localhost:3002/anamnesis
```

### 🔄 Flujo Paso a Paso

#### **Paso 1: Pantalla de Bienvenida**
```
┌─────────────────────────────────────────┐
│    🏥 Tu Historia Clínica               │
│                                         │
│  Vamos a completar tu historia clínica │
│  que es la base de diagnósticos        │
│                                         │
│  🔒 Configuración de Privacidad:       │
│  ○ Compartida con médicos AutaMedica   │
│  ○ Privada - Solo uso personal         │
│                                         │
│  ⏱️ Tiempo estimado: 15-20 minutos     │
│  💾 Se guarda automáticamente           │
│                                         │
│  [▶️ Comenzar mi Historia Clínica]     │
└─────────────────────────────────────────┘
```

**Acciones del sistema:**
- Carga configuración de privacidad desde localStorage
- Verifica si existe anamnesis previa en Supabase
- Si existe, carga progreso guardado

#### **Paso 2: Completar Secciones (13 en total)**

**Orden de secciones:**
1. Datos Personales
2. Contactos de Emergencia
3. Historia Médica
4. Historia Familiar
5. Alergias
6. Medicamentos Actuales
7. Condiciones Crónicas
8. Historia Quirúrgica
9. Hospitalizaciones
10. Historia Ginecológica (si aplica)
11. Estilo de Vida
12. Salud Mental
13. Consentimientos

**Para cada sección:**

```
┌─────────────────────────────────────────┐
│  Progreso: ████████░░░░░░ 60% (8/13)   │
│                                         │
│  [Datos] [Emergencia] [Historia] ...   │
│                                         │
│  📝 Historia Médica                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  💡 ¿Por qué es importante?             │
│  [Card educativa con explicación]      │
│                                         │
│  📋 Ahora cuéntanos sobre ti            │
│  ┌─────────────────────────────────┐   │
│  │ [Campos del formulario]         │   │
│  │ • Condiciones médicas           │   │
│  │ • Alergias                      │   │
│  │ • Medicamentos                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [← Anterior]  [Siguiente →]           │
└─────────────────────────────────────────┘
```

**Acciones del sistema (cada 30 segundos):**
```typescript
// Auto-guardado automático
await updateSection(sectionKey, anamnesisData);
// Muestra: "💾 Guardando..."
// Luego: "✓ Guardado 3s atrás"
```

#### **Paso 3: Pausas Cognitivas**

Cada 4 secciones completadas:
```
┌─────────────────────────────────────────┐
│         ☕ Pausa Cognitiva               │
│                                         │
│  Has completado 4 secciones.            │
│  ¡Excelente progreso!                   │
│                                         │
│  💡 Tip: Tómate un momento para         │
│  reflexionar antes de continuar         │
│                                         │
│  [✓ Continuar]                          │
└─────────────────────────────────────────┘
```

#### **Paso 4: Finalización**

```
┌─────────────────────────────────────────┐
│     📋 Resumen de Anamnesis             │
│                                         │
│  ✅ Condiciones Médicas: 3              │
│  ✅ Alergias: 2                         │
│  ✅ Historia Familiar: 5 condiciones    │
│                                         │
│  Privacidad: Compartida con médicos     │
│                                         │
│  [✅ Completar Anamnesis]               │
└─────────────────────────────────────────┘
```

**Acciones del sistema al completar:**
```typescript
// 1. Crear o actualizar anamnesis
await createAnamnesis({
  status: 'completed',
  completion_percentage: 100,
  privacy_accepted: privacySetting === 'shared',
  terms_accepted: true
});

// 2. Guardar última sección
await updateSection(lastSection, data);

// 3. Limpiar borrador local
localStorage.removeItem('anamnesis_draft');

// 4. Guardar copia final
localStorage.setItem('anamnesis_final', JSON.stringify(finalData));
```

### 📊 Datos Guardados en Supabase

**Tabla: `anamnesis`**
```sql
INSERT INTO anamnesis (
  patient_id,
  status,
  completion_percentage,
  locked,
  privacy_accepted,
  terms_accepted
) VALUES (
  'user-uuid',
  'completed',
  100,
  false,
  true,
  true
);
```

**Tabla: `anamnesis_sections`**
```sql
INSERT INTO anamnesis_sections (
  anamnesis_id,
  section,
  data,
  completed,
  completed_at
) VALUES (
  'anamnesis-uuid',
  'personal_data',
  '{"name": "...", "age": "..."}',
  true,
  NOW()
);
-- Se repite para cada una de las 13 secciones
```

---

## 2. Flujo de Telemedicina (Videollamadas)

### 🎯 Objetivo
Facilitar consultas médicas por videollamada con registro automático de eventos.

### 📍 Ruta
```
http://localhost:3002/call/[roomId]
```

### 🔄 Flujo Paso a Paso

#### **Paso 1: Preparación de Llamada**

```
┌─────────────────────────────────────────┐
│   🎥 Preparando Videollamada            │
│                                         │
│   Dr. García - Cardiología              │
│   Sesión: ABC-123                       │
│                                         │
│   🔍 Verificando permisos...            │
│   📹 Solicitando acceso a cámara        │
│   🎤 Solicitando acceso a micrófono     │
│                                         │
└─────────────────────────────────────────┘
```

**Acciones del sistema:**
```typescript
// 1. Verificar autenticación
const { session, loading } = useAuth();

// 2. Crear sesión en Supabase (si no existe)
const telemedicine = useTelemedicine(sessionId);

// 3. Solicitar permisos de MediaStream
const videoCall = useVideoCall();
await videoCall.startCall();
```

#### **Paso 2: Videollamada Activa**

```
┌───────────────────────────────────────────┐
│  [Video del doctor - pantalla completa]   │
│                                           │
│  ┌─────────────────┐                      │
│  │  Video propio   │  (esquina)           │
│  │  (paciente)     │                      │
│  └─────────────────┘                      │
│                                           │
│  🟢 HD • En vivo • 00:15:32               │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 🎤 🎥 📺 📱 ⛔                       │ │
│  │ Mic Cam Share Info End              │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  👨‍⚕️ Dr. García • Cardiología             │
└───────────────────────────────────────────┘
```

**Controles disponibles:**
- 🎤 Toggle audio (mute/unmute)
- 🎥 Toggle video (on/off)
- 📺 Compartir pantalla
- 📱 Ver información de paciente
- ⛔ Finalizar llamada

**Eventos registrados automáticamente:**
```typescript
// Al iniciar
useEffect(() => {
  if (videoCall.callStatus === 'live') {
    telemedicine.logEvent('call_started', 'Video call initiated successfully');
  }
}, [videoCall.callStatus]);

// Al cambiar estado de video
await telemedicine.logEvent('video_toggled', 'Video disabled');

// Al cambiar estado de audio
await telemedicine.logEvent('audio_toggled', 'Audio muted');

// Al compartir pantalla
await telemedicine.logEvent('screen_share_started', 'Screen sharing initiated');
```

#### **Paso 3: Finalización de Llamada**

```
┌─────────────────────────────────────────┐
│   Videollamada Finalizada               │
│                                         │
│   ⏱️ Duración: 15 minutos 32 segundos   │
│   📊 Calidad: HD                        │
│   ✅ Grabación guardada                 │
│                                         │
│   [← Volver al Dashboard]               │
└─────────────────────────────────────────┘
```

**Acciones del sistema al finalizar:**
```typescript
// 1. Registrar evento de fin
await telemedicine.logEvent('call_ended', 'Video call ended by patient');

// 2. Liberar recursos de MediaStream
videoCall.endCall();

// 3. Actualizar sesión en Supabase
await supabase
  .from('telemedicine_sessions')
  .update({
    status: 'ended',
    actual_end: new Date().toISOString(),
    duration_seconds: calculateDuration()
  })
  .eq('id', sessionId);
```

### 📊 Datos Guardados en Supabase

**Tabla: `telemedicine_sessions`**
```sql
INSERT INTO telemedicine_sessions (
  appointment_id,
  patient_id,
  doctor_id,
  status,
  signaling_room_id,
  scheduled_start,
  actual_start,
  actual_end,
  duration_seconds,
  connection_quality
) VALUES (
  'appointment-uuid',
  'patient-uuid',
  'doctor-uuid',
  'ended',
  'room-abc-123',
  '2025-10-02 10:00:00',
  '2025-10-02 10:02:15',
  '2025-10-02 10:17:47',
  932,
  'good'
);
```

**Tabla: `session_events`**
```sql
-- Múltiples registros de eventos
INSERT INTO session_events (session_id, event_type, details) VALUES
  ('session-uuid', 'call_started', 'Video call initiated successfully'),
  ('session-uuid', 'video_toggled', 'Video disabled'),
  ('session-uuid', 'audio_toggled', 'Audio muted'),
  ('session-uuid', 'call_ended', 'Video call ended by patient');
```

---

## 3. Flujo de Comunidad de Pacientes

### 🎯 Objetivo
Conectar pacientes con condiciones similares para compartir experiencias y apoyo.

### 📍 Ruta
```
http://localhost:3002/community
```

### 🔄 Flujo Paso a Paso

#### **Paso 1: Vista Principal de Comunidad**

```
┌───────────────────────────────────────────────┐
│  💬 Comunidad                                 │
│  Comparte experiencias y apóyate en otros    │
│                                               │
│  🔍 [Buscar en la comunidad...]               │
│  [+ Nueva publicación]                        │
│                                               │
│  Filtros: [Todos] [Mis grupos] [Popular]     │
│                                               │
│  🏷️ Grupos Recomendados                      │
│  ┌─────────────────────────────────────────┐ │
│  │ 💉 Diabetes Tipo 2    1,200 miembros   │ │
│  │ ❤️ Hipertensión        850 miembros    │ │
│  │ 🧠 Salud Mental        620 miembros    │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  📝 Feed de Publicaciones                     │
│  ┌─────────────────────────────────────────┐ │
│  │ María, 45 años • Diabetes Tipo 2        │ │
│  │ Hace 2 horas                             │ │
│  │                                          │ │
│  │ ¿Alguien más tiene bajones de azúcar    │ │
│  │ después del ejercicio?                   │ │
│  │                                          │ │
│  │ 👍 45  💬 23 respuestas  🔖 Guardar      │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

**Carga de datos al montar:**
```typescript
useEffect(() => {
  // Cargar grupos
  loadGroups();

  // Cargar posts con filtro inicial
  loadPosts({ sort_by: 'recent' });
}, []);
```

#### **Paso 2: Ver Grupo Específico**

```
┌───────────────────────────────────────────────┐
│  💉 Diabetes Tipo 2                           │
│  1,200 miembros • Público                     │
│                                               │
│  Manejo de diabetes y control glucémico      │
│                                               │
│  [✓ Unido] [⋮ Más opciones]                  │
│                                               │
│  📋 Reglas del Grupo:                         │
│  • Respeta a todos los miembros              │
│  • Comparte experiencias, no consejos médicos│
│  • Mantén un tono positivo                   │
│                                               │
│  📝 Publicaciones del Grupo                   │
│  [Ver todas las publicaciones]                │
└───────────────────────────────────────────────┘
```

#### **Paso 3: Crear Publicación**

```
┌───────────────────────────────────────────────┐
│  Nueva Publicación                            │
│                                               │
│  Grupo: [Diabetes Tipo 2 ▼]                  │
│                                               │
│  Título:                                      │
│  [____________________________________]       │
│                                               │
│  Contenido:                                   │
│  [                                     ]      │
│  [                                     ]      │
│  [                                     ]      │
│                                               │
│  🔒 [✓] Publicar como anónimo                │
│                                               │
│  [Cancelar] [Publicar]                        │
└───────────────────────────────────────────────┘
```

**Acciones del sistema al publicar:**
```typescript
const newPost = await createPost({
  group_id: selectedGroup.id,
  title: postTitle,
  content: postContent,
  is_anonymous: isAnonymous,
});

// El sistema automáticamente:
// 1. Establece moderation_status: 'pending_review'
// 2. Asigna author_id del usuario actual
// 3. Crea author_display_name (real o anónimo)
```

#### **Paso 4: Interactuar con Publicaciones**

**Reacciones:**
```typescript
await addReaction(postId, 'heart'); // ❤️
await addReaction(postId, 'hug');   // 🤗
await addReaction(postId, 'helpful'); // 💡
```

**Comentarios:**
```typescript
await addComment(postId, {
  content: "Gracias por compartir tu experiencia...",
  is_anonymous: false
});
```

### 📊 Datos Guardados en Supabase

**Tabla: `community_posts`**
```sql
INSERT INTO community_posts (
  group_id,
  author_id,
  author_display_name,
  is_anonymous,
  title,
  content,
  moderation_status
) VALUES (
  'group-uuid',
  'user-uuid',
  'María G.',
  false,
  '¿Bajones de azúcar después del ejercicio?',
  'Me pasa hace una semana y no sé si es normal...',
  'pending_review'
);
```

**Tabla: `post_reactions`**
```sql
INSERT INTO post_reactions (
  post_id,
  user_id,
  reaction_type
) VALUES (
  'post-uuid',
  'user-uuid',
  'heart'
);
```

**Realtime Subscription:**
```typescript
// Los posts nuevos aprobados aparecen automáticamente
useEffect(() => {
  const channel = supabase
    .channel('community_posts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'community_posts',
      filter: 'moderation_status=eq.approved',
    }, (payload) => {
      setPosts(prev => [payload.new, ...prev]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

---

## 4. Flujo de Salud Preventiva

### 🎯 Objetivo
Ayudar a los pacientes a mantener exámenes preventivos al día.

### 📍 Ruta
```
http://localhost:3002/preventive-health
```

### 🔄 Flujo Simplificado

```
┌───────────────────────────────────────────────┐
│  🏥 Salud Preventiva                          │
│                                               │
│  📊 Exámenes Pendientes (3)                   │
│  ┌─────────────────────────────────────────┐ │
│  │ ⚠️ Mamografía                             │ │
│  │    Vencida hace 2 meses                  │ │
│  │    [Agendar cita]                        │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ✅ Exámenes Completados (12)                │
│  📅 Próximos Exámenes (5)                    │
│                                               │
│  🎯 Objetivos de Salud                       │
│  • Perder 5kg - 60% completado               │
│  • Ejercicio 3x/semana - En progreso         │
└───────────────────────────────────────────────┘
```

**Datos manejados por `usePatientScreenings` hook (ya existente)**

---

## 🔐 Consideraciones de Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS activas:

```sql
-- Ejemplo: Anamnesis
CREATE POLICY "Users can view own anamnesis" ON anamnesis
  FOR SELECT USING (auth.uid() = patient_id);

-- Ejemplo: Posts de comunidad
CREATE POLICY "Users can view approved posts" ON community_posts
  FOR SELECT USING (moderation_status = 'approved');
```

### Privacidad de Datos

- ✅ Anamnesis: Configuración de privacidad respetada
- ✅ Comunidad: Opción de anonimato disponible
- ✅ Videollamadas: Consentimiento explícito para grabación
- ✅ Salud preventiva: Solo visible para el paciente y su equipo de cuidado

---

## 📱 Testing de Flujos

Para probar cada flujo:

```bash
# 1. Ejecutar servidor de desarrollo
cd /root/altamedica-reboot-fresh
pnpm dev --filter @autamedica/patients

# 2. Abrir navegador
http://localhost:3002

# 3. Ejecutar script de verificación
node scripts/verify-integration.mjs
```

---

## 🎯 Métricas de Éxito

- **Anamnesis**: Tasa de completitud > 80%
- **Telemedicina**: Calidad de conexión > 85% "good" o "excellent"
- **Comunidad**: Tasa de moderación < 24 horas
- **Salud Preventiva**: Exámenes al día > 70%

---

Última actualización: 2 de octubre de 2025
