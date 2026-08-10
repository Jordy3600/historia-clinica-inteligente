import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  Users,
  CheckCircle,
  FileCheck,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportesPage() {
  const [timeRange, setTimeRange] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  const handleExport = (format: string) => {
    toast.success(`Exportando reporte estadístico clínico en formato ${format}...`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header Bar Minimalista */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-1">Reportes</h1>
          <p className="text-xs text-text-3">
            Métricas de atención médica, diagnósticos frecuentes y análisis estadístico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs font-bold text-text-1 hover:border-teal/50 hover:bg-bg-hover transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-teal" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 rounded-xl bg-[#00a8c6] hover:bg-[#00c2e0] px-3.5 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-bg-card p-2 sm:px-4">
        <div className="flex items-center gap-2 text-xs font-bold text-text-2">
          <Calendar className="h-4 w-4 text-teal" />
          <span>Período de Análisis:</span>
        </div>

        <div className="flex items-center gap-1">
          {(['semana', 'mes', 'trimestre'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-teal text-bg shadow-glow-teal'
                  : 'text-text-3 hover:text-text-1 hover:bg-bg-hover'
              }`}
            >
              {range === 'semana' ? 'Esta Semana' : range === 'mes' ? 'Este Mes' : 'Último Trimestre'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-border/80 bg-bg-card p-5">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Atenciones Médicas</span>
            <Users className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-text-1">142</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-teal">
            <TrendingUp className="h-3 w-3" />
            <span>+18% vs período anterior</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-bg-card p-5">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Historias Clínicas Generadas</span>
            <FileCheck className="h-4 w-4 text-blue" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-blue">98</div>
          <div className="mt-1 text-[10px] text-text-3 font-medium">100% firmadas digitalmente</div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-bg-card p-5">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Consultas Asistente IA</span>
            <Sparkles className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-teal">312</div>
          <div className="mt-1 text-[10px] text-teal font-medium">Búsqueda médica en tiempo real</div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-bg-card p-5">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Precisión Diagnóstica</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">99.4%</div>
          <div className="mt-1 text-[10px] text-emerald-400/80 font-medium">Basado en Guías CIE-10 / ICD-11</div>
        </div>
      </div>

      {/* Analytics Main Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Diagnoses */}
        <div className="rounded-3xl border border-border/80 bg-bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-text-1">Diagnósticos Más Frecuentes</h3>
            <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[10px] font-bold text-teal">CIE-10</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Hipertensión Arterial Esencial (I10)', count: 42, pct: '30%' },
              { name: 'Diabetes Mellitus Tipo 2 (E11)', count: 28, pct: '20%' },
              { name: 'Dislipidemia Mixta (E78.2)', count: 22, pct: '15%' },
              { name: 'Rinofaringitis Aguda / ARL (J00)', count: 18, pct: '13%' },
              { name: 'Gastritis Crónica no Especificada (K29.7)', count: 14, pct: '10%' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-text-1">
                  <span>{item.name}</span>
                  <span className="text-teal">{item.count} casos ({item.pct})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-bg-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal transition-all duration-500"
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Health Insights */}
        <div className="rounded-3xl border border-teal/30 bg-gradient-to-br from-teal/10 via-bg-card to-bg-card p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal" />
            <h3 className="text-base font-extrabold text-text-1">Resumen Epidemiológico HistorIA</h3>
          </div>

          <p className="text-xs text-text-2 leading-relaxed">
            El Asistente Clínico Inteligente ha detectado una tendencia de incremento del 14% en pacientes con control subóptimo de presión arterial durante los fines de semana de este mes.
          </p>

          <div className="rounded-2xl border border-border/80 bg-bg-card/80 p-4 space-y-2">
            <div className="text-xs font-bold text-teal">Recomendaciones del Asistente:</div>
            <ul className="space-y-1.5 text-xs text-text-2 list-disc list-inside">
              <li>Reforzar el monitoreo ambulatorio de presión arterial (MAPA).</li>
              <li>Ajustar posología de fármacos antihipertensivos en pacientes hipertensos grado 2.</li>
              <li>Programar recordatorios automáticos de toma de medicación vía WhatsApp/Email.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
