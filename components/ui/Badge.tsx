import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'campo' | 'alerta' | 'critico' | 'tierra';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-surface-3 text-text-2',
    campo: 'bg-campo-100 text-campo-700',
    alerta: 'bg-amber-100 text-alerta-600',
    critico: 'bg-red-100 text-critico-600',
    tierra: 'bg-tierra-100 text-tierra-800 font-mono',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
