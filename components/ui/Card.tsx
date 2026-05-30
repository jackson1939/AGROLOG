import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  severity?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
}

export function Card({ className, severity, children, ...props }: CardProps) {
  const borderColors = {
    BAJA: 'border-l-campo-500',
    MEDIA: 'border-l-alerta-400',
    ALTA: 'border-l-alerta-600',
    CRITICA: 'border-l-critico-600',
  };

  return (
    <div
      className={cn(
        'rounded-lg bg-surface shadow-card border border-border/50',
        severity && 'border-l-[3px]',
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
