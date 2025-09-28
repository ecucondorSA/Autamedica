# TODO Glosario – Autamedica (PR #1)

## 📊 Resumen de CI: 167 errores detectados
- **147 exports** no documentados en glosario
- **32 tipos** documentados pero no exportados
- **20 errores** de naming conventions

## 🎯 Prioridad 1: Faltantes críticos (añadir al GLOSARIO_MAESTRO)

### Utilidades de fechas ISO
- [ ] `isISODateString` - Validator para strings de fecha ISO
- [ ] `toISODateString` - Converter a formato ISO string
- [ ] `nowAsISODateString` - Fecha actual como ISO string

### Sistema de IDs y validación
- [ ] `createId` - Factory para crear IDs únicos
- [ ] `ID_VALIDATION_CONFIG` - Configuración de validación de IDs
- [ ] `validateIdForScope` - Validador de ID por contexto
- [ ] `createValidatedId` - Factory para IDs validados
- [ ] `generateUUID` - Generador UUID v4
- [ ] `generatePrefixedId` - Generador ID con prefijo
- [ ] `generatePatientId` - Generador específico para pacientes
- [ ] `generateDoctorId` - Generador específico para médicos
- [ ] `generateAppointmentId` - Generador específico para citas

### Estado de entidades
- [ ] `isEntityDeleted` - Verificar si entidad está eliminada
- [ ] `isEntityActive` - Verificar si entidad está activa
- [ ] `markEntityAsDeleted` - Marcar entidad como eliminada

### API Response helpers
- [ ] `ok` - Constructor para respuesta exitosa
- [ ] `fail` - Constructor para respuesta fallida
- [ ] `failWithCode` - Constructor error con código específico
- [ ] `isApiSuccess` - Type guard para respuesta exitosa
- [ ] `isApiError` - Type guard para respuesta con error
- [ ] `unwrapApiResponse` - Extraer data de response
- [ ] `mapApiResponse` - Transformar response
- [ ] `medicalOk` - Constructor respuesta médica exitosa
- [ ] `medicalFail` - Constructor respuesta médica fallida

## ⚠️ Prioridad 2: Huérfanos (están en glosario pero no exportados)

- [ ] `UUID` - Revisar si debe exportarse o es base type
- [ ] `PatientId` - Branded type, debería exportarse
- [ ] `DoctorId` - Branded type, debería exportarse
- [ ] `AppointmentId` - Branded type, debería exportarse
- [ ] `FacilityId` - Branded type, debería exportarse

## 📋 Plan de ejecución

### Batch 1 (15 tipos): Fechas + IDs básicos
1. Documentar en `docs/GLOSARIO_MAESTRO.md`
2. Verificar exports en `packages/types/src/index.ts`
3. Commit: `📝 docs: sincronizar fechas ISO y sistema de IDs (batch 1/10)`

### Batch 2 (15 tipos): API responses + validaciones
1. Documentar helpers de API response
2. Verificar/agregar exports faltantes
3. Commit: `📝 docs: sincronizar API responses y validaciones (batch 2/10)`

### Batch 3 (10 tipos): Resolver huérfanos
1. Exportar branded types faltantes
2. Limpiar entradas obsoletas del glosario
3. Commit: `📝 docs: resolver tipos huérfanos y branded types (batch 3/10)`

## 🎯 Meta: CI en verde
- **Target**: 0 errores en `Validate Contracts`
- **Método**: Iterativo por batches con feedback de CI
- **Validación**: `node scripts/validate-contracts.js` local + GitHub Actions