import { useState } from 'react';
import { Search, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DISEASES = [
  { name: 'Hipertensión arterial esencial', category: 'Cardiovascular', icd10: 'I10', summary: 'Presión arterial ≥140/90 mmHg sin causa secundaria identificable.' },
  { name: 'Diabetes mellitus tipo 2', category: 'Endocrino', icd10: 'E11', summary: 'Hiperglucemia por resistencia a insulina y déficit relativo de secreción.' },
  { name: 'Asma bronquial', category: 'Respiratorio', icd10: 'J45', summary: 'Inflamación crónica de vías aéreas con broncoconstricción reversible.' },
  { name: 'Gastritis aguda', category: 'Gastrointestinal', icd10: 'K29.0', summary: 'Inflamación de la mucosa gástrica, frecuentemente por AINEs o H. pylori.' },
  { name: 'Infección del tracto urinario', category: 'Infeccioso', icd10: 'N39.0', summary: 'Infección bacteriana del sistema urinario, predominante por E. coli.' },
  { name: 'Anemia ferropénica', category: 'Hematológico', icd10: 'D50', summary: 'Déficit de hierro que reduce la síntesis de hemoglobina.' },
  { name: 'EPOC', category: 'Respiratorio', icd10: 'J44', summary: 'Enfermedad pulmonar obstructiva crónica, limitación al flujo aéreo no reversible.' },
  { name: 'Dislipidemia', category: 'Cardiovascular', icd10: 'E78', summary: 'Alteración de los niveles de lípidos sanguíneos (colesterol y/o triglicéridos).' },
];

export default function EnfermedadesPage() {
  const [search, setSearch] = useState('');
  const filtered = DISEASES.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in"><h1 className="text-2xl font-bold tracking-tight text-text-1">Enfermedades</h1><p className="mt-1 text-sm text-text-2">Catálogo de patologías con clasificación CIE-10 y descripción clínica.</p></div>
      <div className="relative animate-slide-up"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><input type="text" placeholder="Buscar por nombre o categoría…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-teal/50 focus:outline-none focus:ring-2 focus:ring-blue/20" /></div>
      <div className="grid gap-3 sm:grid-cols-2">{filtered.map((d, i) => <Card key={d.name} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}><CardContent className="flex items-start gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10"><Activity className="h-5 w-5 text-teal" /></div><div className="flex-1"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-1">{d.name}</h3><span className="rounded-md bg-bg-hover px-2 py-0.5 font-mono text-xs text-text-2">{d.icd10}</span></div><p className="mt-1 text-xs text-text-2">{d.summary}</p><span className="mt-2 inline-block rounded-md bg-teal/10 px-2 py-0.5 text-xs text-teal">{d.category}</span></div></CardContent></Card>)}</div>
      {filtered.length === 0 && <div className="py-12 text-center text-sm text-text-2">No se encontraron enfermedades.</div>}
    </div>
  );
}
