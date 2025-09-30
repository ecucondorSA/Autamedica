# Despliegue Edge Functions via CLI

## 🚀 Despliegue Automático con Supabase CLI

### **Opción A: Login Interactivo (Recomendado)**

```bash
# 1. Login a Supabase (abrirá el navegador)
npx supabase login

# 2. Desplegar ambas funciones
npx supabase functions deploy create-call --project-ref gtyvdircfhmdjiaelqkg
npx supabase functions deploy update-call-status --project-ref gtyvdircfhmdjiaelqkg

# 3. Verificar deployment
curl -L -X POST 'https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/create-call' \
  -H 'Authorization: Bearer [YOUR-AUTH-TOKEN]' \
  -H 'Content-Type: application/json' \
  -H 'apikey: REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA' \
  --data '{"doctorId":"test-doctor","patientId":"test-patient"}'
```

### **Opción B: Access Token Manual**

Si ya tienes un access token de Supabase:

```bash
# 1. Configurar token (reemplaza YOUR_ACCESS_TOKEN)
export SUPABASE_ACCESS_TOKEN="your_access_token_here"

# 2. Desplegar funciones
npx supabase functions deploy create-call --project-ref gtyvdircfhmdjiaelqkg
npx supabase functions deploy update-call-status --project-ref gtyvdircfhmdjiaelqkg
```

### **Opción C: Script de Despliegue Automatizado**

He creado un script que puedes ejecutar:

```bash
# Hacer ejecutable
chmod +x ./deploy-functions.sh

# Ejecutar
./deploy-functions.sh
```

## 📍 **URLs de las Funciones Desplegadas**

Una vez desplegadas exitosamente, las funciones estarán disponibles en:

- **Create Call**: `https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/create-call`
- **Update Call Status**: `https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/update-call-status`

## 🧪 **Testing Post-Deployment**

### **1. Test con curl:**

```bash
# Test create-call
curl -L -X POST 'https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/create-call' \
  -H 'Authorization: Bearer [USER-AUTH-TOKEN]' \
  -H 'Content-Type: application/json' \
  -H 'apikey: REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA' \
  --data '{"doctorId":"test-doctor","patientId":"test-patient"}'

# Test update-call-status
curl -L -X POST 'https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/update-call-status' \
  -H 'Authorization: Bearer [USER-AUTH-TOKEN]' \
  -H 'Content-Type: application/json' \
  -H 'apikey: REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA' \
  --data '{"callId":"[CALL-ID-FROM-CREATE]","status":"accepted","reason":"Test"}'
```

### **2. Test con Navegador:**

Abrir `test-edge-functions.html` en el navegador y seguir las instrucciones.

## 🔧 **Troubleshooting**

### **Error: Access token not provided**
```bash
# Solución: Login first
npx supabase login
```

### **Error: function not found**
```bash
# Verificar que las funciones se desplegaron correctamente
npx supabase functions list --project-ref gtyvdircfhmdjiaelqkg
```

### **Error: Invalid API key**
- Verificar que estás usando el `anon key` correcto en las peticiones
- Verificar que la función está verificando autenticación correctamente

### **Error: Database function not found**
- Asegurarse de que la migración SQL se aplicó correctamente
- Verificar que las funciones `create_call` y `update_call_status` existen en la base de datos

## ✅ **Verificación Exitosa**

Si todo funciona correctamente, deberías ver:

```json
{
  "success": true,
  "call": {
    "id": "uuid-del-call",
    "room_id": "room_abc123",
    "doctor_id": "test-doctor",
    "patient_id": "test-patient",
    "status": "requested",
    "created_at": "2025-09-28T..."
  }
}
```

## 🎯 **Próximo Paso**

Una vez que las Edge Functions estén desplegadas y funcionando, el sistema de llamadas estará completamente operativo. El frontend ya está configurado para usar estas funciones automáticamente.