import { AlertTriangle, Stethoscope, FileText, Activity, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SummarySections } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const SECTIONS: Array<{ key: keyof SummarySections; label: string; Icon: typeof FileText; color: string; bg: string; highlight?: boolean }> = [
  { key: 'motivo_consulta', label: 'Motivo de consulta', Icon: Stethoscope, color: 'text-sec-blue', bg: 'bg-sec-blue/10' },
  { key: 'antecedentes', label: 'Antecedentes médicos', Icon: FileText, color: 'text-sec-purple', bg: 'bg-sec-purple/10' },
  { key: 'diagnostico', label: 'Diagnóstico / Impresión clínica', Icon: Activity, color: 'text-teal', bg: 'bg-teal/10' },
  { key: 'alertas', label: 'Alertas y alergias', Icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10', highlight: true },
  { key: 'tratamiento', label: 'Recomendación de tratamiento', Icon: Pill, color: 'text-success', bg: 'bg-success/10' },
];

export function SummaryView({ data }: { data: SummarySections }) {
  return (
    <div className="grid gap-4">
      {SECTIONS.map(({ key, label, Icon, color, bg, highlight }, i) => (
        <Card key={key} className={cn('animate-slide-up', highlight && 'border-error/30')} style={{ animationDelay: `${i * 60}ms` }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}><Icon className={cn('h-4 w-4', color)} /></div>
              <span className="text-text-1">{label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-text-1/90">{data[key] || 'No consignado'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
