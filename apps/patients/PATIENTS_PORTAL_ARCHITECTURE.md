# 🏥 Portal de Pacientes AutaMedica - Arquitectura Completa

**Versión:** 2.0
**Fecha:** 2 Octubre 2025
**Enfoque:** Telemedicina como centro de la experiencia

---

## 🎯 Filosofía del Diseño

> **"El paciente como protagonista de su salud"**

- ✅ **Telemedicina central**: El video es el corazón de la plataforma
- ✅ **Sin duplicados**: Cada dato en su lugar lógico
- ✅ **Comunidad activa**: Pacientes que se apoyan entre sí
- ✅ **Transparencia**: Visibilidad de quién accede a tu información
- ✅ **Gamificación**: Motivación para cuidar la salud
- ✅ **IA útil**: Asistente que realmente ayuda

---

## 📐 Layout Principal (3 Columnas Horizontal)

```
┌──────────┬─────────────────────────────────┬──────────────────────┐
│ SIDEBAR  │         CENTRO (Video)          │   PANEL DINÁMICO     │
│  (12%)   │            (58%)                │       (30%)          │
├──────────┼─────────────────────────────────┼──────────────────────┤
│          │                                 │                      │
│ [Menú]   │  ┌─────────────────────────┐   │ [Contexto intelig.]  │
│          │  │                         │   │                      │
│ Iconos + │  │    ÁREA DE VIDEO        │   │ Tabs según vista:    │
│ Texto    │  │    (Protagonista)       │   │                      │
│          │  │                         │   │ • Video: Chat/Notas  │
│ Secciones│  │                         │   │ • Inicio: Comunidad  │
│ princip. │  │                         │   │ • Citas: Preguntas   │
│          │  └─────────────────────────┘   │ • Historia: Gráficos │
│          │                                 │                      │
│ 🤖 ALTA  │  [Controles de Videollamada]    │ ⚠️ Alertas activas   │
│ (flotante│                                 │ 🏆 Progreso gamif.   │
│  abajo)  │  [Área contextual dinámica]     │ ⚡ Acciones rápidas  │
│          │                                 │                      │
└──────────┴─────────────────────────────────┴──────────────────────┘
```

---

## 🗂️ Arquitectura de Información (Sin Duplicados)

### 📊 **INICIO (Dashboard)**
**Propósito:** Vista rápida del estado de salud + acceso a telemedicina

**Contenido:**
- Video de telemedicina (centro, siempre visible)
- Próxima cita inmediata (solo la más cercana)
- Medicamentos HOY (recordatorio con hora)
- Posts recientes de comunidad
- Centro de acciones rápidas
- Insights IA del día

**Panel derecho:**
- 💬 Comunidad (posts relevantes)
- 🏆 Progreso gamificado
- ⚡ Acciones rápidas
- 🔔 Notificaciones (3 últimas)

---

### 📋 **HISTORIA CLÍNICA**
**Propósito:** Registro completo médico del paciente

**Contenido:**
```
├─ 🩺 Signos Vitales
│  ├─ Presión arterial (histórico + gráficos)
│  ├─ Frecuencia cardíaca
│  ├─ Temperatura
│  ├─ Saturación O2
│  ├─ Peso / IMC
│  └─ 📊 Tendencias temporales (7/30/90 días)
│
├─ ⚠️ Alergias
│  ├─ Medicamentosas (destacadas en rojo)
│  ├─ Alimentarias
│  ├─ Ambientales
│  └─ Severidad + reacción
│
├─ 💊 Medicamentos
│  ├─ Activos actuales
│  ├─ Histórico (suspendidos)
│  ├─ Dosis + frecuencia
│  ├─ Prescriptor + fecha
│  └─ 📈 Adherencia (% cumplimiento)
│
├─ 🏥 Condiciones Crónicas
│  ├─ Diagnóstico
│  ├─ Fecha de inicio
│  ├─ Estado (activa/controlada/resuelta)
│  └─ Tratamiento actual
│
├─ 🔪 Cirugías Previas
│  ├─ Procedimiento
│  ├─ Fecha
│  ├─ Cirujano
│  └─ Complicaciones
│
├─ 👨‍👩‍👧 Antecedentes Familiares
│  ├─ Parentesco
│  ├─ Condición
│  └─ Edad de diagnóstico
│
└─ 👁️ VISIBILIDAD Y PRIVACIDAD ← NUEVO
   ├─ 📊 Vistas de tu historial:
   │  ├─ Dr. García (Cardiología) - 12 veces
   │  ├─ Dra. Martínez (Medicina General) - 8 veces
   │  ├─ Empresa: TechCorp RRHH - 2 veces ✅ Consentimiento
   │  └─ [Ver log completo de accesos]
   │
   ├─ 🔒 Permisos activos:
   │  ├─ Equipo médico: Acceso total
   │  ├─ TechCorp (Empresa): Solo chequeos preventivos
   │  └─ Familiar (Juan Torres): Solo emergencias
   │
   └─ [Gestionar permisos]
```

**Panel derecho (Historia Clínica):**
- 📈 Gráficos de evolución
- 🔍 Buscador de registros
- 📤 Exportar PDF
- 👁️ Log de accesos (expandido)

---

### ❤️ **SALUD REPRODUCTIVA**
**Propósito:** Seguimiento ginecológico y salud sexual

**Contenido:**
- 🩸 Ciclo menstrual (calendario + tracking)
- 🤰 Control prenatal (si aplica)
- 💊 Métodos anticonceptivos
- 🏥 IVE/ILE (Ley 27.610 Argentina)
- 📊 Síntomas relacionados
- 📅 Citas ginecológicas

---

### 🛡️ **SALUD PREVENTIVA**
**Propósito:** Chequeos programados y prevención

**Contenido:**
- 💉 Vacunas (carnet digital)
- 🔬 Screening por edad/género:
  - Mamografía (mujeres >40)
  - Colonoscopía (>50)
  - PSA (hombres >50)
  - Densitometría ósea
- ⚠️ Factores de riesgo identificados
- 📅 Próximos chequeos sugeridos
- 📚 Educación preventiva personalizada

---

### 📅 **CITAS**
**Propósito:** Gestión completa de consultas médicas

**Contenido:**
```
├─ 📆 Agenda Completa
│  ├─ Próximas citas
│  ├─ Historial de consultas
│  └─ Calendario mensual
│
├─ ❓ PREGUNTAS PARA EL MÉDICO ← NUEVO
│  ├─ Lista de preguntas preparadas
│  ├─ IA sugiere preguntas relevantes
│  ├─ Checklist durante videollamada
│  ├─ Historial de preguntas/respuestas
│  └─ Exportar PDF pre/post consulta
│
├─ 📝 Notas Post-Consulta
│  ├─ Indicaciones del médico
│  ├─ Recetas emitidas
│  ├─ Estudios solicitados
│  └─ Próxima cita sugerida
│
└─ 🎯 Preparación Pre-Consulta
   ├─ Estudios a llevar
   ├─ Síntomas a mencionar
   └─ Medicamentos actuales
```

**Panel derecho (Citas):**
- ❓ Banco de preguntas guardadas
- 📋 Checklist de preparación
- 🔔 Recordatorios automáticos

---

### 📹 **VIDEOLLAMADA**
**Propósito:** Telemedicina de alta calidad

**Estados de la Videollamada:**

#### 🟡 **Sala de Espera**
```tsx
┌─────────────────────────────────┐
│  Dr. García se conectará pronto │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   [Avatar del médico]   │   │
│  │   [Animación de pulso]  │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Posición en cola: 1            │
│  Tiempo estimado: 5 min         │
│                                 │
│  ✅ Cámara: Funcionando         │
│  ✅ Micrófono: OK               │
│  ✅ Conexión: Buena (HD)        │
│                                 │
│  [Probar audio/video]           │
└─────────────────────────────────┘
```

#### 🟢 **Videollamada Activa**
```tsx
┌─────────────────────────────────────────────┐
│  [Video del médico - 70% vertical]          │
│                                             │
│                                             │
│     ┌────────────────────┐                 │
│     │  TU CÁMARA (PiP)   │  ← Draggable    │
│     │  [Video paciente]  │                 │
│     └────────────────────┘                 │
│                                             │
│  🔴 Grabando  📶 HD  ⏱️ 12:35              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🎤  📹  🖥️  💬  📄  ⚙️  ❌              │
│  [Controles flotantes con glassmorphism]    │
└─────────────────────────────────────────────┘
```

**Controles Disponibles:**
- 🎤 Silenciar/Activar micrófono
- 📹 Activar/Desactivar cámara
- 🖥️ Compartir pantalla
- 💬 Chat en vivo (con doctor)
- 📄 Compartir documentos
- ⚙️ Configuración de video/audio
- ❌ Finalizar llamada

**Panel derecho (Durante video):**
- 💬 Chat en tiempo real
- 📋 Notas colaborativas
- 📄 Documentos compartidos
- ❓ Checklist de preguntas

---

### 📊 **MIS RESULTADOS** ← NUEVO
**Propósito:** Centralizar todos los estudios médicos

**Contenido:**
```
├─ 🧪 LABORATORIO
│  ├─ Hemograma completo
│  ├─ Perfil bioquímico
│  ├─ Perfil lipídico
│  ├─ Hormonas
│  └─ Marcadores tumorales
│
├─ 🔬 IMÁGENES
│  ├─ Radiografías
│  ├─ Tomografías (TAC)
│  ├─ Resonancias (RMN)
│  ├─ Ecografías
│  └─ Mamografías
│
├─ 📋 INFORMES MÉDICOS
│  ├─ Informes de especialistas
│  ├─ Epicrisis hospitalarias
│  ├─ Certificados médicos
│  └─ Órdenes de estudios
│
├─ 📈 COMPARATIVA TEMPORAL
│  ├─ Gráficos de evolución
│  ├─ Alertas de valores anormales
│  └─ Tendencias identificadas por IA
│
└─ 💡 INSIGHTS IA
   ├─ "Glucosa subió 8% vs hace 3 meses"
   ├─ "Colesterol en descenso (mejora)"
   └─ "Recomendar ajuste en metformina"
```

**Features:**
- 📷 OCR para escanear resultados físicos
- 🚨 Alertas automáticas si fuera de rango
- 📊 Comparativas visuales
- 📤 Exportar informe consolidado
- 🔔 Notificar al médico si crítico

---

### 👥 **EQUIPO MÉDICO**
**Propósito:** Gestión del equipo de salud

**Contenido:**
- 👨‍⚕️ Médico de cabecera
- 🏥 Especialistas consultados
- 👩‍⚕️ Enfermeras asignadas
- 💊 Farmacéutico de confianza
- 🔄 Solicitar interconsulta
- ⭐ Valorar atención recibida

---

### 💬 **COMUNIDAD** ← NUEVO
**Propósito:** Red de apoyo entre pacientes

**Estructura:**
```
├─ 🏷️ GRUPOS POR CONDICIÓN
│  ├─ Diabetes Tipo 2 (1.2k miembros)
│  ├─ Hipertensión (850 miembros)
│  ├─ Ansiedad/Depresión (620 miembros)
│  ├─ Cáncer de mama (340 miembros)
│  └─ [Ver todos los grupos]
│
├─ 📝 PUBLICACIONES
│  ├─ Crear post (texto/imagen)
│  ├─ Hacer pregunta
│  ├─ Compartir experiencia
│  └─ Recurso útil
│
├─ 🎖️ SISTEMA DE AYUDA
│  ├─ Usuarios verificados (médicos)
│  ├─ Helpers (pacientes activos)
│  ├─ Moderadores
│  └─ Gamificación: puntos por ayudar
│
├─ 🔍 BÚSQUEDA INTELIGENTE
│  ├─ Por palabra clave
│  ├─ Por condición
│  ├─ Posts populares
│  └─ Recursos verificados
│
└─ 🔒 PRIVACIDAD
   ├─ Modo anónimo (opcional)
   ├─ Control de visibilidad
   └─ Reportar contenido inapropiado
```

**Features:**
- ✅ Auto-asignación a grupos según diagnóstico
- ✅ Moderación médica profesional
- ✅ Badges para usuarios activos
- ✅ Recursos verificados por médicos
- ✅ Notificaciones personalizadas

**Ejemplo de Post:**
```
┌────────────────────────────────────────┐
│ 👤 María, 45 años (Diabetes Tipo 2)    │
│ Hace 2 horas                           │
├────────────────────────────────────────┤
│                                        │
│ "¿Alguien más tiene bajones de azúcar │
│  después del ejercicio? Me pasa hace   │
│  una semana y no sé si es normal..."   │
│                                        │
│ 💬 23 respuestas  👍 45  🔖 Guardar    │
│                                        │
│ [Ver respuestas]                       │
└────────────────────────────────────────┘
```

---

## 🆕 Funcionalidades Innovadoras

### 1. 🤖 **ASISTENTE IA "ALTA"**
**Botón flotante permanente (bottom-right)**

**Capacidades:**
- 💬 Chat conversacional sobre tu salud
- 📊 Consultar datos del historial
- 💊 Recordatorios de medicamentos
- 📈 Explicar resultados de laboratorio
- 🔍 Buscar en comunidad
- 📅 Agendar citas
- ❓ Responder preguntas médicas básicas

**Ejemplo de conversación:**
```
Tú: ¿Cuál era mi presión ayer?

ALTA: Tu última medición fue ayer a las
      8:30 AM: 120/80 mmHg. Está dentro
      del rango normal para ti.

      ¿Quieres ver la tendencia semanal?

Tú: Sí

ALTA: [Muestra gráfico de 7 días]
      Tu presión ha estado estable esta
      semana. ¡Sigue así! 👍
```

---

### 2. 🏆 **GAMIFICACIÓN DE SALUD**

**Sistema de Progreso:**
```
├─ 🔥 RACHAS (Streaks)
│  ├─ Días consecutivos tomando meds
│  ├─ Días sin síntomas
│  ├─ Semanas con ejercicio
│  └─ Registro diario de signos vitales
│
├─ 💎 NIVELES
│  ├─ Bronce (0-500 pts)
│  ├─ Plata (500-2000 pts)
│  ├─ Oro (2000-5000 pts)
│  └─ Platino (5000+ pts)
│
├─ ⭐ PUNTOS
│  ├─ +10 pts: Tomar medicamento a tiempo
│  ├─ +20 pts: Registrar signos vitales
│  ├─ +50 pts: Completar chequeo preventivo
│  ├─ +30 pts: Ayudar en comunidad
│  └─ +100 pts: Cumplir meta semanal
│
├─ 🏅 LOGROS (Badges)
│  ├─ "Guerrero Cardiovascular" (30 días sin síntomas)
│  ├─ "Maestro de Adherencia" (90% meds a tiempo)
│  ├─ "Comunidad Helper" (50 respuestas útiles)
│  ├─ "Prevención Oro" (todos los screenings al día)
│  └─ "Meta Alcanzada" (objetivo de salud cumplido)
│
└─ 🎁 BENEFICIOS POR NIVEL
   ├─ Plata: Consultas prioritarias
   ├─ Oro: Descuentos en estudios
   └─ Platino: Acceso a eventos exclusivos
```

**Visualización:**
```
┌─────────────────────────────────────┐
│ 🏆 TU PROGRESO                      │
├─────────────────────────────────────┤
│                                     │
│ 🔥 RACHA ACTUAL: 15 días            │
│ ████████████████░░░░  15/30         │
│                                     │
│ 💎 NIVEL: PLATA                     │
│ ████████████░░░░  1,250/2,000 pts   │
│                                     │
│ 🎯 METAS SEMANALES                  │
│ ✅ Medicamentos      7/7            │
│ ✅ Registrar PA      5/7            │
│ ⏳ Ejercicio 30min   3/5            │
│                                     │
│ 🏅 LOGROS RECIENTES                 │
│ 🥇 Guerrero Cardiovascular          │
│ 🥈 Maestro Adherencia               │
│                                     │
│ [Ver todos los logros]              │
└─────────────────────────────────────┘
```

---

### 3. 👁️ **TRANSPARENCIA Y PRIVACIDAD** ← NUEVO

**Log de Accesos al Historial:**
```
┌────────────────────────────────────────────┐
│ 👁️ VISIBILIDAD DE TU HISTORIAL CLÍNICO    │
├────────────────────────────────────────────┤
│                                            │
│ 📊 TOTAL DE ACCESOS: 28 veces              │
│                                            │
│ 👨‍⚕️ EQUIPO MÉDICO (22 accesos)            │
│ ┌────────────────────────────────────────┐ │
│ │ Dr. García (Cardiología)               │ │
│ │ • 12 veces                             │ │
│ │ • Última: Ayer 10:30 AM                │ │
│ │ • Secciones vistas: Signos vitales,    │ │
│ │   Medicamentos, Laboratorios           │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Dra. Martínez (Medicina General)       │ │
│ │ • 8 veces                              │ │
│ │ • Última: 15 Ene 2:00 PM               │ │
│ │ • Secciones vistas: Historia completa  │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 🏢 EMPRESAS (4 accesos) ✅ Consentimiento  │
│ ┌────────────────────────────────────────┐ │
│ │ TechCorp - RRHH                        │ │
│ │ • 2 veces                              │ │
│ │ • Última: 10 Ene 9:00 AM               │ │
│ │ • Secciones permitidas:                │ │
│ │   - Chequeos preventivos ✅            │ │
│ │   - Vacunas ✅                         │ │
│ │   - Historia clínica ❌                │ │
│ │ • [Revocar acceso] [Modificar permisos]│ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 👨‍👩‍👧 FAMILIARES (2 accesos) ✅ Autorizado  │
│ ┌────────────────────────────────────────┐ │
│ │ Juan Torres (Esposo)                   │ │
│ │ • 2 veces                              │ │
│ │ • Última: Ayer 8:00 PM                 │ │
│ │ • Permisos: Solo emergencias           │ │
│ │ • [Revocar acceso]                     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 🔒 GESTIÓN DE PERMISOS                     │
│ [+ Dar acceso a nuevo médico/empresa]      │
│ [Ver log completo de auditoría]            │
│ [Descargar reporte de accesos (PDF)]       │
└────────────────────────────────────────────┘
```

**Consentimiento Informado para Empresas:**
```
┌────────────────────────────────────────┐
│ 🏢 SOLICITUD DE ACCESO A HISTORIAL     │
│ TechCorp - Departamento RRHH           │
├────────────────────────────────────────┤
│                                        │
│ La empresa TechCorp solicita acceso a  │
│ tu historial médico para:              │
│                                        │
│ ✅ Chequeos médicos ocupacionales      │
│ ✅ Certificados de aptitud             │
│ ✅ Seguimiento preventivo              │
│                                        │
│ 📋 DATOS QUE PODRÁN VER:               │
│ ☑️ Chequeos preventivos                │
│ ☑️ Vacunas                             │
│ ☐ Historia clínica completa            │
│ ☐ Medicamentos                         │
│ ☐ Condiciones crónicas                 │
│                                        │
│ ⏰ DURACIÓN DEL ACCESO:                │
│ [ ] 3 meses  [✓] 6 meses  [ ] 1 año   │
│                                        │
│ 🔔 NOTIFICACIONES:                     │
│ ✅ Avisarme cada vez que accedan       │
│ ✅ Informe mensual de accesos          │
│                                        │
│ [Rechazar] [Modificar] [Aceptar] ✅    │
└────────────────────────────────────────┘
```

**Notificación de Acceso:**
```
🔔 TechCorp RRHH accedió a tu historial
   📅 Hoy 9:00 AM
   👁️ Secciones vistas: Chequeos preventivos, Vacunas
   [Ver detalles] [Revocar acceso]
```

---

### 4. ⚡ **CENTRO DE ACCIONES RÁPIDAS**

**Dashboard - Shortcuts:**
```
┌─────────────────────────────────────┐
│ ⚡ ACCIONES RÁPIDAS                 │
├─────────────────────────────────────┤
│                                     │
│ [📊 Registrar presión arterial]     │
│ [💊 Confirmar toma de medicamento]  │
│ [📝 Agregar síntoma]                │
│ [📷 Subir resultado de laboratorio] │
│ [❓ Guardar pregunta para médico]   │
│ [💬 Publicar en comunidad]          │
│ [📅 Solicitar nueva cita]           │
│ [🤖 Preguntarle a ALTA]             │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. 🔔 **CENTRO DE NOTIFICACIONES INTELIGENTE**

**Tipos de Notificaciones:**
```
├─ ⚠️ URGENTE (Priority 1)
│  ├─ Resultado crítico fuera de rango
│  ├─ Médico quiere verte urgente
│  └─ Efecto adverso reportado
│
├─ 💊 MEDICAMENTOS (Priority 2)
│  ├─ Hora de tomar medicamento
│  ├─ Receta por vencer (3 días)
│  └─ Interacción medicamentosa detectada
│
├─ 📅 CITAS (Priority 3)
│  ├─ Recordatorio 24h antes
│  ├─ Médico en sala de espera
│  └─ Cita cancelada/reprogramada
│
├─ 💬 COMUNIDAD (Priority 4)
│  ├─ Respuesta a tu post
│  ├─ Mención en comentario
│  └─ Nuevo post en grupo seguido
│
├─ 📊 INSIGHTS IA (Priority 5)
│  ├─ Tendencia positiva detectada
│  ├─ Patrón de síntomas identificado
│  └─ Sugerencia de mejora
│
└─ 👁️ ACCESOS (Priority 6)
   ├─ Nuevo acceso a historial
   ├─ Solicitud de permiso pendiente
   └─ Informe semanal de visibilidad
```

---

### 6. 📱 **WALLET MÉDICO DIGITAL** ← NUEVO

**Carnet Digital:**
```
┌────────────────────────────────────┐
│ 💳 WALLET MÉDICO                   │
├────────────────────────────────────┤
│                                    │
│ [Carnet de Vacunación QR]          │
│ 💉 COVID-19: 5 dosis ✅            │
│    Última: 15/Oct/2023             │
│                                    │
│ [Grupo Sanguíneo - Emergencias]    │
│ 🩸 A+ (RH Positivo)                │
│    [Mostrar QR de emergencia]      │
│                                    │
│ [Alergias Críticas]                │
│ ⚠️ Penicilina - Reacción severa    │
│    [QR para paramédicos]           │
│                                    │
│ [Recetas Activas]                  │
│ 💊 3 recetas digitales             │
│    [Ver QR para farmacia]          │
│                                    │
│ [Contacto de Emergencia]           │
│ 📞 Juan Torres - Esposo            │
│    +54 11 1234-5678                │
│                                    │
│ [Compartir Wallet en emergencia]   │
└────────────────────────────────────┘
```

---

## 🎨 Diseño Visual y UX

### **Paleta de Colores:**
- **Principal:** Turquesa (#4fd1c5) - AutaMedica brand
- **Fondos:** Gray 900/950 (dark mode)
- **Acentos:**
  - Verde: Éxito, normalidad, salud OK
  - Amarillo: Advertencia, seguimiento
  - Rojo: Urgente, crítico, alergia
  - Azul: Información, comunidad
  - Púrpura: IA, insights, premium

### **Efectos Visuales:**
- ✨ Glassmorphism en cards
- 🌊 Gradientes dinámicos
- 💫 Micro-animaciones Framer Motion
- 🎯 Depth con sombras suaves
- 🔥 Iconos animados (Lucide React)

### **Tipografía:**
- Headers: Font-bold, text-2xl+
- Body: Font-normal, text-base
- Labels: Font-medium, text-sm
- Datos médicos: Font-mono (números)

---

## 📊 Stack Tecnológico

### **Frontend:**
- ⚛️ Next.js 15 (App Router)
- 🎨 Tailwind CSS
- 🎬 Framer Motion (animaciones)
- 📈 Recharts (gráficos)
- 🎯 Lucide React (iconos)
- 📹 WebRTC (videollamadas)

### **Backend (Supabase):**
- 🗄️ PostgreSQL
- 🔐 Row Level Security (RLS)
- 📡 Realtime subscriptions
- 🗂️ Storage (imágenes/PDFs)
- 🔑 Auth (JWT)

### **Integraciones:**
- 🤖 OpenAI API (ALTA assistant)
- 📊 Audit logs (visibilidad)
- 🔔 Push notifications
- 📧 Email (recordatorios)
- 📱 SMS (emergencias)

---

## 🚀 Roadmap de Implementación

### **Fase 1: Core (Semana 1-2)** ✅ COMPLETADA
- [x] Layout de 3 columnas horizontal (12%-58%-30%)
- [x] Sidebar compacto con iconos + tooltips
- [x] Área central de video con telemedicina funcional
- [x] Panel derecho dinámico con tabs contextuales
- [x] Sistema de navegación implementado
- [x] Componentes creados:
  - `CompactSidebar.tsx` - Navegación lateral con iconos
  - `DynamicRightPanel.tsx` - Panel contextual con 5 paneles:
    - CommunityPanel - Comunidad de pacientes
    - ProgressPanel - Gamificación (streaks, niveles, logros)
    - QuickActionsPanel - Acciones rápidas
    - MedicalInfoPanel - Signos vitales, medicamentos, alergias, log de accesos
    - ChatPanel - Chat durante videollamada
  - `page.tsx` - Página principal con video central
- [x] Features implementados:
  - Video telemedicina como protagonista
  - Controles de video (mic, cámara, compartir pantalla, finalizar)
  - Panel de comunidad (posts de pacientes por grupos)
  - Sistema de gamificación (rachas, niveles, metas semanales, badges)
  - Log de transparencia (quién accedió al historial)
  - Acciones rápidas contextuales

### **Fase 2: Telemedicina (Semana 3-4)**
- [ ] Sala de espera con estados
- [ ] Video WebRTC funcional
- [ ] Controles de videollamada
- [ ] Chat en tiempo real
- [ ] Compartir documentos

### **Fase 3: Dashboard y Comunidad (Semana 5-6)**
- [ ] Centro de acciones rápidas
- [ ] Posts de comunidad
- [ ] Sistema de grupos
- [ ] Gamificación básica
- [ ] Insights IA

### **Fase 4: Historia Clínica Avanzada (Semana 7-8)**
- [ ] Signos vitales + gráficos
- [ ] Gestión de medicamentos
- [ ] Alergias destacadas
- [ ] Log de accesos (transparencia)
- [ ] Sistema de permisos

### **Fase 5: Features Premium (Semana 9-10)**
- [ ] Asistente ALTA (IA)
- [ ] Wallet médico digital
- [ ] OCR para resultados
- [ ] Comparativas temporales
- [ ] Exportación de informes

### **Fase 6: Optimización (Semana 11-12)**
- [ ] Responsive mobile
- [ ] PWA (offline)
- [ ] Performance
- [ ] Testing E2E
- [ ] Docs para usuarios

---

## 📝 Notas de Implementación

### **Prioridades:**
1. 🥇 Telemedicina funcional (core business)
2. 🥈 Transparencia de accesos (diferenciador)
3. 🥉 Comunidad activa (engagement)
4. 📊 Gamificación (retención)
5. 🤖 IA útil (valor agregado)

### **Métricas de Éxito:**
- ⏱️ Tiempo en plataforma: >15 min/sesión
- 🔁 Frecuencia de uso: 3+ veces/semana
- 💬 Participación comunidad: 20% usuarios activos
- 📹 Videoconsultas completadas: >90% sin problemas técnicos
- 🏆 Gamificación: 60% usuarios con racha activa

---

## 🔒 Seguridad y Privacidad

### **Cumplimiento Normativo:**
- ✅ HIPAA (USA)
- ✅ Ley 25.326 (Protección Datos Argentina)
- ✅ Ley 26.529 (Derechos del Paciente)
- ✅ GDPR (Europa, si aplica)

### **Medidas de Seguridad:**
- 🔐 Encriptación E2E en videollamadas
- 🔑 Autenticación multifactor (MFA)
- 📝 Audit logs completos
- 🚨 Alertas de accesos sospechosos
- 🔒 Consentimiento explícito para compartir datos
- ⏰ Expiración automática de permisos
- 🗑️ Derecho al olvido (GDPR)

---

## 📚 Referencias

- [WebRTC Best Practices](https://webrtc.org/)
- [Telemedicine UX Guidelines](https://www.nngroup.com/articles/telehealth-ux/)
- [Healthcare Gamification](https://www.healthcareguy.com/gamification/)
- [HIPAA Compliance](https://www.hhs.gov/hipaa/)
- [Ley 25.326 Argentina](http://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/norma.htm)

---

**Última actualización:** 2 Octubre 2025
**Próxima revisión:** Después de Fase 1
