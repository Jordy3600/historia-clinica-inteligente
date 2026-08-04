import { createFileRoute } from "@tanstack/react-router";
import PanelClinicoPage from "@/pages/panel-clinico";

export const Route = createFileRoute("/app/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel clínico — HistorIA" },
      { name: "description", content: "Panel clínico en HistorIA, la plataforma clínica con IA para clínicas en Perú." },
      { property: "og:title", content: "Panel clínico — HistorIA" },
      { property: "og:description", content: "Panel clínico en HistorIA, la plataforma clínica con IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelClinicoPage,
});
