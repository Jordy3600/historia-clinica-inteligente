import { createFileRoute } from "@tanstack/react-router";
import AsistenteIAPage from "@/pages/asistente-ia";

export const Route = createFileRoute("/app/asistente")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Asistente IA — HistorIA" },
      { name: "description", content: "Asistente IA en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Asistente IA — HistorIA" },
      { property: "og:description", content: "Asistente IA en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AsistenteIAPage,
});
