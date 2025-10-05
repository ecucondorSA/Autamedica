# 🔧 Refactorización App Doctors - AutaMedica

## 📊 Análisis Inicial

### Problemas Identificados:

1. **Component Bloat** ⚠️
   - `page.tsx`: 868 líneas (debería ser <200)
   - `DoctorsPortalShell.tsx`: 614 líneas (debería ser <400)
   - Múltiples estados y lógica compleja en un solo archivo

2. **Duplicación de Componentes** 🔴
   - 5 componentes de videollamada diferentes:
     - `SimpleDoctorVideoCall.tsx`
     - `DoctorVideoConsultation.tsx`
     - `VideoCallComponent.tsx`
     - `IntegratedDoctorVideoCall.tsx`
     - Lógica inline en `page.tsx`
   - **Acción**: Consolidar en un solo componente con props configurables

3. **Datos Demo Mezclados** ⚠️
   - `src/data/demoData.ts`
   - `src/data/marketplaceData.ts`
   - Hardcoded en componentes
   - **Acción**: Separar en `src/constants/` y usar feature flags

4. **Falta de Separación de Concerns** ⚠️
   - Lógica de negocio en componentes UI
   - Hooks con demasiada responsabilidad
   - **Acción**: Crear capa de servicios

5. **TypeScript Inconsistente** ⚠️
   - Tipos locales vs compartidos
   - Uso de `any` en algunos lugares
   - **Acción**: Consolidar en `@autamedica/types`

---

## 🎯 Plan de Refactorización

### Fase 1: Limpieza Inmediata (High Impact, Low Risk)

#### 1.1 Extraer page.tsx (868 → ~150 líneas)
```
src/app/page.tsx (nuevo)
  ├── components/
  │   ├── VideoCallArea.tsx       (todo el código de video)
  │   ├── CallControls.tsx        (botones de control)
  │   ├── QuickActionsPanel.tsx   (panel lateral)
  │   └── DiagnosisModal.tsx      (modal de diagnóstico)
```

#### 1.2 Consolidar Video Components (5 → 1)
```
src/components/video/
  ├── UnifiedVideoCall.tsx        (componente principal)
  ├── hooks/
  │   ├── useMediaDevices.ts
  │   ├── useCallControls.ts
  │   └── useScreenShare.ts
  └── types.ts
```

#### 1.3 Separar Demo Data
```
src/constants/
  ├── demo/
  │   ├── patients.ts
  │   ├── appointments.ts
  │   └── marketplace.ts
  ├── config.ts
  └── feature-flags.ts
```

### Fase 2: Mejoras de Arquitectura

#### 2.1 Crear Services Layer
```
src/services/
  ├── api/
  │   ├── patients.service.ts
  │   ├── appointments.service.ts
  │   └── medical-records.service.ts
  ├── webrtc/
  │   └── signaling.service.ts
  └── auth/
      └── session.service.ts
```

#### 2.2 Mejorar Types
```
packages/types/src/
  ├── entities/
  │   ├── Doctor.ts
  │   ├── Patient.ts
  │   └── Appointment.ts
  ├── api/
  │   └── responses.ts
  └── ui/
      └── components.ts
```

#### 2.3 Error Handling
```
src/components/errors/
  ├── ErrorBoundary.tsx
  ├── ErrorFallback.tsx
  └── ErrorToast.tsx
```

### Fase 3: Performance

#### 3.1 Code Splitting
- Lazy load de paneles pesados
- Dynamic imports para modales
- Suspense boundaries

#### 3.2 Memoization
- React.memo en componentes puros
- useMemo para cálculos pesados
- useCallback para funciones estables

---

## 📋 Checklist de Ejecución

### Sprint 1: Limpieza (Hoy)
- [ ] Extraer components de page.tsx
- [ ] Consolidar video components
- [ ] Mover demo data a constants
- [ ] Limpiar imports no usados

### Sprint 2: Arquitectura (Siguiente)
- [ ] Crear services layer
- [ ] Mejorar types compartidos
- [ ] Implementar error boundaries
- [ ] Agregar feature flags

### Sprint 3: Performance (Final)
- [ ] Code splitting
- [ ] Memoization
- [ ] Bundle analysis
- [ ] Lighthouse audit

---

## 🎨 Principios de la Refactorización

1. **Single Responsibility**: Cada componente hace UNA cosa
2. **DRY**: No repetir código (consolidar duplicados)
3. **Separation of Concerns**: UI ≠ Lógica de Negocio ≠ Data
4. **Type Safety**: TypeScript estricto, cero `any`
5. **Performance First**: Lazy load, memoization, code splitting

---

## 📊 Métricas de Éxito

### Antes:
- `page.tsx`: 868 líneas
- Componentes de video: 5 archivos
- Build size: ~2.5MB
- First load: ~800ms

### Después (Objetivo):
- `page.tsx`: <200 líneas ✅
- Componentes de video: 1 archivo configurable ✅
- Build size: <2MB ✅
- First load: <500ms ✅

---

**Generado**: 2025-10-05
**Por**: Claude Code Refactoring Assistant
