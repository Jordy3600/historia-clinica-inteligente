import { createFileRoute } from "@tanstack/react-router";
import HistorialPage from "@/pages/historial";

export const Route = createFileRoute("/app/historial/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Historial de pacientes — HistorIA" },
      { name: "description", content: "Consulta todos los resúmenes clínicos generados con HistorIA." },
      { property: "og:title", content: "Historial de pacientes — HistorIA" },
      { property: "og:description", content: "Consulta todos los resúmenes clínicos generados con HistorIA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistorialPage,
});
