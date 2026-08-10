import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ClipboardList, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, type SummaryListItem } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HistorialPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<SummaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('patient_summaries')
        .select('id, patient_name, patient_code, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        const local = localStorage.getItem('historia_summaries');
        if (local) {
          try {
            setItems(JSON.parse(local));
          } catch {
            setItems([]);
          }
        }
      } else {
        setItems((data ?? []) as SummaryListItem[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    await supabase.from('patient_summaries').delete().eq('id', id);
    setDeletingId(null);

    const local = localStorage.getItem('historia_summaries');
    if (local) {
      try {
        const list = JSON.parse(local).filter((r: { id: string }) => r.id !== id);
        localStorage.setItem('historia_summaries', JSON.stringify(list));
      } catch {}
    }

    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.success('Resumen eliminado');
  }

  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.patient_name.toLowerCase().includes(q) ||
      (item.patient_code?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text-1">Historial de Resúmenes</h1>
          <p className="text-xs text-text-3">
            Consulta y gestiona las historias clínicas generadas.
          </p>
        </div>
        <Link to="/app/nueva-consulta">
          <button className="flex items-center gap-1.5 rounded-xl bg-[#00a8c6] hover:bg-[#00c2e0] px-4 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Nuevo</span>
          </button>
        </Link>
      </div>

      <div className="relative animate-slide-up">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
        <input
          type="text"
          placeholder={t('historial.buscar')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando…
        </div>
      ) : error ? (
        <p className="text-sm text-error">{error}</p>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center text-text-2">
            <ClipboardList className="mb-3 h-8 w-8 text-blue opacity-50" />
            <p className="text-sm">
              {search ? 'No se encontraron resultados.' : t('historial.vacio')}
            </p>
            {!search && (
              <Link to="/app/nueva-consulta" className="mt-4">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Generar el primero
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => (
            <Link key={row.id} to={`/app/historial/${row.id}`}>
              <Card className="transition-colors hover:border-blue/30 hover:bg-bg-hover/50">
                <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{row.patient_name}</CardTitle>
                    <CardDescription>
                      {row.patient_code ? `${row.patient_code} · ` : ''}
                      {new Date(row.created_at).toLocaleString('es-PE')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(row.id, e)}
                      disabled={deletingId === row.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-3" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
