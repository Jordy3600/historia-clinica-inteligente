import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  audioData: z.string().min(1).max(20_000_000),
  mimeType: z.string().max(100).optional().default("audio/webm"),
  lang: z.string().max(10).optional().default("es"),
});

export const Route = createFileRoute("/api/transcribe")({
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
          return Response.json({ error: "Audio inválido." }, { status: 400 });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              {
                role: "system",
                content:
                  "Transcribe literalmente el audio clínico. Devuelve SOLO la transcripción, sin comentarios. Si no hay voz audible responde exactamente: [audio sin voz detectable]",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Transcribe este audio en ${body.lang === "en" ? "inglés" : "español"}.`,
                  },
                  {
                    type: "input_audio",
                    input_audio: {
                      data: body.audioData,
                      format: body.mimeType.includes("wav") ? "wav" : "webm",
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (!res.ok) {
          console.error("[api/transcribe] gateway error", res.status, await res.text());
          return Response.json({ error: "No se pudo transcribir el audio." }, { status: 502 });
        }

        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        return Response.json({ text: data.choices?.[0]?.message?.content ?? "" });
      },
    },
  },
});
