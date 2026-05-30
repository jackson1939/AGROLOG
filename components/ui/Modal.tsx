'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-tierra-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg bg-surface shadow-elevated border border-border',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-serif text-lg text-text-1">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
              ✕
            </Button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
