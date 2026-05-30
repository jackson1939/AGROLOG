'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-campo-500 focus:outline-none focus:ring-2 focus:ring-campo-500/20 transition-colors',
            error && 'border-critico-400 focus:border-critico-400 focus:ring-critico-400/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-critico-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
