import { createFileRoute } from "@tanstack/react-router";
import ResultadoPage from "@/pages/resultado";

export const Route = createFileRoute("/app/resultado")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Resumen generado — HistorIA" },
      { name: "description", content: "Resumen generado en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Resumen generado — HistorIA" },
      { property: "og:description", content: "Resumen generado en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultadoPage,
});
