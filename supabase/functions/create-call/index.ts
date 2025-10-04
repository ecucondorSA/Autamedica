import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

logger.info("Create Call function started")

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

    logger.info('Creating call for:', { doctorId, patientId })

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
      logger.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    logger.info('Authenticated user:', user.id)

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
      logger.error('Error creating call:', callError)
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

    logger.info('Call created successfully:', callData)

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
    logger.error('Unexpected error:', error)
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