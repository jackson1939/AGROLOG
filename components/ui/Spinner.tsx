import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-tierra-200 border-t-campo-500',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%]',
        className
      )}
    />
  );
}
