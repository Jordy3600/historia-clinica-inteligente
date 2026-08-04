import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  prompt: z.string().min(1).max(2000),
  type: z.string().max(60).optional().default("medical_diagram"),
});

export const Route = createFileRoute("/api/generate-medical-image")({
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

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            modalities: ["image", "text"],
            messages: [
              {
                role: "user",
                content: `Ilustración médica educativa, estilo diagrama anatómico limpio con etiquetas en español, fondo oscuro clínico: ${body.prompt}`,
              },
            ],
          }),
        });

        if (!res.ok) {
          console.error("[api/generate-medical-image] gateway error", res.status, await res.text());
          return Response.json({ error: "No se pudo generar la imagen médica." }, { status: 502 });
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
        };
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!imageUrl) {
          return Response.json({ error: "La IA no devolvió una imagen." }, { status: 502 });
        }
        return Response.json({ imageUrl, prompt: body.prompt });
      },
    },
  },
});
