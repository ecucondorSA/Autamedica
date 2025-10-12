/**
 * API Routes para gestión individual de citas
 * GET /api/appointments/[id] - Obtener cita específica
 * PATCH /api/appointments/[id] - Actualizar cita
 * DELETE /api/appointments/[id] - Cancelar cita
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@autamedica/auth/server';
import { cookies } from 'next/headers';
import type { UpdateAppointmentInput } from '@/types/appointment';
import { logger } from '@autamedica/shared';
import { mapAppointment, mapTypeToDb, computeEndTime } from '../utils';
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
      data: mapAppointment(appointment as any),
    });
  } catch (error) {
    logger.error('[GET /api/appointments/[id]] Error:', error);
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
      .select('id, start_time, duration_minutes')
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
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    let effectiveStart = existingAppointment?.start_time || null;
    let effectiveDuration = existingAppointment?.duration_minutes ?? 30;

    if (body.scheduled_at) {
      const startIso = new Date(body.scheduled_at).toISOString();
      updates.start_time = startIso;
      effectiveStart = startIso;
    }

    if (body.duration_minutes !== undefined) {
      updates.duration_minutes = body.duration_minutes;
      effectiveDuration = body.duration_minutes;
    }

    if (effectiveStart) {
      updates.end_time = computeEndTime(effectiveStart, effectiveDuration);
    }

    if (body.status) updates.status = body.status;
    if (body.type) updates.type = mapTypeToDb(body.type);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.reason !== undefined) updates.reason = body.reason;
    if (body.meeting_url !== undefined) updates.meeting_url = body.meeting_url;
    if (body.location !== undefined) updates.location = body.location;

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updates)
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
      logger.error('[PATCH /api/appointments/[id]] Error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar la cita', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapAppointment(updatedAppointment as any),
    });
  } catch (error) {
    logger.error('[PATCH /api/appointments/[id]] Error:', error);
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
      data: mapAppointment(cancelledAppointment as any),
    });
  } catch (error) {
    logger.error('[DELETE /api/appointments/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
