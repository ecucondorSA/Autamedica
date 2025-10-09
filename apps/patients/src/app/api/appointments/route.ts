/**
 * API Routes para gestión de citas médicas
 * GET /api/appointments - Obtener citas del paciente actual
 * POST /api/appointments - Crear nueva cita
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@autamedica/auth/server';
import { cookies } from 'next/headers';
import type { CreateAppointmentInput, Appointment } from '@/types/appointment';

import { logger } from '@autamedica/shared';
/**
 * GET /api/appointments
 * Obtiene todas las citas del paciente autenticado
 */
export async function GET(request: NextRequest) {
  try {
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

    // Obtener patient_id del usuario
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

    // Obtener citas del paciente con información del doctor
    const { data: appointments, error: appointmentsError } = await supabase
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
      .eq('patient_id', patient.id)
      .order('scheduled_at', { ascending: false });

    if (appointmentsError) {
      console.error('[GET /api/appointments] Error:', appointmentsError);
      return NextResponse.json(
        { error: 'Error al obtener citas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointments || [],
    });
  } catch (error) {
    console.error('[GET /api/appointments] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Crea una nueva cita para el paciente autenticado
 */
export async function POST(request: NextRequest) {
  try {
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

    // Obtener patient_id del usuario
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

    // Parsear body de la request
    const body: CreateAppointmentInput = await request.json();

    // Validar campos requeridos
    if (!body.scheduled_at) {
      return NextResponse.json(
        { error: 'El campo scheduled_at es requerido' },
        { status: 400 }
      );
    }

    // Crear la cita
    const appointmentData = {
      patient_id: patient.id,
      doctor_id: body.doctor_id || null,
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes || 30,
      type: body.type || 'telemedicine',
      status: 'scheduled' as const,
      notes: body.notes || null,
      reason: body.reason || null,
    };

    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert(appointmentData)
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

    if (insertError) {
      console.error('[POST /api/appointments] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al crear la cita', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/appointments] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
