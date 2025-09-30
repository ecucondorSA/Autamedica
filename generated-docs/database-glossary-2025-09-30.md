# 📊 Base de Datos AutaMedica - Glosario Técnico

**🏥 Sistema Médico Completo con Cumplimiento HIPAA**

---

## 📋 Información General

| **Campo**                   | **Valor**                |
| --------------------------- | ------------------------ |
| **Base de Datos**           | parsed                   |
| **Esquema Principal**       | 1.0                      |
| **Última Migración**        | 2025-09-30T00:43:20.353Z |
| **Método de Introspección** | SQL_PARSING              |
| **Generado**                | 2025-09-30T18:36:45.255Z |

---

## 🔢 Estadísticas del Esquema

| **Métrica**                        | **Cantidad** |
| ---------------------------------- | ------------ |
| 📋 **Tablas Totales**              | 19           |
| 📊 **Columnas Totales**            | 185          |
| ⚙️ **Funciones**                   | 20           |
| 🔒 **Columnas HIPAA Clasificadas** | 0            |

---

---

## 📋 Tablas por Dominio Médico

### UNKNOWN

#### 📄 `profiles`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**   | **Tipo**  | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| ------------- | --------- | ------------- | ------------------------------------- | --------- |
| `user_id`     | uuid      | ❌            | No description available              | -         |
| `email`       | TEXT      | ✅            | Comunicación con el paciente          | -         |
| `role`        | TEXT      | ✅            | No description available              | -         |
| `external_id` | TEXT      | ✅            | No description available              | -         |
| `first_name`  | TEXT      | ❌            | No description available              | -         |
| `last_name`   | TEXT      | ❌            | No description available              | -         |
| `phone`       | TEXT      | ❌            | Contacto de emergencia y citas        | -         |
| `avatar_url`  | TEXT      | ❌            | No description available              | -         |
| `active`      | BOOLEAN   | ❌            | No description available              | -         |
| `created_at`  | TIMESTAMP | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`  | TIMESTAMP | ❌            | Auditoría de modificación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_profiles_email`** (btree) en email - Optimize query performance
- **`idx_profiles_role`** (btree) en role - Optimize query performance
- **`profiles_user_id_idx`** (btree) en user_id - Optimize query performance
- **`idx_profiles_numeric_id`** (btree) en numeric_id - Optimize query performance

---

### UNKNOWN

#### 📄 `companies`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**        | **Tipo**  | **Requerida** | **Propósito Médico**                     | **HIPAA** |
| ------------------ | --------- | ------------- | ---------------------------------------- | --------- |
| `id`               | UUID      | ❌            | No description available                 | -         |
| `name`             | TEXT      | ✅            | No description available                 | -         |
| `legal_name`       | TEXT      | ❌            | No description available                 | -         |
| `cuit`             | TEXT      | ❌            | No description available                 | -         |
| `industry`         | TEXT      | ❌            | No description available                 | -         |
| `size`             | TEXT      | ❌            | No description available                 | -         |
| `address`          | JSONB     | ❌            | Información demográfica para facturación | -         |
| `phone`            | TEXT      | ❌            | Contacto de emergencia y citas           | -         |
| `email`            | TEXT      | ❌            | Comunicación con el paciente             | -         |
| `website`          | TEXT      | ❌            | No description available                 | -         |
| `owner_profile_id` | UUID      | ❌            | No description available                 | -         |
| `active`           | BOOLEAN   | ❌            | No description available                 | -         |
| `created_at`       | TIMESTAMP | ❌            | Auditoría de creación de registro        | -         |
| `updated_at`       | TIMESTAMP | ❌            | Auditoría de modificación de registro    | -         |

---

### PROVIDER_MANAGEMENT

#### 📄 `doctors`

**Propósito**: Gestión de profesionales médicos

##### 📊 Columnas

| **Columna**          | **Tipo**      | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| -------------------- | ------------- | ------------- | ------------------------------------- | --------- |
| `id`                 | UUID          | ❌            | No description available              | -         |
| `user_id`            | UUID          | ❌            | No description available              | -         |
| `license_number`     | TEXT          | ✅            | No description available              | -         |
| `specialty`          | TEXT          | ✅            | No description available              | -         |
| `subspecialty`       | TEXT          | ❌            | No description available              | -         |
| `years_experience`   | INTEGER       | ❌            | No description available              | -         |
| `education`          | JSONB         | ❌            | No description available              | -         |
| `certifications`     | JSONB         | ❌            | No description available              | -         |
| `schedule`           | JSONB         | ❌            | No description available              | -         |
| `consultation_fee`   | DECIMAL(10,2) | ❌            | No description available              | -         |
| `accepted_insurance` | JSONB         | ❌            | Cobertura de seguro médico            | -         |
| `bio`                | TEXT          | ❌            | No description available              | -         |
| `languages`          | JSONB         | ❌            | No description available              | -         |
| `active`             | BOOLEAN       | ❌            | No description available              | -         |
| `created_at`         | TIMESTAMP     | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`         | TIMESTAMP     | ❌            | Auditoría de modificación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_doctors_user_id`** (btree) en user_id - Optimize query performance
- **`idx_doctors_specialty_active`** (btree) en specialty,active - Optimize query performance

---

### PATIENT_MANAGEMENT

#### 📄 `patients`

**Propósito**: Gestión de información de pacientes

##### 📊 Columnas

| **Columna**         | **Tipo**     | **Requerida** | **Propósito Médico**                     | **HIPAA** |
| ------------------- | ------------ | ------------- | ---------------------------------------- | --------- |
| `id`                | UUID         | ❌            | No description available                 | -         |
| `user_id`           | UUID         | ❌            | No description available                 | -         |
| `dni`               | TEXT         | ❌            | No description available                 | -         |
| `birth_date`        | DATE         | ❌            | Cálculo de edad para dosificación médica | -         |
| `gender`            | TEXT         | ❌            | No description available                 | -         |
| `blood_type`        | TEXT         | ❌            | No description available                 | -         |
| `height_cm`         | INTEGER      | ❌            | No description available                 | -         |
| `weight_kg`         | DECIMAL(5,2) | ❌            | No description available                 | -         |
| `emergency_contact` | JSONB        | ❌            | No description available                 | -         |
| `medical_history`   | JSONB        | ❌            | No description available                 | -         |
| `allergies`         | JSONB        | ❌            | No description available                 | -         |
| `medications`       | JSONB        | ❌            | Tratamiento farmacológico prescrito      | -         |
| `insurance_info`    | JSONB        | ❌            | Cobertura de seguro médico               | -         |
| `company_id`        | UUID         | ❌            | No description available                 | -         |
| `active`            | BOOLEAN      | ❌            | No description available                 | -         |
| `created_at`        | TIMESTAMP    | ❌            | Auditoría de creación de registro        | -         |
| `updated_at`        | TIMESTAMP    | ❌            | Auditoría de modificación de registro    | -         |

##### 📈 Índices de Rendimiento

- **`idx_patients_user_id`** (btree) en user_id - Optimize query performance
- **`idx_patients_company_active`** (btree) en organization_id,active - Optimize query performance

---

### UNKNOWN

#### 📄 `company_members`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**          | **Tipo**    | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| -------------------- | ----------- | ------------- | ------------------------------------- | --------- |
| `id`                 | UUID        | ❌            | No description available              | -         |
| `company_id`         | UUID        | ❌            | No description available              | -         |
| `profile_id`         | UUID        | ❌            | No description available              | -         |
| `role`               | TEXT        | ❌            | No description available              | -         |
| `position`           | TEXT        | ❌            | No description available              | -         |
| `department`         | TEXT        | ❌            | No description available              | -         |
| `employee_id`        | TEXT        | ❌            | No description available              | -         |
| `start_date`         | DATE        | ❌            | No description available              | -         |
| `end_date`           | DATE        | ❌            | No description available              | -         |
| `active`             | BOOLEAN     | ❌            | No description available              | -         |
| `created_at`         | TIMESTAMP   | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`         | TIMESTAMP   | ❌            | Auditoría de modificación de registro | -         |
| `UNIQUE(company_id,` | profile_id) | ❌            | No description available              | -         |

---

### PATIENT_MANAGEMENT

#### 📄 `patient_care_team`

**Propósito**: Gestión de información de pacientes

##### 📊 Columnas

| **Columna**          | **Tipo**   | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| -------------------- | ---------- | ------------- | ------------------------------------- | --------- |
| `id`                 | UUID       | ❌            | No description available              | -         |
| `patient_id`         | UUID       | ❌            | No description available              | -         |
| `doctor_id`          | UUID       | ❌            | No description available              | -         |
| `role`               | TEXT       | ❌            | No description available              | -         |
| `assigned_date`      | DATE       | ❌            | No description available              | -         |
| `active`             | BOOLEAN    | ❌            | No description available              | -         |
| `created_at`         | TIMESTAMP  | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`         | TIMESTAMP  | ❌            | Auditoría de modificación de registro | -         |
| `UNIQUE(patient_id,` | doctor_id) | ❌            | No description available              | -         |

##### 📈 Índices de Rendimiento

- **`idx_patient_care_team_lookup`** (btree) en doctor_id,patient_id,active - Optimize query performance

---

### APPOINTMENTS

#### 📄 `appointments`

**Propósito**: Sistema de citas médicas

##### 📊 Columnas

| **Columna**        | **Tipo**  | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| ------------------ | --------- | ------------- | ------------------------------------- | --------- |
| `id`               | UUID      | ❌            | No description available              | -         |
| `patient_id`       | UUID      | ❌            | No description available              | -         |
| `doctor_id`        | UUID      | ❌            | No description available              | -         |
| `start_time`       | TIMESTAMP | ✅            | No description available              | -         |
| `end_time`         | TIMESTAMP | ❌            | No description available              | -         |
| `duration_minutes` | INTEGER   | ❌            | No description available              | -         |
| `type`             | TEXT      | ❌            | No description available              | -         |
| `status`           | TEXT      | ❌            | No description available              | -         |
| `notes`            | TEXT      | ❌            | No description available              | -         |
| `location`         | TEXT      | ❌            | No description available              | -         |
| `meeting_url`      | TEXT      | ❌            | No description available              | -         |
| `created_by`       | UUID      | ❌            | No description available              | -         |
| `created_at`       | TIMESTAMP | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`       | TIMESTAMP | ❌            | Auditoría de modificación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_appointments_patient_id`** (btree) en patient_id - Optimize query performance
- **`idx_appointments_doctor_id`** (btree) en doctor_id - Optimize query performance
- **`idx_appointments_start_time`** (btree) en start_time - Optimize query performance
- **`idx_appointments_doctor_time`** (btree) en doctor_id,start_time - Optimize query performance
- **`idx_appointments_patient_time`** (btree) en patient_id,start_time - Optimize query performance

---

### CLINICAL_DATA

#### 📄 `medical_records`

**Propósito**: Historiales médicos de pacientes

##### 📊 Columnas

| **Columna**      | **Tipo**  | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| ---------------- | --------- | ------------- | ------------------------------------- | --------- |
| `id`             | UUID      | ❌            | No description available              | -         |
| `patient_id`     | UUID      | ❌            | No description available              | -         |
| `doctor_id`      | UUID      | ❌            | No description available              | -         |
| `appointment_id` | UUID      | ❌            | No description available              | -         |
| `type`           | TEXT      | ✅            | No description available              | -         |
| `title`          | TEXT      | ✅            | No description available              | -         |
| `content`        | JSONB     | ✅            | No description available              | -         |
| `attachments`    | JSONB     | ❌            | No description available              | -         |
| `visibility`     | TEXT      | ❌            | No description available              | -         |
| `date_recorded`  | TIMESTAMP | ❌            | No description available              | -         |
| `created_at`     | TIMESTAMP | ❌            | Auditoría de creación de registro     | -         |
| `updated_at`     | TIMESTAMP | ❌            | Auditoría de modificación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_medical_records_patient_id`** (btree) en patient_id - Optimize query performance
- **`idx_medical_records_patient`** (btree) en patient_id,created_at - Optimize query performance

---

### UNKNOWN

#### 📄 `calls`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**   | **Tipo**    | **Requerida** | **Propósito Médico**              | **HIPAA** |
| ------------- | ----------- | ------------- | --------------------------------- | --------- |
| `id`          | UUID        | ❌            | No description available          | -         |
| `room_id`     | TEXT        | ✅            | No description available          | -         |
| `doctor_id`   | UUID        | ✅            | No description available          | -         |
| `patient_id`  | UUID        | ✅            | No description available          | -         |
| `status`      | call_status | ✅            | No description available          | -         |
| `created_at`  | TIMESTAMPTZ | ✅            | Auditoría de creación de registro | -         |
| `accepted_at` | TIMESTAMPTZ | ❌            | No description available          | -         |
| `ended_at`    | TIMESTAMPTZ | ❌            | No description available          | -         |
| `reason`      | TEXT        | ❌            | No description available          | -         |

---

### UNKNOWN

#### 📄 `call_events`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna** | **Tipo**    | **Requerida** | **Propósito Médico**     | **HIPAA** |
| ----------- | ----------- | ------------- | ------------------------ | --------- |
| `id`        | BIGSERIAL   | ❌            | No description available | -         |
| `call_id`   | UUID        | ✅            | No description available | -         |
| `at`        | TIMESTAMPTZ | ✅            | No description available | -         |
| `type`      | TEXT        | ✅            | No description available | -         |
| `payload`   | JSONB       | ❌            | No description available | -         |

---

### UNKNOWN

#### 📄 `profiles`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**  | **Tipo**    | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| ------------ | ----------- | ------------- | ------------------------------------- | --------- |
| `user_id`    | uuid        | ❌            | No description available              | -         |
| `role`       | text        | ✅            | No description available              | -         |
| `created_at` | timestamptz | ✅            | Auditoría de creación de registro     | -         |
| `updated_at` | timestamptz | ✅            | Auditoría de modificación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_profiles_email`** (btree) en email - Optimize query performance
- **`idx_profiles_role`** (btree) en role - Optimize query performance
- **`profiles_user_id_idx`** (btree) en user_id - Optimize query performance
- **`idx_profiles_numeric_id`** (btree) en numeric_id - Optimize query performance

---

### UNKNOWN

#### 📄 `organizations`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**        | **Tipo**    | **Requerida** | **Propósito Médico**                     | **HIPAA** |
| ------------------ | ----------- | ------------- | ---------------------------------------- | --------- |
| `id`               | UUID        | ❌            | No description available                 | -         |
| `owner_profile_id` | UUID        | ✅            | No description available                 | -         |
| `slug`             | TEXT        | ✅            | No description available                 | -         |
| `name`             | TEXT        | ✅            | No description available                 | -         |
| `legal_name`       | TEXT        | ❌            | No description available                 | -         |
| `tax_id`           | TEXT        | ❌            | No description available                 | -         |
| `type`             | TEXT        | ❌            | No description available                 | -         |
| `industry`         | TEXT        | ❌            | No description available                 | -         |
| `size`             | TEXT        | ❌            | No description available                 | -         |
| `address`          | JSONB       | ❌            | Información demográfica para facturación | -         |
| `contact`          | JSONB       | ❌            | No description available                 | -         |
| `metadata`         | JSONB       | ✅            | No description available                 | -         |
| `is_active`        | BOOLEAN     | ✅            | No description available                 | -         |
| `created_at`       | TIMESTAMPTZ | ✅            | Auditoría de creación de registro        | -         |
| `updated_at`       | TIMESTAMPTZ | ✅            | Auditoría de modificación de registro    | -         |

---

### UNKNOWN

#### 📄 `org_members`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**       | **Tipo**    | **Requerida** | **Propósito Médico**                  | **HIPAA** |
| ----------------- | ----------- | ------------- | ------------------------------------- | --------- |
| `organization_id` | UUID        | ✅            | No description available              | -         |
| `profile_id`      | UUID        | ✅            | No description available              | -         |
| `role`            | TEXT        | ✅            | No description available              | -         |
| `status`          | TEXT        | ✅            | No description available              | -         |
| `invited_by`      | UUID        | ❌            | No description available              | -         |
| `metadata`        | JSONB       | ✅            | No description available              | -         |
| `created_at`      | TIMESTAMPTZ | ✅            | Auditoría de creación de registro     | -         |
| `updated_at`      | TIMESTAMPTZ | ✅            | Auditoría de modificación de registro | -         |
| `PRIMARY`         | KEY         | ❌            | No description available              | -         |

---

### SYSTEM_ADMINISTRATION

#### 📄 `user_roles`

**Propósito**: Gestión de usuarios y autenticación

##### 📊 Columnas

| **Columna**       | **Tipo**    | **Requerida** | **Propósito Médico**     | **HIPAA** |
| ----------------- | ----------- | ------------- | ------------------------ | --------- |
| `id`              | UUID        | ❌            | No description available | -         |
| `profile_id`      | UUID        | ✅            | No description available | -         |
| `organization_id` | UUID        | ❌            | No description available | -         |
| `role`            | TEXT        | ✅            | No description available | -         |
| `granted_by`      | UUID        | ❌            | No description available | -         |
| `granted_at`      | TIMESTAMPTZ | ✅            | No description available | -         |
| `expires_at`      | TIMESTAMPTZ | ❌            | No description available | -         |
| `metadata`        | JSONB       | ✅            | No description available | -         |

##### 📈 Índices de Rendimiento

- **`user_roles_unique_global_role`** (btree) en profile_id,role - Optimize query performance
- **`user_roles_unique_org_role`** (btree) en profile_id,organization_id,role - Optimize query performance

---

### PATIENT_MANAGEMENT

#### 📄 `patients`

**Propósito**: Gestión de información de pacientes

##### 📊 Columnas

| **Columna**             | **Tipo**    | **Requerida** | **Propósito Médico**              | **HIPAA** |
| ----------------------- | ----------- | ------------- | --------------------------------- | --------- |
| `id`                    | uuid        | ❌            | No description available          | -         |
| `user_id`               | uuid        | ✅            | No description available          | -         |
| `company_id`            | uuid        | ❌            | No description available          | -         |
| `medical_record_number` | text        | ❌            | No description available          | -         |
| `created_at`            | timestamptz | ❌            | Auditoría de creación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_patients_user_id`** (btree) en user_id - Optimize query performance
- **`idx_patients_company_active`** (btree) en organization_id,active - Optimize query performance

---

### PROVIDER_MANAGEMENT

#### 📄 `doctors`

**Propósito**: Gestión de profesionales médicos

##### 📊 Columnas

| **Columna**      | **Tipo**    | **Requerida** | **Propósito Médico**              | **HIPAA** |
| ---------------- | ----------- | ------------- | --------------------------------- | --------- |
| `id`             | uuid        | ❌            | No description available          | -         |
| `user_id`        | uuid        | ✅            | No description available          | -         |
| `license_number` | text        | ✅            | No description available          | -         |
| `speciality`     | text        | ❌            | No description available          | -         |
| `verified`       | boolean     | ❌            | No description available          | -         |
| `created_at`     | timestamptz | ❌            | Auditoría de creación de registro | -         |

##### 📈 Índices de Rendimiento

- **`idx_doctors_user_id`** (btree) en user_id - Optimize query performance
- **`idx_doctors_specialty_active`** (btree) en specialty,active - Optimize query performance

---

### UNKNOWN

#### 📄 `companies`

**Propósito**: Tabla del sistema médico

##### 📊 Columnas

| **Columna**    | **Tipo**    | **Requerida** | **Propósito Médico**              | **HIPAA** |
| -------------- | ----------- | ------------- | --------------------------------- | --------- |
| `id`           | uuid        | ❌            | No description available          | -         |
| `user_id`      | uuid        | ✅            | No description available          | -         |
| `tax_id`       | text        | ✅            | No description available          | -         |
| `company_name` | text        | ✅            | No description available          | -         |
| `created_at`   | timestamptz | ❌            | Auditoría de creación de registro | -         |

---

### PATIENT_MANAGEMENT

#### 📄 `doctor_patient`

**Propósito**: Gestión de información de pacientes

##### 📊 Columnas

| **Columna**   | **Tipo**    | **Requerida** | **Propósito Médico**     | **HIPAA** |
| ------------- | ----------- | ------------- | ------------------------ | --------- |
| `doctor_id`   | uuid        | ❌            | No description available | -         |
| `patient_id`  | uuid        | ❌            | No description available | -         |
| `assigned_at` | timestamptz | ❌            | No description available | -         |
| `PRIMARY`     | KEY         | ❌            | No description available | -         |

---

### COMPLIANCE_AUDIT

#### 📄 `medical_audit_log`

**Propósito**: Auditoría y registro de actividades

##### 📊 Columnas

| **Columna**       | **Tipo**    | **Requerida** | **Propósito Médico**                     | **HIPAA** |
| ----------------- | ----------- | ------------- | ---------------------------------------- | --------- |
| `id`              | uuid        | ❌            | No description available                 | -         |
| `user_id`         | uuid        | ❌            | No description available                 | -         |
| `action_type`     | text        | ✅            | No description available                 | -         |
| `table_name`      | text        | ✅            | No description available                 | -         |
| `record_id`       | uuid        | ❌            | No description available                 | -         |
| `patient_user_id` | uuid        | ❌            | No description available                 | -         |
| `ip_address`      | inet        | ❌            | Información demográfica para facturación | -         |
| `user_agent`      | text        | ❌            | No description available                 | -         |
| `created_at`      | timestamptz | ❌            | Auditoría de creación de registro        | -         |

##### 📈 Índices de Rendimiento

- **`idx_audit_log_user_date`** (btree) en user_id,created_at - Optimize query performance
- **`idx_audit_log_patient_date`** (btree) en patient_user_id,created_at - Optimize query performance

---

---

## ⚙️ Funciones y Procedimientos

### `handle_updated_at()`

**Propósito**: Database function
**Tipo de Retorno**: `TRIGGER AS $$ BEGIN NEW.updated_at &#x3D; NOW()`

---

### `create_call()`

**Propósito**: Database function
**Tipo de Retorno**: `TABLE( id UUID, room_id TEXT, doctor_id UUID, patient_id UUID, status call_status, created_at TIMESTAMPTZ ) AS $$ DECLARE v_room_id TEXT`

---

### `update_call_status()`

**Propósito**: Database function
**Tipo de Retorno**: `BOOLEAN AS $$ DECLARE v_updated BOOLEAN :&#x3D; FALSE`

---

### `handle_new_user()`

**Propósito**: Database function
**Tipo de Retorno**: `trigger as $$ begin insert into public.profiles (user_id, email, role) values ( new.id, new.email, coalesce( new.raw_app_meta_data-&gt;&gt;&#x27;role&#x27;, new.raw_user_meta_data-&gt;&gt;&#x27;role&#x27;, &#x27;patient&#x27; )::text )`

---

### `update_updated_at_column()`

**Propósito**: Database function
**Tipo de Retorno**: `trigger as $$ begin new.updated_at &#x3D; now()`

---

### `update_updated_at_column()`

**Propósito**: Database function
**Tipo de Retorno**: `TRIGGER AS $$ BEGIN NEW.updated_at &#x3D; NOW()`

---

### `select_primary_role_for_profile()`

**Propósito**: Database function
**Tipo de Retorno**: `TEXT AS $$ DECLARE selected_role TEXT`

---

### `sync_profile_primary_role()`

**Propósito**: Database function
**Tipo de Retorno**: `TRIGGER AS $$ BEGIN IF TG_OP &#x3D; &#x27;DELETE&#x27; THEN UPDATE public.profiles SET role &#x3D; public.select_primary_role_for_profile(OLD.profile_id), updated_at &#x3D; NOW() WHERE user_id &#x3D; OLD.profile_id`

---

### `generate_external_id()`

**Propósito**: Database function
**Tipo de Retorno**: `text AS $$ BEGIN RETURN role_prefix || &#x27;_&#x27; || substr(encode(gen_random_bytes(6), &#x27;base64&#x27;), 1, 8)`

---

### `auto_generate_external_id()`

**Propósito**: Database function
**Tipo de Retorno**: `trigger AS $$ BEGIN IF NEW.external_id IS NULL THEN NEW.external_id :&#x3D; generate_external_id( CASE NEW.role WHEN &#x27;patient&#x27; THEN &#x27;PAT&#x27; WHEN &#x27;doctor&#x27; THEN &#x27;DOC&#x27; WHEN &#x27;company&#x27; THEN &#x27;COM&#x27; WHEN &#x27;company_admin&#x27; THEN &#x27;ADM&#x27; WHEN &#x27;organization_admin&#x27; THEN &#x27;ORG&#x27; END )`

---

### `ensure_numeric_id()`

**Propósito**: Database function
**Tipo de Retorno**: `TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF NEW.numeric_id IS NULL THEN NEW.numeric_id :&#x3D; nextval(&#x27;public.user_numeric_id_seq&#x27;)`

---

### `get_next_numeric_id()`

**Propósito**: Database function
**Tipo de Retorno**: `BIGINT LANGUAGE sql SECURITY DEFINER AS $$ SELECT last_value + 1 FROM public.user_numeric_id_seq`

---

### `format_user_id()`

**Propósito**: Database function
**Tipo de Retorno**: `TEXT LANGUAGE plpgsql IMMUTABLE AS $$ DECLARE v_prefix TEXT`

---

### `is_doctor()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.profiles WHERE user_id &#x3D; auth.uid() AND role &#x3D; &#x27;doctor&#x27; AND active &#x3D; true )`

---

### `is_patient()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.profiles WHERE user_id &#x3D; auth.uid() AND role &#x3D; &#x27;patient&#x27; AND active &#x3D; true )`

---

### `is_company_admin()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.profiles WHERE user_id &#x3D; auth.uid() AND role IN (&#x27;company&#x27;, &#x27;company_admin&#x27;) AND active &#x3D; true )`

---

### `is_system_admin()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.profiles WHERE user_id &#x3D; auth.uid() AND role IN (&#x27;admin&#x27;, &#x27;platform_admin&#x27;) AND active &#x3D; true )`

---

### `doctor_has_patient_access()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ DECLARE doctor_id uuid`

---

### `user_belongs_to_company()`

**Propósito**: Database function
**Tipo de Retorno**: `boolean AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.company_members cm JOIN public.profiles p ON p.user_id &#x3D; cm.profile_id WHERE cm.profile_id &#x3D; auth.uid() AND cm.organization_id &#x3D; target_organization_id AND cm.active &#x3D; true AND p.active &#x3D; true )`

---

### `log_medical_access()`

**Propósito**: Database function
**Tipo de Retorno**: `void AS $$ BEGIN INSERT INTO public.medical_audit_log ( user_id, action_type, table_name, record_id, patient_user_id, ip_address, created_at ) VALUES ( auth.uid(), p_action_type, p_table_name, p_record_id, p_patient_user_id, inet_client_addr(), now() )`

---

---

## 🔍 Validación del Esquema

✅ **No hay problemas de validación detectados**

---

## 🏗️ Información de Generación

| **Campo**               | **Valor**                  |
| ----------------------- | -------------------------- |
| **Generado Por**        | Database Glossary CLI v1.0 |
| **Modo**                | SQL_PARSING                |
| **Versión de Template** | 1.0                        |
| **Duración**            | 0ms                        |
| **Validación**          | ✅ Pasó                    |

---

## 📚 Referencias y Notas

### 🏥 Dominios Médicos Cubiertos

- **👤 PATIENT_MANAGEMENT**: Gestión de pacientes y demografía
- **🩺 CLINICAL_DATA**: Datos clínicos, diagnósticos, tratamientos
- **📅 APPOINTMENTS**: Sistema de citas y agenda médica
- **💰 BILLING_FINANCIAL**: Facturación y gestión financiera
- **👨‍⚕️ PROVIDER_MANAGEMENT**: Gestión de profesionales médicos
- **🏥 FACILITY_OPERATIONS**: Operaciones de instalaciones médicas
- **💻 TELEMEDICINE**: Consultas remotas y telemedicina
- **🔬 RESEARCH_ANALYTICS**: Investigación y análisis poblacional
- **⚙️ SYSTEM_ADMINISTRATION**: Administración del sistema
- **📋 COMPLIANCE_AUDIT**: Cumplimiento y auditoría
- **🚨 EMERGENCY_CARE**: Atención de emergencias
- **💊 PHARMACY**: Gestión farmacéutica
- **🧪 LABORATORY**: Laboratorio y resultados
- **📷 IMAGING**: Imagenología médica

### 🔒 Niveles de Sensibilidad HIPAA

- **PUBLIC**: Sin PHI - datos públicos
- **INTERNAL**: Uso interno - sin datos de pacientes
- **RESTRICTED**: Contiene PHI - acceso controlado
- **HIGHLY_SENSITIVE**: PHI altamente sensible - auditoría obligatoria
- **PSYCHIATRIC**: Salud mental - protección especial
- **GENETIC**: Información genética - protección federal
- **UNKNOWN**: Requiere revisión manual

### 📖 Convenciones de Nomenclatura

- **Tablas**: snake_case, singular para entidades, plural para relaciones
- **Columnas**: snake_case, descriptivo del contenido
- **Índices**: idx_tablename_columnname(s)
- **Constrains**: pk_tablename (primary key), fk_tablename_referenced (foreign key)
- **Funciones**: verbo_sustantivo, descriptivo de la acción

---

**🔐 Documento generado automáticamente - Cumplimiento HIPAA verificado**
**📅 Última actualización**: 2025-09-30T18:36:45.258Z
**🛠️ Sistema de Glosario de Base de Datos AutaMedica v1.0**
