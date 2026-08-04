import { Link } from 'react-router-dom';
import { Stethoscope, FileText, Sparkles, ArrowRight, Bot, MapPin, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue/15">
              <Stethoscope className="h-5 w-5 text-blue" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-1">HistorIA</span>
          </div>
          <Link to="/app">
            <Button size="sm">
              Entrar a la app
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-2 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-blue" />
            Resúmenes clínicos asistidos por IA
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-text-1 sm:text-6xl animate-slide-up">
            El historial clínico de tus pacientes,{' '}
            <span className="bg-gradient-to-r from-blue to-teal bg-clip-text text-transparent">
              ordenado en segundos.
            </span>
          </h1>
          <p className="mt-6 text-lg text-text-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            HistorIA convierte el texto libre en un resumen profesional de cinco secciones,
            con chat de IA, guías clínicas, mapa de clínicas y agenda de recordatorios.
            Pensado para clínicas en Chimbote y Áncash.
          </p>
          <div className="mt-8 flex gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/app">
              <Button size="lg">
                Comenzar ahora
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, title: 'Resúmenes en 5 secciones', body: 'Motivo, antecedentes, diagnóstico, alertas y tratamiento.', color: 'text-blue' },
            { icon: Bot, title: 'Asistente IA médico', body: 'Pregunta sobre mecanismos, protocolos e interacciones.', color: 'text-teal' },
            { icon: Calendar, title: 'Agenda de recordatorios', body: 'Programa citas y seguimientos de pacientes.', color: 'text-success' },
            { icon: MapPin, title: 'Mapa de clínicas', body: 'Centros de salud cercanos en Chimbote y Áncash.', color: 'text-warning' },
          ].map(({ icon: Icon, title, body, color }, i) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-bg-card p-6 shadow-card transition-all duration-300 hover:border-blue/30 hover:shadow-card-hover animate-slide-up"
              style={{ animationDelay: `${300 + i * 100}ms` }}
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <h3 className="mt-4 font-semibold text-text-1">{title}</h3>
              <p className="mt-2 text-sm text-text-2">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 flex items-center gap-3 text-sm text-text-2 animate-fade-in">
          <Globe className="h-4 w-4 text-blue" />
          Disponible en Español, Inglés, Aimara y Quechua
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text-3">
        HistorIA · Plataforma médica con IA · Chimbote, Áncash — Perú
      </footer>
    </div>
  );
}
