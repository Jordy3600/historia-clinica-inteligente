import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSummary } from "@/lib/summary.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryView } from "@/components/summary-view";
import { downloadSummaryPdf } from "@/lib/pdf";
import { Download, Printer, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Nuevo resumen — HistorIA" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

type SummaryRow = Awaited<ReturnType<typeof generateSummary>>;

function DashboardPage() {
  const [patientName, setPatientName] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [rawHistory, setRawHistory] = useState("");
  const [result, setResult] = useState<SummaryRow | null>(null);
  const generateFn = useServerFn(generateSummary);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: { patientName: string; patientCode: string; rawHistory: string }) =>
      generateFn({
        data: {
          patientName: input.patientName,
          patientCode: input.patientCode || null,
          rawHistory: input.rawHistory,
        },
      }),
    onSuccess: (data) => {
      setResult(data as SummaryRow);
      queryClient.invalidateQueries({ queryKey: ["summaries"] });
      toast.success("Resumen generado");
    },
    onError: (err: Error) => toast.error(err.message || "No se pudo generar el resumen"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim() || rawHistory.trim().length < 20) {
      toast.error("Ingresa el nombre del paciente y al menos 20 caracteres de historial");
      return;
    }
    mutation.mutate({ patientName, patientCode, rawHistory });
  }

  function reset() {
    setResult(null);
    setPatientName("");
    setPatientCode("");
    setRawHistory("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="no-print lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo resumen clínico</CardTitle>
            <CardDescription>Pega el historial en texto libre. La IA lo organizará en cinco secciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del paciente</Label>
                <Input id="name" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Ej. María López" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código (opcional)</Label>
                <Input id="code" value={patientCode} onChange={(e) => setPatientCode(e.target.value)} placeholder="HC-00234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="history">Historial clínico</Label>
                <Textarea
                  id="history"
                  value={rawHistory}
                  onChange={(e) => setRawHistory(e.target.value)}
                  placeholder="Motivo, síntomas, antecedentes, medicación actual, alergias, etc."
                  rows={14}
                  required
                />
                <p className="text-xs text-muted-foreground">{rawHistory.length} caracteres</p>
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generar resumen</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="lg:col-span-3">
        {result ? (
          <div className="space-y-4">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{result.patient_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {result.patient_code ? `${result.patient_code} · ` : ""}
                  {new Date(result.created_at).toLocaleString("es-PE")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Nuevo
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" /> Imprimir
                </Button>
                <Button size="sm" onClick={() => downloadSummaryPdf(result)}>
                  <Download className="mr-1.5 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
            <SummaryView data={result} />
          </div>
        ) : (
          <Card className="no-print flex h-full min-h-[400px] items-center justify-center border-dashed">
            <CardContent className="text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p className="text-sm">El resumen aparecerá aquí una vez generado.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}