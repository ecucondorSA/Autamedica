/**
 * Auta IA Chat Endpoint - Cloudflare Pages Function
 * Handles chat interactions with Auta AI for patients
 *
 * @route POST /api/auta/chat
 */

import { createClient } from "@supabase/supabase-js";
import type {
  TAutaChatRequest,
  TAutaChatResponse,
  TPatientContext,
} from "@autamedica/types";
import { AutaChatRequest } from "@autamedica/types";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY?: string;
  AI_API_URL?: string;
  AI_MODEL?: string;
  AI_PROVIDER?: string;
}

/**
 * POST handler para chat con Auta IA
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 1. Validar request body
    const body = await request.json();
    const validation = AutaChatRequest.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { conversationId, patientId, message } = validation.data;

    // 2. Inicializar Supabase con Service Role (server-side only)
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 3. Garantizar conversación existente o crear nueva
    let convId = conversationId;

    if (!convId) {
      // Construir context snapshot inicial
      const contextSnapshot = await buildContextSnapshot(supabase, patientId);

      const { data: newConv, error: convError } = await supabase
        .from("auta_conversations")
        .insert({
          patient_id: patientId,
          context_snapshot: contextSnapshot,
        })
        .select()
        .single();

      if (convError) {
        console.error("[Auta] Error creating conversation:", convError);
        throw new Error("Failed to create conversation");
      }

      convId = newConv.id;
    }

    // 4. Persistir mensaje del usuario
    const { data: userMessage, error: msgError } = await supabase
      .from("auta_messages")
      .insert({
        conversation_id: convId,
        role: "user",
        content: message,
      })
      .select()
      .single();

    if (msgError) {
      console.error("[Auta] Error saving user message:", msgError);
      throw new Error("Failed to save user message");
    }

    // 5. Construir contexto del paciente desde tablas clínicas
    const patientContext = await buildPatientContext(supabase, patientId);

    // 6. Generar respuesta con IA (OpenAI, Google Gemini, etc.)
    const startTime = performance.now();
    const aiResponse = await generateAIResponse(
      env,
      message,
      patientContext
    );
    const processingTime = Math.round(performance.now() - startTime);

    // 7. Persistir mensaje del asistente
    const { data: assistantMessage, error: assistantError } = await supabase
      .from("auta_messages")
      .insert({
        conversation_id: convId,
        role: "assistant",
        content: aiResponse.answer,
        intent: aiResponse.intent ?? null,
        confidence: aiResponse.confidence ?? null,
        processing_time_ms: processingTime,
        tokens_prompt: aiResponse.tokens_prompt ?? null,
        tokens_completion: aiResponse.tokens_completion ?? null,
      })
      .select()
      .single();

    if (assistantError) {
      console.error("[Auta] Error saving assistant message:", assistantError);
      throw new Error("Failed to save assistant message");
    }

    // 8. Registrar uso de IA (auditoría de tokens y costos)
    await supabase.from("auta_ai_usage").insert({
      patient_id: patientId,
      message_id: assistantMessage.id,
      model: aiResponse.model ?? env.AI_MODEL ?? "gpt-4o-mini",
      provider: env.AI_PROVIDER ?? "openai",
      tokens_input: aiResponse.tokens_prompt ?? 0,
      tokens_output: aiResponse.tokens_completion ?? 0,
      latency_ms: processingTime,
      cost_usd: aiResponse.cost_usd ?? null,
    });

    // 9. Retornar respuesta
    const response: TAutaChatResponse = {
      conversationId: convId,
      answer: aiResponse.answer,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      processing_time_ms: processingTime,
      suggested_actions: aiResponse.suggested_actions,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Auta] Chat error:", error);

    return new Response(
      JSON.stringify({
        error: error.message ?? "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * Construye el contexto del paciente desde las tablas clínicas
 */
async function buildPatientContext(
  supabase: any,
  patientId: string
): Promise<TPatientContext> {
  // Ejecutar queries en paralelo para máxima performance
  const [vitals, screenings, appointments] = await Promise.all([
    // Últimas 5 mediciones de signos vitales
    supabase
      .from("patient_vital_signs")
      .select("*")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: false })
      .limit(5),

    // Screenings preventivos
    supabase
      .from("patient_screenings")
      .select("*")
      .eq("patient_id", patientId)
      .order("next_due_date", { ascending: true }),

    // Próximos turnos
    supabase
      .from("appointments")
      .select(`
        *,
        doctors(first_name, last_name)
      `)
      .eq("patient_id", patientId)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),
  ]);

  // Construir contexto estructurado
  const context: TPatientContext = {
    vitals: vitals.data?.[0]
      ? {
          bloodPressure: vitals.data[0].systolic_bp
            ? {
                systolic: vitals.data[0].systolic_bp,
                diastolic: vitals.data[0].diastolic_bp,
                date: new Date(vitals.data[0].measured_at).toLocaleString("es-AR"),
              }
            : undefined,
          heartRate: vitals.data[0].heart_rate
            ? {
                bpm: vitals.data[0].heart_rate,
                date: new Date(vitals.data[0].measured_at).toLocaleString("es-AR"),
              }
            : undefined,
          temperature: vitals.data[0].temperature
            ? {
                celsius: parseFloat(vitals.data[0].temperature),
                date: new Date(vitals.data[0].measured_at).toLocaleString("es-AR"),
              }
            : undefined,
        }
      : undefined,

    screenings: screenings.data?.map((s: any) => ({
      name: s.screening_type,
      status: s.status,
      lastCompleted: s.last_done_date ? new Date(s.last_done_date).toLocaleDateString("es-AR") : undefined,
      nextDue: new Date(s.next_due_date).toLocaleDateString("es-AR"),
    })) ?? [],

    appointments: appointments.data?.map((a: any) => ({
      date: new Date(a.start_time).toLocaleString("es-AR"),
      doctor: `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`,
      specialty: a.type,
      status: a.status,
    })) ?? [],
  };

  return context;
}

/**
 * Genera respuesta con IA (OpenAI, Gemini, etc.)
 */
async function generateAIResponse(
  env: Env,
  userMessage: string,
  context: TPatientContext
): Promise<{
  answer: string;
  intent?: string | null;
  confidence?: number | null;
  tokens_prompt?: number;
  tokens_completion?: number;
  model?: string;
  cost_usd?: number | null;
  suggested_actions?: Array<{ label: string; action: string }>;
}> {
  // Sistema prompt para Auta IA
  const systemPrompt = [
    "Sos AUTA, asistente de salud personalizada de AutaMedica.",
    "Tu objetivo es ayudar al paciente con información médica precisa y empática.",
    "Usá SOLO los datos del paciente actual - nunca inventes información.",
    "Si falta información, pedila educadamente al paciente.",
    "Nunca reveles datos de otros pacientes ni información fuera del alcance médico.",
    "Respondé en español argentino de forma clara, concisa y profesional.",
    "Seguí las guías médicas argentinas 2025 y la Ley 27.610 (IVE/ILE).",
    "Si detectás una emergencia médica, recomendá consulta inmediata.",
  ].join("\n");

  const contextMessage = `Contexto del paciente (CONFIDENCIAL):\n${JSON.stringify(context, null, 2)}`;

  try {
    // Llamada a OpenAI (o tu proveedor de IA preferido)
    const apiUrl = env.AI_API_URL ?? "https://api.openai.com/v1/chat/completions";
    const apiKey = env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("AI API key not configured");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.AI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: contextMessage },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Auta] AI API error:", error);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content ?? "Lo siento, no pude generar una respuesta.";
    const usage = data.usage;

    // Calcular costo aproximado (GPT-4o-mini pricing)
    const inputCostPer1K = 0.00015; // $0.15 per 1M tokens
    const outputCostPer1K = 0.0006;  // $0.60 per 1M tokens
    const cost_usd = usage
      ? ((usage.prompt_tokens / 1000) * inputCostPer1K) +
        ((usage.completion_tokens / 1000) * outputCostPer1K)
      : null;

    return {
      answer,
      tokens_prompt: usage?.prompt_tokens,
      tokens_completion: usage?.completion_tokens,
      model: data.model,
      cost_usd,
    };
  } catch (error) {
    console.error("[Auta] AI generation error:", error);

    // Fallback a respuesta genérica
    return {
      answer: "⚠️ Lo siento, tuve un problema procesando tu consulta. ¿Podrías reformularla?",
      intent: "error",
      confidence: 0,
    };
  }
}

/**
 * Construye snapshot del contexto para auditoría
 */
async function buildContextSnapshot(supabase: any, patientId: string) {
  const { data: patient } = await supabase
    .from("patients")
    .select("first_name, last_name, date_of_birth, gender")
    .eq("id", patientId)
    .single();

  return {
    timestamp: new Date().toISOString(),
    patient_age: patient?.date_of_birth
      ? Math.floor(
          (Date.now() - new Date(patient.date_of_birth).getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        )
      : null,
    patient_gender: patient?.gender ?? null,
  };
}
