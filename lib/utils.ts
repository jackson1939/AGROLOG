import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'dd MMM yyyy', { locale: es });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy '·' HH:mm", { locale: es });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export const SEVERIDAD_COLORS: Record<string, string> = {
  BAJA: 'var(--color-campo-500)',
  MEDIA: 'var(--color-alerta-400)',
  ALTA: 'var(--color-alerta-600)',
  CRITICA: 'var(--color-critico-600)',
};

export const SEVERIDAD_LABELS: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const CULTIVO_LABELS: Record<string, string> = {
  SOYA: 'Soya',
  MAIZ: 'Maíz',
  QUINUA: 'Quinua',
  PAPA: 'Papa',
  TRIGO: 'Trigo',
  GIRASOL: 'Girasol',
  CITRICOS: 'Cítricos',
  TOMATE: 'Tomate',
  CEBOLLA: 'Cebolla',
  OTRO: 'Otro',
};

export const ANIMATION = {
  STAGGER: 0.08,
  LIST_STAGGER: 0.06,
  PAGE_DURATION: 0.5,
  COUNTUP_DURATION: 1.2,
  GAUGE_DURATION: 1.4,
} as const;
