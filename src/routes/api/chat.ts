import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  message: z.string().min(1).max(20000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(40)
    .optional()
    .default([]),
  patientContext: z.string().max(20000).optional().default(""),
  lang: z.string().max(10).optional().default("es"),
  useWebSearch: z.boolean().optional().default(false),
  media: z
    .array(
      z.object({
        name: z.string().max(300),
        type: z.string().max(200),
        dataUrl: z.string().max(15_000_000),
      }),
    )
    .max(5)
    .optional()
    .default([]),
});

function systemPrompt(lang: string, patientContext: string, useWebSearch: boolean) {
  const base = `Eres "Asistente HistorIA", un asistente clínico para médicos en Perú.
- Responde en ${lang === "en" ? "inglés" : "español"}, con lenguaje clínico claro y estructurado en Markdown.
- Aporta razonamiento diagnóstico, diagnósticos diferenciales, exámenes sugeridos y planes de manejo.
- Nunca inventes datos del paciente. Si falta información, indícalo explícitamente.
- Añade siempre al final una nota breve: la decisión clínica final es del médico tratante.`;
  const search = useWebSearch
    ? "\n- El médico pidió una búsqueda ampliada: apóyate en guías clínicas reconocidas y menciona la fuente y el año cuando cites evidencia."
    : "";
  const ctx = patientContext ? `\n\nCONTEXTO DEL PACIENTE SELECCIONADO:\n${patientContext}` : "";
  return base + search + ctx;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "El servicio de IA no está configurado." }, { status: 500 });
        }

        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return Response.json({ error: "Solicitud inválida." }, { status: 400 });
        }

        const mediaBlocks = body.media.flatMap((m) => {
          if (m.type.startsWith("image/")) {
            return [{ type: "image_url", image_url: { url: m.dataUrl } }];
          }
          if (m.type === "application/pdf") {
            return [{ type: "file", file: { filename: m.name, file_data: m.dataUrl } }];
          }
          return [];
        });

        const userContent =
          mediaBlocks.length > 0
            ? [{ type: "text", text: body.message }, ...mediaBlocks]
            : body.message;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: systemPrompt(body.lang, body.patientContext, body.useWebSearch) },
              ...body.history,
              { role: "user", content: userContent },
            ],
          }),
        });

        if (res.status === 429) {
          return Response.json(
            { error: "El servicio de IA está saturado. Intenta nuevamente en unos segundos." },
            { status: 429 },
          );
        }
        if (res.status === 402) {
          return Response.json(
            { error: "Se agotaron los créditos de IA de la clínica. Contacta al administrador." },
            { status: 402 },
          );
        }
        if (!res.ok) {
          console.error("[api/chat] gateway error", res.status, await res.text());
          return Response.json({ error: "No se pudo contactar al Asistente HistorIA." }, { status: 502 });
        }

        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        return Response.json({ text: data.choices?.[0]?.message?.content ?? "" });
      },
    },
  },
});
