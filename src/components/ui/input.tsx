import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, r) => <input ref={r} className={cn('flex h-10 w-full rounded-2xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 placeholder:text-text-3 transition-all focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50', className)} {...p} />);
Input.displayName = 'Input';
