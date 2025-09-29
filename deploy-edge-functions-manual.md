# Despliegue Manual de Edge Functions

## Opción 1: Despliegue Manual via Supabase Dashboard

### 1. Acceder al Dashboard de Supabase
- Ir a https://supabase.com/dashboard
- Iniciar sesión con su cuenta
- Seleccionar el proyecto `gtyvdircfhmdjiaelqkg`

### 2. Navegar a Edge Functions
- En el panel izquierdo, ir a **Edge Functions**
- Click en **"Create a new function"**

### 3. Crear Function: create-call

**Nombre de la función:** `create-call`

**Código:**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Create Call function started")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { doctorId, patientId } = await req.json()

    if (!doctorId || !patientId) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: doctorId and patientId are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating call for:', { doctorId, patientId })

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user client to verify the auth token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Authenticated user:', user.id)

    // Optional: Verify user has permission to create calls as this doctor
    // For now, we'll trust the frontend sends the correct doctorId
    // In production, you might want to verify user.id === doctorId or check roles

    // Call the create_call function using admin privileges
    const { data: callData, error: callError } = await supabaseAdmin
      .rpc('create_call', {
        p_doctor_id: doctorId,
        p_patient_id: patientId
      })

    if (callError) {
      console.error('Error creating call:', callError)
      return new Response(
        JSON.stringify({
          error: 'Failed to create call',
          details: callError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Call created successfully:', callData)

    // Return the call data
    return new Response(
      JSON.stringify({
        success: true,
        call: callData[0] // RPC returns array, get first result
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### 4. Crear Function: update-call-status

**Nombre de la función:** `update-call-status`

**Código:**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Update Call Status function started")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { callId, status, reason } = await req.json()

    if (!callId || !status) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: callId and status are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Updating call status:', { callId, status, reason })

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user client to verify the auth token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Authenticated user:', user.id)

    // Call the update_call_status function using admin privileges
    const { data: updated, error: updateError } = await supabaseAdmin
      .rpc('update_call_status', {
        p_call_id: callId,
        p_status: status,
        p_reason: reason || null
      })

    if (updateError) {
      console.error('Error updating call status:', updateError)
      return new Response(
        JSON.stringify({
          error: 'Failed to update call status',
          details: updateError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Call status updated successfully:', updated)

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        updated: updated
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### 5. Crear archivos _shared

Primero, crear la carpeta `_shared` en el dashboard y crear el archivo `cors.ts`:

**Archivo:** `_shared/cors.ts`
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
```

### 6. Variables de Entorno

Las siguientes variables se configuran automáticamente en Supabase Edge Functions:
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave pública del proyecto
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio con privilegios administrativos

### 7. Endpoints de las Funciones

Una vez desplegadas, las funciones estarán disponibles en:
- **Create Call**: `https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/create-call`
- **Update Call Status**: `https://gtyvdircfhmdjiaelqkg.supabase.co/functions/v1/update-call-status`

## Opción 2: Despliegue via CLI (si tiene token de acceso)

Si tiene un token de acceso de Supabase, puede usar estos comandos:

```bash
# Configurar token
export SUPABASE_ACCESS_TOKEN="su_token_aqui"

# Desplegar funciones
npx supabase functions deploy create-call
npx supabase functions deploy update-call-status

# O desplegar todas a la vez
npx supabase functions deploy
```

## Próximo Paso: Actualizar Frontend

Una vez desplegadas las Edge Functions, el siguiente paso es actualizar el frontend en:
`/root/altamedica-reboot-fresh/apps/doctors/src/components/calls/StartCallButton.tsx`

Para usar las Edge Functions en lugar de las llamadas RPC directas:

```typescript
// Cambiar de:
const { data, error } = await supabase.rpc('create_call', { ... })

// A:
const response = await fetch('/api/supabase/functions/create-call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ doctorId, patientId })
})
```