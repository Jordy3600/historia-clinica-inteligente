import { cn } from '@/lib/utils';

/**
 * Orb brillante giratorio del Asistente IA (referencia de diseño HistorIA).
 */
export default function AiOrb({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('relative inline-block flex-shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full blur-[10px] opacity-70 bg-[radial-gradient(circle_at_30%_30%,#5eead4,#3b82f6_60%,#7c3aed)]" />
      <span className="ai-orb-spin absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#2dd4bf,#3b82f6,#a855f7,#2dd4bf)] shadow-[inset_0_0_8px_rgba(255,255,255,0.35)]" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.85),transparent_45%)]" />
    </span>
  );
}
