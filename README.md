# 🏥 AutaMedica - Monorepo Healthcare Platform

> **Plataforma médica integral** construida con **arquitectura multi-app**, Turborepo, Next.js 15 y TypeScript estricto.
> Solución completa para teleconsultas, gestión médica y crisis sanitarias con **sistema AI/DX enterprise**.

## 🤖 **Sistema AI/DX Enterprise**

AutaMedica incluye un sistema completo de **calidad + consistencia + automatización + DX con IA**:

- 🎯 **TypeScript strict** + ESLint enterprise + hooks automáticos
- ⚡ **Changelog automático** + preview comments + CI matrix
- 🤖 **AI Reviews**: Claude + ChatGPT con contexto médico HIPAA
- 🔒 **Tipos críticos protegidos** + ADR framework médico

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Desarrollo (todas las apps)
pnpm dev

# Desarrollo por app específica
pnpm dev --filter @autamedica/web-app      # Puerto 3000 - Landing + Auth
pnpm dev --filter @autamedica/doctors      # Puerto 3001 - Portal Médicos
pnpm dev --filter @autamedica/patients     # Puerto 3002 - Portal Pacientes
pnpm dev --filter @autamedica/companies    # Puerto 3003 - Portal Empresarial

# Build completo
pnpm build

# Validar contratos
pnpm docs:validate
```

## 🏗️ **Arquitectura Multi-App COMPLETADA**

```
autamedica-reboot/
├── apps/                                    # 🎯 5 Aplicaciones Especializadas
│   ├── web-app/                            # 🌐 Landing + Autenticación Central (3000)
│   ├── doctors/                            # 👨‍⚕️ Portal Médicos + Videollamadas (3001)
│   ├── patients/                           # 👤 Portal Pacientes + Historial (3002)
│   ├── companies/                          # 🏢 Crisis Control + Marketplace (3003)
│   ├── admin/                              # ⚙️ Panel Administrativo (3004)
│   └── signaling-server/                   # 📡 WebRTC Signaling para Videollamadas
├── packages/                               # 📦 Packages Compartidos
│   ├── @autamedica/types                   # Contratos TypeScript + Zod médicos
│   ├── @autamedica/shared                  # Utilidades compartidas
│   ├── @autamedica/auth                    # 🔐 Autenticación + SSO + Supabase
│   ├── @autamedica/hooks                   # React hooks médicos especializados
│   ├── @autamedica/ui                      # Componentes UI médicos
│   ├── @autamedica/tailwind-config         # Configuración Tailwind compartida
│   └── @autamedica/typescript-config       # Configuración TypeScript estricta
├── docs/                                   # 📚 Documentación Técnica
│   ├── GLOSARIO_MAESTRO.md                # 📖 Contratos API documentados
│   ├── SECURE_DEPLOYMENT_GUIDE.md         # 🚀 Guía deployment Cloudflare Pages
│   ├── PROGRAMMING_METHODOLOGY.md         # 🛠️ Metodología de programación avanzada
│   └── TELEMEDICINE_IMPLEMENTATION_PLAN.md # 🏥 Plan implementación telemedicina
└── scripts/                               # 🔧 Automatización
    ├── validate-exports.mjs               # Validación contratos vs exports
    ├── health-check.mjs                   # Health check completo del monorepo
    └── start-claude.mjs                   # 🤖 Sesión desarrollo con Claude
```

## 🛠 Comandos Principales

## 🎯 **Apps Especializadas - Estado COMPLETADO**

### 🌐 **Web-App** (puerto 3000)
- **Landing Page Central** + Sistema de autenticación Supabase
- **Redirección automática** según rol del usuario
- **OAuth completo** con Google, GitHub y email
- **Términos médicos HIPAA** y política de privacidad

### 👨‍⚕️ **Doctors** (puerto 3001) - ✅ **SISTEMA MÉDICO IMPLEMENTADO**
- **Portal médico profesional** con layout estilo VSCode
- **🎥 Sistema de videollamadas** con WebRTC integrado
- **📋 Información de pacientes** en tiempo real (María González, 32 años)
- **🩺 6 Componentes médicos**: Historial, Prescripciones, Signos Vitales, IA Médica
- **🔧 Hooks especializados**: usePatientData, useActiveSession, useMedicalHistory
- **✅ UUID Problem RESUELTO**: Sistema dinámico sin hardcode

### 👤 **Patients** (puerto 3002)
- **Portal personal del paciente** con layout modular responsive
- **Sistema de temas** para personalización visual
- **Historial médico personal** y resultados de laboratorio
- **Citas y seguimiento** de tratamientos

### 🏢 **Companies** (puerto 3003)
- **🚨 Crisis Management Center** con tema de emergencia
- **💼 Marketplace Médico** integrado con toggle navigation
- **📊 Centro de control** de crisis sanitarias
- **👩‍⚕️ Sistema de contratación** de profesionales médicos

### 📡 **Signaling-Server**
- **WebRTC Signaling Server** para videollamadas médicas
- **Arquitectura de microservicio** independiente
- **Soporte para múltiples salas** y calidad de conexión

### Desarrollo

```bash
pnpm dev                                    # Todas las apps en paralelo
pnpm dev --filter @autamedica/web-app      # Solo web-app (puerto 3000)
pnpm dev --filter @autamedica/doctors      # Solo doctors (puerto 3001)
pnpm dev --filter @autamedica/patients     # Solo patients (puerto 3002)
pnpm dev --filter @autamedica/companies    # Solo companies (puerto 3003)
```

### Build y Validación

```bash
pnpm build:packages         # Solo packages
pnpm build:apps            # Solo apps
pnpm type-check            # TypeScript check
pnpm lint                  # ESLint check
pnpm format                # Prettier format
```

### Tests y Calidad

```bash
pnpm test:unit            # Tests unitarios
pnpm docs:validate        # Validar exports vs glosario
pnpm health              # Health check completo
pnpm lint-staged         # Pre-commit checks
```

## 📦 **Packages - Arquitectura Completada**

### 🔐 **@autamedica/auth** - SSO + Supabase
- **Single Sign-On** entre todas las aplicaciones
- **Autenticación Supabase** con OAuth (Google, GitHub)
- **Middleware de protección** automático por app
- **Gestión de roles** y redirección inteligente
- **Magic Links** y validación HIPAA

### 🏗️ **@autamedica/types** - Contratos Médicos
- **Branded types médicos**: PatientId, DoctorId, UUID, SessionId
- **Tipos especializados**: PatientProfile, VitalSigns, MedicalRecord
- **APIResponse discriminated union** para consistencia
- **ISODateString** para fechas + timezone médico

### 🛠️ **@autamedica/shared** - Utilidades Core
- **Environment safety**: `ensureEnv()` centralizado
- **Validaciones médicas**: email, teléfono, documentos
- **Utilidades de fecha**: cálculo de edad, timezone médico
- **Funciones puras** compartidas entre apps

### ⚛️ **@autamedica/hooks** - Hooks Médicos Especializados
- **Hooks de datos**: `usePatientData`, `useMedicalHistory`, `useVitalSigns`
- **Hooks de sesión**: `useActiveSession`, `useAIAnalysis`
- **Hooks de utilidad**: `useAsync`, `useDebounce`, `usePrescriptions`
- **Integración Supabase** automática con cache

### 🎨 **@autamedica/ui** + **@autamedica/tailwind-config**
- **Componentes médicos** especializados
- **Design System AutaMedica** consistente
- **Tailwind config compartido** entre todas las apps
- **Temas médicos**: colores HIPAA-compliant, accesibilidad

### ⚙️ **Packages de Configuración**
- **@autamedica/typescript-config**: TypeScript estricto + medical rules
- **@autamedica/eslint-config**: Linting médico + security rules

## 🚀 **Deployment - Estado COMPLETADO**

### ✅ **Cloudflare Pages Multi-App (Best Practices 2025)**

**METODOLOGÍA PROBADA**: 1 Proyecto Cloudflare Pages = 1 App

#### **URLs de Producción Activas:**
- 🌐 **Web-App**: https://autamedica-web-app.pages.dev
- 👨‍⚕️ **Doctors**: https://autamedica-doctors.pages.dev ✅
- 👤 **Patients**: https://autamedica-patients.pages.dev ✅
- 🏢 **Companies**: https://autamedica-companies.pages.dev ✅

#### **Configuración por App:**
```bash
# Build Commands optimizados (metodología documentada)
pnpm turbo run build --filter=@autamedica/web-app
pnpm turbo run build --filter=@autamedica/doctors
pnpm turbo run build --filter=@autamedica/patients
pnpm turbo run build --filter=@autamedica/companies

# Output Directory: .next/
# Root Directory: apps/<app-name>
# ☑ Include files outside Root Directory: ENABLED
```

#### **🔧 Variables de Entorno Configuradas:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... # Configurado en Cloudflare Pages
NODE_ENV=production
HUSKY=0  # Deshabilitado en producción
```

Ver: [docs/SECURE_DEPLOYMENT_GUIDE.md](docs/SECURE_DEPLOYMENT_GUIDE.md) para metodología completa.

### Variables de Entorno

Configurar en Cloudflare Pages o `.env.local`:
- Definir según uso de `ensureEnv` en el código
- Separar por entorno (Production/Preview/Development)

## 🔒 Reglas de Desarrollo

### Imports Permitidos ✅
```typescript
import { Patient } from "@autamedica/types";
import { validateEmail } from "@autamedica/shared";
import { useAuth } from "@autamedica/auth";
```

### Imports Prohibidos ❌
```typescript
import { Patient } from "@autamedica/types/src/entities";  // Deep import
const env = process.env.API_URL;  // Direct env access
```

### Contratos Obligatorios
- Todo export debe estar en `GLOSARIO_MAESTRO.md`
- Usar `ISODateString` en lugar de `Date`
- APIResponse como unión discriminada
- Validaciones en `@autamedica/shared`

## 🤖 CI/CD

### GitHub Actions
- ✅ Lint estricto (no warnings)
- ✅ TypeScript strict mode
- ✅ Build paralelo con dependencias
- ✅ Validación de contratos
- ✅ Tests unitarios con Vitest
- ✅ Jobs separados para performance

### Pre-commit Hooks
- ✅ ESLint auto-fix
- ✅ Prettier format
- ✅ Lint-staged

## 🏗 Arquitectura

### Dependencias
```
@autamedica/types (base)
    ↓
@autamedica/shared
    ↓
@autamedica/auth, @autamedica/hooks
    ↓
apps/web-app
```

### Principios
1. **Contratos primero**: Tipos definidos antes que código
2. **Zero circular deps**: Dependencias unidireccionales
3. **Export validation**: Solo lo documentado se exporta
4. **Environment safety**: Variables validadas centralmente

## 🐛 Troubleshooting

### Build Errors
```bash
# Limpiar cache
turbo prune

# Rebuild desde cero
rm -rf node_modules dist .next .turbo
pnpm install
pnpm build
```

### Type Errors
```bash
# Check específico
pnpm --filter @autamedica/types typecheck

# Global check
pnpm type-check
```

## 📈 Performance

### Turborepo
- ✅ Cache distribuido
- ✅ Builds incrementales
- ✅ Parallel execution

### Next.js 15
- ✅ Turbopack (beta)
- ✅ Bundle optimization
- ✅ Tree shaking automático

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feat/nueva-caracteristica`
3. Commit cambios: `git commit -m 'feat: agregar nueva característica'`
4. Push a la rama: `git push origin feat/nueva-caracteristica`
5. Abrir Pull Request con checklist completo

## 📄 Licencia

Proprietary - Autamedica © 2025
# Force Cloudflare cache refresh vie 19 sep 2025 16:34:46 -03
