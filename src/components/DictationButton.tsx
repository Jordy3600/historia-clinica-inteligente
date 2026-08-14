import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: { length: number; [index: number]: { transcript: string }; isFinal: boolean };
  };
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface DictationButtonProps {
  /** Current text of the target field */
  value: string;
  /** Called with the new full text as dictation progresses */
  onChange: (next: string) => void;
  lang?: 'es' | 'en';
  size?: 'sm' | 'md';
  className?: string;
  title?: string;
}

/**
 * Reusable circular microphone button.
 * Dictates in real time into the given text field (Web Speech API),
 * falling back to record + /api/transcribe when live recognition is unavailable.
 */
export function DictationButton({
  value,
  onChange,
  lang = 'es',
  size = 'md',
  className,
  title,
}: DictationButtonProps) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const valueRef = useRef(value);
  valueRef.current = value;

  const baseRef = useRef('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      try { recorderRef.current?.stop(); } catch { /* noop */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function appendBase(text: string) {
    const base = baseRef.current;
    const sep = base && !/\s$/.test(base) ? ' ' : '';
    return base + sep + text;
  }

  function startRecognition(): boolean {
    const SR = getSpeechRecognition();
    if (!SR) return false;
    try {
      const rec = new SR();
      rec.lang = lang === 'en' ? 'en-US' : 'es-PE';
      rec.continuous = true;
      rec.interimResults = true;

      baseRef.current = valueRef.current;

      rec.onresult = (e) => {
        let interim = '';
        let finalStr = '';
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (!r) continue;
          const alt = r[0];
          if (!alt) continue;
          if (r.isFinal) finalStr += alt.transcript;
          else interim += alt.transcript;
        }
        const combined = (finalStr + ' ' + interim).trim();
        if (combined) onChange(appendBase(combined));
      };
      rec.onerror = () => {
        setListening(false);
        try { rec.stop(); } catch { /* noop */ }
      };
      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      rec.start();
      recognitionRef.current = rec;
      setListening(true);
      return true;
    } catch {
      return false;
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('El micrófono no está disponible en este navegador.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      baseRef.current = valueRef.current;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        setListening(false);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 400) {
          toast.info('No se detectó audio. Intenta dictar nuevamente.');
          return;
        }

        setTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('No se pudo leer el audio.'));
            reader.onloadend = () => resolve(((reader.result as string).split(',')[1]) ?? '');
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioData: base64, mimeType: blob.type || 'audio/webm', lang }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'Error al transcribir.');

          const text = (data.text ?? '').trim();
          if (text && !text.includes('[audio sin voz detectable]')) {
            onChange(appendBase(text));
            toast.success('Dictado transcrito.');
          } else {
            toast.info('No se detectó voz clara.');
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Error al transcribir el dictado.');
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start(200);
      setListening(true);
      toast.info('🎙️ Dictando… vuelve a pulsar para detener.');
    } catch {
      toast.error('Permiso de micrófono denegado o no disponible.');
    }
  }

  async function toggle() {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch { /* noop */ }
      } else {
        setListening(false);
      }
      return;
    }
    if (startRecognition()) return;
    await startRecording();
  }

  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={transcribing}
      aria-pressed={listening}
      aria-label={listening ? 'Detener dictado' : 'Dictar por voz'}
      title={title ?? (listening ? 'Detener dictado' : 'Dictar por voz')}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
        dim,
        listening
          ? 'border-teal bg-teal text-[#04222a] shadow-glow-teal'
          : 'border-teal/25 bg-bg-hover/70 text-teal hover:border-teal/60 hover:bg-teal/10',
        className
      )}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full bg-teal/40 animate-ping" aria-hidden="true" />
      )}
      {transcribing ? (
        <Loader2 className={cn(icon, 'animate-spin')} />
      ) : listening ? (
        <Square className={cn(icon, 'relative fill-current')} />
      ) : (
        <Mic className={cn(icon, 'relative')} />
      )}
    </button>
  );
}

export default DictationButton;
