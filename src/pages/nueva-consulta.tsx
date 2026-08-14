import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eraser, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { organizeSummary } from '@/lib/summary-organizer';
import { useSummary } from '@/lib/summary-context';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DictationButton } from '@/components/DictationButton';

const SAMPLE_TEXT = `Motivo de consulta: Paciente femenina de 34 años que acude por dolor abdominal en epigastrio de 3 días de evolución, tipo cólico, intensidad moderada, que se exacerba tras la ingesta de alimentos grasos. Asociado a náuseas y vómitos en 2 oportunidades.

Antecedentes: Hipertensión arterial diagnosticada hace 5 años, en tratamiento con enalapril 20 mg/día. Cirugía de cesárea en 2019. Sin alergias conocidas. Madre con diabetes mellitus tipo 2.

Diagnóstico: Sospecha de colelitiasis con posible colecistitis aguda. Se solicita ecografía abdominal de urgencia. Diferencial con dispepsia funcional y úlcera péptica.

Alertas: Paciente refiere alergia a la penicilina (rash cutáneo a los 12 años). Vigilar signos de irritación peritoneal. No descartar patología biliar complicada si fiebre >38.5°C o leucocitosis >15,000.

Tratamiento: Dieta baja en grasas. Metoclopramida 10 mg IV cada 8 horas por 24 horas. Ketorolaco 30 mg IV cada 8 horas por dolor. Resultado de ecografía en 24h para definir manejo definitivo. Control en 48 horas o antes si empeora.`;

export default function NuevaConsultaPage() {
  const navigate = useNavigate();
  const { setPending } = useSummary();
  const { t } = useI18n();
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rawHistory, setRawHistory] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSample() { setRawHistory(SAMPLE_TEXT); if (!patientName) setPatientName('María González Torres'); }
  function handleClear() { setPatientName(''); setRawHistory(''); setDate(new Date().toISOString().slice(0, 10)); }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim()) { toast.error('Ingresa el nombre o código del paciente'); return; }
    if (rawHistory.trim().length < 20) { toast.error('El historial clínico debe tener al menos 20 caracteres'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const sections = organizeSummary(rawHistory);
    setPending({ patientName: patientName.trim(), patientCode: patientName.trim(), rawHistory, sections, date });
    setLoading(false);
    toast.success('Resumen generado');
    navigate('/app/resultado');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">{t('consulta.titulo')}</h1>
        <p className="mt-1 text-sm text-text-2">Pega el historial clínico en texto libre. La IA lo organizará en 5 secciones.</p>
      </div>
      <Card className="animate-slide-up">
        <CardHeader><CardTitle>Datos de la consulta</CardTitle><CardDescription>Completa los campos y pega el historial del paciente para generar el resumen.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient"><User className="mr-1.5 inline h-3.5 w-3.5" />{t('consulta.paciente')}</Label>
                <Input id="patient" placeholder="Ej. María González / HC-00234" value={patientName} onChange={e => setPatientName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date"><Calendar className="mr-1.5 inline h-3.5 w-3.5" />{t('consulta.fecha')}</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="history"><FileText className="mr-1.5 inline h-3.5 w-3.5" />{t('consulta.historial')}</Label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleSample} className="text-xs font-medium text-blue hover:text-blue-hover transition-colors">{t('consulta.ejemplo')}</button>
                  <DictationButton value={rawHistory} onChange={setRawHistory} size="sm" />
                </div>
              </div>
              <Textarea id="history" placeholder="Pega o dicta aquí el historial clínico completo del paciente…" className="min-h-[300px] resize-y font-serif text-sm leading-relaxed" value={rawHistory} onChange={e => setRawHistory(e.target.value)} maxLength={20000} required />
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-2">La IA detecta automáticamente las secciones del historial.</p>
                <p className="text-xs text-text-3 tabular-nums">{rawHistory.length.toLocaleString()} / 20,000</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Generando…</> : <><Sparkles className="h-4 w-4" />{t('consulta.generar')}</>}</Button>
              <Button type="button" variant="outline" onClick={handleClear}><Eraser className="h-4 w-4" />{t('common.limpiar')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
