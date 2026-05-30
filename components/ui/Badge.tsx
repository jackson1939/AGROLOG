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
    default: 'bg-surface-3/80 text-text-2 border border-border/50 backdrop-blur-sm',
    campo: 'bg-campo-50/90 text-campo-700 border border-campo-300/40 backdrop-blur-sm',
    alerta: 'bg-amber-50/90 text-alerta-600 border border-amber-300/40 backdrop-blur-sm',
    critico: 'bg-red-50/90 text-critico-600 border border-red-300/40 backdrop-blur-sm',
    tierra: 'bg-tierra-50/90 text-tierra-800 border border-tierra-200/40 font-mono backdrop-blur-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-300 hover:brightness-95',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
