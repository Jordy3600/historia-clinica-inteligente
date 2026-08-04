import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, r) => <textarea ref={r} className={cn('flex w-full rounded-2xl border border-border bg-bg-hover p-3.5 text-sm text-text-1 placeholder:text-text-3 transition-all focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50', className)} {...p} />);
Textarea.displayName = 'Textarea';
