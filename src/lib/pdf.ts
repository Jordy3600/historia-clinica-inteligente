import { jsPDF } from "jspdf";

export interface SummaryForPdf {
  patient_name: string;
  patient_code: string | null;
  created_at: string;
  motivo_consulta: string;
  antecedentes: string;
  diagnostico: string;
  alertas: string;
  tratamiento: string;
}

const SECTIONS: Array<{ key: keyof SummaryForPdf; label: string }> = [
  { key: "motivo_consulta", label: "1. Motivo de consulta" },
  { key: "antecedentes", label: "2. Antecedentes médicos" },
  { key: "diagnostico", label: "3. Diagnóstico o impresión clínica" },
  { key: "alertas", label: "4. Alertas y alergias" },
  { key: "tratamiento", label: "5. Recomendación de tratamiento" },
];

export function downloadSummaryPdf(summary: SummaryForPdf) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("HistorIA — Resumen clínico", marginX, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const date = new Date(summary.created_at).toLocaleString("es-PE");
  doc.text(`Paciente: ${summary.patient_name}`, marginX, y);
  y += 14;
  if (summary.patient_code) {
    doc.text(`Código: ${summary.patient_code}`, marginX, y);
    y += 14;
  }
  doc.text(`Fecha: ${date}`, marginX, y);
  y += 20;

  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  for (const { key, label } of SECTIONS) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(label, marginX, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const value = String(summary[key] || "No consignado");
    const lines = doc.splitTextToSize(value, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, marginX, y);
      y += 14;
    }
    y += 10;
  }

  const safeName = summary.patient_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "paciente";
  const safeDate = new Date(summary.created_at).toISOString().slice(0, 10);
  doc.save(`resumen-${safeName}-${safeDate}.pdf`);
}