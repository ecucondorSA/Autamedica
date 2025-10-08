# 🚀 EJECUTAR MIGRACIÓN - MÉTODO MANUAL (ÚNICO FUNCIONAL)

**Problema detectado:** La conexión directa vía CLI está bloqueada por firewall/red.

**Solución:** Ejecución manual en Supabase Dashboard (5 minutos)

---

## ✅ PASO A PASO

### 1. Abrir SQL Editor (Click aquí)
https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new

### 2. Copiar el SQL

**Opción A: Desde terminal**
```bash
cat /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
```

**Opción B: Abrir el archivo directamente**
```bash
code /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
# o
gedit /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
```

### 3. Pegar en SQL Editor

- Seleccionar TODO el contenido (455 líneas)
- Copiar (Ctrl+C)
- Pegar en Supabase SQL Editor (Ctrl+V)

### 4. Ejecutar

- Click en "Run" (esquina inferior derecha)
- O presionar: Ctrl+Enter

### 5. Verificar Resultado

**✅ Si ves "Success":**
- La migración funcionó
- Volver aquí y escribir: "success"

**❌ Si ves algún error:**
- Copiar el mensaje de error completo
- Volver aquí y pegar el error

---

## 📋 QUÉ ESTÁS EJECUTANDO

El SQL creará:
- ✅ 7 tablas: companies, doctors, patients, appointments, medical_records, patient_care_team, company_members
- ✅ 20+ políticas RLS
- ✅ Índices optimizados
- ✅ Triggers automáticos
- ✅ Reparará FK roto de patient_vital_signs

**Líneas de código:** 455
**Riesgo:** BAJO (solo crea, no modifica)
**Reversible:** SÍ

---

## 🔍 DESPUÉS DE EJECUTAR

Una vez que veas "Success", volver aquí y escribir:

```
success
```

O si hubo error, copiar el mensaje completo.

---

**NO HAY OTRA FORMA DE EJECUTARLO DESDE AQUÍ**
La conexión CLI está bloqueada por la red.

