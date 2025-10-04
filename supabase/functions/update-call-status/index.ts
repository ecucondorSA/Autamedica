import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

logger.info("Update Call Status function started")

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

    logger.info('Updating call status:', { callId, status, reason })

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

    // Call the update_call_status function using admin privileges
    const { data: updated, error: updateError } = await supabaseAdmin
      .rpc('update_call_status', {
        p_call_id: callId,
        p_status: status,
        p_reason: reason || null
      })

    if (updateError) {
      logger.error('Error updating call status:', updateError)
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

    logger.info('Call status updated successfully:', updated)

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