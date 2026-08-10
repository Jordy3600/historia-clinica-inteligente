import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Save,
  Zap,
  Wand2,
  RefreshCw,
  FileCheck,
  UserCheck,
  ShieldAlert,
  Check,
  X,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

// Sample Patient Data for Live DNI/Name Search
const PATIENTS_DB = [
  { dni: '45891234', name: 'María González Torres', age: 54, gender: 'Femenino', hc: 'HC-00234', lastVisit: 'Hoy, 09:30 AM', condition: 'Hipertensión Arterial' },
  { dni: '10293847', name: 'Jorge Ramírez Medina', age: 62, gender: 'Masculino', hc: 'HC-00189', lastVisit: 'Ayer', condition: 'Diabetes Tipo 2' },
  { dni: '72615438', name: 'Ana Lucía Paredes', age: 38, gender: 'Femenino', hc: 'HC-00312', lastVisit: 'Hace 2 días', condition: 'Asma Bronquial' },
  { dni: '09876543', name: 'Carlos Eduardo Silva', age: 45, gender: 'Masculino', hc: 'HC-00105', lastVisit: '28 Jul 2026', condition: 'Dislipidemia' },
];

export default function PanelClinicoPage() {
  const navigate = useNavigate();

  // Top Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<(typeof PATIENTS_DB)[0] | null>(PATIENTS_DB[0]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Medical Note Editor State
  const [noteText, setNoteText] = useState(
    'Paciente acude a consulta de control. Refiere cefalea holocraneana leve de 3 días de evolución, acompañado de cifras tensionales de 145/95 mmHg en toma domiciliaria. Sin acúfenos ni fosfenos. Refiere tos seca persistente atribuida a inicio de Enalapril 20mg hace 3 semanas.\n\nExamen Físico: PA 142/90 mmHg, FC 74 bpm, FR 16 rpm, SpO2 98%. Tórax limpio, sin soplos.'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    sintesis: string;
    diagnostico: string;
    cie10: string;
    alertas: string[];
    plan: string[];
    farmacos: string[];
  } | null>({
    sintesis: 'Cuadro de Hipertensión Arterial no controlada secundario a probable intolerancia/efecto secundario por IECA (tos por Enalapril).',
    diagnostico: 'Hipertensión Arterial Esencial Grado 1 + Tos inducida por IECA',
    cie10: 'I10 / T88.7',
    alertas: [
      'Tos seca atribuible a Enalapril (efecto adverso de clase IECA por acumulación de bradicinina).',
      'Cifras de PA 145/95 mmHg fuera de meta (<130/80 mmHg).',
    ],
    plan: [
      'Sustituir Enalapril por ARA-II (Losartán 50 mg cada 24 horas vía oral).',
      'Solicitar Perfil Renal (Creatinina, Uremia) y Electrólitos séricos (Potasio).',
      'Cita de control en 14 días con diario de presión arterial.',
    ],
    farmacos: ['Losartán 50mg tab - 1 tab c/24h x 30 días', 'Monitoreo domiciliario PA bid'],
  });

  const [copied, setCopied] = useState(false);

  // Filtered Patients Search
  const filteredPatients = PATIENTS_DB.filter(
    (p) => p.dni.includes(searchQuery.trim()) || p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // AI Processing Action
  const handleProcessWithAI = () => {
    if (!noteText.trim()) {
      toast.error('Por favor escribe la nota clínica antes de procesar.');
      return;
    }

    setIsProcessing(true);
    setAiResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setAiResult({
        sintesis: `Análisis automático finalizado para ${selectedPatient ? selectedPatient.name : 'Paciente'}. Evaluación de síntomas y antecedentes procesada con éxito.`,
        diagnostico: 'Hipertensión Esencial Grado 1 + Tos Secundaria a IECA',
        cie10: 'I10 / T88.7',
        alertas: [
          'Tolerancia a IECA compromised: Se sugiere rotación a antagonista de receptores de angiotensina II (ARA-II).',
          'Riesgo cardiovascular moderado: Mantener seguimiento de lípidos y función renal.',
        ],
        plan: [
          'Rotación de tratamiento antihipertensivo a Losartán 50mg/día.',
          'Laboratorio de control: Creatinina, Urea, Electrólitos Séricos.',
          'Estilo de vida: Dieta DASH con restricción sódica <2g/día y caminata 30 min/día.',
        ],
        farmacos: ['Losartán 50mg V.O. cada 24 hrs', 'Control de presión arterial en 14 días'],
      });
      toast.success('✨ Nota médica analizada');
    }, 1200);
  };

  const handleCopyResult = () => {
    if (!aiResult) return;
    const textToCopy = `IMPRESIÓN DIAGNÓSTICA:\n${aiResult.diagnostico} (${aiResult.cie10})\n\nALERTAS:\n${aiResult.alertas.join('\n')}\n\nPLAN TERAPÉUTICO:\n${aiResult.plan.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Resumen clínico copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = () => {
    toast.success(`Historia clínica guardada para ${selectedPatient?.name || 'Paciente'}`);
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text-1">
      {/* ========================================================= */}
      {/* CONTENEDOR PRINCIPAL: HEADER + ÁREA DE CONTENIDO          */}
      {/* ========================================================= */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* HEADER BARRA SUPERIOR */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-bg-card/95 px-4 sm:px-6 backdrop-blur z-10">
          {/* Buscador Principal por DNI o Nombre de Paciente */}
          <div className="relative flex-1 max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-text-3" />
              <input
                type="text"
                placeholder="Buscar paciente por DNI o Nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full rounded-full border border-border bg-bg-hover/80 pl-10 pr-4 py-2 text-xs text-text-1 placeholder-text-3 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-text-3 hover:text-text-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Resultados de Búsqueda */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-2 shadow-2xl space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-3 border-b border-border/50">
                  Pacientes Encontrados ({filteredPatients.length})
                </div>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.dni}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowSearchResults(false);
                        setSearchQuery('');
                        toast.info(`Paciente seleccionado: ${patient.name}`);
                      }}
                      className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs hover:bg-bg-hover cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-text-1">{patient.name}</div>
                        <div className="text-[10px] text-text-3">DNI: {patient.dni} • HC: {patient.hc}</div>
                      </div>
                      <span className="rounded-full bg-blue/15 px-2 py-0.5 text-[10px] font-bold text-blue">
                        {patient.condition}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-text-3">No se encontraron pacientes con ese DNI o Nombre.</div>
                )}
              </div>
            )}
          </div>

        </header>

        {/* ÁREA PRINCIPAL DE CONTENIDO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Banner Paciente Seleccionado */}
          {selectedPatient && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-blue/30 bg-blue/5 p-4 gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/20 text-blue font-bold text-sm">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-text-1">{selectedPatient.name}</h2>
                    <span className="rounded-md bg-blue/20 px-2 py-0.5 text-[10px] font-bold text-blue">
                      DNI: {selectedPatient.dni}
                    </span>
                    <span className="text-xs text-text-3">| {selectedPatient.hc}</span>
                  </div>
                  <p className="text-xs text-text-2 mt-0.5">
                    {selectedPatient.age} años • Sexo {selectedPatient.gender} • Condición: <strong className="text-teal font-bold">{selectedPatient.condition}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-xs text-text-3 hover:text-text-1 cursor-pointer flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Cambiar Paciente
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TARJETAS DE MÉTRICAS                                       */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Métrica 1: Pacientes Atendidos Hoy */}
            <div className="relative overflow-hidden rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-5 shadow-sm transition-all hover:border-blue/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-2">
                  Pacientes atendidos hoy
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue/15 text-blue">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text-1">12</span>
                <span className="text-xs font-bold text-teal">+18% vs. ayer</span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-2.5 text-[11px] text-text-3 font-medium">
                <Clock className="h-3.5 w-3.5 text-blue" />
                <span>Tiempo prom. por consulta: 14 min</span>
              </div>
            </div>

            {/* Métrica 2: Historias Procesadas por IA */}
            <div className="relative overflow-hidden rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-5 shadow-sm transition-all hover:border-teal/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-2">
                  Historias procesadas por IA
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text-1">28</span>
                <span className="text-xs font-bold text-teal">100% precisión CIE-10</span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-2.5 text-[11px] text-text-3 font-medium">
                <Zap className="h-3.5 w-3.5 text-teal" />
                <span>Velocidad de síntesis: &lt; 1.5 seg</span>
              </div>
            </div>

            {/* Métrica 3: Alertas Médicas Pendientes */}
            <div className="relative overflow-hidden rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-5 shadow-sm transition-all hover:border-amber-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-2">
                  Alertas médicas pendientes
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text-1">3</span>
                <span className="text-xs font-bold text-amber-400">Interacciones detectadas</span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-2.5 text-[11px] text-amber-400 font-bold">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Requiere revisión del especialista</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* EDITOR DE NOTA MÉDICA INTERACTIVO                          */}
          {/* ========================================================= */}
          <div className="rounded-3xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue" />
                  <h2 className="text-base font-extrabold text-text-1">
                    Editor de Nota Médica Interactiva
                  </h2>
                </div>
                <p className="text-xs text-text-2 mt-0.5">
                  Redacta las observaciones del examen clínico o pega notas sin estructurar para análisis automático por IA.
                </p>
              </div>

              {/* Botón Destacado: Procesar con IA */}
              <button
                type="button"
                onClick={handleProcessWithAI}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-2.5 text-xs font-bold text-white shadow-glow-teal hover:bg-teal-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analizando nota con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Procesar con IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Presets Rápidos de Nota Médica */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-text-3">Plantillas Rápidas:</span>
              <button
                type="button"
                onClick={() =>
                  setNoteText(
                    'ANAMNESIS: Paciente femenino de 54 años acude por mareos y cefalea pulsátil. PA: 150/95. Refiere consumo irregular de Enalapril. Sin dolor torácico.\nEXAMEN FÍSICO: Consciente, orientada. Ruidos cardíacos rítmicos. No edemas.\nPLAN: Evaluar ajuste antihipertensivo.'
                  )
                }
                className="rounded-xl border border-border/80 bg-bg-hover px-2.5 py-1 text-[11px] font-semibold text-text-2 hover:border-teal hover:text-teal transition-colors cursor-pointer"
              >
                + Control Hipertensión
              </button>
              <button
                type="button"
                onClick={() =>
                  setNoteText(
                    'PACIENTE CON DIABETES TIPO 2: Control de rutina. Glucosa en ayunas 165 mg/dL. HbA1c reciente 7.8%. Refiere parestesias ocasionales en miembros inferiores. En tratamiento actual con Metformina 850mg c/12h.'
                  )
                }
                className="rounded-xl border border-border/80 bg-bg-hover px-2.5 py-1 text-[11px] font-semibold text-text-2 hover:border-teal hover:text-teal transition-colors cursor-pointer"
              >
                + Control Diabetes
              </button>
            </div>

            {/* Textarea del Editor */}
            <div className="relative">
              <textarea
                rows={6}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escribe o dicta la nota de consulta médica aquí..."
                className="w-full rounded-2xl border border-border bg-bg-hover/50 p-4 text-xs leading-relaxed text-text-1 placeholder-text-3 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-text-3 px-1">
                <span>{noteText.length} caracteres • {noteText.split(/\s+/).filter(Boolean).length} palabras</span>
                <button
                  type="button"
                  onClick={() => setNoteText('')}
                  className="hover:text-text-1 cursor-pointer"
                >
                  Limpiar texto
                </button>
              </div>
            </div>

            {/* RESULTADO INTERACTIVO PROCESADO POR IA */}
            {aiResult && (
              <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4 sm:p-5 space-y-4 animate-fade-in shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-teal/20 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-teal" />
                    <div>
                      <h3 className="text-xs font-extrabold text-teal">
                        Diagnóstico & Plan Generado por IA Médica SAC
                      </h3>
                      <p className="text-[10px] text-text-3">Código CIE-10 asignado: {aiResult.cie10}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="flex items-center gap-1.5 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3 py-1.5 text-xs font-bold text-text-1 hover:border-blue cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5 text-blue" />}
                      <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToHistory}
                      className="flex items-center gap-1.5 rounded-xl bg-teal px-3 py-1.5 text-xs font-bold text-white shadow-glow-teal hover:bg-teal-hover cursor-pointer transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Guardar en HC</span>
                    </button>
                  </div>
                </div>

                {/* Grid de Secciones Diagnósticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Diagnóstico Presuntivo & Alertas */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-bg-card p-3 border border-border/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block mb-1">
                        Diagnóstico Presuntivo
                      </span>
                      <p className="font-extrabold text-text-1 text-xs">{aiResult.diagnostico}</p>
                      <p className="mt-1 text-[11px] text-text-2 leading-relaxed">{aiResult.sintesis}</p>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Alertas de Seguridad
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-text-2 space-y-1">
                        {aiResult.alertas.map((al, idx) => (
                          <li key={idx}>{al}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan de Trabajo & Fármacos */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-bg-card p-3 border border-border/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal flex items-center gap-1 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Plan Sugerido
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-text-2 space-y-1">
                        {aiResult.plan.map((pl, idx) => (
                          <li key={idx}>{pl}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-blue/10 p-3 border border-blue/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue flex items-center gap-1 mb-1">
                        <Stethoscope className="h-3.5 w-3.5" /> Receta / Esquema
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-text-2 space-y-1">
                        {aiResult.farmacos.map((fa, idx) => (
                          <li key={idx}>{fa}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


