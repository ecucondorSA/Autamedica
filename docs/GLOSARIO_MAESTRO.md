# Autamedica - Glosario Maestro de Contratos

## 🎯 Objetivo

Este glosario define el **lenguaje común** de Autamedica. Cada tipo exportado debe estar documentado aquí antes de ser implementado.

**Regla de oro**: Solo se exporta lo que está en este glosario.

---

## 📚 Índice de Glosarios

El glosario maestro se ha dividido en módulos especializados para mejor organización:

### 1. [Glosario Core](./glossary/core.md)
**Contratos base y utilidades fundamentales**

- Identificadores únicos (UUID, PatientId, DoctorId, etc.)
- Escalares (ISODateString)
- Utilidades de fechas ISO
- Sistema de generación de IDs
- Estado de entidades (soft-delete)
- Sistema de geografía y direcciones
- Sistema de teléfonos
- Type guards y validaciones
- Estados async/loadable

**👉 [Ver documentación completa →](./glossary/core.md)**

---

### 2. [Glosario Personas](./glossary/personas.md)
**Entidades de usuarios: pacientes, médicos, staff**

- Usuario base (User)
- Paciente (Patient)
  - Cálculos de salud y riesgo
  - Elegibilidad de servicios
  - Sistema de seguros argentinos
- Doctor
  - Sistema de especialidades médicas
  - Licencias y certificaciones
  - Validaciones profesionales
- Sistema de reviews y ratings
- Citas médicas (Appointment)

**👉 [Ver documentación completa →](./glossary/personas.md)**

---

### 3. [Glosario API](./glossary/api.md)
**Contratos de respuestas y manejo de errores**

- Tipos de respuestas API
- Factory functions (ok, fail, etc.)
- Type guards para respuestas
- Utilidades de transformación
- Respuestas médicas específicas

**👉 [Ver documentación completa →](./glossary/api.md)**

---

### 4. [Glosario Packages](./glossary/packages.md)
**Exports públicos de cada package**

- `@autamedica/types` - Tipos y contratos
- `@autamedica/shared` - Utilidades compartidas
- `@autamedica/auth` - Sistema de autenticación
- `@autamedica/hooks` - React hooks médicos
- `@autamedica/ui` - Componentes UI
- `@autamedica/tailwind-config` - Configuración CSS

**👉 [Ver documentación completa →](./glossary/packages.md)**

---

## 🔍 Cómo Usar Este Glosario

### Para Desarrolladores

1. **Antes de exportar**: Verifica que el tipo/función esté documentado en el glosario correspondiente
2. **Validación automática**: Ejecuta `pnpm docs:validate` para verificar exports vs contratos
3. **Consulta rápida**: Usa el índice arriba para navegar a la sección relevante

### Para Claude Code

1. **Contract-First Development**: Define contratos en el glosario ANTES de implementar
2. **Consulta constante**: Revisa el glosario al crear nuevos tipos o funciones
3. **Validación obligatoria**: Siempre ejecuta `pnpm docs:validate` después de cambios

---

## 📋 Scripts de Validación

```bash
# Validar que todos los exports estén documentados
pnpm docs:validate

# Generar glosario de base de datos
pnpm docs:db:generate

# Verificar cambios en el glosario
pnpm docs:db:check-diff

# Health check completo
pnpm health
```

---

## 🚀 Workflow de Actualización

### 1. Agregar Nuevo Contrato

```bash
# 1. Editar el glosario correspondiente
# docs/glossary/core.md, personas.md, api.md, o packages.md

# 2. Implementar en el package
# packages/types/src/...

# 3. Exportar desde index.ts
# packages/types/src/index.ts

# 4. Validar
pnpm docs:validate
```

### 2. Modificar Contrato Existente

```bash
# 1. Actualizar documentación en glosario
# docs/glossary/*.md

# 2. Actualizar implementación
# packages/*/src/...

# 3. Validar breaking changes
pnpm type-check

# 4. Validar exports
pnpm docs:validate
```

---

## 📊 Estadísticas del Glosario

- **Total de contratos**: ~190+ tipos médicos
- **Packages documentados**: 6 packages core
- **Entidades principales**: Patient, Doctor, Appointment, Company
- **Utilidades**: ~100+ funciones validadoras y factories
- **Última actualización**: 2025-10-04

---

## 🔗 Referencias Relacionadas

- **[CLAUDE.md](../CLAUDE.md)** - Guía para Claude Code
- **[DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md)** - Roadmap de desarrollo
- **[DEVALTAMEDICA_GUIDE.md](../DEVALTAMEDICA_GUIDE.md)** - Metodología de migración
- **[Package.json scripts](../../package.json)** - Comandos de validación

---

**Mantenido por**: Sistema de validación automática
**Última refactorización**: 2025-10-04
**Estructura**: Modular (4 sub-glosarios especializados)
