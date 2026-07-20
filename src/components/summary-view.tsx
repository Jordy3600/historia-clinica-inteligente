import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Stethoscope, FileText, Activity, Pill } from "lucide-react";

export interface SummaryData {
  motivo_consulta: string;
  antecedentes: string;
  diagnostico: string;
  alertas: string;
  tratamiento: string;
}

const SECTIONS: Array<{ key: keyof SummaryData; label: string; Icon: typeof FileText; highlight?: boolean }> = [
  { key: "motivo_consulta", label: "Motivo de consulta", Icon: Stethoscope },
  { key: "antecedentes", label: "Antecedentes médicos", Icon: FileText },
  { key: "diagnostico", label: "Diagnóstico / Impresión clínica", Icon: Activity },
  { key: "alertas", label: "Alertas y alergias", Icon: AlertTriangle, highlight: true },
  { key: "tratamiento", label: "Recomendación de tratamiento", Icon: Pill },
];

export function SummaryView({ data }: { data: SummaryData }) {
  return (
    <div className="grid gap-4">
      {SECTIONS.map(({ key, label, Icon, highlight }, i) => (
        <Card
          key={key}
          className={`print-card ${highlight ? "border-destructive/40 bg-destructive/5" : ""}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className={`h-4 w-4 ${highlight ? "text-destructive" : "text-primary"}`} />
              <span className="text-muted-foreground text-xs font-medium">{i + 1}.</span>
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {data[key] || "No consignado"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}