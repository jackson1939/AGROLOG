import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  severity?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
  interactive?: boolean;
  glass?: boolean;
}

export function Card({ className, severity, interactive = true, glass = false, children, ...props }: CardProps) {
  const borderColors = {
    BAJA: 'border-l-campo-500',
    MEDIA: 'border-l-alerta-400',
    ALTA: 'border-l-alerta-600',
    CRITICA: 'border-l-critico-600',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300',
        glass ? 'glass-panel' : 'bg-[#081109]/40 backdrop-blur-md border border-white/5 shadow-card hover:border-emerald-500/20',
        interactive && 'hover-lift cursor-pointer',
        severity && 'border-l-[4px]',
        severity && borderColors[severity],
        className
      )}
      {...props}
    >
      {children}
    </div>

  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pb-2', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pt-2', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-serif text-lg text-text-1', className)}
      {...props}
    />
  );
}
