import { createFileRoute } from "@tanstack/react-router";
import NuevaConsultaPage from "@/pages/nueva-consulta";

export const Route = createFileRoute("/app/nueva-consulta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva consulta — HistorIA" },
      { name: "description", content: "Nueva consulta en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Nueva consulta — HistorIA" },
      { property: "og:description", content: "Nueva consulta en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NuevaConsultaPage,
});
