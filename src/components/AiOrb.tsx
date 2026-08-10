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
      <span className="absolute inset-0 rounded-full blur-[12px] opacity-80 bg-[radial-gradient(circle_at_30%_30%,#5eead4,#22d3ee_55%,#0e7490)]" />
      <span className="ai-orb-spin absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#5eead4,#22d3ee,#0891b2,#2dd4bf,#5eead4)] shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.85),transparent_45%)]" />
    </span>
  );
}
