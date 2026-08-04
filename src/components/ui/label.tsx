import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...p }, r) => <label ref={r} className={cn('text-sm font-medium text-text-2', className)} {...p} />);
Label.displayName = 'Label';
