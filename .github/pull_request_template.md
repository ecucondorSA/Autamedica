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
- [ ] **Tests passing**: `pnpm test` (cobertura > 70%)
- [ ] **Lint passing**: `pnpm lint` (0 warnings)
- [ ] **TypeScript passing**: `pnpm typecheck` (0 errors)
- [ ] **Build successful**: `pnpm build:packages && pnpm build:apps`

### Validaciones AutaMedica
- [ ] **Contracts validation**: `pnpm docs:validate`
- [ ] **Medical glossary check**: `pnpm glossary:check`
- [ ] **Security validation**: `pnpm security:check`
- [ ] **Conventions**: `node scripts/validate-conventions.mjs` (SSK_FAE/Router)

### Pre-deployment
- [ ] **Pre-deploy check**: `pnpm pre-deploy`
- [ ] **Environment variables validadas**
- [ ] **No hay hardcoded values o datos demo**

### Performance & SLO (Impact Pack)
- [ ] **Fetch checks**: `node scripts/node_fetch_check.mjs` (200 OK)
- [ ] **Screenshots**: `node scripts/screenshot_check.mjs` (captures OK)
- [ ] **Health gates**: `node scripts/health-gate.mjs` (SLOs met)
- [ ] **Load testing**: `k6 run scripts/k6-smoke.js` (error rate < 0.5%)
- [ ] **SLO budget**: `node scripts/slo-budget-check.mjs` (within budget)
- [ ] **Lighthouse**: Performance > 85, Accessibility > 90

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

## 🚨 Riesgo y Rollback

### Nivel de riesgo
- [ ] 🟢 Bajo (cambios menores, sin impacto en usuarios)
- [ ] 🟡 Medio (cambios moderados, puede requerir ajustes)
- [ ] 🔴 Alto (cambios críticos, afecta funcionalidad core)

### Plan de Rollback
<!-- ¿Cómo revertir estos cambios si algo sale mal en producción? -->

**Comandos de rollback:**
```bash
# Cloudflare Pages rollback
npx wrangler pages deployment rollback <PREV_DEPLOY_ID> --project-name=autamedica-doctors

# DB rollback (si aplica)
psql "$DATABASE_URL" -f generated-docs/db-backup.sql
```

### Compatibilidad hacia atrás
- [ ] ✅ Cambios 100% compatibles
- [ ] ⚠️ Breaking changes (requiere migración - documentar abajo)
- [ ] 📝 Deprecations (documentadas en CHANGELOG)

### Breaking Changes (si aplica)
<!-- Si hay breaking changes, documéntalos aquí con ejemplo de migración -->

**Cambios que rompen compatibilidad:**

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