import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Check, Clock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  patient_name: string;
  patient_code: string | null;
  reminder_type: string;
  reminder_date: string;
  reminder_time: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  cita: 'Cita',
  seguimiento: 'Seguimiento',
  control: 'Control',
  otro: 'Otro',
};

const TYPE_COLORS: Record<string, string> = {
  cita: 'text-blue bg-blue/10',
  seguimiento: 'text-teal bg-teal/10',
  control: 'text-success bg-success/10',
  otro: 'text-text-2 bg-bg-hover',
};

export default function AgendaPage() {
  const { t } = useI18n();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [type, setType] = useState('cita');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_date', { ascending: true });

    if (error || !data) {
      const local = localStorage.getItem('historia_reminders');
      if (local) {
        try {
          setReminders(JSON.parse(local));
        } catch {
          setReminders([]);
        }
      }
    } else {
      setReminders((data ?? []) as Reminder[]);
    }
    setLoading(false);
  }

  function resetForm() {
    setPatientName('');
    setPatientCode('');
    setType('cita');
    setDate('');
    setTime('');
    setNotes('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim() || !date) {
      toast.error('Completa el nombre del paciente y la fecha');
      return;
    }

    setSaving(true);
    const newRem: Reminder = {
      id: crypto.randomUUID(),
      patient_name: patientName.trim(),
      patient_code: patientCode.trim() || null,
      reminder_type: type,
      reminder_date: date,
      reminder_time: time || null,
      notes: notes.trim() || null,
      completed: false,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('reminders').insert({
      patient_name: newRem.patient_name,
      patient_code: newRem.patient_code,
      reminder_type: newRem.reminder_type,
      reminder_date: newRem.reminder_date,
      reminder_time: newRem.reminder_time,
      notes: newRem.notes,
      completed: false,
    });

    setSaving(false);

    // Save to local storage as fallback/sync
    const local = localStorage.getItem('historia_reminders');
    const list: Reminder[] = local ? JSON.parse(local) : [];
    list.push(newRem);
    localStorage.setItem('historia_reminders', JSON.stringify(list));

    toast.success('Recordatorio guardado');
    resetForm();
    setShowForm(false);
    loadReminders();
  }

  async function toggleComplete(reminder: Reminder) {
    await supabase
      .from('reminders')
      .update({ completed: !reminder.completed })
      .eq('id', reminder.id);

    const local = localStorage.getItem('historia_reminders');
    if (local) {
      try {
        const list: Reminder[] = JSON.parse(local);
        const updated = list.map((r) => (r.id === reminder.id ? { ...r, completed: !r.completed } : r));
        localStorage.setItem('historia_reminders', JSON.stringify(updated));
      } catch {}
    }

    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, completed: !r.completed } : r)),
    );
  }

  async function handleDelete(id: string) {
    await supabase.from('reminders').delete().eq('id', id);

    const local = localStorage.getItem('historia_reminders');
    if (local) {
      try {
        const list: Reminder[] = JSON.parse(local);
        const updated = list.filter((r) => r.id !== id);
        localStorage.setItem('historia_reminders', JSON.stringify(updated));
      } catch {}
    }

    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success('Recordatorio eliminado');
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reminders.filter((r) => r.reminder_date >= today && !r.completed);
  const past = reminders.filter((r) => r.reminder_date < today || r.completed);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function isToday(dateStr: string): boolean {
    return dateStr === today;
  }

  function isTomorrow(dateStr: string): boolean {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return dateStr === t.toISOString().slice(0, 10);
  }

  function dateLabel(dateStr: string): string {
    if (isToday(dateStr)) return 'Hoy';
    if (isTomorrow(dateStr)) return 'Mañana';
    return formatDate(dateStr);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text-1">Agenda</h1>
          <p className="text-xs text-text-3">
            Programa citas, seguimientos y controles de tus pacientes.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-[#00a8c6] hover:bg-[#00c2e0] px-4 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-xs"
        >
          {showForm ? (
            <>Cancelar</>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {t('agenda.nuevo')}
            </>
          )}
        </button>
      </div>

      {showForm && (
        <Card className="animate-slide-up">
          <CardContent className="p-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="r-name">{t('agenda.paciente')}</Label>
                  <Input
                    id="r-name"
                    placeholder="Nombre del paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-code">Código (opcional)</Label>
                  <Input
                    id="r-code"
                    placeholder="Ej. HC-00234"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="r-type">{t('agenda.tipo')}</Label>
                  <select
                    id="r-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3 py-2.5 text-sm text-text-1 focus:border-teal/50 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value} className="bg-bg-card">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-date">{t('agenda.fecha')}</Label>
                  <Input
                    id="r-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-time">{t('agenda.hora')}</Label>
                  <Input
                    id="r-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="r-notes">{t('agenda.notas')}</Label>
                <Textarea
                  id="r-notes"
                  placeholder="Notas adicionales…"
                  className="min-h-[80px] resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    t('common.guardar')
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {t('common.cancelar')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-text-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando…
        </div>
      )}

      {!loading && (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text-2">Próximos</h2>
              {upcoming.map((r) => (
                <Card key={r.id} className="transition-colors hover:border-blue/20">
                  <CardContent className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => toggleComplete(r)}
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-colors',
                        r.completed
                          ? 'border-success bg-success/20 text-success'
                          : 'border-border hover:border-blue/40',
                      )}
                    >
                      {r.completed && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-text-3" />
                        <span className="truncate text-sm font-semibold text-text-1">{r.patient_name}</span>
                        {r.patient_code && <span className="text-xs text-text-3">{r.patient_code}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-2">
                        <span className={cn('rounded-md px-2 py-0.5 font-medium', TYPE_COLORS[r.reminder_type] ?? TYPE_COLORS.otro)}>
                          {TYPE_LABELS[r.reminder_type] ?? r.reminder_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateLabel(r.reminder_date)}
                        </span>
                        {r.reminder_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {r.reminder_time}
                          </span>
                        )}
                      </div>
                      {r.notes && <p className="mt-1.5 text-xs text-text-2">{r.notes}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text-2">Pasados y completados</h2>
              {past.map((r) => (
                <Card key={r.id} className="opacity-60 transition-opacity hover:opacity-80">
                  <CardContent className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => toggleComplete(r)}
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-colors',
                        r.completed
                          ? 'border-success bg-success/20 text-success'
                          : 'border-border hover:border-blue/40',
                      )}
                    >
                      {r.completed && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-text-3" />
                        <span className={cn('truncate text-sm font-semibold', r.completed ? 'text-text-2 line-through' : 'text-text-1')}>{r.patient_name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-2">
                        <span className={cn('rounded-md px-2 py-0.5 font-medium', TYPE_COLORS[r.reminder_type] ?? TYPE_COLORS.otro)}>
                          {TYPE_LABELS[r.reminder_type] ?? r.reminder_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(r.reminder_date)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-16 text-center text-text-2">
                <Calendar className="mb-3 h-8 w-8 text-blue opacity-50" />
                <p className="text-sm">No tienes recordatorios aún.</p>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  Crear el primero
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
