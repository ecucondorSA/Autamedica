# 📚 Glosario Modular de AutaMedica

Este directorio contiene glosarios especializados por dominio para mejorar la mantenibilidad.

## 📂 Estructura

- **`core.md`** - Tipos base, primitivos, branded types
- **`medical.md`** - Tipos médicos, especialidades, diagnósticos
- **`patients.md`** - Portal de pacientes, historia clínica
- **`doctors.md`** - Portal de médicos, prescripciones
- **`companies.md`** - Portal empresarial, empleados
- **`reproductive-health.md`** - Sistema IVE/ILE (Ley 27.610)
- **`preventive-care.md`** - Screenings preventivos
- **`validators.md`** - Schemas Zod, validaciones
- **`shared.md`** - Utilidades compartidas

## 🔍 Cómo Usar

Cada glosario sigue el formato:

```markdown
## NombreDelTipo

**Package:** `@autamedica/types`
**Tipo:** `type` | `interface` | `function` | `const`
**Descripción:** Breve descripción del propósito

**Ejemplo:**
\`\`\`typescript
// Código de ejemplo
\`\`\`
```

## 🤖 Auto-generación

Los glosarios se auto-generan desde los exports de cada package usando:

```bash
pnpm docs:validate
```

El script lee los exports y crea entradas automáticas para tipos sin documentar.
