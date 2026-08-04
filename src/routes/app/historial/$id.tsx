import { createFileRoute } from "@tanstack/react-router";
import HistorialDetailPage from "@/pages/historial-detail";

export const Route = createFileRoute("/app/historial/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Resumen clínico — HistorIA" },
      { name: "description", content: "Resumen clínico completo del paciente generado con HistorIA." },
      { property: "og:title", content: "Resumen clínico — HistorIA" },
      { property: "og:description", content: "Resumen clínico completo del paciente generado con HistorIA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistorialDetailPage,
});
