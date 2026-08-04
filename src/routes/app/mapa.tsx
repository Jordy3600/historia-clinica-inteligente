import { createFileRoute } from "@tanstack/react-router";
import MapaClinicasPage from "@/pages/mapa-clinicas";

export const Route = createFileRoute("/app/mapa")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mapa de clínicas — HistorIA" },
      { name: "description", content: "Mapa de clínicas en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Mapa de clínicas — HistorIA" },
      { property: "og:description", content: "Mapa de clínicas en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MapaClinicasPage,
});
