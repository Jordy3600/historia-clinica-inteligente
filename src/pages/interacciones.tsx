import { useState } from 'react';
import { Search, GitCompare, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Interaction { drugA: string; drugB: string; severity: 'leve' | 'moderada' | 'grave'; effect: string; recommendation: string; }
const INTERACTIONS: Interaction[] = [
  { drugA: 'Warfarina', drugB: 'Amoxicilina', severity: 'moderada', effect: 'Aumento del INR y riesgo de sangrado', recommendation: 'Monitorear INR cada 2-3 días, ajustar dosis' },
  { drugA: 'Enalapril', drugB: 'KCl', severity: 'moderada', effect: 'Riesgo de hipercalemia', recommendation: 'Controlar potasio sérico, evaluar alternativa' },
  { drugA: 'Metformina', drugB: 'Contraste yodado', severity: 'grave', effect: 'Acidosis láctica por acumulación renal', recommendation: 'Suspender 48h antes y 48h después del contraste' },
  { drugA: 'Atorvastatina', drugB: 'Claritromicina', severity: 'grave', effect: 'Rabdomiolisis por inhibición del CYP3A4', recommendation: 'Evitar uso concomitante o reducir dosis' },
  { drugA: 'Omeprazol', drugB: 'Clopidogrel', severity: 'moderada', effect: 'Redución del efecto antiagregante', recommendation: 'Usar pantoprazol como alternativa' },
  { drugA: 'Salbutamol', drugB: 'Propranolol', severity: 'moderada', effect: 'Bloqueo del efecto broncodilatador', recommendation: 'Evitar beta-bloqueantes no selectivos en asmáticos' },
  { drugA: 'Losartán', drugB: 'Espironolactona', severity: 'moderada', effect: 'Hipercalemia', recommendation: 'Controlar K+ sérico regularmente' },
  { drugA: 'Amoxicilina', drugB: 'Alopurinol', severity: 'leve', effect: 'Aumento de riesgo de rash cutáneo', recommendation: 'Vigilar reacciones cutáneas' },
];
const SEV_CFG = { leve: { label: 'Leve', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' }, moderada: { label: 'Moderada', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' }, grave: { label: 'Grave', color: 'text-error', bg: 'bg-error/10', border: 'border-error/20' } };

export default function InteraccionesPage() {
  const [search, setSearch] = useState('');
  const filtered = INTERACTIONS.filter(i => i.drugA.toLowerCase().includes(search.toLowerCase()) || i.drugB.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in"><h1 className="text-2xl font-bold tracking-tight text-text-1">Interacciones</h1><p className="mt-1 text-sm text-text-2">Verificador de interacciones entre medicamentos con nivel de severidad.</p></div>
      <div className="relative animate-slide-up"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><input type="text" placeholder="Buscar por nombre del medicamento…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-blue/50 focus:outline-none focus:ring-2 focus:ring-blue/20" /></div>
      <div className="grid gap-3">{filtered.map((int, i) => { const cfg = SEV_CFG[int.severity]; return (
        <Card key={`${int.drugA}-${int.drugB}`} className={cn('animate-slide-up border', cfg.border)} style={{ animationDelay: `${i * 50}ms` }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-hover"><GitCompare className="h-5 w-5 text-blue" /></div><div className="flex items-center gap-2 text-sm font-semibold text-text-1">{int.drugA}<ArrowRight className="h-3.5 w-3.5 text-text-3" />{int.drugB}</div><span className={cn('ml-auto rounded-lg px-2.5 py-1 text-xs font-medium', cfg.bg, cfg.color)}>{cfg.label}</span></div>
            <div className="mt-3 space-y-2"><p className="text-xs text-text-2"><span className="text-text-3">Efecto:</span> {int.effect}</p><div className="flex items-start gap-1.5"><AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-warning mt-0.5" /><p className="text-xs text-text-2"><span className="text-text-3">Recomendación:</span> {int.recommendation}</p></div></div>
          </CardContent>
        </Card>
      ); })}</div>
      {filtered.length === 0 && <div className="py-12 text-center text-sm text-text-2">No se encontraron interacciones.</div>}
    </div>
  );
}
