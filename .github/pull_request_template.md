# Pull Request - Autamedica

## 📋 Descripción

<!-- Describe brevemente los cambios realizados -->

## 🏛️ Contract Validation (OBLIGATORIO)

### 📚 Glosario & Contratos

- [ ] **Tipos nuevos documentados en `docs/GLOSARIO_MAESTRO.md`**
- [ ] **Sin breaking changes** **o** ADR adjunto en `docs/adr/xxxx-*.md`
- [ ] **Exports validados**: `pnpm docs:validate` passing
- [ ] **Convenciones seguidas** (branded types, *Id sufijos, APIResponse<T>)
- [ ] **Tipos críticos** sin cambios o documentados en ADR

### 🔒 Tipos Críticos (Requieren ADR si cambian)
- `PatientId`, `DoctorId`, `CompanyId`, `UUID`
- `Patient`, `Doctor`, `Appointment`, `MedicalRecord`
- `APIResponse`, `AuthUser`, `UserRole`
- `ISODateString`, `EmailAddress`, `PhoneNumber`

### Validación Automática

Este PR incluye validación automática de contratos. Si falla:
1. Documentar tipos faltantes en `docs/GLOSARIO_MAESTRO.md`
2. Seguir convenciones de naming establecidas
3. Re-ejecutar `node scripts/validate-contracts.js`

## 🔍 Tipo de Cambio

- [ ] 🎯 Nueva funcionalidad (feature)
- [ ] 🐛 Corrección de bug (fix)
- [ ] 📚 Actualización de documentación
- [ ] 🏗️ Refactoring (sin cambios de funcionalidad)
- [ ] 🧪 Tests
- [ ] 🔧 Cambios de configuración/tooling

## 🏥 Compliance Médico (si aplica)

- [ ] **Cumple con estándares HIPAA**
- [ ] **No registra datos PHI en logs**
- [ ] **Sigue terminología médica del glosario**
- [ ] **Incluye comentarios de compliance requeridos**

## ✅ Quality Checklist

### Básico
- [ ] **Tests passing**: `pnpm test`
- [ ] **Lint passing**: `pnpm lint`
- [ ] **TypeScript passing**: `pnpm type-check`
- [ ] **Build successful**: `pnpm build`

### Validaciones Autamedica
- [ ] **Contracts validation**: `pnpm docs:validate`
- [ ] **Medical glossary check**: `pnpm glossary:check`
- [ ] **Security validation**: `pnpm security:check`

### Pre-deployment
- [ ] **Pre-deploy check**: `pnpm pre-deploy`
- [ ] **Environment variables validadas**
- [ ] **No hay hardcoded values o datos demo**

## 🚀 Testing

### Casos de Prueba
<!-- Describe cómo testear los cambios -->

- [ ] **Funcionalidad principal probada**
- [ ] **Edge cases considerados**
- [ ] **Responsive design verificado** (si aplica)
- [ ] **Accessibility verificado** (si aplica)

### Testing Manual
```bash
# Comandos para testing manual
pnpm dev
# Navegar a: http://localhost:3000
```

## 📱 Apps Afectadas

- [ ] `apps/web-app` (Landing + Auth)
- [ ] `apps/doctors` (Portal médicos)
- [ ] `apps/patients` (Portal pacientes)
- [ ] `apps/companies` (Portal empresarial)
- [ ] `packages/*` (Shared libraries)

## 🔗 Links Relacionados

<!-- Agrega links a issues, documentación, etc. -->

- Issue: #
- Documentación:
- Design:

## 📸 Screenshots (si aplica)

<!-- Capturas de pantalla para cambios de UI -->

## 🚨 Breaking Changes

- [ ] **Este PR NO incluye breaking changes**
- [ ] **Este PR incluye breaking changes** (documentados abajo)

### Cambios que rompen compatibilidad:
<!-- Si hay breaking changes, documéntalos aquí -->

## 📝 Notas para Review

<!-- Información adicional para reviewers -->

---

## 🤖 Para el Reviewer

### Validación Automática
- ✅ GitHub Actions ejecutará todas las validaciones
- ✅ Contract validation se ejecuta automáticamente
- ✅ Comentarios automáticos si fallan validaciones

### Puntos de Revisión Críticos
1. **Glosario**: ¿Todos los exports están documentados?
2. **Naming**: ¿Sigue convenciones médicas?
3. **Security**: ¿No expone datos PHI?
4. **Quality**: ¿Pasan todas las validaciones?

**Comando de revisión completa:**
```bash
pnpm check:all  # lint + type-check + policies + docs
```