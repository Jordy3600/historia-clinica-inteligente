import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSummaries } from "@/lib/summary.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardList, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historial/")({
  head: () => ({ meta: [{ title: "Historial — HistorIA" }, { name: "robots", content: "noindex" }] }),
  component: HistorialPage,
});

function HistorialPage() {
  const listFn = useServerFn(listSummaries);
  const { data, isLoading, error } = useQuery({
    queryKey: ["summaries"],
    queryFn: () => listFn(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial de pacientes</h1>
        <p className="text-sm text-muted-foreground">Todos los resúmenes que has generado.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Error al cargar el historial.</p>
      ) : !data || data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <ClipboardList className="mb-3 h-8 w-8 text-primary" />
            <p className="text-sm">Aún no hay resúmenes. Crea uno desde <span className="font-medium text-foreground">Nuevo resumen</span>.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.map((row) => (
            <Link
              key={row.id}
              to="/historial/$id"
              params={{ id: row.id }}
              className="block"
            >
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                  <div>
                    <CardTitle className="text-base">{row.patient_name}</CardTitle>
                    <CardDescription>
                      {row.patient_code ? `${row.patient_code} · ` : ""}
                      {new Date(row.created_at).toLocaleString("es-PE")}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}