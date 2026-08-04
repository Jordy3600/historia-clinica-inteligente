import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'es' | 'en' | 'ay' | 'qu';

export const LANGUAGES: Array<{ code: Lang; label: string; flag: string }> = [
  { code: 'es', label: 'Español', flag: '🇵🇪' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ay', label: 'Aimara', flag: '🇧🇴' },
  { code: 'qu', label: 'Quechua', flag: '🇵🇪' },
];

type Dict = Record<string, string>;

const es: Dict = {
  'nav.inicio': 'Inicio',
  'nav.asistente': 'Asistente IA',
  'nav.resumen': 'Resumen clínico',
  'nav.agenda': 'Agenda',
  'nav.historial': 'Historial',
  'nav.guias': 'Guías clínicas',
  'nav.mapa': 'Mapa de clínicas',
  'common.sistema': 'Sistema',
  'common.buscar': 'Buscar',
  'common.guardar': 'Guardar',
  'common.cancelar': 'Cancelar',
  'common.limpiar': 'Limpiar',
  'panel.titulo': 'Panel clínico',
  'panel.estado': 'Estado del sistema',
  'panel.operativo': 'Operativo',
  'panel.tema': 'Tema clínico del día',
  'panel.accesos': 'Accesos rápidos',
  'consulta.titulo': 'Nueva consulta',
  'consulta.paciente': 'Paciente',
  'consulta.fecha': 'Fecha de consulta',
  'consulta.historial': 'Historial clínico',
  'consulta.ejemplo': 'Usar ejemplo',
  'consulta.generar': 'Generar resumen',
  'resultado.titulo': 'Resumen clínico',
  'resultado.guardar': 'Guardar en historial',
  'resultado.pdf': 'Descargar PDF',
  'resultado.aviso': 'Revisa siempre el contenido antes de compartirlo. Este resumen es informativo y no sustituye el criterio médico.',
  'chat.titulo': 'Asistente IA',
  'agenda.titulo': 'Agenda',
  'agenda.nuevo': 'Nuevo recordatorio',
  'agenda.paciente': 'Paciente',
  'agenda.tipo': 'Tipo',
  'agenda.fecha': 'Fecha',
  'agenda.hora': 'Hora',
  'agenda.notas': 'Notas',
  'historial.titulo': 'Historial',
  'historial.buscar': 'Buscar por paciente o código…',
  'historial.vacio': 'Aún no has generado resúmenes.',
};

const en: Dict = {
  'nav.inicio': 'Home',
  'nav.asistente': 'AI Assistant',
  'nav.resumen': 'Clinical summary',
  'nav.agenda': 'Schedule',
  'nav.historial': 'History',
  'nav.guias': 'Clinical guidelines',
  'nav.mapa': 'Clinic map',
  'common.sistema': 'System',
  'common.buscar': 'Search',
  'common.guardar': 'Save',
  'common.cancelar': 'Cancel',
  'common.limpiar': 'Clear',
  'panel.titulo': 'Clinical panel',
  'panel.estado': 'System status',
  'panel.operativo': 'Operational',
  'panel.tema': 'Daily clinical topic',
  'panel.accesos': 'Quick access',
  'consulta.titulo': 'New consultation',
  'consulta.paciente': 'Patient',
  'consulta.fecha': 'Consultation date',
  'consulta.historial': 'Clinical history',
  'consulta.ejemplo': 'Use sample',
  'consulta.generar': 'Generate summary',
  'resultado.titulo': 'Clinical summary',
  'resultado.guardar': 'Save to history',
  'resultado.pdf': 'Download PDF',
  'resultado.aviso': 'Always review the content before sharing. This summary is informative and does not replace medical judgment.',
  'chat.titulo': 'AI Assistant',
  'agenda.titulo': 'Schedule',
  'agenda.nuevo': 'New reminder',
  'agenda.paciente': 'Patient',
  'agenda.tipo': 'Type',
  'agenda.fecha': 'Date',
  'agenda.hora': 'Time',
  'agenda.notas': 'Notes',
  'historial.titulo': 'History',
  'historial.buscar': 'Search by patient or code…',
  'historial.vacio': 'You have not generated summaries yet.',
};

const ay: Dict = {
  'nav.inicio': 'Qalltaña',
  'nav.asistente': 'Yatichiri IA',
  'nav.resumen': 'Qhana klinika',
  'nav.agenda': 'T\'ijawi',
  'nav.historial': 'Yatichäwi',
  'nav.guias': 'Yatichäwinaqanaka',
  'nav.mapa': 'Klinikanaka mayi',
  'common.sistema': 'Sistema',
  'common.buscar': 'Thaqhaña',
  'common.guardar': 'Imaña',
  'common.cancelar': 'Tukuya',
  'common.limpiar': 'Pichaña',
  'panel.titulo': 'Klinika panel',
  'panel.estado': "Yaqht'ata",
  'panel.operativo': "Yaqht'ata",
  'panel.tema': "Uñacht'ayaña",
  'panel.accesos': "Jik'iñ chikanchiri",
  'consulta.titulo': "Machaqa t'ijawi",
  'consulta.paciente': 'Nanesaña',
  'consulta.fecha': "T'ijawi uru",
  'consulta.historial': 'Klinika yatichäwi',
  'consulta.ejemplo': 'Yatichäwinaka',
  'consulta.generar': 'Qhana qhanaña',
  'resultado.titulo': 'Qhana klinika',
  'resultado.guardar': 'Yatichäwina imaña',
  'resultado.pdf': 'PDF jisk\'ayaña',
  'resultado.aviso': "Uñacht'ayañ qhanacht\'ayañ jik\'iñata. Aka qhana klinikaxa yatichäwiwa, jan ukasti mediku yatichäwix chikt\'ata.",
  'chat.titulo': 'Yatichiri IA',
  'agenda.titulo': "T'ijawi",
  'agenda.nuevo': "Machaqa t'ijawi",
  'agenda.paciente': 'Nanesaña',
  'agenda.tipo': 'T\'ijawi',
  'agenda.fecha': 'Uru',
  'agenda.hora': 'Ura',
  'agenda.notas': 'Yatichäwinaka',
  'historial.titulo': 'Yatichäwi',
  'historial.buscar': 'Nanesaña thaqhaña…',
  'historial.vacio': 'Jan qhana klinikanaka jik\'iñata.',
};

const qu: Dict = {
  'nav.inicio': 'Qallariy',
  'nav.asistente': 'Yachachiq IA',
  'nav.resumen': 'Hampikamayuq qillqa',
  'nav.agenda': 'P\'unchaw',
  'nav.historial': 'Yuyay',
  'nav.guias': 'Hampikamayuq yachachikuna',
  'nav.mapa': 'Hampiwasi mapan',
  'common.sistema': 'Sistema',
  'common.buscar': 'Maskay',
  'common.guardar': 'Waakuy',
  'common.cancelar': 'Tukuy',
  'common.limpiar': 'Pichay',
  'panel.titulo': 'Hampikamayuq panel',
  'panel.estado': "Kawsay",
  'panel.operativo': "Kawsayninkama",
  'panel.tema': "P\'unchawpi yachachiy",
  'panel.accesos': "Utqaylla yayku",
  'consulta.titulo': "Machuq hampi",
  'consulta.paciente': 'Hampisqa',
  'consulta.fecha': "P\'unchaw",
  'consulta.historial': 'Hampikamayuq yuyay',
  'consulta.ejemplo': 'Yachachiy',
  'consulta.generar': 'Qillqay',
  'resultado.titulo': 'Hampikamayuq qillqa',
  'resultado.guardar': 'Yuyayman waakuy',
  'resultado.pdf': 'PDF uraykachiy',
  'resultado.aviso': "Yuyaymanta qillqayta qhaway. Aka qillqaxa yachachiyllam, manan hampikamayuq yuyayta rantin.",
  'chat.titulo': 'Yachachiq IA',
  'agenda.titulo': "P\'unchaw",
  'agenda.nuevo': "Machuq p\'unchaw",
  'agenda.paciente': 'Hampisqa',
  'agenda.tipo': "P\'unchaw",
  'agenda.fecha': "P\'unchaw",
  'agenda.hora': 'Hora',
  'agenda.notas': 'Yuyayninkuna',
  'historial.titulo': 'Yuyay',
  'historial.buscar': 'Hampisqata maskay…',
  'historial.vacio': 'Manan qillqaykuna kanchu.',
};

const DICTS: Record<Lang, Dict> = { es, en, ay, qu };

interface I18nContextValue {
  t: (key: string) => string;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  const [hydrated, setHydrated] = useState(false);

  // Read the persisted language after hydration so SSR and the first client render match.
  useEffect(() => {
    const saved = localStorage.getItem('historia-lang') as Lang | null;
    if (saved) setLangState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('historia-lang', lang);
  }, [lang, hydrated]);

  const t = (key: string): string => DICTS[lang][key] ?? DICTS.es[key] ?? key;
  const setLang = (l: Lang) => setLangState(l);

  return <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
