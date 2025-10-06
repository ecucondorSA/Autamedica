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

## 📋 Exports Auto-generados

### APPOINTMENT_STATUSES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para appointment statuses.
- **Contrato:** Pendiente de documentación detallada

### APPOINTMENT_TYPES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para appointment types.
- **Contrato:** Pendiente de documentación detallada

### ARGENTINA_INSURANCE_PROVIDERS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para argentina insurance providers.
- **Contrato:** Pendiente de documentación detallada

### AUDIT_ACTIONS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para audit actions.
- **Contrato:** Pendiente de documentación detallada

### AUDIT_RESOURCE_TYPES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para audit resource types.
- **Contrato:** Pendiente de documentación detallada

### AppointmentInsertSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para appointmentinsertsnakeschema.
- **Contrato:** Pendiente de documentación detallada

### AppointmentSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para appointmentsnakeschema.
- **Contrato:** Pendiente de documentación detallada

### AppointmentUpdateSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para appointmentupdatesnakeschema.
- **Contrato:** Pendiente de documentación detallada

### CERTIFICATION_TYPES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para certification types.
- **Contrato:** Pendiente de documentación detallada

### COMPANY_DEPARTMENTS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para company departments.
- **Contrato:** Pendiente de documentación detallada

### COMPANY_MEMBER_ROLES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para company member roles.
- **Contrato:** Pendiente de documentación detallada

### COMPANY_SIZES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para company sizes.
- **Contrato:** Pendiente de documentación detallada

### CompanyMemberInsertSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para companymemberinsertsnakeschema.
- **Contrato:** Pendiente de documentación detallada

### CompanyMemberSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para companymembersnakeschema.
- **Contrato:** Pendiente de documentación detallada

### CompanyMemberUpdateSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para companymemberupdatesnakeschema.
- **Contrato:** Pendiente de documentación detallada

### GENDERS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para genders.
- **Contrato:** Pendiente de documentación detallada

### GROUP_CATEGORIES_DISPLAY
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para group categories display.
- **Contrato:** Pendiente de documentación detallada

### ID_VALIDATION_CONFIG
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para id validation config.
- **Contrato:** Pendiente de documentación detallada

### ISODateTime
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Interfaz de datos para isodatetime en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### LICENSE_STATUS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para license status.
- **Contrato:** Pendiente de documentación detallada

### MEDICAL_RECORD_VISIBILITIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para medical record visibilities.
- **Contrato:** Pendiente de documentación detallada

### MEDICAL_SPECIALTIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para medical specialties.
- **Contrato:** Pendiente de documentación detallada

### PHONE_VALIDATION_CONFIG
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para phone validation config.
- **Contrato:** Pendiente de documentación detallada

### PatientInsertSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para patientinsertsnakeschema.
- **Contrato:** Pendiente de documentación detallada

### PatientProfileSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para patientprofilesnakeschema.
- **Contrato:** Pendiente de documentación detallada

### PatientUpdateSnakeSchema
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para patientupdatesnakeschema.
- **Contrato:** Pendiente de documentación detallada

### REACTION_DISPLAY
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para reaction display.
- **Contrato:** Pendiente de documentación detallada

### REVIEW_WINDOW_DAYS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para review window days.
- **Contrato:** Pendiente de documentación detallada

### ROLE_TO_PORTALS
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para role to portals.
- **Contrato:** Pendiente de documentación detallada

### SCREENING_CATALOG
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para screening catalog.
- **Contrato:** Pendiente de documentación detallada

### SECTION_DISPLAY_NAMES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para section display names.
- **Contrato:** Pendiente de documentación detallada

### SECTION_ORDER
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para section order.
- **Contrato:** Pendiente de documentación detallada

### SUBSPECIALTIES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para subspecialties.
- **Contrato:** Pendiente de documentación detallada

### Tables
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Interfaz de datos para tables en el sistema médico.
- **Contrato:** Pendiente de documentación detallada

### TablesInsert
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tablesinsert.
- **Contrato:** Pendiente de documentación detallada

### TablesUpdate
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tablesupdate.
- **Contrato:** Pendiente de documentación detallada

### USER_ROLES
- **Tipo:** const
- **Package:** @autamedica/types
- **Descripción:** Constante del sistema para user roles.
- **Contrato:** Pendiente de documentación detallada

### acceptsInsurancePlan
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para acceptsinsuranceplan.
- **Contrato:** Pendiente de documentación detallada

### anonymizeDisplayName
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para anonymizedisplayname.
- **Contrato:** Pendiente de documentación detallada

### calculateAge
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateage.
- **Contrato:** Pendiente de documentación detallada

### calculateBMI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatebmi.
- **Contrato:** Pendiente de documentación detallada

### calculateDistance
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatedistance.
- **Contrato:** Pendiente de documentación detallada

### calculateMonthsActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatemonthsactive.
- **Contrato:** Pendiente de documentación detallada

### calculateNextDueDate
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatenextduedate.
- **Contrato:** Pendiente de documentación detallada

### calculateOverallRating
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateoverallrating.
- **Contrato:** Pendiente de documentación detallada

### calculatePatientReviewsScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatepatientreviewsscore.
- **Contrato:** Pendiente de documentación detallada

### calculateRecognitionScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculaterecognitionscore.
- **Contrato:** Pendiente de documentación detallada

### calculateReputationScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatereputationscore.
- **Contrato:** Pendiente de documentación detallada

### calculateReviewsBreakdown
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatereviewsbreakdown.
- **Contrato:** Pendiente de documentación detallada

### calculateRiskLevel
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculaterisklevel.
- **Contrato:** Pendiente de documentación detallada

### calculateSectionWeight
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatesectionweight.
- **Contrato:** Pendiente de documentación detallada

### calculateSessionDuration
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatesessionduration.
- **Contrato:** Pendiente de documentación detallada

### calculateTotalTrainingYears
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatetotaltrainingyears.
- **Contrato:** Pendiente de documentación detallada

### calculateUrgency
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateurgency.
- **Contrato:** Pendiente de documentación detallada

### calculateVolumePercentile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatevolumepercentile.
- **Contrato:** Pendiente de documentación detallada

### calculateVolumeScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculatevolumescore.
- **Contrato:** Pendiente de documentación detallada

### calculateYearsOfExperience
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para calculateyearsofexperience.
- **Contrato:** Pendiente de documentación detallada

### canAcceptEmergency
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canacceptemergency.
- **Contrato:** Pendiente de documentación detallada

### canAccessPortal
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canaccessportal.
- **Contrato:** Pendiente de documentación detallada

### canAccessRecord
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canaccessrecord.
- **Contrato:** Pendiente de documentación detallada

### canApprovExpenses
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canapprovexpenses.
- **Contrato:** Pendiente de documentación detallada

### canEditAnamnesis
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para caneditanamnesis.
- **Contrato:** Pendiente de documentación detallada

### canJoinSession
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canjoinsession.
- **Contrato:** Pendiente de documentación detallada

### canManageMembers
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canmanagemembers.
- **Contrato:** Pendiente de documentación detallada

### canModerateContent
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canmoderatecontent.
- **Contrato:** Pendiente de documentación detallada

### canPostInGroup
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canpostingroup.
- **Contrato:** Pendiente de documentación detallada

### canPracticeInArgentina
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canpracticeinargentina.
- **Contrato:** Pendiente de documentación detallada

### canPracticeSpecialty
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canpracticespecialty.
- **Contrato:** Pendiente de documentación detallada

### canReceiveTelemedicine
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para canreceivetelemedicine.
- **Contrato:** Pendiente de documentación detallada

### canSubmitReview
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para cansubmitreview.
- **Contrato:** Pendiente de documentación detallada

### combineLoadables
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para combineloadables.
- **Contrato:** Pendiente de documentación detallada

### containsPHI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para containsphi.
- **Contrato:** Pendiente de documentación detallada

### createBasicAddress
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createbasicaddress en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createBasicSpecialty
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createbasicspecialty en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para create en el sistema.
- **Contrato:** Pendiente de documentación detallada

### createMedicalAddress
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicaladdress en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createMedicalLicense
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicallicense en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createMedicalView
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createmedicalview en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createPublicProfile
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createpublicprofile en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createRatingDisplay
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para createratingdisplay en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createValidatedId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para createvalidated en el sistema.
- **Contrato:** Pendiente de documentación detallada

### estimateTravelTime
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para estimatetraveltime.
- **Contrato:** Pendiente de documentación detallada

### extractCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractcountrycode.
- **Contrato:** Pendiente de documentación detallada

### extractPrivateData
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractprivatedata.
- **Contrato:** Pendiente de documentación detallada

### extractProvinceFromLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para extractprovincefromlicense.
- **Contrato:** Pendiente de documentación detallada

### fail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para fail.
- **Contrato:** Pendiente de documentación detallada

### failWithCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para failwithcode.
- **Contrato:** Pendiente de documentación detallada

### failure
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para failure.
- **Contrato:** Pendiente de documentación detallada

### flatMapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para flatmaploadable.
- **Contrato:** Pendiente de documentación detallada

### formatAddressString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formataddressstring.
- **Contrato:** Pendiente de documentación detallada

### formatAuditDescription
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatauditdescription.
- **Contrato:** Pendiente de documentación detallada

### formatDistance
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatdistance.
- **Contrato:** Pendiente de documentación detallada

### formatMedicalLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatmedicallicense.
- **Contrato:** Pendiente de documentación detallada

### formatPhoneForDisplay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para formatphonefordisplay.
- **Contrato:** Pendiente de documentación detallada

### generateAppointmentId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateappointment en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generateDisplayName
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para generatedisplayname.
- **Contrato:** Pendiente de documentación detallada

### generateDoctorId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generatedoctor en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generatePatientId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generatepatient en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generatePrefixedId
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateprefixed en el sistema.
- **Contrato:** Pendiente de documentación detallada

### generateUUID
- **Tipo:** type
- **Package:** @autamedica/types
- **Descripción:** Identificador único tipado para generateuu en el sistema.
- **Contrato:** Pendiente de documentación detallada

### getAvailableSubspecialties
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getavailablesubspecialties en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getBMICategory
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getbmicategory en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getConnectionQualityScore
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getconnectionqualityscore en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getConsultationTypeDisplayName
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getconsultationtypedisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDepartmentDisplayName
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getdepartmentdisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getEmploymentDuration
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getemploymentduration en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoadableValue
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getloadablevalue en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getNextPendingSection
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getnextpendingsection en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPhoneExamples
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getphoneexamples en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getQualityRecommendation
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getqualityrecommendation en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRecognitionBadgeText
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getrecognitionbadgetext en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleDisplayName
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getroledisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSpecialtiesByCategory
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getspecialtiesbycategory en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSpecialtiesRequiring
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getspecialtiesrequiring en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSpecialtyDisplayName
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getspecialtydisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseErrorMessage
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getsupabaseerrormessage en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getYearsOfService
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para getyearsofservice en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### hasAccessToSensitiveData
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasaccesstosensitivedata.
- **Contrato:** Pendiente de documentación detallada

### hasActiveAllergies
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasactiveallergies.
- **Contrato:** Pendiente de documentación detallada

### hasAdminPermissions
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasadminpermissions.
- **Contrato:** Pendiente de documentación detallada

### hasInsurance
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasinsurance.
- **Contrato:** Pendiente de documentación detallada

### hasInsuranceCoverage
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasinsurancecoverage.
- **Contrato:** Pendiente de documentación detallada

### hasValidEmergencyContact
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para hasvalidemergencycontact.
- **Contrato:** Pendiente de documentación detallada

### idle
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para idle.
- **Contrato:** Pendiente de documentación detallada

### isActiveLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isactivelicense.
- **Contrato:** Pendiente de documentación detallada

### isActiveMember
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isactivemember.
- **Contrato:** Pendiente de documentación detallada

### isAnamnesisComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isanamnesiscomplete.
- **Contrato:** Pendiente de documentación detallada

### isApiError
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isapierror.
- **Contrato:** Pendiente de documentación detallada

### isApiSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isapisuccess.
- **Contrato:** Pendiente de documentación detallada

### isAppointment
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isappointment.
- **Contrato:** Pendiente de documentación detallada

### isAppointmentConsultationType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isappointmentconsultationtype.
- **Contrato:** Pendiente de documentación detallada

### isAppointmentStatus
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para isappointment en el sistema.
- **Contrato:** Pendiente de documentación detallada

### isAppointmentType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isappointmenttype.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaMobile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinamobile.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaPhone
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinaphone.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaStateCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinastatecode.
- **Contrato:** Pendiente de documentación detallada

### isArgentinaZipCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isargentinazipcode.
- **Contrato:** Pendiente de documentación detallada

### isAuditAction
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isauditaction.
- **Contrato:** Pendiente de documentación detallada

### isAuditLog
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isauditlog.
- **Contrato:** Pendiente de documentación detallada

### isAuditResourceType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isauditresourcetype.
- **Contrato:** Pendiente de documentación detallada

### isAvailableOnDay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isavailableonday.
- **Contrato:** Pendiente de documentación detallada

### isChatActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ischatactive.
- **Contrato:** Pendiente de documentación detallada

### isCompanyDepartment
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscompanydepartment.
- **Contrato:** Pendiente de documentación detallada

### isCompanyMemberRole
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscompanymemberrole.
- **Contrato:** Pendiente de documentación detallada

### isCompleteAddress
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscompleteaddress.
- **Contrato:** Pendiente de documentación detallada

### isContentApproved
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscontentapproved.
- **Contrato:** Pendiente de documentación detallada

### isCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscountrycode.
- **Contrato:** Pendiente de documentación detallada

### isCriticalAction
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iscriticalaction.
- **Contrato:** Pendiente de documentación detallada

### isDoctor
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctor.
- **Contrato:** Pendiente de documentación detallada

### isDoctorEducation
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctoreducation.
- **Contrato:** Pendiente de documentación detallada

### isDoctorLicenseActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctorlicenseactive.
- **Contrato:** Pendiente de documentación detallada

### isDoctorProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdoctorprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### isDurationConsistent
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isdurationconsistent.
- **Contrato:** Pendiente de documentación detallada

### isEligibleForRecognition
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para iseligibleforrecognition.
- **Contrato:** Pendiente de documentación detallada

### isEntityActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isentityactive.
- **Contrato:** Pendiente de documentación detallada

### isEntityDeleted
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isentitydeleted.
- **Contrato:** Pendiente de documentación detallada

### isFailure
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isfailure.
- **Contrato:** Pendiente de documentación detallada

### isHealthCenterType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishealthcentertype.
- **Contrato:** Pendiente de documentación detallada

### isHighRiskContent
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishighriskcontent.
- **Contrato:** Pendiente de documentación detallada

### isHighRiskPatient
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishighriskpatient.
- **Contrato:** Pendiente de documentación detallada

### isHighSensitivityRecord
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ishighsensitivityrecord.
- **Contrato:** Pendiente de documentación detallada

### isISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isisodatestring.
- **Contrato:** Pendiente de documentación detallada

### isIdle
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isidle.
- **Contrato:** Pendiente de documentación detallada

### isLoading
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isloading.
- **Contrato:** Pendiente de documentación detallada

### isMedicalRecordVisibility
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ismedicalrecordvisibility.
- **Contrato:** Pendiente de documentación detallada

### isMinor
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isminor.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyArray
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptyarray.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyObject
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptyobject.
- **Contrato:** Pendiente de documentación detallada

### isNonEmptyString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonemptystring.
- **Contrato:** Pendiente de documentación detallada

### isNonNullable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isnonnullable.
- **Contrato:** Pendiente de documentación detallada

### isOnProbation
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isonprobation.
- **Contrato:** Pendiente de documentación detallada

### isPAMIEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispamieligible.
- **Contrato:** Pendiente de documentación detallada

### isPatient
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispatient.
- **Contrato:** Pendiente de documentación detallada

### isPatientCareTeamRole
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispatientcareteamrole.
- **Contrato:** Pendiente de documentación detallada

### isPatientProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispatientprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### isPercentage
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispercentage.
- **Contrato:** Pendiente de documentación detallada

### isPermanentRecord
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispermanentrecord.
- **Contrato:** Pendiente de documentación detallada

### isPhoneE164
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isphonee164.
- **Contrato:** Pendiente de documentación detallada

### isPositiveNumber
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispositivenumber.
- **Contrato:** Pendiente de documentación detallada

### isPrimaryDoctor
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprimarydoctor.
- **Contrato:** Pendiente de documentación detallada

### isProfile
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprofile.
- **Contrato:** Pendiente de documentación detallada

### isProfileComplete
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isprofilecomplete.
- **Contrato:** Pendiente de documentación detallada

### isPublicHealthcareEligible
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ispublichealthcareeligible.
- **Contrato:** Pendiente de documentación detallada

### isReproductiveHealthSpecialty
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isreproductivehealthspecialty.
- **Contrato:** Pendiente de documentación detallada

### isScreeningApplicable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isscreeningapplicable.
- **Contrato:** Pendiente de documentación detallada

### isSessionActive
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issessionactive.
- **Contrato:** Pendiente de documentación detallada

### isSpecialistAvailable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isspecialistavailable.
- **Contrato:** Pendiente de documentación detallada

### isSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issuccess.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de issupabaseapi.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseError
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issupabaseerror.
- **Contrato:** Pendiente de documentación detallada

### isSupabaseSuccess
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para issupabasesuccess.
- **Contrato:** Pendiente de documentación detallada

### isTerminalStatus
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para isterminal en el sistema.
- **Contrato:** Pendiente de documentación detallada

### isUnauthenticated
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isunauthenticated.
- **Contrato:** Pendiente de documentación detallada

### isValidAppointmentForDisplay
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidappointmentfordisplay.
- **Contrato:** Pendiente de documentación detallada

### isValidBloodType
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidbloodtype.
- **Contrato:** Pendiente de documentación detallada

### isValidCertification
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidcertification.
- **Contrato:** Pendiente de documentación detallada

### isValidCoordinates
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidcoordinates.
- **Contrato:** Pendiente de documentación detallada

### isValidDNI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvaliddni.
- **Contrato:** Pendiente de documentación detallada

### isValidEmail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidemail.
- **Contrato:** Pendiente de documentación detallada

### isValidMedicalLicense
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidmedicallicense.
- **Contrato:** Pendiente de documentación detallada

### isValidPhoneForCountry
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidphoneforcountry.
- **Contrato:** Pendiente de documentación detallada

### isValidRatingScore
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidratingscore.
- **Contrato:** Pendiente de documentación detallada

### isValidRole
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidrole.
- **Contrato:** Pendiente de documentación detallada

### isValidSpecialtyCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidspecialtycode.
- **Contrato:** Pendiente de documentación detallada

### isValidSubspecialtyCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidsubspecialtycode.
- **Contrato:** Pendiente de documentación detallada

### isValidTimeHHmm
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidtimehhmm.
- **Contrato:** Pendiente de documentación detallada

### isValidURL
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para isvalidurl.
- **Contrato:** Pendiente de documentación detallada

### loading
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para loading.
- **Contrato:** Pendiente de documentación detallada

### mapApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de mapapi.
- **Contrato:** Pendiente de documentación detallada

### mapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para maploadable.
- **Contrato:** Pendiente de documentación detallada

### markEntityAsDeleted
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para markentityasdeleted.
- **Contrato:** Pendiente de documentación detallada

### matchAsyncState
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para matchasync en el sistema.
- **Contrato:** Pendiente de documentación detallada

### matchAuthenticatedLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para matchauthenticatedloadable.
- **Contrato:** Pendiente de documentación detallada

### matchDataLoadingState
- **Tipo:** enum
- **Package:** @autamedica/types
- **Descripción:** Estados posibles para matchdataloading en el sistema.
- **Contrato:** Pendiente de documentación detallada

### matchLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para matchloadable.
- **Contrato:** Pendiente de documentación detallada

### medicalFail
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para medicalfail.
- **Contrato:** Pendiente de documentación detallada

### medicalOk
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para medicalok.
- **Contrato:** Pendiente de documentación detallada

### migrateToAddress
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para migratetoaddress.
- **Contrato:** Pendiente de documentación detallada

### normalizePhoneNumber
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para normalizephonenumber.
- **Contrato:** Pendiente de documentación detallada

### nowAsISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para nowasisodatestring.
- **Contrato:** Pendiente de documentación detallada

### ok
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para ok.
- **Contrato:** Pendiente de documentación detallada

### parseAppointmentForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parseappointmentforui.
- **Contrato:** Pendiente de documentación detallada

### parseAppointmentsForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parseappointmentsforui.
- **Contrato:** Pendiente de documentación detallada

### parseCompanyMemberForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parsecompanymemberforui.
- **Contrato:** Pendiente de documentación detallada

### parseCompanyMembersForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parsecompanymembersforui.
- **Contrato:** Pendiente de documentación detallada

### parsePatientForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parsepatientforui.
- **Contrato:** Pendiente de documentación detallada

### parsePatientsForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para parsepatientsforui.
- **Contrato:** Pendiente de documentación detallada

### requiresDoctorReview
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresdoctorreview.
- **Contrato:** Pendiente de documentación detallada

### requiresGuardianConsent
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresguardianconsent.
- **Contrato:** Pendiente de documentación detallada

### requiresMeetingUrl
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresmeetingurl.
- **Contrato:** Pendiente de documentación detallada

### requiresModerationReview
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresmoderationreview.
- **Contrato:** Pendiente de documentación detallada

### requiresPhysicalLocation
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresphysicallocation.
- **Contrato:** Pendiente de documentación detallada

### requiresRecordingConsent
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresrecordingconsent.
- **Contrato:** Pendiente de documentación detallada

### requiresSpecializedCare
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresspecializedcare.
- **Contrato:** Pendiente de documentación detallada

### requiresUrgentAttention
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para requiresurgentattention.
- **Contrato:** Pendiente de documentación detallada

### safeParseAppointmentForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para safeparseappointmentforui.
- **Contrato:** Pendiente de documentación detallada

### safeParseCompanyMemberForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para safeparsecompanymemberforui.
- **Contrato:** Pendiente de documentación detallada

### safeParsePatientForUI
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para safeparsepatientforui.
- **Contrato:** Pendiente de documentación detallada

### sortByDistance
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para sortbydistance.
- **Contrato:** Pendiente de documentación detallada

### success
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para success.
- **Contrato:** Pendiente de documentación detallada

### toArgentinaStateCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toargentinastatecode.
- **Contrato:** Pendiente de documentación detallada

### toArgentinaZipCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toargentinazipcode.
- **Contrato:** Pendiente de documentación detallada

### toCountryCode
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tocountrycode.
- **Contrato:** Pendiente de documentación detallada

### toE164Format
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toe164format.
- **Contrato:** Pendiente de documentación detallada

### toISODateString
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para toisodatestring.
- **Contrato:** Pendiente de documentación detallada

### toNationalFormat
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para tonationalformat.
- **Contrato:** Pendiente de documentación detallada

### type AppointmentInsertSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type appointmentinsertsnake.
- **Contrato:** Pendiente de documentación detallada

### type AppointmentSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type appointmentsnake.
- **Contrato:** Pendiente de documentación detallada

### type AppointmentUpdateSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type appointmentupdatesnake.
- **Contrato:** Pendiente de documentación detallada

### type CompanyMemberInsertSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type companymemberinsertsnake.
- **Contrato:** Pendiente de documentación detallada

### type CompanyMemberSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type companymembersnake.
- **Contrato:** Pendiente de documentación detallada

### type CompanyMemberUpdateSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type companymemberupdatesnake.
- **Contrato:** Pendiente de documentación detallada

### type PatientInsertSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type patientinsertsnake.
- **Contrato:** Pendiente de documentación detallada

### type PatientSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type patientsnake.
- **Contrato:** Pendiente de documentación detallada

### type PatientUpdateSnake
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para type patientupdatesnake.
- **Contrato:** Pendiente de documentación detallada

### unauthenticated
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para unauthenticated.
- **Contrato:** Pendiente de documentación detallada

### unwrapApiResponse
- **Tipo:** interface
- **Package:** @autamedica/types
- **Descripción:** Respuesta de API para operaciones de unwrapapi.
- **Contrato:** Pendiente de documentación detallada

### unwrapLoadable
- **Tipo:** unknown
- **Package:** @autamedica/types
- **Descripción:** Utilidad del sistema AutaMedica para unwraploadable.
- **Contrato:** Pendiente de documentación detallada

### validateIdForScope
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para validateidforscope en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validatePhoneList
- **Tipo:** function
- **Package:** @autamedica/types
- **Descripción:** Función utilitaria para validatephonelist en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### AUTH_URLS
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para auth urls.
- **Contrato:** Pendiente de documentación detallada

### AVAILABLE_ROLES
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para available roles.
- **Contrato:** Pendiente de documentación detallada

### BASE_URL_BY_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para base url by role.
- **Contrato:** Pendiente de documentación detallada

### HOME_BY_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para home by role.
- **Contrato:** Pendiente de documentación detallada

### ICE_SERVERS
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para ice servers.
- **Contrato:** Pendiente de documentación detallada

### MemberRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para memberrole.
- **Contrato:** Pendiente de documentación detallada

### PORTAL_TO_ROLE
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para portal to role.
- **Contrato:** Pendiente de documentación detallada

### VERIFIED_ROLES
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para verified roles.
- **Contrato:** Pendiente de documentación detallada

### WebRTCDiagnostics
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para webrtcdiagnostics.
- **Contrato:** Pendiente de documentación detallada

### buildSafeLoginUrl
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para buildsafeloginurl.
- **Contrato:** Pendiente de documentación detallada

### canAccessMedicalFeatures
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canaccessmedicalfeatures.
- **Contrato:** Pendiente de documentación detallada

### canInviteMembers
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para caninvitemembers.
- **Contrato:** Pendiente de documentación detallada

### canManageBilling
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanagebilling.
- **Contrato:** Pendiente de documentación detallada

### canManageCompany
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanagecompany.
- **Contrato:** Pendiente de documentación detallada

### canManageOrganizations
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para canmanageorganizations.
- **Contrato:** Pendiente de documentación detallada

### countActive
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para countactive.
- **Contrato:** Pendiente de documentación detallada

### ensureClientEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureclientenv.
- **Contrato:** Pendiente de documentación detallada

### ensureEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureenv.
- **Contrato:** Pendiente de documentación detallada

### ensureServerEnv
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para ensureserverenv.
- **Contrato:** Pendiente de documentación detallada

### getAppUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getappurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getBaseUrlForRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getbaseurlforrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getClientEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getclientenvordefault en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getCookieDomain
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getcookiedomain en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDefaultRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getdefaultredirecturl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoginUrl
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getloginurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getOptionalClientEnv
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getoptionalclientenv en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPortalForRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getportalforrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getPortalUrlWithPath
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getportalurlwithpath en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleDescription
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroledescription en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleDisplayName
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroledisplayname en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRoleForPortal
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getroleforportal en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getServerEnvOrDefault
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getserverenvordefault en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSession
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getsession en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getTargetUrlByRole
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para gettargeturlbyrole en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### hardDelete
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para harddelete.
- **Contrato:** Pendiente de documentación detallada

### hasAdminAccess
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para hasadminaccess.
- **Contrato:** Pendiente de documentación detallada

### hasRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para hasrole.
- **Contrato:** Pendiente de documentación detallada

### insertRecord
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para insertrecord.
- **Contrato:** Pendiente de documentación detallada

### isAllowedRedirect
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isallowedredirect.
- **Contrato:** Pendiente de documentación detallada

### isCorrectPortal
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para iscorrectportal.
- **Contrato:** Pendiente de documentación detallada

### isValidRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isvalidrole.
- **Contrato:** Pendiente de documentación detallada

### isValidUserRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isvaliduserrole.
- **Contrato:** Pendiente de documentación detallada

### logger
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para logger.
- **Contrato:** Pendiente de documentación detallada

### requiresVerification
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para requiresverification.
- **Contrato:** Pendiente de documentación detallada

### restoreRecord
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para restorerecord.
- **Contrato:** Pendiente de documentación detallada

### roleToPortal
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para roletoportal.
- **Contrato:** Pendiente de documentación detallada

### roleToPortalDev
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para roletoportaldev.
- **Contrato:** Pendiente de documentación detallada

### safeRedirectOrFallback
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para saferedirectorfallback.
- **Contrato:** Pendiente de documentación detallada

### selectActive
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para selectactive.
- **Contrato:** Pendiente de documentación detallada

### selectActiveRaw
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para selectactiveraw.
- **Contrato:** Pendiente de documentación detallada

### selectById
- **Tipo:** type
- **Package:** @autamedica/shared
- **Descripción:** Identificador único tipado para selectby en el sistema.
- **Contrato:** Pendiente de documentación detallada

### softDelete
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para softdelete.
- **Contrato:** Pendiente de documentación detallada

### supabase
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para supabase.
- **Contrato:** Pendiente de documentación detallada

### toCamel
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para tocamel.
- **Contrato:** Pendiente de documentación detallada

### toSnake
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para tosnake.
- **Contrato:** Pendiente de documentación detallada

### type CamelCased
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type camelcased.
- **Contrato:** Pendiente de documentación detallada

### type SelectOptions
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type selectoptions.
- **Contrato:** Pendiente de documentación detallada

### type Session
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type session.
- **Contrato:** Pendiente de documentación detallada

### type SessionRole
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type sessionrole.
- **Contrato:** Pendiente de documentación detallada

### type SnakeCased
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type snakecased.
- **Contrato:** Pendiente de documentación detallada

### updateRecord
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para updaterecord.
- **Contrato:** Pendiente de documentación detallada

### validateEmail
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para validateemail.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironmentByType
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironmentbytype en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateEnvironmentSecurity
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateenvironmentsecurity en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validatePhone
- **Tipo:** const
- **Package:** @autamedica/shared
- **Descripción:** Constante del sistema para validatephone.
- **Contrato:** Pendiente de documentación detallada

### validateProductionEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validateproductionenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### validateStagingEnvironment
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para validatestagingenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### APP_ALLOWED_ROLES
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para app_allowed_roles.
- **Contrato:** Pendiente de documentación detallada

### AuthError
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para autherror.
- **Contrato:** Pendiente de documentación detallada

### AuthProvider
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para authprovider.
- **Contrato:** Pendiente de documentación detallada

### ROLE_APP_MAPPING
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para role_app_mapping.
- **Contrato:** Pendiente de documentación detallada

### authMiddleware
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para authmiddleware.
- **Contrato:** Pendiente de documentación detallada

### clearLastPath
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para clearlastpath.
- **Contrato:** Pendiente de documentación detallada

### createAppMiddleware
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para createappmiddleware en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### createBrowserClient
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para createbrowserclient.
- **Contrato:** Pendiente de documentación detallada

### getCorrectAppUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getcorrectappurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getCurrentUser
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getcurrentuser en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDefaultRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getdefaultredirecturl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getDomainConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getdomain del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### getEnvironment
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getenvironment en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLastPath
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getlastpath en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoginUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getloginurl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getRedirectUrl
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getredirecturl en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSession
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getsession en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSessionConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getsession del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseClient
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para getsupabaseclient en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getSupabaseConfig
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Configuración para getsupabase del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### hasPortalAccess
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para hasportalaccess.
- **Contrato:** Pendiente de documentación detallada

### hasRole
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para hasrole.
- **Contrato:** Pendiente de documentación detallada

### isCorrectAppForRole
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para iscorrectappforrole.
- **Contrato:** Pendiente de documentación detallada

### isSameOrigin
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para issameorigin.
- **Contrato:** Pendiente de documentación detallada

### requirePortalAccess
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para requireportalaccess.
- **Contrato:** Pendiente de documentación detallada

### requireSession
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para requiresession.
- **Contrato:** Pendiente de documentación detallada

### sanitizeReturnUrl
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para sanitizereturnurl.
- **Contrato:** Pendiente de documentación detallada

### signOut
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para signout.
- **Contrato:** Pendiente de documentación detallada

### signOutGlobally
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para signoutglobally.
- **Contrato:** Pendiente de documentación detallada

### storeLastPath
- **Tipo:** unknown
- **Package:** @autamedica/auth
- **Descripción:** Utilidad del sistema AutaMedica para storelastpath.
- **Contrato:** Pendiente de documentación detallada

### useAuth
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de auth en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useRequireAuth
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de requireauth en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useRequireRole
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para gestión de requirerole en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useAppointments
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de appointments en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useAsync
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de async en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useDebounce
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de debounce en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### usePatients
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de patients en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

## 📋 Exports Auto-generados

### createMiddlewareClient
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para createmiddlewareclient.
- **Contrato:** Pendiente de documentación detallada

### createRouteHandlerClient
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constante del sistema para createroutehandlerclient.
- **Contrato:** Pendiente de documentación detallada

### createServerClient
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Función utilitaria para createserverclient en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

## 📋 Exports Auto-generados

### APP_NAMES
- **Tipo:** const
- **Package:** @autamedica/auth
- **Descripción:** Constantes de nombres de aplicaciones del ecosistema AutaMedica.
- **Contrato:** Objeto constante con los nombres de todas las aplicaciones del sistema:
  ```typescript
  {
    WEB_APP: 'web-app',
    AUTH: 'auth',
    PATIENTS: 'patients',
    DOCTORS: 'doctors',
    COMPANIES: 'companies',
    ADMIN: 'admin'
  } satisfies Record<string, AppName>
  ```

### AppNameConstant
- **Tipo:** type
- **Package:** @autamedica/auth
- **Descripción:** Tipo derivado de los valores del objeto APP_NAMES.
- **Contrato:**
  ```typescript
  type AppNameConstant = typeof APP_NAMES[keyof typeof APP_NAMES]
  // Equivalente a: 'web-app' | 'auth' | 'patients' | 'doctors' | 'companies' | 'admin'
  ```

### UserMetadata
- **Tipo:** interface
- **Package:** @autamedica/auth
- **Descripción:** Metadata de usuario almacenada en Supabase auth.users.user_metadata.
- **Contrato:**
  ```typescript
  interface UserMetadata {
    full_name?: string      // Nombre completo del usuario
    first_name?: string     // Nombre
    last_name?: string      // Apellido
    role?: string           // Rol en el sistema
    company_name?: string   // Nombre de empresa (para admins de organización)
    avatar_url?: string     // URL del avatar
    phone?: string          // Teléfono del usuario
    [key: string]: unknown  // Metadata adicional personalizada
  }
  ```

### useSupabase
- **Tipo:** function
- **Package:** @autamedica/auth
- **Descripción:** Hook de React para obtener una instancia singleton del cliente Supabase.
- **Contrato:**
  ```typescript
  function useSupabase(): SupabaseClient
  ```
  - Retorna una instancia memoizada del cliente Supabase para optimizar performance
  - Solo para uso en componentes cliente (require 'use client')
  - Reutiliza la misma instancia a través de componentes

## 📋 Exports Auto-generados

### isDevelopment
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isdevelopment.
- **Contrato:** Pendiente de documentación detallada

### isProduction
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isproduction.
- **Contrato:** Pendiente de documentación detallada

## 📋 Exports Auto-generados

### cn
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para cn.
- **Contrato:** Pendiente de documentación detallada

### delay
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para delay.
- **Contrato:** Pendiente de documentación detallada

### getAppEnv
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getappenv en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### getLoginUrlBuilder
- **Tipo:** function
- **Package:** @autamedica/shared
- **Descripción:** Función utilitaria para getloginurlbuilder en el ecosistema AutaMedica.
- **Contrato:** Pendiente de documentación detallada

### isBoolean
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isboolean.
- **Contrato:** Pendiente de documentación detallada

### isNumber
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isnumber.
- **Contrato:** Pendiente de documentación detallada

### isString
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para isstring.
- **Contrato:** Pendiente de documentación detallada

### type AppEnvironmentConfig
- **Tipo:** interface
- **Package:** @autamedica/shared
- **Descripción:** Configuración para type appenvironment del sistema médico.
- **Contrato:** Pendiente de documentación detallada

### type AppName
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type appname.
- **Contrato:** Pendiente de documentación detallada

### type LoginUrlBuilder
- **Tipo:** unknown
- **Package:** @autamedica/shared
- **Descripción:** Utilidad del sistema AutaMedica para type loginurlbuilder.
- **Contrato:** Pendiente de documentación detallada

## 📋 Exports Auto-generados

### useMediaControls
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de mediacontrols en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useRtcStats
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de rtcstats en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

### useTelemedicineClient
- **Tipo:** function
- **Package:** @autamedica/hooks
- **Descripción:** Hook de React para gestión de telemedicineclient en la aplicación médica.
- **Contrato:** Pendiente de documentación detallada

## 🔗 Referencias Relacionadas

- **[CLAUDE.md](../CLAUDE.md)** - Guía para Claude Code
- **[DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md)** - Roadmap de desarrollo
- **[DEVALTAMEDICA_GUIDE.md](../DEVALTAMEDICA_GUIDE.md)** - Metodología de migración
- **[Package.json scripts](../../package.json)** - Comandos de validación

---

**Mantenido por**: Sistema de validación automática
**Última refactorización**: 2025-10-04
**Estructura**: Modular (4 sub-glosarios especializados)
