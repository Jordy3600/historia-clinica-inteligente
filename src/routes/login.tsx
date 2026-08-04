import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "HistorIA — Historias clínicas con inteligencia artificial" },
      { name: "description", content: "Inicia sesión en HistorIA y organiza historias clínicas, agenda, pacientes y reportes con ayuda de IA." },
      { property: "og:title", content: "HistorIA — Historias clínicas con inteligencia artificial" },
      { property: "og:description", content: "Organiza historias clínicas, agenda, pacientes y reportes con ayuda de IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});
