import type { SummarySections } from '@/lib/supabase';

const NOT_CONSIGNED = 'No consignado';

const SECTION_PATTERNS: Array<{ key: keyof SummarySections; labels: string[] }> = [
  { key: 'motivo_consulta', labels: ['motivo de consulta','motivo consulta','motivo de la consulta','motivo','consulta','razón de consulta','razon de consulta','queja principal','enfermedad actual','enfermedad actual y motivo','problema actual'] },
  { key: 'antecedentes', labels: ['antecedentes','antecedentes médicos','antecedentes medicos','antecedentes personales','antecedentes familiares','historia clínica','historia clinica','historial médico','historial medico'] },
  { key: 'diagnostico', labels: ['diagnóstico','diagnostico','diagnóstico clínico','diagnostico clinico','diagnóstico o impresión clínica','impresión clínica','impresion clinica','impresión diagnóstica','impresion diagnostica','dx','hipótesis diagnóstica','hipotesis diagnostica','condición clínica','condicion clinica','síndrome','evaluación clínica','evaluacion clinica'] },
  { key: 'alertas', labels: ['alertas','alertas y alergias','alergias','alergia','reacciones adversas','reacción adversa','precauciones','contraindicaciones','riesgos','banderas rojas','red flags','signos de alarma','vigilancia'] },
  { key: 'tratamiento', labels: ['tratamiento','recomendación de tratamiento','recomendacion de tratamiento','plan de tratamiento','plan terapéutico','plan terapeutico','manejo','manejo clínico','manejo clinico','indicaciones','receta','recetas','prescripción','prescripcion','terapia','terapéutica','terapeutica','medicación','medicacion','recomendaciones'] },
];

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findSectionStart(text: string, patterns: string[], searchFrom: number): { index: number; matchedLabel: string } | null {
  let best: { index: number; matchedLabel: string } | null = null;
  for (const label of patterns) {
    const nl = normalize(label);
    const idx = text.slice(searchFrom).indexOf(nl);
    if (idx === -1) continue;
    const abs = searchFrom + idx;
    if (!best || abs < best.index) best = { index: abs, matchedLabel: label };
  }
  return best;
}

function extractContent(text: string, startIdx: number, matchedLabel: string, otherStarts: number[]): string {
  const after = startIdx + matchedLabel.length;
  let cs = after;
  const rem = text.slice(after);
  const sep = rem.match(/^[\s:：\-—–*.#]+/);
  if (sep) cs += sep[0].length;
  let end = text.length;
  for (const os of otherStarts) if (os > cs && os < end) end = os;
  return text.slice(cs, end).trim();
}

export function organizeSummary(rawHistory: string): SummarySections {
  const norm = normalize(rawHistory);
  const found: Array<{ key: keyof SummarySections; index: number; matchedLabel: string }> = [];
  for (const { key, labels } of SECTION_PATTERNS) {
    const m = findSectionStart(norm, labels, 0);
    if (m) found.push({ key, index: m.index, matchedLabel: m.matchedLabel });
  }
  found.sort((a, b) => a.index - b.index);
  const result: SummarySections = { motivo_consulta: NOT_CONSIGNED, antecedentes: NOT_CONSIGNED, diagnostico: NOT_CONSIGNED, alertas: NOT_CONSIGNED, tratamiento: NOT_CONSIGNED };
  for (const { key, index, matchedLabel } of found) {
    const others = found.filter(f => f.index > index).map(f => f.index);
    const content = extractContent(rawHistory, index, matchedLabel, others);
    if (content) result[key] = content;
  }
  if (!Object.values(result).some(v => v !== NOT_CONSIGNED)) result.motivo_consulta = rawHistory.trim();
  return result;
}
