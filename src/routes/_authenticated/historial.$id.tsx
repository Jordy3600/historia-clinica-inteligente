import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSummary } from "@/lib/summary.functions";
import { SummaryView } from "@/components/summary-view";
import { Button } from "@/components/ui/button";
import { downloadSummaryPdf } from "@/lib/pdf";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historial/$id")({
  head: () => ({ meta: [{ title: "Resumen — HistorIA" }, { name: "robots", content: "noindex" }] }),
  component: HistorialDetail,
});

function HistorialDetail() {
  const { id } = Route.useParams();
  const getFn = useServerFn(getSummary);
  const { data, isLoading, error } = useQuery({
    queryKey: ["summary", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">No se encontró el resumen.</p>
        <Link to="/historial"><Button variant="outline" size="sm"><ArrowLeft className="mr-1.5 h-4 w-4" /> Volver</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/historial" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Historial
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{data.patient_name}</h1>
          <p className="text-sm text-muted-foreground">
            {data.patient_code ? `${data.patient_code} · ` : ""}
            {new Date(data.created_at).toLocaleString("es-PE")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> Imprimir
          </Button>
          <Button size="sm" onClick={() => downloadSummaryPdf(data)}>
            <Download className="mr-1.5 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>
      <SummaryView data={data} />
    </div>
  );
}