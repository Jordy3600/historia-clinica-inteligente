import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

const SectionsSchema = z.object({
  motivo_consulta: z.string(),
  antecedentes: z.string(),
  diagnostico: z.string(),
  alertas: z.string(),
  tratamiento: z.string(),
});

export type SummarySections = z.infer<typeof SectionsSchema>;

const SYSTEM_PROMPT = `Eres un asistente clínico que organiza historiales médicos en español para doctores en Perú.
A partir del texto libre entregado por el doctor, produces exactamente cinco secciones en español, cada una en prosa clara, concisa y profesional (2 a 6 líneas).

Reglas:
- Nunca inventes datos que no estén en el texto. Si algo no aparece, escribe "No consignado".
- Usa lenguaje clínico, en tercera persona, sin saludos ni cierres.
- No añadas encabezados, viñetas ni Markdown en los valores.
- Responde SOLO con un objeto JSON con las claves: motivo_consulta, antecedentes, diagnostico, alertas, tratamiento.`;

function emptySections(): SummarySections {
  return {
    motivo_consulta: "No consignado",
    antecedentes: "No consignado",
    diagnostico: "No consignado",
    alertas: "No consignado",
    tratamiento: "No consignado",
  };
}

function parseFallback(text: string | undefined): SummarySections | null {
  if (!text) return null;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    const result = SectionsSchema.safeParse(parsed);
    if (result.success) return result.data;
  } catch {
    // ignore
  }
  return null;
}

export async function generateSummarySections(rawHistory: string): Promise<SummarySections> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurado");

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

  const model = provider("google/gemini-3.5-flash");

  try {
    const { output } = await generateText({
      model,
      output: Output.object({ schema: SectionsSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Historial clínico del paciente:\n\n${rawHistory}`,
    });
    return output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      const fallback = parseFallback((error as { text?: string }).text);
      if (fallback) return fallback;
      return emptySections();
    }
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("429") || msg.includes("rate")) {
        throw new Error("El servicio de IA está saturado. Intenta nuevamente en unos segundos.");
      }
      if (msg.includes("402") || msg.includes("credit")) {
        throw new Error("Se agotaron los créditos de IA de la clínica. Contacta al administrador.");
      }
    }
    throw error;
  }
}