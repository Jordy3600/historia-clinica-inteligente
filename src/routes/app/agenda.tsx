import { createFileRoute } from "@tanstack/react-router";
import AgendaPage from "@/pages/agenda";

export const Route = createFileRoute("/app/agenda")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agenda — HistorIA" },
      { name: "description", content: "Agenda en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Agenda — HistorIA" },
      { property: "og:description", content: "Agenda en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgendaPage,
});
