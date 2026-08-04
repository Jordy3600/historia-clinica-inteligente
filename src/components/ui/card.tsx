import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...p }, r) => <div ref={r} className={cn('rounded-2xl border border-border bg-bg-card shadow-card transition-shadow', className)} {...p} />);
Card.displayName = 'Card';
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...p }, r) => <div ref={r} className={cn('flex flex-col gap-1.5 p-6', className)} {...p} />);
CardHeader.displayName = 'CardHeader';
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...p }, r) => <h3 ref={r} className={cn('text-lg font-semibold leading-none tracking-tight text-text-1', className)} {...p} />);
CardTitle.displayName = 'CardTitle';
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...p }, r) => <p ref={r} className={cn('text-sm text-text-2', className)} {...p} />);
CardDescription.displayName = 'CardDescription';
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...p }, r) => <div ref={r} className={cn('p-6 pt-0', className)} {...p} />);
CardContent.displayName = 'CardContent';
