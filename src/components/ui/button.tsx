import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-teal text-white font-bold shadow-glow-teal hover:bg-teal-2 hover:brightness-105 active:scale-[0.98]',
  outline: 'border border-border bg-bg-card text-text-1 hover:border-teal/40 hover:bg-bg-hover hover:text-teal active:scale-[0.98]',
  ghost: 'text-text-2 hover:text-text-1 hover:bg-bg-hover active:scale-[0.98]',
  destructive: 'bg-error text-white hover:bg-error/90 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs rounded-xl',
  md: 'h-10 px-4 text-sm rounded-2xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn('inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/50', variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = 'Button';
