import { jsPDF } from 'jspdf';
import type { PatientSummary } from '@/lib/supabase';

const SECTIONS: Array<{ key: keyof PatientSummary; label: string }> = [
  { key: 'motivo_consulta', label: '1. Motivo de consulta' },
  { key: 'antecedentes', label: '2. Antecedentes médicos' },
  { key: 'diagnostico', label: '3. Diagnóstico o impresión clínica' },
  { key: 'alertas', label: '4. Alertas y alergias' },
  { key: 'tratamiento', label: '5. Recomendación de tratamiento' },
];

export function downloadSummaryPdf(summary: PatientSummary) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const mx = 48;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - mx * 2;
  let y = 60;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pw, 14, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(30, 30, 40);
  doc.text('HistorIA — Resumen clínico', mx, y); y += 24;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(60, 60, 70);
  const date = new Date(summary.created_at).toLocaleString('es-PE');
  doc.text(`Paciente: ${summary.patient_name}`, mx, y); y += 14;
  if (summary.patient_code) { doc.text(`Código: ${summary.patient_code}`, mx, y); y += 14; }
  doc.text(`Fecha: ${date}`, mx, y); y += 20;
  doc.setDrawColor(200, 200, 210); doc.line(mx, y, pw - mx, y); y += 18;

  for (const { key, label } of SECTIONS) {
    if (y > ph - 80) { doc.addPage(); y = 60; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(37, 99, 235);
    doc.text(label, mx, y); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40, 40, 50);
    const lines = doc.splitTextToSize(String(summary[key] || 'No consignado'), cw);
    for (const line of lines) { if (y > ph - 60) { doc.addPage(); y = 60; } doc.text(line, mx, y); y += 14; }
    y += 12;
  }

  doc.setFontSize(8); doc.setTextColor(160, 160, 170);
  doc.text('Generado por HistorIA · Plataforma médica con IA · Perú', pw / 2, ph - 20, { align: 'center' });
  const safeName = summary.patient_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'paciente';
  const safeDate = new Date(summary.created_at).toISOString().slice(0, 10);
  doc.save(`resumen-${safeName}-${safeDate}.pdf`);
}
