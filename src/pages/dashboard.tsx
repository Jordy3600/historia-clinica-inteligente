import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Printer, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { supabase, type PatientSummary } from '@/lib/supabase';
import { organizeSummary } from '@/lib/summary-organizer';
import { downloadSummaryPdf } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryView } from '@/components/summary-view';

export default function DashboardPage() {
  const [patientName, setPatientName] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [rawHistory, setRawHistory] = useState('');
  const [result, setResult] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim() || rawHistory.trim().length < 20) {
      toast.error('Nombre y al menos 20 caracteres de historial');
      return;
    }

    setLoading(true);
    try {
      const sections = organizeSummary(rawHistory);

      const { data, error } = await supabase
        .from('patient_summaries')
        .insert({
          patient_name: patientName.trim(),
          patient_code: patientCode.trim() || null,
          raw_history: rawHistory,
          ...sections,
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);

      setResult(data as PatientSummary);
      toast.success('Resumen generado');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo generar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setPatientName('');
    setPatientCode('');
    setRawHistory('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-1">Inicio</h1>
        <p className="text-xs text-text-3">Resumen de actividad clínica y organización de historias en tiempo real</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="no-print lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo resumen clínico</CardTitle>
            <CardDescription>
              Pega el historial en texto libre. La IA lo organiza en 5 secciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del paciente</Label>
                <Input
                  id="name"
                  placeholder="Ej. María González Torres"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código (opcional)</Label>
                <Input
                  id="code"
                  placeholder="Ej. HC-00234 / DNI"
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="history">Historial clínico</Label>
                <Textarea
                  id="history"
                  placeholder="Escribe o pega el historial clínico completo del paciente…"
                  className="min-h-[280px] resize-y font-mono text-sm leading-relaxed"
                  value={rawHistory}
                  onChange={(e) => setRawHistory(e.target.value)}
                  maxLength={20000}
                  required
                />
                <p className="text-right text-xs text-text-muted tabular-nums">
                  {rawHistory.length.toLocaleString()} / 20,000
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar resumen
                  </>
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
                <h2 className="text-xl font-semibold text-text-primary">
                  {result.patient_name}
                </h2>
                <p className="text-sm text-text-secondary">
                  {result.patient_code ? `${result.patient_code} · ` : ''}
                  {new Date(result.created_at).toLocaleString('es-PE')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Nuevo
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" />
                  Imprimir
                </Button>
                <Button size="sm" onClick={() => downloadSummaryPdf(result)}>
                  <Download className="mr-1.5 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
            <SummaryView data={result} />
          </div>
        ) : (
          <Card className="no-print flex h-full min-h-[420px] items-center justify-center border-dashed">
            <CardContent className="py-16 text-center text-text-secondary">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent opacity-50" />
              <p className="text-sm">El resumen aparecerá aquí una vez generado.</p>
              {loading && (
                <p className="mt-3 animate-pulse text-xs text-accent">
                  La IA está procesando el historial clínico…
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  </div>
  );
}
