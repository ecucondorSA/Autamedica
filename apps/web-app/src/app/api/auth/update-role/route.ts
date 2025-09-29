import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, userId } = body;

    // Validate role
    const validRoles = ['patient', 'doctor', 'company', 'company_admin', 'organization_admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Verify that the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar este usuario' },
        { status: 403 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Error al actualizar el perfil' },
          { status: 500 }
        );
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json(
          { error: 'Error al crear el perfil' },
          { status: 500 }
        );
      }
    }

    // Update user metadata if we have service role key
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: metadataError } = await adminClient.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: { role },
          user_metadata: { role }
        }
      );

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        // Don't fail the request, profile update was successful
      }
    }

    // Return success with the portal URL for the role
    const portalUrl = getPortalUrlForRole(role);

    return NextResponse.json({
      success: true,
      role,
      redirectUrl: portalUrl
    });

  } catch (error) {
    console.error('Error in update-role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function getPortalUrlForRole(role: string): string {
  // In development, use different ports
  if (process.env.NODE_ENV === 'development') {
    switch(role) {
      case 'doctor':
        return process.env.NEXT_PUBLIC_PORTAL_DOCTORS || 'http://localhost:3001';
      case 'patient':
        return process.env.NEXT_PUBLIC_PORTAL_PATIENTS || 'http://localhost:3002';
      case 'company':
      case 'company_admin':
        return process.env.NEXT_PUBLIC_PORTAL_COMPANIES || 'http://localhost:3003';
      case 'organization_admin':
        return process.env.NEXT_PUBLIC_PORTAL_ADMIN || 'http://localhost:3004';
      default:
        return '/';
    }
  }

  // In production, use configured URLs
  switch(role) {
    case 'doctor':
      return process.env.NEXT_PUBLIC_BASE_URL_DOCTORS || 'https://autamedica-doctors.pages.dev';
    case 'patient':
      return process.env.NEXT_PUBLIC_BASE_URL_PATIENTS || 'https://autamedica-patients.pages.dev';
    case 'company':
    case 'company_admin':
      return process.env.NEXT_PUBLIC_BASE_URL_COMPANIES || 'https://autamedica-companies.pages.dev';
    case 'organization_admin':
      return process.env.NEXT_PUBLIC_BASE_URL_ADMIN || 'https://autamedica-admin.pages.dev';
    default:
      return '/';
  }
}