import { createFileRoute } from "@tanstack/react-router";
import ReportesPage from "@/pages/reportes";

export const Route = createFileRoute("/app/reportes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reportes — HistorIA" },
      { name: "description", content: "Reportes en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Reportes — HistorIA" },
      { property: "og:description", content: "Reportes en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportesPage,
});
