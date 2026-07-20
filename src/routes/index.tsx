import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">HistorIA</span>
          </div>
          <Link to="/auth">
            <Button variant="default">Ingresar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Resúmenes clínicos asistidos por IA
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            El historial clínico de tus pacientes, <span className="text-primary">ordenado en segundos.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            HistorIA convierte el texto libre del historial en un resumen profesional con cinco secciones claras: motivo de consulta, antecedentes, diagnóstico, alertas y tratamiento. Pensado para clínicas pequeñas en Perú.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/auth">
              <Button size="lg">Comenzar ahora</Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            { icon: FileText, title: "Cinco secciones estándar", body: "Motivo, antecedentes, diagnóstico, alertas y tratamiento — siempre en el mismo formato." },
            { icon: ShieldCheck, title: "Privado por doctor", body: "Cada médico solo ve sus propios resúmenes. Datos cifrados en tránsito y protegidos con RLS." },
            { icon: Sparkles, title: "PDF listo para imprimir", body: "Descarga o imprime el resumen desde la consulta con un solo clic." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        HistorIA · Para uso profesional médico
      </footer>
    </div>
  );
}
