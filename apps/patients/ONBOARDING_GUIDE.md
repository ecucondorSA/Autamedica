# 🎓 Guía de Onboarding - Portal de Pacientes AutaMedica

## 📋 Descripción

Sistema de onboarding interactivo usando **Driver.js** que guía a los nuevos pacientes a través de las funcionalidades principales del portal.

## ✨ Características

### 🎯 Tour Guiado Completo
El onboarding incluye **10 pasos** que explican:

1. **Menú de navegación** - Sidebar con todas las secciones
2. **Inicio** - Página principal con video de telemedicina
3. **Mi Anamnesis** - Historia clínica interactiva y educativa
4. **Historial Médico** - Registros completos de salud
5. **Mis Citas** - Gestión de consultas médicas
6. **Salud Preventiva** - Chequeos y vacunas
7. **Centro de Telemedicina** - Área de video central
8. **Panel Dinámico** - Panel contextual derecho
9. **Tabs Contextuales** - Funcionalidades según la sección
10. **Resumen Final** - Puntos clave para recordar

### 🎨 Diseño AutaMedica

- **Paleta de colores personalizada** (stone/gray)
- **Gradientes azul-púrpura** en botones
- **Tipografía clara y legible**
- **Animaciones suaves** (fadeInUp)
- **Responsive design** para móvil/tablet/desktop

### 💾 Persistencia

- **localStorage** para recordar si el usuario ya vio el tour
- **Botón flotante** para reactivar el tutorial cuando se desee
- Se guarda en: `autamedica_onboarding_completed`

### 🔄 Auto-start

- Se inicia **automáticamente** la primera vez que el usuario ingresa
- Delay de 500ms para asegurar que el DOM esté listo
- No se muestra nuevamente una vez completado

## 🛠️ Implementación

### Archivos Creados

```
apps/patients/src/
├── components/onboarding/
│   └── PatientOnboarding.tsx          # Componente principal
├── styles/
│   └── onboarding.css                 # Estilos personalizados
└── app/(dashboard)/
    └── layout.tsx                      # Integración en layout
```

### Dependencias

```json
{
  "driver.js": "^1.3.6"
}
```

### Integración en Layout

```tsx
import { PatientOnboarding } from '@/components/onboarding/PatientOnboarding';
import '@/styles/onboarding.css';

export default function DashboardLayoutWrapper({ children }) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <PatientOnboarding autoStart={true} />
    </>
  );
}
```

## 🎮 Uso

### Para el Usuario

1. **Primera visita**: El onboarding se inicia automáticamente
2. **Navegación**: Usar botones "Siguiente" y "Anterior"
3. **Salir**: Click en "✕" o "ESC" para cerrar
4. **Reactivar**: Click en botón flotante "🎓 Tutorial" (esquina inferior izquierda)

### Para Desarrolladores

#### Opciones del Componente

```tsx
<PatientOnboarding
  autoStart={true}  // false para desactivar auto-inicio
/>
```

#### Reiniciar Onboarding Manualmente

```tsx
// Desde DevTools o código
localStorage.removeItem('autamedica_onboarding_completed');
window.location.reload();
```

#### Personalizar Steps

Editar el array `steps` en `PatientOnboarding.tsx`:

```tsx
steps: [
  {
    element: 'selector-css',  // Elemento a destacar
    popover: {
      title: 'Título',
      description: 'Descripción con <strong>HTML</strong>',
      side: 'right',          // top, right, bottom, left
      align: 'start'          // start, center, end
    }
  }
]
```

## 🎨 Personalización de Estilos

Todos los estilos están en `src/styles/onboarding.css`:

```css
/* Popover principal */
.autamedica-onboarding-popover {
  background: white !important;
  border-radius: 16px !important;
  /* ... */
}

/* Botones */
.driver-popover-next-btn {
  background: linear-gradient(to right, #2563eb, #7c3aed) !important;
  /* ... */
}
```

## 📱 Responsive

- **Desktop**: Max-width 380px
- **Tablet**: Max-width 380px
- **Mobile**: Max-width 90vw con márgenes adaptados

## ♿ Accesibilidad

- ✅ Navegación por teclado (Tab, Enter, ESC)
- ✅ Textos descriptivos claros
- ✅ Alto contraste en botones
- ✅ Tamaños de fuente legibles
- ✅ Indicador de progreso (X de Y)

## 🔧 Troubleshooting

### El onboarding no se inicia

1. Verificar que `autoStart={true}`
2. Limpiar localStorage: `localStorage.removeItem('autamedica_onboarding_completed')`
3. Revisar la consola por errores de selectors CSS

### Los elementos no se destacan correctamente

1. Verificar que los selectores CSS sean correctos
2. Asegurar que el elemento existe en el DOM
3. Aumentar el delay de inicio (línea 22): `setTimeout(() => startOnboarding(), 1000)`

### Estilos no se aplican

1. Verificar que se importa `@/styles/onboarding.css`
2. Verificar que `driver.js/dist/driver.css` se carga primero
3. Usar `!important` si hay conflictos de especificidad

## 🚀 Mejoras Futuras

- [ ] **Analytics**: Trackear pasos completados
- [ ] **A/B Testing**: Diferentes versiones del tour
- [ ] **Tooltips avanzados**: Con videos o GIFs
- [ ] **Multi-idioma**: i18n para español/inglés
- [ ] **Condicionales**: Tours específicos por tipo de usuario
- [ ] **Gamificación**: Puntos por completar el onboarding

## 📚 Referencias

- [Driver.js Docs](https://driverjs.com/)
- [Driver.js GitHub](https://github.com/kamranahmedse/driver.js)
- [Patient Portal Architecture](./PATIENTS_PORTAL_ARCHITECTURE.md)

---

**Última actualización**: 2 Octubre 2025
**Desarrollado para**: AutaMedica Patient Portal
