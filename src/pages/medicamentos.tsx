import { useState } from 'react';
import { Search, Pill } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MEDS = [
  { name: 'Metformina', category: 'Antidiabético', dose: '500–2000 mg/día', indications: 'Diabetes tipo 2, resistencia a insulina' },
  { name: 'Enalapril', category: 'IECA', dose: '10–40 mg/día', indications: 'Hipertensión, insuficiencia cardíaca' },
  { name: 'Amoxicilina', category: 'Antibiótico', dose: '500 mg/8h', indications: 'Infecciones respiratorias, ITU' },
  { name: 'Omeprazol', category: 'IBP', dose: '20–40 mg/día', indications: 'Gastritis, úlcera péptica, ERGE' },
  { name: 'Salbutamol', category: 'Broncodilatador', dose: '100–200 mcg inh.', indications: 'Asma, EPOC' },
  { name: 'Atorvastatina', category: 'Estatina', dose: '10–80 mg/día', indications: 'Hipercolesterolemia, prevención CV' },
  { name: 'Losartán', category: 'ARA-II', dose: '50–100 mg/día', indications: 'Hipertensión, nefropatía diabética' },
  { name: 'Warfarina', category: 'Anticoagulante', dose: 'Según INR', indications: 'Fibrilación auricular, TVP' },
];

export default function MedicamentosPage() {
  const [search, setSearch] = useState('');
  const filtered = MEDS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in"><h1 className="text-2xl font-bold tracking-tight text-text-1">Medicamentos</h1><p className="mt-1 text-sm text-text-2">Base de referencia de fármacos con dosis e indicaciones habituales.</p></div>
      <div className="relative animate-slide-up"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><input type="text" placeholder="Buscar por nombre o categoría…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-blue/50 focus:outline-none focus:ring-2 focus:ring-blue/20" /></div>
      <div className="grid gap-3 sm:grid-cols-2">{filtered.map((m, i) => <Card key={m.name} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}><CardContent className="flex items-start gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10"><Pill className="h-5 w-5 text-blue" /></div><div className="flex-1"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-1">{m.name}</h3><span className="rounded-md bg-bg-hover px-2 py-0.5 text-xs text-text-2">{m.category}</span></div><p className="mt-1 text-xs text-text-2"><span className="text-text-3">Dosis:</span> {m.dose}</p><p className="mt-0.5 text-xs text-text-2"><span className="text-text-3">Indicación:</span> {m.indications}</p></div></CardContent></Card>)}</div>
      {filtered.length === 0 && <div className="py-12 text-center text-sm text-text-2">No se encontraron medicamentos.</div>}
    </div>
  );
}
