import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

/**
 * Test endpoint to verify session persistence
 * GET /api/auth/session
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return NextResponse.json({
        authenticated: false,
        error: error.message
      }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session'
      }, { status: 401 });
    }

    // Get user details
    const { data: { user } } = await supabase.auth.getUser();

    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      session: {
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing',
        expires_at: session.expires_at,
        expires_in: session.expires_in
      },
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.app_metadata?.role || user?.user_metadata?.role,
        created_at: user?.created_at,
        last_sign_in_at: user?.last_sign_in_at
      },
      profile: profile || null,
      cookies: {
        'sb-access-token': 'check-needed',
        'sb-refresh-token': 'check-needed'
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}