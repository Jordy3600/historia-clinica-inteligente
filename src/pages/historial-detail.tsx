import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react';
import { supabase, type PatientSummary } from '@/lib/supabase';
import { SummaryView } from '@/components/summary-view';
import { Button } from '@/components/ui/button';
import { downloadSummaryPdf } from '@/lib/pdf';

export default function HistorialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data, error } = await supabase.from('patient_summaries').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const local = localStorage.getItem('historia_summaries');
        if (local) {
          try {
            const list = JSON.parse(local);
            const found = list.find((item: PatientSummary) => item.id === id);
            if (found) {
              setData(found);
            } else {
              setNotFound(true);
            }
          } catch {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } else {
        setData(data as PatientSummary);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-16 text-text-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando…</div>;
  if (notFound || !data) return <div className="space-y-4 p-6"><p className="text-sm text-error">No se encontró el resumen.</p><Link to="/app/historial"><Button variant="outline" size="sm"><ArrowLeft className="mr-1.5 h-4 w-4" />Volver</Button></Link></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 animate-fade-in">
        <div><Link to="/app/historial" className="mb-2 inline-flex items-center gap-1 text-xs text-text-2 transition-colors hover:text-text-1"><ArrowLeft className="h-3.5 w-3.5" />Historial</Link><h1 className="text-2xl font-bold tracking-tight text-text-1">{data.patient_name}</h1><p className="text-sm text-text-2">{data.patient_code ? `${data.patient_code} · ` : ''}{new Date(data.created_at).toLocaleString('es-PE')}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" />Imprimir</Button><Button size="sm" onClick={() => downloadSummaryPdf(data)}><Download className="mr-1.5 h-4 w-4" />PDF</Button></div>
      </div>
      <SummaryView data={data} />
    </div>
  );
}
