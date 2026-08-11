import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MarkdownMessage from '@/components/MarkdownMessage';
import AiOrb from '@/components/AiOrb';
import {
  Send,
  ArrowUp,
  ArrowLeft,
  AudioLines,
  HeartPulse,
  Bot,
  User,
  AlertTriangle,
  Mic,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  Sparkles,
  ChevronDown,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Radio,
  Search,
  Plus,
  Pin,
  PinOff,
  MoreVertical,
  Pencil,
  Menu,
  MessageSquare,
  Check,
  Maximize2,
  Download,
  Wand2,
  Stethoscope,
  Activity,
  Pill,
  ShieldAlert,
  CheckCircle2,
  Calculator,
  ChevronRight,
  ListOrdered,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { supabase, type PatientSummary } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  loadChatSessions,
  saveChatSessions,
  createNewSession,
  autoGenerateTitleFromPrompt,
  groupSessionsChronologically,
  type ChatSession,
  type Message,
  type Attachment,
} from '@/lib/chat-sessions';

const SUGGESTION_CARDS = [
  {
    title: 'Analizar historia clínica',
    description: 'Sintetiza de forma automática antecedentes, síntomas y evolución.',
    icon: FileText,
    prompt: 'Por favor analiza este historial clínico completo e identifica hallazgos clave, signos de alarma y recomendaciones.',
  },
  {
    title: 'Interpretar laboratorio',
    description: 'Evaluación de hemograma, perfil lipídico, renal e imágenes.',
    icon: Activity,
    prompt: 'Interpreta los siguientes valores de laboratorio médico y destaca desviaciones patológicas con rangos de referencia.',
  },
  {
    title: 'Resumen clínico',
    description: 'Estructuración SOAP rápida para notas de evolución.',
    icon: Wand2,
    prompt: 'Elabora un resumen clínico estructurado con antecedentes, impresión diagnóstica y plan de manejo para mi nota médica.',
  },
  {
    title: 'Interacciones farmacológicas',
    description: 'Verificación de alertas cruzadas y reacciones adversas.',
    icon: Pill,
    prompt: 'Verifica posibles interacciones medicamentosas graves y contraindicaciones para la siguiente combinación de fármacos.',
  },
  {
    title: 'Protocolos médicos',
    description: 'Guías de actuación clínica basadas en evidencia reciente.',
    icon: Stethoscope,
    prompt: '¿Cuál es el protocolo de manejo clínico recomendado y actualizado paso a paso para esta patología?',
  },
  {
    title: 'Diagnóstico diferencial',
    description: 'Desglose jerárquico por probabilidad y descarte.',
    icon: Sparkles,
    prompt: 'Presenta un diagnóstico diferencial ordenado por probabilidad clínica con criterios de confirmación y descarte.',
  },
  {
    title: 'Calculadoras médicas',
    description: 'Riesgo cardiovascular, clearance de creatinina y escalas.',
    icon: Calculator,
    prompt: 'Ayúdame a calcular la tasa de filtración glomerular e interpretar el riesgo cardiovascular para este perfil clínico.',
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSpeechTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function IconRotateCcw15({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <text x="12" y="15.5" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">15</text>
    </svg>
  );
}

function IconRotateCw15({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <text x="12" y="15.5" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">15</text>
    </svg>
  );
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: SpeechRecognitionResult;
      isFinal: boolean;
    };
  };
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function getBestNaturalSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const esVoices = voices.filter((v) => v.lang.startsWith('es'));
  if (esVoices.length === 0) return voices[0] || null;

  const preferredKeywords = [
    'google',
    'natural',
    'neural',
    'online',
    'jorge',
    'monica',
    'diego',
    'sabina',
    'luciana',
  ];

  for (const kw of preferredKeywords) {
    const found = esVoices.find((v) => v.name.toLowerCase().includes(kw));
    if (found) return found;
  }

  return esVoices[0];
}

function FormattedAssistantMessage({ text }: { text: string }) {
  if (!text) return null;
  return <MarkdownMessage text={text} />;
}

function LegacyFormattedAssistantMessage({ text }: { text: string }) {
  if (!text) return null;
  // Render formatted lines & markdown blocks nicely
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentCardLines: string[] = [];
  let currentCardTitle: string | null = null;
  let cardIndex = 0;

  function flushCard() {
    if (currentCardLines.length === 0) return;
    const content = currentCardLines.join('\n').trim();
    if (!content) return;

    if (currentCardTitle) {
      const isAlert = /alerta|riesgo|contraindicación/i.test(currentCardTitle);
      const isMeds = /medicamento|fármaco|tratamiento/i.test(currentCardTitle);
      const isDiag = /diagnóstico|impresión|evaluación/i.test(currentCardTitle);

      renderedElements.push(
        <div
          key={`card-${cardIndex++}`}
          className={cn(
            'my-3 rounded-2xl border p-4 transition-all shadow-xs',
            isAlert
              ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
              : isMeds
              ? 'border-teal/30 bg-teal/5 text-text-1'
              : isDiag
              ? 'border-blue/30 bg-blue/5 text-text-1'
              : 'border-border/80 bg-bg-hover/40 text-text-1'
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            {isAlert ? (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            ) : isMeds ? (
              <Pill className="h-4 w-4 text-teal" />
            ) : isDiag ? (
              <Activity className="h-4 w-4 text-blue font-bold" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-teal" />
            )}
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-1">
              {currentCardTitle}
            </h4>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-text-1/90">
            {content}
          </div>
        </div>
      );
    } else {
      renderedElements.push(
        <div key={`text-${cardIndex++}`} className="space-y-2 text-xs sm:text-sm leading-relaxed text-text-1 whitespace-pre-line">
          {content}
        </div>
      );
    }
    currentCardLines = [];
    currentCardTitle = null;
  }

  lines.forEach((line) => {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$|^[•\-]\s*\*\*(Resumen|Diagnóstico|Factores|Medicamentos|Alertas|Próximos pasos|Recomendaciones[^*]*)\*\*/i);
    if (headerMatch) {
      flushCard();
      currentCardTitle = (headerMatch[1] || headerMatch[2] || line).replace(/[*#]/g, '').trim();
    } else {
      currentCardLines.push(line);
    }
  });

  flushCard();

  return <div className="space-y-2">{renderedElements}</div>;
}


export default function AsistenteIAPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Multi-chat state
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadChatSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const loaded = loadChatSessions();
    return loaded.length > 0 ? loaded[0].id : createNewSession().id;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active session object
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];

  // Patient history selection context
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => activeSession?.patientId || 'none');

  // Sync session's patient ID when active session changes
  useEffect(() => {
    if (activeSession) {
      setSelectedPatientId(activeSession.patientId || 'none');
    }
  }, [activeSessionId]);

  // Input & attachments & menu
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [listening, setListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceErrorDetail, setVoiceErrorDetail] = useState<string | null>(null);

  // Web search & Deep research & Model state
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'flash' | 'sonnet' | 'pro'>('flash');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  // Attachment Plus Popup Menu & Image Generation
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; prompt?: string } | null>(null);

  // Speech & Live Mode State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechElapsedSeconds, setSpeechElapsedSeconds] = useState<number>(0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  const SPEECH_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

  const currentSpokenTextRef = useRef<string>('');
  const currentSpokenCharIndexRef = useRef<number>(0);

  // Rename session state / menu popover state
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [menuOpenSessionId, setMenuOpenSessionId] = useState<string | null>(null);

  // Message action bar state (Copy, Thumbs Up/Down, Regenerate)
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleCopy = (content: string, id: string) => {
    try {
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success('Respuesta copiada al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('No se pudo copiar el texto');
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => {
      const current = prev[id];
      const next = current === type ? null : type;
      if (next === 'up') toast.success('Valoración positiva registrada');
      if (next === 'down') toast.info('Feedback registrado');
      return { ...prev, [id]: next };
    });
  };

  const handleRegenerate = (msgIndex: number) => {
    const prevUserMsg = [...messages.slice(0, msgIndex)].reverse().find((m) => m.role === 'user');
    if (prevUserMsg) {
      toast.info('Regenerando respuesta del Asistente HistorIA...');
      send(prevUserMsg.content);
    } else {
      toast.info('No hay consulta anterior para regenerar');
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const liveModeRef = useRef(false);
  useEffect(() => {
    liveModeRef.current = liveMode;
  }, [liveMode]);

  // Check URL parameter prompt e.g. /app/asistente?prompt=...
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setInput(promptParam);
    }
  }, [searchParams]);

  // Load patient summaries from Supabase & localStorage
  useEffect(() => {
    async function loadPatientHistories() {
      let combined: PatientSummary[] = [];
      const local = localStorage.getItem('historia_summaries');
      if (local) {
        try { combined = JSON.parse(local); } catch {}
      }

      try {
        const { data, error } = await supabase
          .from('patient_summaries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapById = new Map<string, PatientSummary>();
          combined.forEach((s) => mapById.set(s.id, s));
          (data as PatientSummary[]).forEach((s) => mapById.set(s.id, s));
          combined = Array.from(mapById.values());
        }
      } catch {}

      setPatientSummaries(combined);
    }

    loadPatientHistories();
  }, []);

  // Scroll to bottom on messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  // Ensure speech voices loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Speech Elapsed Timer Effect
  useEffect(() => {
    let interval: any;
    if (isSpeaking && !isSpeechPaused) {
      interval = setInterval(() => {
        setSpeechElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isSpeechPaused]);

  function stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setSpeakingMessageId(null);
    setSpeechElapsedSeconds(0);
    currentSpokenCharIndexRef.current = 0;
  }

  function speakAssistantMessage(
    text: string,
    messageId?: string,
    onFinished?: () => void,
    startCharIndex = 0
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Tu navegador no admite lectura en voz alta.');
      onFinished?.();
      return;
    }

    if (startCharIndex === 0) {
      stopSpeech();
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    const cleanSpeech = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/^[\#\*\-\s•]+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[•–—]/g, ' ')
      .trim();

    if (!cleanSpeech) {
      onFinished?.();
      return;
    }

    currentSpokenTextRef.current = cleanSpeech;
    if (messageId) setSpeakingMessageId(messageId);

    const textToSpeak = startCharIndex > 0 ? cleanSpeech.slice(startCharIndex) : cleanSpeech;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voice = getBestNaturalSpanishVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'en' ? 'en-US' : 'es-PE';
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsSpeechPaused(false);
      if (messageId) setSpeakingMessageId(messageId);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        currentSpokenCharIndexRef.current = startCharIndex + event.charIndex;
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setSpeakingMessageId(null);
      setSpeechElapsedSeconds(0);
      currentSpokenCharIndexRef.current = 0;
      onFinished?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setSpeakingMessageId(null);
      onFinished?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  const togglePlayPauseSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      setIsSpeaking(true);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    } else if (currentSpokenTextRef.current && speakingMessageId) {
      speakAssistantMessage(currentSpokenTextRef.current, speakingMessageId);
    }
  };

  const rewind15s = () => {
    if (!currentSpokenTextRef.current || !speakingMessageId) return;
    const charsPerSec = 18 * speechRate;
    const jumpChars = Math.round(15 * charsPerSec);
    const newCharIndex = Math.max(0, currentSpokenCharIndexRef.current - jumpChars);
    setSpeechElapsedSeconds((prev) => Math.max(0, prev - 15));
    speakAssistantMessage(currentSpokenTextRef.current, speakingMessageId, undefined, newCharIndex);
  };

  const forward15s = () => {
    if (!currentSpokenTextRef.current || !speakingMessageId) return;
    const charsPerSec = 18 * speechRate;
    const jumpChars = Math.round(15 * charsPerSec);
    const newCharIndex = Math.min(
      currentSpokenTextRef.current.length - 1,
      currentSpokenCharIndexRef.current + jumpChars
    );
    setSpeechElapsedSeconds((prev) => prev + 15);
    speakAssistantMessage(currentSpokenTextRef.current, speakingMessageId, undefined, newCharIndex);
  };

  const selectSpeechRate = (newRate: number) => {
    setSpeechRate(newRate);
    setSpeedMenuOpen(false);

    if ((isSpeaking || isSpeechPaused) && currentSpokenTextRef.current && speakingMessageId) {
      const curIndex = currentSpokenCharIndexRef.current;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setTimeout(() => {
        if (currentSpokenTextRef.current && speakingMessageId) {
          const textToSpeak = curIndex > 0 ? currentSpokenTextRef.current.slice(curIndex) : currentSpokenTextRef.current;
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const voice = getBestNaturalSpanishVoice();
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          }
          utterance.rate = newRate;
          utterance.pitch = 1.0;
          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsSpeechPaused(false);
          };
          utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
              currentSpokenCharIndexRef.current = curIndex + event.charIndex;
            }
          };
          utterance.onend = () => {
            stopSpeech();
          };
          utterance.onerror = () => {
            stopSpeech();
          };
          window.speechSynthesis.speak(utterance);
        }
      }, 50);
    }
  };

  // Session Management Actions
  function handleCreateNewChat() {
    const selectedPatient = patientSummaries.find((s) => s.id === selectedPatientId);
    const newSess = createNewSession(
      selectedPatientId,
      selectedPatient?.patient_name,
      selectedPatient?.patient_code
    );
    setSessions(loadChatSessions());
    setActiveSessionId(newSess.id);
    toast.success('Nueva conversación iniciada');
  }

  function handleSelectSession(id: string) {
    setActiveSessionId(id);
    setMenuOpenSessionId(null);
  }

  function handleTogglePin(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, pinned: !s.pinned, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setSessions(updated);
    saveChatSessions(updated);
    setMenuOpenSessionId(null);
    toast.success('Estado de anclaje actualizado');
  }

  function handleStartRename(session: ChatSession, e: React.MouseEvent) {
    e.stopPropagation();
    setRenamingSessionId(session.id);
    setRenameInput(session.title);
    setMenuOpenSessionId(null);
  }

  function handleSaveRename(id: string) {
    if (!renameInput.trim()) return;
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, title: renameInput.trim(), updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setSessions(updated);
    saveChatSessions(updated);
    setRenamingSessionId(null);
    toast.success('Título de conversación actualizado');
  }

  function handleDeleteSession(id: string, e?: React.SyntheticEvent) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setMenuOpenSessionId(null);

    const remaining = sessions.filter((s) => s.id !== id);
    saveChatSessions(remaining);
    setSessions(remaining);

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        const selectedPatient = patientSummaries.find((s) => s.id === selectedPatientId);
        const fresh = createNewSession(
          selectedPatientId,
          selectedPatient?.patient_name,
          selectedPatient?.patient_code
        );
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    }
    toast.success('Conversación eliminada');
  }

  // Update session messages helper
  function updateActiveSessionMessages(newMsgs: Message[], autoTitle?: string) {
    const nowIso = new Date().toISOString();
    const selectedPatient = patientSummaries.find((s) => s.id === selectedPatientId);

    const updated = sessions.map((s) => {
      if (s.id === activeSessionId) {
        const newTitle =
          autoTitle && (s.title === 'Nueva Consulta IA' || s.title.startsWith('Consulta sobre'))
            ? autoTitle
            : s.title;

        return {
          ...s,
          title: newTitle,
          patientId: selectedPatientId,
          patientName: selectedPatient?.patient_name,
          patientCode: selectedPatient?.patient_code,
          updatedAt: nowIso,
          messages: newMsgs,
        };
      }
      return s;
    });

    setSessions(updated);
    saveChatSessions(updated);
  }

  // Patient Context string
  const getPatientContext = (): string => {
    if (selectedPatientId === 'none') return '';
    const found = patientSummaries.find((s) => s.id === selectedPatientId);
    if (!found) return '';

    return `
PACIENTE: ${found.patient_name} ${found.patient_code ? `(Código: ${found.patient_code})` : ''}
FECHA DEL RESUMEN: ${new Date(found.created_at).toLocaleDateString('es-ES')}
HISTORIAL BRUTO Y MOTIVO DE CONSULTA:
${found.raw_history || 'No especificado'}

RESUMEN ESTRUCTURADO:
- Motivo de consulta: ${found.motivo_consulta || 'N/A'}
- Antecedentes médicos: ${found.antecedentes || 'N/A'}
- Diagnóstico: ${found.diagnostico || 'N/A'}
- Tratamiento y Plan: ${found.tratamiento || 'N/A'}
- Alertas y alergias: ${found.alertas || 'N/A'}
`.trim();
  };

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} supera el límite de 10 MB`);
        continue;
      }

      let contentStr = undefined;
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        try { contentStr = await file.text(); } catch {}
      }

      newAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: contentStr,
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function toggleVoice() {
    setVoiceErrorDetail(null);

    if (listening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setListening(false);
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
            else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
            else mimeType = '';
          }
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          setListening(false);

          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }

          const chunks = audioChunksRef.current;
          if (chunks.length === 0) return;

          const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          if (audioBlob.size < 400) {
            toast.info('No se detectó audio prolongado. Intenta hablar nuevamente.');
            return;
          }

          setIsTranscribing(true);
          toast.info('Transcribiendo audio con HistorIA IA...');

          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              try {
                const base64String = (reader.result as string).split(',')[1];
                if (!base64String) {
                  setIsTranscribing(false);
                  toast.error('Error al codificar el archivo de voz.');
                  return;
                }

                const response = await fetch('/api/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    audioData: base64String,
                    mimeType: audioBlob.type || 'audio/webm',
                    lang,
                  }),
                });

                const data = await response.json();
                setIsTranscribing(false);

                if (!response.ok) {
                  throw new Error(data.error || 'Error en la API de transcripción.');
                }

                const transcript = data.text ? data.text.trim() : '';
                if (transcript && !transcript.includes('[audio sin voz detectable]')) {
                  toast.success('Voz transcrita exitosamente. Enviando consulta...');
                  setInput(transcript);
                  send(transcript);
                } else {
                  toast.info('No se detectó voz clara. Por favor intenta hablar más cerca del micrófono.');
                }
              } catch (innerErr: any) {
                setIsTranscribing(false);
                toast.error(innerErr?.message || 'Error en transcripción.');
              }
            };
          } catch (err: any) {
            setIsTranscribing(false);
            toast.error(err?.message || 'No se pudo leer la grabación de audio.');
          }
        };

        recorder.start(200);
        setListening(true);
        toast.info('🎙️ Grabando voz... Habla tu consulta médica y haz clic de nuevo en el micrófono.');
        return;
      } catch (err: any) {
        setVoiceErrorDetail(`${err?.name || 'Error'}: ${err?.message || 'Permiso de micrófono denegado'}`);
        toast.error('Permiso de micrófono denegado o no disponible.');
        return;
      }
    }

    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'en' ? 'en-US' : 'es-PE';
        recognition.continuous = false;
        recognition.interimResults = true;

        let capturedText = '';

        recognition.onresult = (e: SpeechRecognitionEvent) => {
          let interim = '';
          let finalStr = '';
          for (let i = 0; i < e.results.length; i++) {
            const result = e.results[i];
            if (result.isFinal) {
              finalStr += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }
          capturedText = (finalStr + ' ' + interim).trim();
          setInput(capturedText);
        };

        recognition.onend = () => {
          setListening(false);
          if (capturedText.trim()) {
            toast.success('Voz transcrita');
            send(capturedText.trim());
          }
        };

        recognition.onerror = ((e: any) => {
          setListening(false);
          toast.error(`Error en dictado por voz (${e?.error || 'desconocido'})`);
        }) as () => void;

        recognition.start();
        recognitionRef.current = recognition;
        setListening(true);
        toast.info('Escuchando...');
        return;
      } catch {}
    }

    toast.error('Tu navegador no admite grabación de audio.');
  }

  function handleDownloadImage(imageUrl: string, filename = 'ilustracion-medica-historia.jpg') {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Imagen guardada localmente');
  }

  async function send(text: string, forceImageGen = false) {
    if ((!text.trim() && attachments.length === 0) || thinking || isGeneratingImage) return;

    let fullPromptText = text.trim();

    if (attachments.length > 0) {
      const attachInfo = attachments
        .map((a) => {
          if (a.content) {
            return `[Archivo adjunto: ${a.name}]\nContenido del archivo:\n${a.content}`;
          }
          return `[Archivo adjunto: ${a.name} (${a.type})]`;
        })
        .join('\n\n');

      fullPromptText = `${fullPromptText}\n\nArchivos adjuntos por el usuario:\n${attachInfo}`;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim() || 'Consulta sobre archivos adjuntos',
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const newMessages = [...messages, userMsg];
    const computedTitle = messages.length === 0 ? autoGenerateTitleFromPrompt(text) : undefined;
    updateActiveSessionMessages(newMessages, computedTitle);

    setInput('');
    setAttachments([]);
    setPlusMenuOpen(false);
    setThinking(true);

    try {
      const patientContext = getPatientContext();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullPromptText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          patientContext,
          lang,
          useWebSearch: useWebSearch || isDeepResearch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el Asistente HistorIA.');
      }

      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'Sin respuesta del Asistente HistorIA.',
      };

      // Check if text or flag requests medical image / visual diagram generation
      const lowerText = text.toLowerCase();
      const needsImage =
        forceImageGen ||
        lowerText.includes('generar imagen') ||
        lowerText.includes('esquema anatómico') ||
        lowerText.includes('esquema anatomico') ||
        lowerText.includes('gráfico de') ||
        lowerText.includes('grafico de') ||
        lowerText.includes('simulación médica') ||
        lowerText.includes('simulacion medica') ||
        lowerText.includes('ilustrac') ||
        lowerText.includes('representación visual') ||
        lowerText.includes('representacion visual') ||
        lowerText.includes('diagrama');

      if (needsImage) {
        setIsGeneratingImage(true);
        toast.info('🎨 Generando visualización gráfica médica...');
        try {
          const imgRes = await fetch('/api/generate-medical-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text.trim(), type: 'medical_diagram' }),
          });
          const imgData = await imgRes.json();
          if (imgData.imageUrl) {
            reply.generatedImageUrl = imgData.imageUrl;
            reply.generatedImagePrompt = imgData.prompt || text.trim();
          }
        } catch (imgErr) {
          console.warn('Error al generar imagen médica:', imgErr);
        } finally {
          setIsGeneratingImage(false);
        }
      }

      const finalMessages = [...newMessages, reply];
      updateActiveSessionMessages(finalMessages);

      if (liveModeRef.current) {
        speakAssistantMessage(reply.content, reply.id, () => {
          if (liveModeRef.current) {
            setTimeout(() => {
              if (liveModeRef.current && !listening) {
                toast.info('🎙️ Modo Conversación en Vivo: escuchando tu respuesta...');
                toggleVoice();
              }
            }, 500);
          }
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error de comunicación con HistorIA IA');
      const errorReply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `No se pudo completar la consulta en este momento. Por favor reintenta.`,
      };
      updateActiveSessionMessages([...newMessages, errorReply]);
    } finally {
      setThinking(false);
      setIsGeneratingImage(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }

  function handleExportPDF() {
    if (messages.length === 0) {
      toast.error('No hay mensajes en esta conversación para exportar.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Por favor permite las ventanas emergentes para exportar el expediente.');
      return;
    }

    const sessionTitle = activeSession?.title || 'Consulta Médica HistorIA';
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const contentHtml = messages
      .map(
        (m) => `
        <div style="margin-bottom: 20px; padding: 14px 18px; border-radius: 12px; background: ${
          m.role === 'user' ? '#eff6ff' : '#f8fafc'
        }; border: 1px solid ${m.role === 'user' ? '#bfdbfe' : '#e2e8f0'};">
          <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${
            m.role === 'user' ? '#1d4ed8' : '#0d9488'
          }; margin-bottom: 6px;">
            ${m.role === 'user' ? 'MÉDICO / CONSULTANTE' : 'ASISTENTE HISTORIA IA'}
          </div>
          <div style="font-size: 13px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${
            m.content
          }</div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sessionTitle} - HistorIA Expediente</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 820px; margin: 0 auto; background: #ffffff; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 28px; }
            .title { font-size: 24px; font-weight: 900; color: #0284c7; margin: 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 13px; font-weight: 600; color: #64748b; margin-top: 6px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HISTORIA - CONSULTA CLÍNICA ASISTIDA POR IA</div>
            <div class="subtitle">${sessionTitle} | ${formattedDate}</div>
          </div>
          ${contentHtml}
          <div class="footer">
            Documento emitido por la plataforma médica HistorIA IA. Herramienta de orientación clínica para uso exclusivo del profesional de la salud.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    send(input);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  const selectedPatient = patientSummaries.find((s) => s.id === selectedPatientId);
  const grouped = useMemo(() => groupSessionsChronologically(sessions, searchQuery), [sessions, searchQuery]);

  function renderChatItem(s: ChatSession) {
    const isActive = s.id === activeSessionId;
    const isRenaming = renamingSessionId === s.id;
    const isMenuOpen = menuOpenSessionId === s.id;

    return (
      <div
        key={s.id}
        onClick={() => handleSelectSession(s.id)}
        className={cn(
          'group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs transition-all cursor-pointer border',
          isActive
            ? 'border-teal/40 bg-teal/12 text-teal-2'
            : 'border-border/60 bg-bg-card/40 text-text-2 hover:bg-bg-hover hover:text-text-1'
        )}
      >
        <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
          <MessageSquare className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-teal-2" : "text-text-3")} />
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(s.id)}
                  className="w-full rounded-md border border-teal bg-bg px-2 py-1 text-xs text-text-1 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveRename(s.id)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-teal text-slate-950 font-bold"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 truncate">
                  {s.pinned && <Pin className="h-3 w-3 flex-shrink-0 text-text-3" />}
                  <span className="truncate text-[13px] font-medium">{s.title}</span>
                </div>
                {s.patientName && (
                  <div className="mt-0.5 truncate text-[10px] text-teal font-medium">
                    👤 {s.patientName} {s.patientCode ? `(${s.patientCode})` : ''}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 3 Dots Options Button & Popover */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpenSessionId(isMenuOpen ? null : s.id)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg text-text-3 hover:bg-bg-hover hover:text-text-1 transition-opacity cursor-pointer',
              isMenuOpen || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            title="Opciones de chat"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {/* Dropdown Options Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-1.5 shadow-2xl space-y-1">
              <button
                onClick={(e) => handleTogglePin(s.id, e)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text-2 hover:bg-bg-hover hover:text-text-1"
              >
                {s.pinned ? <PinOff className="h-3.5 w-3.5 text-amber-400" /> : <Pin className="h-3.5 w-3.5 text-amber-400" />}
                <span>{s.pinned ? 'Desanclar' : 'Fijar al principio'}</span>
              </button>

              <button
                onClick={(e) => handleStartRename(s, e)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-blue" />
                <span>Renombrar</span>
              </button>

              <div className="border-t border-border/60 my-1" />

              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-error hover:bg-error/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-error" />
                <span>Eliminar chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* ========================================================= */}
      {/* ÁREA PRINCIPAL DE CHAT (CENTRAL - EXPANDIDO)             */}
      {/* ========================================================= */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header Bar Minimalista (Exactamente como en la Imagen de Referencia) */}
        <div className="bg-bg px-5 py-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
              title="Volver a Inicio"
              aria-label="Volver a Inicio"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <HeartPulse className="h-6 w-6 text-teal-2" strokeWidth={1.8} />
            <div className="leading-tight">
              <h1 className="text-[15px] font-semibold tracking-tight text-text-1">Asistente IA</h1>
              <p className="text-[11px] text-text-3">IA médica inteligente</p>
            </div>
          </div>

          {/* Derecha: únicamente el orb (y acceso al historial si está oculto) */}
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-3 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
                title="Mostrar historial de chats"
                aria-label="Mostrar historial de chats"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            )}
            <AiOrb size={26} />
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.length === 0 && (
              <div className="space-y-8 py-8 animate-fade-in">
                <div className="text-center space-y-3">
                  <div className="relative mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal/30 via-teal/15 to-blue/20 text-teal border border-teal/40 shadow-glow-teal transition-transform hover:scale-105 duration-300">
                    <Stethoscope className="h-10 w-10 text-teal" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-teal" />
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-1 tracking-tight">
                    HistorIA AI
                  </h2>
                  <p className="text-sm sm:text-base font-medium text-text-2 max-w-md mx-auto">
                    ¿En qué puedo ayudarte hoy?
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SUGGESTION_CARDS.map(({ title, description, icon: Icon, prompt }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => send(prompt)}
                      className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-bg-card/90 p-4 text-left transition-all duration-200 hover:border-teal/50 hover:bg-teal/5 hover:shadow-glow-teal cursor-pointer active:scale-[0.98]"
                    >
                      <div className="space-y-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal border border-teal/30 group-hover:scale-110 transition-transform">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-text-1 group-hover:text-teal transition-colors">
                          {title}
                        </h3>
                        <p className="text-[11px] text-text-3 leading-relaxed font-normal">
                          {description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-teal opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Iniciar consulta</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, msgIndex) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal border border-teal/30 mt-1">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[85%] space-y-2',
                    msg.role === 'user' ? 'flex flex-col items-end' : 'flex-1'
                  )}
                >
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3 py-1.5"
                        >
                          {att.type.startsWith('image/') ? (
                            <ImageIcon className="h-3.5 w-3.5 text-teal" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-teal" />
                          )}
                          <span className="text-xs text-text-1">{att.name}</span>
                          <span className="text-xs text-text-3">{formatBytes(att.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={cn(
                      'space-y-3',
                      msg.role === 'user'
                        ? 'rounded-[14px] bg-[#1c1c1e] border border-white/[0.06] px-4 py-3 text-text-1 shadow-sm'
                        : 'text-text-1'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Plus className="h-4 w-4 text-teal stroke-[2.5]" />
                          <span className="text-[14px] font-semibold text-teal-2">HistorIA AI</span>
                        </div>
                        <FormattedAssistantMessage text={msg.content} />

                        {/* Visual Medical Illustration Card */}
                        {msg.generatedImageUrl && (
                          <div className="mt-3 rounded-2xl border border-border/80 bg-black/40 p-2.5 space-y-2 animate-fade-in shadow-lg">
                            <div className="flex items-center justify-between text-xs px-1">
                              <span className="flex items-center gap-1.5 font-bold text-teal">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Ilustración / Diagrama Clínico Generado</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedImage({
                                      url: msg.generatedImageUrl!,
                                      prompt: msg.generatedImagePrompt || msg.content,
                                    })
                                  }
                                  className="flex items-center gap-1 text-[11px] font-bold text-blue hover:text-blue-hover cursor-pointer"
                                >
                                  <Maximize2 className="h-3 w-3" />
                                  <span>Ampliar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadImage(msg.generatedImageUrl!)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-teal hover:text-teal-hover cursor-pointer"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Descargar</span>
                                </button>
                              </div>
                            </div>
                            <div
                              className="relative cursor-pointer overflow-hidden rounded-xl group"
                              onClick={() =>
                                setExpandedImage({
                                  url: msg.generatedImageUrl!,
                                  prompt: msg.generatedImagePrompt || msg.content,
                                })
                              }
                            >
                              <img
                                src={msg.generatedImageUrl}
                                alt={msg.generatedImagePrompt || 'Diagrama Médico'}
                                referrerPolicy="no-referrer"
                                className="w-full max-h-80 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-sm">
                                  <Maximize2 className="h-3.5 w-3.5" /> Ampliar imagen médica
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Minimalist AI Action Bar (ChatGPT / Gemini / Claude Style) */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/30">
                          {/* Left Group: Copiar, Me gusta, No me gusta, Regenerar */}
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {/* Copiar */}
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 hover:text-text-1 hover:bg-bg-hover/70 transition-colors cursor-pointer"
                              title="Copiar texto"
                              aria-label="Copiar texto"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-4 w-4 text-teal animate-in zoom-in-50 duration-150" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>

                            {/* Me gusta */}
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'up')}
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                                feedback[msg.id] === 'up'
                                  ? 'text-teal'
                                  : 'text-text-3 hover:text-text-1 hover:bg-bg-hover/70'
                              )}
                              title="Buena respuesta"
                              aria-label="Buena respuesta"
                            >
                              <ThumbsUp className={cn('h-4 w-4', feedback[msg.id] === 'up' && 'fill-teal/20')} />
                            </button>

                            {/* No me gusta */}
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'down')}
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                                feedback[msg.id] === 'down'
                                  ? 'text-rose-400'
                                  : 'text-text-3 hover:text-text-1 hover:bg-bg-hover/70'
                              )}
                              title="Mala respuesta"
                              aria-label="Mala respuesta"
                            >
                              <ThumbsDown className={cn('h-4 w-4', feedback[msg.id] === 'down' && 'fill-rose-400/20')} />
                            </button>

                            {/* Regenerar */}
                            <button
                              type="button"
                              onClick={() => handleRegenerate(msgIndex)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 hover:text-text-1 hover:bg-bg-hover/70 transition-colors cursor-pointer"
                              title="Regenerar respuesta"
                              aria-label="Regenerar respuesta"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Extreme Right: Altavoz (Solo ícono) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (speakingMessageId === msg.id) {
                                stopSpeech();
                              } else {
                                speakAssistantMessage(msg.content, msg.id);
                              }
                            }}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                              speakingMessageId === msg.id
                                ? 'text-red-400 hover:text-red-300 hover:bg-bg-hover/70'
                                : 'text-text-3 hover:text-text-1 hover:bg-bg-hover/70'
                            )}
                            title={speakingMessageId === msg.id ? 'Detener voz' : 'Escuchar en voz alta'}
                            aria-label={speakingMessageId === msg.id ? 'Detener voz' : 'Escuchar en voz alta'}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="h-4 w-4 text-red-400 animate-pulse" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(thinking || isGeneratingImage) && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal/10">
                  <Bot className="h-4 w-4 text-teal" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-4 py-3 shadow-xs">
                  <span className="text-xs text-text-2 font-medium">
                    {isGeneratingImage
                      ? 'HistorIA IA generando ilustración clínica...'
                      : 'HistorIA IA analizando...'}
                  </span>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-teal" style={{ animationDelay: '200ms' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-teal" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar & Floating Voice Player Container */}
        <div className="bg-bg px-3 py-3 sm:px-6 relative flex-shrink-0">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl relative">
            {/* Floating Voice Playback Controls Bar (Centered Pill Floating Above Input) */}
            {(isSpeaking || isSpeechPaused || speakingMessageId !== null) && (
              <div className="flex justify-center mb-3 animate-fade-in z-30">
                <div className="inline-flex items-center gap-3 sm:gap-4 rounded-full border border-white/10 bg-[#0e131f]/95 px-5 py-2 shadow-2xl backdrop-blur-2xl text-white">
                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={togglePlayPauseSpeech}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/20 transition-all cursor-pointer active:scale-95"
                    title={isSpeechPaused ? "Reanudar lectura" : "Pausar lectura"}
                    aria-label={isSpeechPaused ? "Reanudar lectura" : "Pausar lectura"}
                  >
                    {isSpeechPaused ? (
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    ) : (
                      <Pause className="h-4 w-4 fill-white" />
                    )}
                  </button>

                  {/* Retroceder 15s */}
                  <button
                    type="button"
                    onClick={rewind15s}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer active:scale-95"
                    title="Retroceder 15 segundos"
                    aria-label="Retroceder 15 segundos"
                  >
                    <IconRotateCcw15 className="h-4 w-4" />
                  </button>

                  {/* Adelantar 15s */}
                  <button
                    type="button"
                    onClick={forward15s}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer active:scale-95"
                    title="Adelantar 15 segundos"
                    aria-label="Adelantar 15 segundos"
                  >
                    <IconRotateCw15 className="h-4 w-4" />
                  </button>

                  {/* Selector de velocidad */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSpeedMenuOpen((prev) => !prev)}
                      className="flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                      title="Cambiar velocidad de reproducción"
                    >
                      <span>{speechRate}x</span>
                      <ChevronDown className={cn("h-3 w-3 text-white/60 transition-transform duration-200", speedMenuOpen && "rotate-180")} />
                    </button>

                    {speedMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setSpeedMenuOpen(false)}
                        />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-40 w-24 max-h-56 overflow-y-auto rounded-2xl border border-white/15 bg-[#16171d] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in custom-scrollbar">
                          {SPEECH_SPEED_OPTIONS.map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => selectSpeechRate(rate)}
                              className={cn(
                                "w-full py-1.5 text-center text-xs font-semibold rounded-xl transition-colors cursor-pointer",
                                speechRate === rate
                                  ? "bg-white/20 text-white font-bold"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tiempo transcurrido */}
                  <span className="text-xs font-mono font-medium text-white/80 min-w-[36px] text-center">
                    {formatSpeechTime(speechElapsedSeconds)}
                  </span>

                  {/* Botón cerrar (X) */}
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white transition-all cursor-pointer ml-1"
                    title="Detener lectura por completo"
                    aria-label="Detener lectura por completo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {listening && (
              <div className="mb-2.5 flex items-center justify-between rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-500 animate-pulse">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-red-500 animate-bounce" />
                  <span>Escuchando consulta por voz... Habla libremente.</span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Transcribir
                </button>
              </div>
            )}

            {voiceErrorDetail && (
              <div className="mb-2.5 flex items-center justify-between rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-400">
                <span className="truncate pr-2">{voiceErrorDetail}</span>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white shadow-xs cursor-pointer flex-shrink-0"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Active Mode Badges (Web Search & Deep Research) */}
            {(useWebSearch || isDeepResearch) && (
              <div className="mb-2 flex flex-wrap items-center gap-2 px-2">
                {useWebSearch && (
                  <div className="flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/15 px-3 py-1 text-xs font-bold text-teal shadow-xs animate-fade-in">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Buscar en la web</span>
                    <button
                      type="button"
                      onClick={() => setUseWebSearch(false)}
                      className="ml-1 text-teal/70 hover:text-teal cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {isDeepResearch && (
                  <div className="flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/15 px-3 py-1 text-xs font-bold text-blue shadow-xs animate-fade-in">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    <span>Búsqueda profunda (Deep Research)</span>
                    <button
                      type="button"
                      onClick={() => setIsDeepResearch(false)}
                      className="ml-1 text-blue/70 hover:text-blue cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-2 px-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-full border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3 py-1 shadow-xs"
                  >
                    {att.type.startsWith('image/') ? (
                      <ImageIcon className="h-3.5 w-3.5 text-teal" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-blue" />
                    )}
                    <span className="text-xs font-medium text-text-1 max-w-[150px] truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-text-3 hover:text-error cursor-pointer rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Container Principal de Entrada (Exactamente como en la Imagen de Referencia) */}
            <div className="rounded-[24px] border border-[#1c2433] bg-[#0c1017] p-3 shadow-2xl transition-all duration-300 focus-within:border-teal/60 focus-within:ring-1 focus-within:ring-teal/30">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* Fila Superior: Input de Texto con Icono Waveform al Extremo Derecho */}
              <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Preguntar lo que quieras"
                  className="w-full bg-transparent text-sm text-text-1 placeholder:text-text-3 outline-none border-none focus:outline-none focus:ring-0"
                />
              </div>

              {/* Fila Inferior: Botón +, Micrófono a la izquierda; Botón Enviar Celeste a la derecha */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 relative">
                  {/* Botón (+) */}
                  <button
                    type="button"
                    onClick={() => setPlusMenuOpen((prev) => !prev)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full bg-[#182030] text-text-2 hover:bg-[#222c42] hover:text-text-1 transition-all cursor-pointer',
                      plusMenuOpen && 'bg-teal/20 text-teal border border-teal/40'
                    )}
                    title="Opciones avanzadas (+)"
                  >
                    <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>

                  {/* Popover Menú de Opciones (+) */}
                  {plusMenuOpen && (
                    <div className="absolute left-0 bottom-12 z-50 w-72 rounded-2xl border border-border/80 bg-[#141824]/95 p-2 shadow-2xl backdrop-blur-2xl animate-fade-in space-y-1 text-xs">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-3 border-b border-border/50 mb-1">
                        Modos & Adjuntos Médicos
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUseWebSearch((prev) => !prev);
                          setPlusMenuOpen(false);
                          toast.info(useWebSearch ? 'Búsqueda en la web desactivada' : '🌐 Búsqueda en la web ACTIVADA');
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium cursor-pointer transition-colors',
                          useWebSearch ? 'bg-teal/15 text-teal font-bold' : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="h-4 w-4 text-teal" />
                          <span>Buscar en la web</span>
                        </div>
                        {useWebSearch && <Check className="h-4 w-4 text-teal" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsDeepResearch((prev) => !prev);
                          setPlusMenuOpen(false);
                          toast.info(isDeepResearch ? 'Deep Research desactivado' : '🔬 Deep Research (Búsqueda Profunda) ACTIVADO');
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium cursor-pointer transition-colors',
                          isDeepResearch ? 'bg-blue/15 text-blue font-bold' : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-blue" />
                          <span>Búsqueda profunda (Deep Research)</span>
                        </div>
                        {isDeepResearch && <Check className="h-4 w-4 text-blue" />}
                      </button>

                      <div className="border-t border-border/50 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = '.pdf,.txt,.doc,.docx';
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 cursor-pointer transition-colors"
                      >
                        <FileText className="h-4 w-4 text-blue" />
                        <span>Adjuntar documento (PDF, TXT)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = 'image/*';
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 cursor-pointer transition-colors"
                      >
                        <ImageIcon className="h-4 w-4 text-teal" />
                        <span>Adjuntar imagen clínica</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          setInput('Analizar siguientes valores de laboratorio/hemograma: ');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 cursor-pointer transition-colors"
                      >
                        <Stethoscope className="h-4 w-4 text-amber-400" />
                        <span>Análisis de laboratorio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          setInput('Calcular e interpretar dosis/escalas médicas para: ');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 cursor-pointer transition-colors"
                      >
                        <Calculator className="h-4 w-4 text-purple-400" />
                        <span>Herramientas clínicas (Glasgow / CURB-65)</span>
                      </button>

                      <div className="border-t border-border/50 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setPlusMenuOpen(false);
                          setInput('Generar esquema anatómico o representación visual médica de: ');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-semibold text-teal hover:bg-teal/10 cursor-pointer transition-colors"
                      >
                        <Wand2 className="h-4 w-4 text-teal" />
                        <span>Generar Ilustración Médica</span>
                      </button>
                    </div>
                  )}

                  {/* Botón Micrófono */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full bg-[#182030] text-text-2 hover:bg-[#222c42] hover:text-text-1 transition-all cursor-pointer',
                      listening && 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/40'
                    )}
                    title={listening ? 'Detener dictado por voz' : 'Dictado por voz'}
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Botón Enviar Celeste (#00A8C6) */}
                {input.trim() || attachments.length > 0 ? (
                  <button
                    type="submit"
                    disabled={thinking || isGeneratingImage}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00d3ee] hover:bg-[#3ce0f5] text-slate-950 shadow-[0_0_18px_rgba(0,211,238,0.45)] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    title="Enviar consulta médica (Enter)"
                    aria-label="Enviar consulta"
                  >
                    <ArrowUp className="h-5 w-5 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
                      if (lastAiMessage) {
                        speakAssistantMessage(lastAiMessage.content, lastAiMessage.id);
                      } else {
                        toggleVoice();
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00d3ee] hover:bg-[#3ce0f5] text-slate-950 shadow-[0_0_18px_rgba(0,211,238,0.45)] transition-all duration-200 active:scale-95 cursor-pointer font-bold"
                    title="Escuchar / dictar"
                    aria-label="Modo voz"
                  >
                    <AudioLines className="h-5 w-5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] sm:text-[11px] text-text-3 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              HistorIA Multi-Chat. Respuestas con orientación clínica asistida por IA.
            </p>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PANEL DERECHO DE HISTORIAL DE CHATS (ESTILO CHATGPT)      */}
      {/* ========================================================= */}
      <aside
        className={cn(
          'flex flex-col border-l border-border/70 bg-[#080a0c] transition-all duration-300 ease-in-out z-20 flex-shrink-0',
          sidebarOpen ? 'w-72 sm:w-80 opacity-100' : 'w-0 overflow-hidden border-l-0 opacity-0 pointer-events-none'
        )}
      >
        {/* Header del Sidebar Derecho */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between h-8">
            <span className="text-[13.5px] font-semibold tracking-tight text-text-1">
              Historial de chats
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
              title="Ocultar panel de historial"
              aria-label="Ocultar panel de historial"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Botón Principal + Nuevo Chat */}
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal/18 hover:bg-teal/28 border border-teal/25 py-3 px-4 text-[13px] font-semibold text-teal-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Nuevo Chat</span>
          </button>

          {/* Buscador de conversaciones */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl/60 pl-10 pr-8 py-2.5 text-[13px] text-text-1 placeholder:text-text-3 focus:border-teal/40 focus:outline-none focus:ring-1 focus:ring-teal/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lista Cronológica de Conversaciones */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Fijados */}
          {grouped.fijados.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-medium text-text-3">
                <Pin className="h-3 w-3" />
                <span>Anclados</span>
              </div>
              {grouped.fijados.map((s) => renderChatItem(s))}
            </div>
          )}

          {/* Hoy */}
          {grouped.hoy.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-1 py-1 text-[11px] font-medium text-text-3">
                Hoy
              </div>
              {grouped.hoy.map((s) => renderChatItem(s))}
            </div>
          )}

          {/* Ayer */}
          {grouped.ayer.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-1 py-1 text-[11px] font-medium text-text-3">
                Ayer
              </div>
              {grouped.ayer.map((s) => renderChatItem(s))}
            </div>
          )}

          {/* Últimos 7 Días */}
          {grouped.ultimos7Dias.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-1 py-1 text-[11px] font-medium text-text-3">
                Últimos 7 días
              </div>
              {grouped.ultimos7Dias.map((s) => renderChatItem(s))}
            </div>
          )}

          {/* Anteriores */}
          {grouped.anteriores.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-1 py-1 text-[11px] font-medium text-text-3">
                Anteriores
              </div>
              {grouped.anteriores.map((s) => renderChatItem(s))}
            </div>
          )}

          {sessions.length === 0 && (
            <div className="p-4 text-center text-xs text-text-3">
              No hay conversaciones guardadas. Haz clic en "+ Nuevo Chat".
            </div>
          )}
        </div>
      </aside>

      {/* Lightbox Zoom Modal para Ilustraciones Médicas */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-bg-card border border-border rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3 px-1">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-teal" />
                <h3 className="text-xs sm:text-sm font-bold text-text-1 line-clamp-1">
                  {expandedImage.prompt || 'Ilustración Médica Generada por HistorIA AI'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadImage(expandedImage.url)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue px-3 py-1.5 text-xs font-bold text-white shadow-glow-blue hover:bg-blue-hover cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => setExpandedImage(null)}
                  className="rounded-xl p-1.5 text-text-3 hover:bg-bg-hover hover:text-text-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center items-center overflow-hidden rounded-2xl bg-black/40 p-2">
              <img
                src={expandedImage.url}
                alt={expandedImage.prompt || 'Ilustración médica'}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY FUTURISTA DE MODO VOZ EN VIVO (CHATGPT VOICE MODE) */}
      {liveMode && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#070B14]/95 backdrop-blur-2xl p-6 sm:p-10 animate-fade-in text-white">
          <div className="flex w-full max-w-2xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal/20 border border-teal/40 text-teal shadow-glow-teal">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">HistorIA AI • Modo Voz en Vivo</h3>
                <p className="text-[10px] font-bold text-teal tracking-wider uppercase">Voz Clínica Inteligente</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLiveMode(false);
                stopSpeech();
                if (listening) toggleVoice();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8 my-auto text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-56 w-56 rounded-full bg-teal/20 animate-ping opacity-30" />
              <div className="absolute h-48 w-48 rounded-full bg-blue/30 animate-pulse opacity-50 blur-xl" />
              
              <div className={cn(
                "relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-teal via-cyan-400 to-blue-600 shadow-glow-teal transition-all duration-300",
                isSpeaking && "scale-110 shadow-[0_0_50px_rgba(6,182,212,0.8)]",
                thinking && "animate-spin"
              )}>
                <AudioLines className="h-16 w-16 text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 text-xs font-bold text-teal shadow-glow-teal">
                <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                {thinking
                  ? 'Procesando consulta médica...'
                  : isSpeaking
                  ? 'Generando respuesta clínica...'
                  : listening
                  ? 'Escuchando tu voz...'
                  : 'Listo para escuchar'}
              </div>
              <p className="text-xs text-text-3 font-medium">
                {thinking
                  ? 'Analizando información y consultando guías clínicas.'
                  : isSpeaking
                  ? 'Reproduciendo voz con síntesis médica natural.'
                  : 'Habla directamente con HistorIA en tiempo real.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleVoice}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 shadow-xl cursor-pointer",
                listening
                  ? "bg-red-500 text-white shadow-red-500/50 animate-pulse"
                  : "bg-teal text-white shadow-glow-teal hover:bg-teal-2"
              )}
              title={listening ? "Pausar micrófono" : "Activar micrófono"}
            >
              <Mic className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                setLiveMode(false);
                stopSpeech();
                if (listening) toggleVoice();
              }}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <span>Finalizar sesión de voz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
