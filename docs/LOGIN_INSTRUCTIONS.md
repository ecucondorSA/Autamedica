# Instrucciones de Login - Usuario Médico

## Información de la Cuenta

**Email**: `doctor.test@autamedica.com`
**Password**: `DoctorTest2025!`
**Rol**: `doctor`
**Nombre**: Dr. Juan Pérez

## Opción 1: Acceso Directo (Recomendado en Development)

Como estamos en modo desarrollo, el middleware de autenticación está **deshabilitado** automáticamente.

**Simplemente abre el navegador en:**
```
http://localhost:3001
```

La aplicación cargará sin necesidad de login. El sistema está en modo desarrollo, por lo que puedes acceder directamente al portal de doctors.

## Opción 2: Login Manual desde DevTools

Si quieres establecer una sesión real de Supabase, usa este script en DevTools Console (F12):

```javascript
// 1. Importar el cliente de Supabase desde el CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = async () => {
  // 2. Crear cliente
  const { createClient } = supabase;
  const client = createClient(
    'https://ewpsepaieakqbywxnidu.supabase.co',
    'sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk'
  );

  // 3. Hacer login
  const { data, error } = await client.auth.signInWithPassword({
    email: 'doctor.test@autamedica.com',
    password: 'DoctorTest2025!'
  });

  if (error) {
    console.error('Error en login:', error);
  } else {
    console.log('✅ Login exitoso!', data);
    console.log('Recargando página...');
    setTimeout(() => location.reload(), 1000);
  }
};
document.head.appendChild(script);
```

## Opción 3: Usar Sistema de Auth Centralizado

Si tienes la app de auth corriendo en puerto 3000 o 3005:

1. Navega a: `http://localhost:3000/auth/login?role=doctor`
2. O: `http://localhost:3005/auth/login?role=doctor`
3. Ingresa las credenciales
4. Serás redirigido automáticamente a `http://localhost:3001`

## Opción 4: API de Login (Para Testing Automatizado)

```bash
# Hacer login y obtener tokens
curl -X POST 'https://ewpsepaieakqbywxnidu.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor.test@autamedica.com",
    "password": "DoctorTest2025!"
  }'
```

## Verificar la Sesión Activa

Una vez logueado, puedes verificar la sesión en DevTools:

```javascript
// Verificar cookie de sesión
document.cookie.split(';').filter(c => c.includes('sb-'));

// O verificar en Application > Cookies
```

## Solución al Error "window.supabase is undefined"

El error que obtuviste es porque Supabase no está disponible como variable global. En su lugar, usa la **Opción 1** (acceso directo en desarrollo) o la **Opción 2** (que carga el cliente dinámicamente).

## Estado Actual del Sistema

- ✅ Usuario médico creado en Supabase
- ✅ Middleware deshabilitado en desarrollo
- ✅ Portal de doctors corriendo en http://localhost:3001
- ✅ Signaling server activo en http://localhost:8888
- ✅ LiveKit configurado y operativo

**Recomendación**: En modo desarrollo, simplemente abre http://localhost:3001 y la app cargará sin necesidad de autenticación.
