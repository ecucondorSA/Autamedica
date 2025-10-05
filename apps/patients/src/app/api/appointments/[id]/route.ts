/**
 * API Routes para gestión individual de citas
 * GET /api/appointments/[id] - Obtener cita específica
 * PATCH /api/appointments/[id] - Actualizar cita
 * DELETE /api/appointments/[id] - Cancelar cita
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@autamedica/auth';
import { cookies } from 'next/headers';
import type { UpdateAppointmentInput } from '@/types/appointment';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/appointments/[id]
 * Obtiene una cita específica
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(cookieStore);

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener patient_id
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors (
          id,
          first_name,
          last_name,
          specialty,
          profile_picture_url
        )
      `)
      .eq('id', id)
      .eq('patient_id', patient.id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('[GET /api/appointments/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/appointments/[id]
 * Actualiza una cita existente
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(cookieStore);

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener patient_id
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la cita pertenece al paciente
    const { data: existingAppointment, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .eq('patient_id', patient.id)
      .single();

    if (checkError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Parsear body
    const body: UpdateAppointmentInput = await request.json();

    // Actualizar la cita
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        ...(body.scheduled_at && { scheduled_at: body.scheduled_at }),
        ...(body.duration_minutes && { duration_minutes: body.duration_minutes }),
        ...(body.status && { status: body.status }),
        ...(body.type && { type: body.type }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.reason !== undefined && { reason: body.reason }),
        ...(body.diagnosis !== undefined && { diagnosis: body.diagnosis }),
        ...(body.treatment_plan !== undefined && { treatment_plan: body.treatment_plan }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        doctor:doctors (
          id,
          first_name,
          last_name,
          specialty,
          profile_picture_url
        )
      `)
      .single();

    if (updateError) {
      console.error('[PATCH /api/appointments/[id]] Error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar la cita', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('[PATCH /api/appointments/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Cancela una cita (soft delete, cambia status a 'cancelled')
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(cookieStore);

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener patient_id
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Cancelar la cita (soft delete)
    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('patient_id', patient.id)
      .select()
      .single();

    if (cancelError || !cancelledAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada o ya cancelada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: cancelledAppointment,
    });
  } catch (error) {
    console.error('[DELETE /api/appointments/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
