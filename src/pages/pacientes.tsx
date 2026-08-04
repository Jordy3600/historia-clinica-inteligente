import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  Activity,
  HeartPulse,
  ChevronRight,
  FileText,
  Clock,
  Phone,
  Mail,
  ShieldAlert,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  code: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  riskLevel: 'bajo' | 'moderado' | 'alto';
  vitals: {
    bp: string;
    hr: number;
    glucose: number;
  };
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'María González Torres',
    code: 'HC-00234',
    age: 58,
    gender: 'F',
    phone: '+51 987 654 321',
    email: 'maria.gonzalez@email.com',
    lastVisit: '2026-08-01',
    condition: 'Hipertensión Arterial Grado 2, DM2',
    riskLevel: 'alto',
    vitals: { bp: '150/95', hr: 82, glucose: 142 },
  },
  {
    id: 'pat-2',
    name: 'Carlos Mendoza Ramos',
    code: 'HC-00189',
    age: 45,
    gender: 'M',
    phone: '+51 912 345 678',
    email: 'carlos.mendoza@email.com',
    lastVisit: '2026-07-28',
    condition: 'Dislipidemia, Control anual',
    riskLevel: 'moderado',
    vitals: { bp: '128/82', hr: 74, glucose: 108 },
  },
  {
    id: 'pat-3',
    name: 'Lucía Benítez Prado',
    code: 'HC-00312',
    age: 32,
    gender: 'F',
    phone: '+51 955 443 221',
    email: 'lucia.benitez@email.com',
    lastVisit: '2026-07-25',
    condition: 'Asma Bronquial Leve Persistente',
    riskLevel: 'bajo',
    vitals: { bp: '118/75', hr: 68, glucose: 92 },
  },
  {
    id: 'pat-4',
    name: 'Roberto Silva Castro',
    code: 'HC-00401',
    age: 67,
    gender: 'M',
    phone: '+51 933 112 233',
    email: 'roberto.silva@email.com',
    lastVisit: '2026-07-15',
    condition: 'Insuficiencia Cardíaca Compensada, FA',
    riskLevel: 'alto',
    vitals: { bp: '135/85', hr: 88, glucose: 115 },
  },
  {
    id: 'pat-5',
    name: 'Elena Vargas Ríos',
    code: 'HC-00512',
    age: 29,
    gender: 'F',
    phone: '+51 977 889 900',
    email: 'elena.vargas@email.com',
    lastVisit: '2026-07-10',
    condition: 'Control Prenatal - 18 semanas',
    riskLevel: 'bajo',
    vitals: { bp: '110/70', hr: 72, glucose: 88 },
  },
];

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new patient
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newPhone, setNewPhone] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newRisk, setNewRisk] = useState<'bajo' | 'moderado' | 'alto'>('bajo');

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q);

    const matchesRisk = filterRisk === 'todos' || p.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: newName.trim(),
      code: `HC-00${Math.floor(100 + Math.random() * 900)}`,
      age: parseInt(newAge) || 40,
      gender: newGender,
      phone: newPhone.trim() || '+51 900 000 000',
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      lastVisit: new Date().toISOString().split('T')[0],
      condition: newCondition.trim() || 'Consulta General',
      riskLevel: newRisk,
      vitals: { bp: '120/80', hr: 75, glucose: 100 },
    };

    setPatients([newPatient, ...patients]);
    setIsModalOpen(false);
    toast.success('Paciente registrado exitosamente');

    // Reset
    setNewName('');
    setNewAge('');
    setNewCondition('');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header Bar Minimalista */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-1">Pacientes</h1>
          <p className="text-xs text-text-3">
            Gestión de expedientes clínicos, monitoreo de signos vitales y factores de riesgo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00a8c6] hover:bg-[#00c2e0] px-4 py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nuevo Paciente</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-bg-card p-4">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Total Expedientes</span>
            <UserCheck className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-text-1">{patients.length}</div>
          <div className="text-[10px] text-teal font-medium mt-1">Activos en sistema</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-bg-card p-4">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Riesgo Alto</span>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-400">
            {patients.filter((p) => p.riskLevel === 'alto').length}
          </div>
          <div className="text-[10px] text-red-400/80 font-medium mt-1">Seguimiento prioritario</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-bg-card p-4">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Riesgo Moderado</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-400">
            {patients.filter((p) => p.riskLevel === 'moderado').length}
          </div>
          <div className="text-[10px] text-amber-400/80 font-medium mt-1">Controles trimestrales</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-bg-card p-4">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold">Consultas este mes</span>
            <HeartPulse className="h-4 w-4 text-blue" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue">24</div>
          <div className="text-[10px] text-blue font-medium mt-1">Con Asistente HistorIA</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, historia clínica (HC) o diagnóstico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border/80 bg-bg-card py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-1 placeholder:text-text-3 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-text-3 flex-shrink-0" />
          {['todos', 'alto', 'moderado', 'bajo'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterRisk === lvl
                  ? 'bg-teal text-bg shadow-glow-teal'
                  : 'bg-bg-card text-text-2 border border-border hover:text-text-1'
              }`}
            >
              {lvl === 'todos' ? 'Todos los riesgos' : `Riesgo ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table / Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-bg-card p-5 shadow-xs hover:border-teal/50 hover:bg-bg-hover/40 transition-all duration-200"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded-md bg-teal/15 px-2 py-0.5 text-[10px] font-extrabold text-teal">
                    {patient.code}
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-text-1 group-hover:text-teal transition-colors">
                    {patient.name}
                  </h3>
                  <div className="mt-0.5 text-xs text-text-3">
                    {patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                    patient.riskLevel === 'alto'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : patient.riskLevel === 'moderado'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-teal/15 text-teal border border-teal/30'
                  }`}
                >
                  Riesgo {patient.riskLevel}
                </span>
              </div>

              {/* Condition */}
              <div className="mt-4 rounded-2xl border border-border/60 bg-bg-hover/60 p-3">
                <div className="text-[10px] font-bold text-text-3 uppercase tracking-wider">Diagnóstico Principal</div>
                <div className="mt-0.5 text-xs font-semibold text-text-1 truncate">{patient.condition}</div>
              </div>

              {/* Vitals Summary */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-xl border border-border/50 bg-bg/60 p-2">
                  <div className="text-text-3">P.A.</div>
                  <div className="font-extrabold text-text-1">{patient.vitals.bp}</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-bg/60 p-2">
                  <div className="text-text-3">F.C.</div>
                  <div className="font-extrabold text-text-1">{patient.vitals.hr} bpm</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-bg/60 p-2">
                  <div className="text-text-3">Glucosa</div>
                  <div className="font-extrabold text-text-1">{patient.vitals.glucose} mg/dL</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-text-3">
                <Clock className="h-3.5 w-3.5 text-teal" />
                <span>Última visita: {patient.lastVisit}</span>
              </div>

              <Link
                to={`/app/asistente?paciente=${encodeURIComponent(patient.name)}`}
                className="flex items-center gap-1 text-xs font-bold text-teal hover:underline cursor-pointer"
              >
                <span>Consultar IA</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* New Patient Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-text-1">Registrar Nuevo Paciente</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl p-1 text-text-3 hover:text-text-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Morales"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">Edad</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 52"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">Género</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'M' | 'F')}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="+51 987 654 321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Diagnóstico / Motivo de Consulta</label>
                <input
                  type="text"
                  placeholder="Ej: HTA, Control semestral"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-2 mb-1">Nivel de Riesgo Clínico</label>
                <select
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value as 'bajo' | 'moderado' | 'alto')}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-1 outline-none focus:border-teal"
                >
                  <option value="bajo">Riesgo Bajo</option>
                  <option value="moderado">Riesgo Moderado</option>
                  <option value="alto">Riesgo Alto (Prioritario)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-text-3 hover:bg-bg-hover"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal px-5 py-2 text-xs font-extrabold text-bg hover:bg-teal-hover shadow-glow-teal"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
