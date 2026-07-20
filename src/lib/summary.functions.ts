import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateSummarySections } from "./summary-ai.server";

const GenerateInput = z.object({
  patientName: z.string().trim().min(1, "Nombre requerido").max(200),
  patientCode: z.string().trim().max(60).optional().nullable(),
  rawHistory: z.string().trim().min(20, "El historial debe tener al menos 20 caracteres").max(20000),
});

export const generateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }) => {
    const sections = await generateSummarySections(data.rawHistory);

    const { data: row, error } = await context.supabase
      .from("patient_summaries")
      .insert({
        doctor_id: context.userId,
        patient_name: data.patientName,
        patient_code: data.patientCode || null,
        raw_history: data.rawHistory,
        motivo_consulta: sections.motivo_consulta,
        antecedentes: sections.antecedentes,
        diagnostico: sections.diagnostico,
        alertas: sections.alertas,
        tratamiento: sections.tratamiento,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const listSummaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("patient_summaries")
      .select("id, patient_name, patient_code, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("patient_summaries")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Resumen no encontrado");
    return row;
  });