import { createFileRoute } from "@tanstack/react-router";
import ConfiguracionPage from "@/pages/configuracion";

export const Route = createFileRoute("/app/configuracion")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configuración — HistorIA" },
      { name: "description", content: "Configuración en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Configuración — HistorIA" },
      { property: "og:description", content: "Configuración en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfiguracionPage,
});
