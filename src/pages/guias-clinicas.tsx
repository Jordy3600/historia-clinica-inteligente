import { useState } from 'react';
import { Search, BookOpen, Clock, ArrowUpRight, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Guide { id: string; title: string; specialty: string; summary: string; readTime: string; updated: string; }

const GUIDES: Guide[] = [
  { id: '1', title: 'Manejo de hipertensión arterial en atención primaria', specialty: 'Cardiología', summary: 'Criterios diagnósticos, estratificación de riesgo cardiovascular y esquemas farmacológicos de primera línea según MINSA 2024.', readTime: '12 min', updated: '2024' },
  { id: '2', title: 'Manejo del asma bronquial en pediatría', specialty: 'Pediatría', summary: 'Clasificación de severidad, escalonamiento terapéutico y manejo de crisis asmática aguda en menores de 12 años.', readTime: '10 min', updated: '2024' },
  { id: '3', title: 'Tratamiento de diabetes mellitus tipo 2', specialty: 'Endocrinología', summary: 'Algoritmo de tratamiento escalonado, metas de control glucémico y selección de fármacos según comorbilidades.', readTime: '15 min', updated: '2024' },
  { id: '4', title: 'Abordaje inicial de infección del tracto urinario', specialty: 'Medicina interna', summary: 'Diagnóstico diferencial, criterios de tratamiento empírico y duración según perfil de resistencia local.', readTime: '8 min', updated: '2023' },
  { id: '5', title: 'Manejo ambulatorio de gastritis y úlcera péptica', specialty: 'Gastroenterología', summary: 'Indicaciones de erradicación de H. pylori, esquemas de primera y segunda línea, y manejo de dispepsia funcional.', readTime: '11 min', updated: '2024' },
  { id: '6', title: 'Diagnóstico y tratamiento de anemia ferropénica', specialty: 'Hematología', summary: 'Criterios diagnósticos, esquemas de suplementación oral e IV, y estudio de causas subyacentes en adultos.', readTime: '9 min', updated: '2023' },
  { id: '7', title: 'Abordaje del dolor torácico agudo en urgencias', specialty: 'Emergenciología', summary: 'Estratificación de riesgo, protocolo de troponinas y criterios de derivación a hemodinamia.', readTime: '14 min', updated: '2024' },
  { id: '8', title: 'Manejo prenatal de bajo riesgo', specialty: 'Ginecología y obstetricia', summary: 'Cronograma de controles, suplementación, tamizaje rutinario y criterios de derivación a alto riesgo.', readTime: '10 min', updated: '2024' },
];

const SPECIALTIES = ['Todas','Cardiología','Pediatría','Endocrinología','Medicina interna','Gastroenterología','Hematología','Emergenciología','Ginecología y obstetricia'];
const SP_COLORS: Record<string, string> = { Cardiología: 'text-error bg-error/10', Pediatría: 'text-blue bg-blue/10', Endocrinología: 'text-teal bg-teal/10', 'Medicina interna': 'text-sec-purple bg-sec-purple/10', Gastroenterología: 'text-success bg-success/10', Hematología: 'text-warning bg-warning/10', Emergenciología: 'text-error bg-error/10', 'Ginecología y obstetricia': 'text-sec-blue bg-sec-blue/10' };

export default function GuiasClinicasPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const filtered = GUIDES.filter(g => (g.title.toLowerCase().includes(search.toLowerCase()) || g.summary.toLowerCase().includes(search.toLowerCase())) && (specialty === 'Todas' || g.specialty === specialty));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in"><h1 className="text-2xl font-bold tracking-tight text-text-1">Guías clínicas</h1><p className="mt-1 text-sm text-text-2">Biblioteca de protocolos médicos basados en evidencia, actualizados según MINSA.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row animate-slide-up">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><input type="text" placeholder="Buscar guías por título o contenido…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-blue/50 focus:outline-none focus:ring-2 focus:ring-blue/20" /></div>
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-text-2" /><select value={specialty} onChange={e => setSpecialty(e.target.value)} className="rounded-xl border border-border bg-bg-card px-3 py-2.5 text-sm text-text-1 focus:border-blue/50 focus:outline-none cursor-pointer">{SPECIALTIES.map(s => <option key={s} value={s} className="bg-bg-card">{s}</option>)}</select></div>
      </div>
      <p className="text-xs text-text-2">{filtered.length} {filtered.length === 1 ? 'guía encontrada' : 'guías encontradas'}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((g, i) => (
          <Card key={g.id} className="group cursor-pointer transition-all duration-200 hover:border-blue/30 hover:shadow-card-hover animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10"><BookOpen className="h-5 w-5 text-blue" /></div><span className={cn('rounded-lg px-2.5 py-1 text-xs font-medium', SP_COLORS[g.specialty] ?? 'text-text-2 bg-bg-hover')}>{g.specialty}</span></div>
              <h3 className="mt-3 text-base font-semibold leading-snug text-text-1">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-2">{g.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><div className="flex items-center gap-3 text-xs text-text-3"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{g.readTime}</span><span>· Actualizado {g.updated}</span></div><ArrowUpRight className="h-4 w-4 text-text-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <div className="py-16 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-text-3" /><p className="text-sm text-text-2">No se encontraron guías con esos criterios.</p></div>}
    </div>
  );
}
