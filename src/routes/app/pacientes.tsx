import { createFileRoute } from "@tanstack/react-router";
import PacientesPage from "@/pages/pacientes";

export const Route = createFileRoute("/app/pacientes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pacientes — HistorIA" },
      { name: "description", content: "Pacientes en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Pacientes — HistorIA" },
      { property: "og:description", content: "Pacientes en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PacientesPage,
});
