import { supabase } from '@/lib/supabase';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  dataUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  generatedImageUrl?: string;
  generatedImagePrompt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  patientId?: string; // 'none' or patient summary UUID
  patientName?: string | null;
  patientCode?: string | null;
  messages: Message[];
}

const LOCAL_STORAGE_KEY = 'historia_chat_sessions_v3';

// Default initial sessions to give an immediate high quality experience
const SEED_SESSIONS: ChatSession[] = [
  {
    id: 'session-seed-1',
    title: 'Manejo de Crisis Hipertensiva en María González',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hrs ago
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    pinned: true,
    patientId: 'patient-seed-1',
    patientName: 'María González Torres',
    patientCode: 'HC-00234',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: '¿Cuál es el protocolo de abordaje para la paciente María González si presenta PA 170/100 y tos seca persistente?',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `**Evaluación Clínica para María González Torres (HC-00234):**

1. **Conducta con la Hipertensión:**
   - La cifrada de 170/100 mmHg corresponde a Hipertensión Grado 2. Si no hay daño agudo de órgano diana (sin dolor torácico, alteraciones visio-neurológicas o disnea severa), se clasifica como **Urgencia Hipertensiva**.
   - Se recomienda no reducir la presión de forma abrupta. Reducir la PAM un 15-20% en las primeras 24 horas.

2. **Tos inducida por IECA (Enalapril):**
   - La tos seca sin expectoración ocurre en hasta un 15% de pacientes en tratamiento con Enalapril.
   - **Plan:** Rotación de clase farmacológica a un ARA-II (**Losartán 50 mg/día** o **Valsartán 80 mg/día**). La tos debe remitir progresivamente en 1 a 4 semanas tras la suspensión.

3. **Recomendación de seguimiento:**
   - Monitorear Presión Arterial en domicilio (AMPA) por 7 días.
   - Solicitar electrolitos séricos (Potasio) y Creatinina tras 2 semanas de iniciar el ARA-II.`,
      },
    ],
  },
  {
    id: 'session-seed-2',
    title: 'Ajuste de Tratamiento Diabetes T2 - Jorge Ramírez',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    pinned: false,
    patientId: 'patient-seed-2',
    patientName: 'Jorge Ramírez Medina',
    patientCode: 'HC-00189',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Revisión de laboratorio: HbA1c 7.2% y TFG 65 ml/min en Jorge Ramírez. ¿Es adecuado iniciar iSGLT2?',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `**Análisis para Jorge Ramírez Medina (HC-00189):**

- **HbA1c 7.2%:** Ligeramente por encima de la meta estándar (< 7.0%).
- **TFG 65 ml/min/1.73m²:** Función renal conservada (Estadio G2).

**Recomendación Terapéutica:**
- **Sí, es altamente indicado agregar un iSGLT2** (Empagliflozina 10mg o Dapagliflozina 10mg).
- Beneficios adicionales: Protección cardiorrenal comprobada, reducción de albuminuria y leve descenso ponderal.
- Mantener Metformina 850mg c/12h con las comidas.`,
      },
    ],
  },
  {
    id: 'session-seed-3',
    title: 'Consulta General sobre Interacción Warfarina',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    pinned: false,
    patientId: 'none',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: '¿Qué antibióticos tienen mayor riesgo de potenciar el efecto de la Warfarina y elevar el INR?',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `Los antibióticos de **alto riesgo** que potencian significativamente la anticoagulación por Warfarina son:

1. **Cotrimoxazol (SXT/Trimetoprima-Sulfametoxazol):** Inhibición potente de CYP2C9. Riesgo crítico de hemorragia.
2. **Fluconazol / Ketoconazol / Metronidazol:** Inhibidores enzimáticos directos del S-enantiómero de la warfarina.
3. **Macrólidos (Eritromicina, Claritromicina):** Alteración de la flora intestinal sintetizadora de Vitamina K e inhibición de CYP3A4.
4. **Fluorquinolonas (Ciprofloxacino, Levofloxacino):** Desplazamiento de proteínas plasmáticas.

**Sugerencia:** Si es indispensable prescribir Cotrimoxazol o Metronidazol, reducir dosis de Warfarina a la mitad y monitorear INR a las 48-72 horas.`,
      },
    ],
  },
];

export function loadChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return SEED_SESSIONS;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatSession[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortSessions(parsed);
      }
    }
  } catch (err) {
    console.warn('Error loading chat sessions from localStorage:', err);
  }

  // Save seeds if empty
  saveChatSessions(SEED_SESSIONS);
  return SEED_SESSIONS;
}

export function saveChatSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Error saving chat sessions to localStorage:', err);
  }
}

export function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function createNewSession(patientId: string = 'none', patientName?: string | null, patientCode?: string | null): ChatSession {
  const defaultTitle =
    patientId !== 'none' && patientName
      ? `Consulta sobre ${patientName}`
      : 'Nueva Consulta IA';

  const newSession: ChatSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: defaultTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
    patientId,
    patientName,
    patientCode,
    messages: [],
  };

  const sessions = loadChatSessions();
  const updated = [newSession, ...sessions];
  saveChatSessions(updated);
  return newSession;
}

export function autoGenerateTitleFromPrompt(firstPrompt: string): string {
  let clean = firstPrompt
    .replace(/^¿|\?$/g, '')
    .replace(/^(hola|buenas|por favor|analiza|dame|cuál es|que|cómo)\s+/i, '')
    .trim();

  if (!clean) return 'Consulta Clínica';
  if (clean.length > 42) {
    clean = clean.substring(0, 42).trim() + '…';
  }
  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function exportSessionSummaryText(session: ChatSession): string {
  const dateStr = new Date(session.createdAt).toLocaleString('es-PE');
  let output = `=================================================\n`;
  output += `HISTORIA - RESUMEN DE CONSULTA IA\n`;
  output += `Título: ${session.title}\n`;
  output += `Fecha: ${dateStr}\n`;
  if (session.patientName) {
    output += `Paciente: ${session.patientName} (${session.patientCode || 'Sin código'})\n`;
  }
  output += `=================================================\n\n`;

  session.messages.forEach((m, idx) => {
    const roleLabel = m.role === 'user' ? 'MÉDICO' : 'ASISTENTE IA HISTORIA';
    output += `[${roleLabel}]\n${m.content}\n\n`;
  });

  return output;
}

export interface ChronologicalGroups {
  fijados: ChatSession[];
  hoy: ChatSession[];
  ayer: ChatSession[];
  ultimos7Dias: ChatSession[];
  anteriores: ChatSession[];
}

export function groupSessionsChronologically(
  sessions: ChatSession[],
  searchFilter: string = ''
): ChronologicalGroups {
  const filtered = sessions.filter((s) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(query);
    const matchesPatient = s.patientName?.toLowerCase().includes(query);
    const matchesContent = s.messages.some((m) => m.content.toLowerCase().includes(query));
    return matchesTitle || matchesPatient || matchesContent;
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 3600 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 3600 * 1000;

  const groups: ChronologicalGroups = {
    fijados: [],
    hoy: [],
    ayer: [],
    ultimos7Dias: [],
    anteriores: [],
  };

  filtered.forEach((s) => {
    if (s.pinned) {
      groups.fijados.push(s);
      return;
    }

    const sessionTime = new Date(s.updatedAt).getTime();
    if (sessionTime >= startOfToday) {
      groups.hoy.push(s);
    } else if (sessionTime >= startOfYesterday) {
      groups.ayer.push(s);
    } else if (sessionTime >= startOf7Days) {
      groups.ultimos7Dias.push(s);
    } else {
      groups.anteriores.push(s);
    }
  });

  return groups;
}
