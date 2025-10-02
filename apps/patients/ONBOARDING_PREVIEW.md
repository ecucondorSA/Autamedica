# 🎓 Vista Previa del Onboarding - AutaMedica

## 📸 Flujo Visual del Tour

### Paso 1: Menú de Navegación
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────┐                                                 │
│ │ [Sidebar]   │  ◄── 🏥 Bienvenido/a a AutaMedica              │
│ │             │                                                 │
│ │ • Inicio    │      Te voy a mostrar las funcionalidades      │
│ │ • Anamnesis │      principales del portal. Este es tu        │
│ │ • Historial │      menú de navegación donde puedes           │
│ │ • Citas     │      acceder a todas las secciones.            │
│ │ • Salud     │                                                 │
│ │ • Perfil    │      [← Anterior]  [Siguiente →]   1 de 10    │
│ └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 2: Inicio
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────┐                                                 │
│ │ Sidebar     │  ◄── 🏠 Inicio                                 │
│ │             │                                                 │
│ │ 👉 [Inicio] │      Tu página principal con el video de       │
│ │ • Anamnesis │      telemedicina siempre disponible y         │
│ │ • Historial │      resumen de tu salud.                      │
│ │ • Citas     │                                                 │
│ │ • Salud     │      [← Anterior]  [Siguiente →]   2 de 10    │
│ │ • Perfil    │                                                 │
│ └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 3: Mi Anamnesis
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────┐                                                 │
│ │ Sidebar     │  ◄── 📖 Mi Anamnesis                           │
│ │             │                                                 │
│ │ • Inicio    │      Aquí completarás tu historia clínica      │
│ │ 👉[Anamnesis]│      interactiva. Es educativa y te explica   │
│ │ • Historial │      por qué cada pregunta es importante       │
│ │ • Citas     │      para tu diagnóstico.                      │
│ │ • Salud     │                                                 │
│ │ • Perfil    │      [← Anterior]  [Siguiente →]   3 de 10    │
│ └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 7: Centro de Telemedicina
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         ┌───────────────────────────────────┐                  │
│         │                                   │                  │
│         │   [ÁREA DE VIDEO DESTACADA]       │ ◄─────────┐     │
│         │                                   │           │     │
│         │   🎥 Centro de Telemedicina       │           │     │
│         │                                   │  Este es el     │
│         │   [Controles: 🎤 📹 🖥️ ❌]        │  corazón de     │
│         │                                   │  AutaMedica.    │
│         └───────────────────────────────────┘  Aquí tendrás   │
│                                                 tus consultas. │
│                 [← Anterior]  [Siguiente →]    7 de 10        │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 8: Panel Dinámico
```
┌─────────────────────────────────────────────────────────────────┐
│                                         ┌───────────────────┐   │
│                                         │ [Panel Dinámico]  │◄──│
│                                         │                   │   │
│  📊 Panel Dinámico                      │ [Tab] [Tab] [Tab] │   │
│                                         │                   │   │
│  Este panel cambia según la             │ 💬 Comunidad      │   │
│  sección donde estés. Aquí verás:       │ 🏆 Progreso       │   │
│  comunidad de pacientes, tu             │ ⚡ Acciones       │   │
│  progreso gamificado, y acciones        │                   │   │
│  rápidas.                               └───────────────────┘   │
│                                                                 │
│  [← Anterior]  [Siguiente →]   8 de 10                         │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 10: Resumen Final
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   🎉 ¡Listo para comenzar!                      │
│                                                                 │
│         Ya conoces lo básico de AutaMedica. Recuerda:          │
│                                                                 │
│         • 💾 Tu información se guarda automáticamente           │
│         • 🔒 Puedes ver quién accede a tu historial            │
│         • 🏆 Gana puntos cuidando tu salud                     │
│         • 💬 Conecta con otros pacientes en Comunidad          │
│         • 🎥 Video siempre disponible para consultas           │
│                                                                 │
│              ¡Empecemos a cuidar tu salud! 🌟                   │
│                                                                 │
│                       [¡Entendido!]           10 de 10          │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Elementos Visuales

### Paleta de Colores

- **Popover**: Fondo blanco (#ffffff)
- **Bordes**: Stone (#e7e5e4)
- **Títulos**: Stone 900 (#1c1917)
- **Texto**: Stone 600 (#57534e)
- **Botón Siguiente**: Gradiente azul-púrpura (#2563eb → #7c3aed)
- **Botón Finalizar**: Gradiente verde (#059669 → #10b981)
- **Botón Anterior**: Stone claro (#f5f5f4)

### Tipografía

- **Título**: 1.125rem, font-weight: 700
- **Descripción**: 0.9375rem, line-height: 1.6
- **Botones**: 0.875rem, font-weight: 600
- **Progreso**: 0.75rem, font-weight: 600

### Efectos

- **Sombras**: Box-shadow suave con blur
- **Animación**: fadeInUp (0.3s ease-out)
- **Hover**: Transform translateY/translateX
- **Overlay**: rgba(0, 0, 0, 0.5) + backdrop-blur(2px)
- **Radius**: Border-radius 16px en popover, 12px en elementos

## 🔄 Interacciones

### Navegación por Teclado

- **Tab**: Navegar entre botones
- **Enter**: Confirmar botón activo
- **ESC**: Cerrar el tour
- **← →**: Navegar pasos (si está configurado)

### Navegación por Mouse

- **Click en "Siguiente"**: Avanza al siguiente paso
- **Click en "Anterior"**: Retrocede un paso
- **Click en "✕"**: Cierra el tour
- **Click fuera del popover**: No hace nada (evita cierre accidental)

## 📱 Responsive

### Desktop (>1024px)
- Popover max-width: 380px
- Posicionamiento: side/align según paso
- Overlay completo con blur

### Tablet (768px - 1024px)
- Popover max-width: 380px
- Posicionamiento adaptado si no cabe
- Overlay completo

### Mobile (<768px)
- Popover max-width: 90vw
- Márgenes: 1rem
- Font-size reducido (título: 1rem, texto: 0.875rem)
- Botones apilados si es necesario

## 🎯 Botón de Reinicio

Después de completar el onboarding, aparece un botón flotante:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│  [🎓 Tutorial] ◄── Botón flotante (bottom-left)                │
│                    Gradient: blue-600 → purple-600              │
│                    Hover: scale-105 + shadow-xl                 │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Funcionalidades

- [x] Auto-start en primera visita
- [x] 10 pasos completos con explicaciones
- [x] Persistencia en localStorage
- [x] Botón de reinicio flotante
- [x] Navegación secuencial (anterior/siguiente)
- [x] Indicador de progreso (X de Y)
- [x] Estilos personalizados AutaMedica
- [x] Animaciones suaves
- [x] Responsive design
- [x] Accesibilidad por teclado
- [x] Overlay con blur
- [x] Highlights de elementos
- [x] Botón de cerrar visible

## 🚀 Próximos Pasos

1. **Probar el onboarding**: Visitar http://localhost:3002
2. **Reiniciarlo**: Click en "🎓 Tutorial" (esquina inferior izquierda)
3. **Ajustar steps**: Editar `PatientOnboarding.tsx` si es necesario
4. **Personalizar estilos**: Modificar `onboarding.css` según diseño

---

**Estado**: ✅ Implementado y funcional
**Última actualización**: 2 Octubre 2025
