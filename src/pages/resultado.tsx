import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Download, AlertTriangle, ArrowLeft, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, type PatientSummary, type SummarySections } from '@/lib/supabase';
import { useSummary } from '@/lib/summary-context';
import { useI18n } from '@/lib/i18n';
import { downloadSummaryPdf } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { SummaryView } from '@/components/summary-view';

export default function ResultadoPage() {
  const navigate = useNavigate();
  const { pending, saved, setSaved } = useSummary();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!pending && !saved) navigate('/app/nueva-consulta', { replace: true }); }, [pending, saved, navigate]);
  if (!pending && !saved) return null;

  const display: PatientSummary | null = saved ?? null;
  const sections: SummarySections | null = saved ?? pending?.sections ?? null;
  if (!sections) return null;

  const patientName = display?.patient_name ?? pending?.patientName ?? '';
  const patientCode = display?.patient_code ?? pending?.patientCode ?? '';
  const createdAt = display?.created_at ?? pending?.date ?? new Date().toISOString();
  const isSaved = !!saved;

  async function handleSave() {
    if (!pending) { toast.info('Este resumen ya está guardado'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('patient_summaries').insert({ patient_name: pending.patientName, patient_code: pending.patientCode || null, raw_history: pending.rawHistory, ...pending.sections }).select('*').single();
      let newSaved: PatientSummary;
      if (error || !data) {
        newSaved = {
          id: crypto.randomUUID(),
          doctor_id: null,
          patient_name: pending.patientName,
          patient_code: pending.patientCode || null,
          raw_history: pending.rawHistory,
          ...pending.sections,
          created_at: new Date().toISOString(),
        };
      } else {
        newSaved = data as PatientSummary;
      }
      const local = localStorage.getItem('historia_summaries');
      const list = local ? JSON.parse(local) : [];
      list.unshift(newSaved);
      localStorage.setItem('historia_summaries', JSON.stringify(list));

      setSaved(newSaved);
      toast.success('Resumen guardado en el historial');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'No se pudo guardar'); }
    finally { setSaving(false); }
  }

  function handlePdf() {
    const target = display ?? (pending ? { id: 'temp', doctor_id: null, patient_name: pending.patientName, patient_code: pending.patientCode || null, raw_history: pending.rawHistory, ...pending.sections, created_at: pending.date } as PatientSummary : null);
    if (target) downloadSummaryPdf(target);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in">
        <button onClick={() => navigate('/app/nueva-consulta')} className="mb-3 inline-flex items-center gap-1.5 text-xs text-text-2 transition-colors hover:text-text-1"><ArrowLeft className="h-3.5 w-3.5" />Volver a nueva consulta</button>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">{t('resultado.titulo')}</h1>
        <p className="mt-1 text-sm text-text-2">Resumen clínico generado por IA a partir del historial del paciente.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-4 animate-slide-up">
        <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-text-2" /><span className="font-semibold text-text-1">{patientName}</span>{patientCode && patientCode !== patientName && <span className="text-text-2">· {patientCode}</span>}</div>
        <div className="flex items-center gap-2 text-sm text-text-2"><Calendar className="h-4 w-4" />{new Date(createdAt).toLocaleString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        {isSaved && <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success"><Save className="h-3 w-3" />Guardado</span>}
      </div>
      <div className="flex flex-wrap gap-3 no-print animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Button onClick={handleSave} disabled={saving || isSaved}><Save className="h-4 w-4" />{isSaved ? 'Guardado' : saving ? 'Guardando…' : t('resultado.guardar')}</Button>
        <Button variant="outline" onClick={handlePdf}><Download className="h-4 w-4" />{t('resultado.pdf')}</Button>
      </div>
      <SummaryView data={sections} />
      <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4 no-print animate-fade-in">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5" />
        <p className="text-xs leading-relaxed text-text-2"><strong className="text-text-1">Resumen generado por IA.</strong> {t('resultado.aviso')}</p>
      </div>
    </div>
  );
}
