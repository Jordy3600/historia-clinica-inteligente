import { useState } from 'react';
import { Search, HeartPulse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SYMPTOMS = [
  { name: 'Dolor torácico', systems: 'Cardiovascular, respiratorio', redFlags: 'Dolor irradiado a brazo/mandíbula, disnea, diaforesis' },
  { name: 'Cefalea', systems: 'Neurológico', redFlags: 'Inicio súbito, fiebre alta, rigidez de nuca, déficit focal' },
  { name: 'Dolor abdominal', systems: 'Gastrointestinal', redFlags: 'Signos peritoneales, fiebre, vómitos biliosos' },
  { name: 'Disnea', systems: 'Respiratorio, cardiovascular', redFlags: 'SpO2 <90%, disnea de reposo, ortopnea' },
  { name: 'Fiebre', systems: 'Infeccioso', redFlags: '>39.5°C, rigores, petequias, compromiso del sensorio' },
  { name: 'Síncope', systems: 'Cardiovascular, neurológico', redFlags: 'Pérdida de conciencia prolongada, trauma craneal' },
  { name: 'Náuseas y vómitos', systems: 'Gastrointestinal', redFlags: 'Vómitos con sangre, deshidratación, íleo paralítico' },
  { name: 'Edema de miembros inferiores', systems: 'Cardiovascular, renal', redFlags: 'Edema unilateral, dolor, eritema (TVP)' },
];

export default function SintomasPage() {
  const [search, setSearch] = useState('');
  const filtered = SYMPTOMS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="animate-fade-in"><h1 className="text-2xl font-bold tracking-tight text-text-1">Síntomas</h1><p className="mt-1 text-sm text-text-2">Guía de síntomas con banderas rojas para orientación diagnóstica.</p></div>
      <div className="relative animate-slide-up"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><input type="text" placeholder="Buscar síntoma…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-teal/50 focus:outline-none focus:ring-2 focus:ring-blue/20" /></div>
      <div className="grid gap-3 sm:grid-cols-2">{filtered.map((s, i) => <Card key={s.name} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}><CardContent className="flex items-start gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sec-purple/10"><HeartPulse className="h-5 w-5 text-sec-purple" /></div><div className="flex-1"><h3 className="text-sm font-semibold text-text-1">{s.name}</h3><p className="mt-1 text-xs text-text-2"><span className="text-text-3">Sistemas:</span> {s.systems}</p><div className="mt-2 flex items-start gap-1.5 rounded-lg border border-error/20 bg-error/5 px-2.5 py-1.5"><span className="text-xs font-medium text-error">Banderas rojas:</span><span className="text-xs text-text-2">{s.redFlags}</span></div></div></CardContent></Card>)}</div>
      {filtered.length === 0 && <div className="py-12 text-center text-sm text-text-2">No se encontraron síntomas.</div>}
    </div>
  );
}
