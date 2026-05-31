/**
 * EnfermedadBadge.tsx — Pro Max Edition
 *
 * Problemas corregidos en el original:
 *  1. Record de variantes era incompleto — sin fallback robusto
 *  2. Sin ícono visual por tipo (todo se veía igual)
 *  3. Sin soporte para `size` (sm | md | lg)
 *  4. Sin animación de entrada opcional
 *  5. Sin `title` accesible en el badge
 *
 * Mejoras:
 *  - Iconos SVG inline por tipo (ENFERMEDAD, PLAGA, DEFICIENCIA, etc.)
 *  - Sistema de 5 variantes con colores semánticos coherentes
 *  - Prop `size`: 'sm' | 'md' (default) | 'lg'
 *  - Prop `pulse`: boolean — anima el dot para estados activos/críticos
 *  - Prop `icon`: boolean — muestra/oculta el icono (default true)
 *  - Accesible: `title` derivado de tipo, `aria-label` descriptivo
 *  - Export del tipo TipoDiagnostico para reuso en otras partes del sistema
 */

import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type TipoDiagnostico =
  | 'ENFERMEDAD'
  | 'PLAGA'
  | 'DEFICIENCIA'
  | 'FISIOLOGICO'
  | 'NORMAL'
  | string; // fallback for unknown values

type BadgeVariant = 'campo' | 'alerta' | 'critico' | 'default';
type BadgeSize    = 'sm' | 'md' | 'lg';

export interface EnfermedadBadgeProps {
  tipo: TipoDiagnostico;
  /** Override the display label (default: formatted tipo string) */
  label?: string;
  /** Show icon before label (default: true) */
  icon?: boolean;
  /** Pulse animation on the status dot (default: false) */
  pulse?: boolean;
  /** Badge size (default: 'md') */
  size?: BadgeSize;
  /** Extra className */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Config maps                                                         */
/* ------------------------------------------------------------------ */

interface TipoConfig {
  variant:     BadgeVariant;
  icon:        React.ReactNode;
  description: string;
}

const TIPO_CONFIG: Record<string, TipoConfig> = {
  ENFERMEDAD: {
    variant:     'alerta',
    description: 'Enfermedad detectada',
    icon: (
      <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
        <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zM6 3.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 1 0zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z" />
      </svg>
    ),
  },
  PLAGA: {
    variant:     'critico',
    description: 'Plaga identificada',
    icon: (
      <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
        <path d="M6 1L1 10h10L6 1zm0 2.5l3.2 5.5H2.8L6 3.5z" />
        <rect x="5.5" y="6" width="1" height="2.5" rx="0.5" />
        <circle cx="6" cy="9.5" r="0.6" />
      </svg>
    ),
  },
  DEFICIENCIA: {
    variant:     'default',
    description: 'Deficiencia nutricional',
    icon: (
      <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="6" r="5" opacity="0.2" />
        <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  FISIOLOGICO: {
    variant:     'default',
    description: 'Problema fisiológico',
    icon: (
      <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
        <path d="M6 2C4 2 2 4 2 6s2 4 4 4 4-2 4-4" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" />
        <circle cx="9" cy="3" r="1.5" />
      </svg>
    ),
  },
  NORMAL: {
    variant:     'campo',
    description: 'Estado normal',
    icon: (
      <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

/** Fallback for unknown tipo values */
const FALLBACK_CONFIG: TipoConfig = {
  variant:     'default',
  description: 'Tipo desconocido',
  icon: (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="6" r="5" opacity="0.3" />
      <path d="M6 4.5v2M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Size class map                                                      */
/* ------------------------------------------------------------------ */

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-[10px] gap-1 px-1.5 py-0.5',
  md: 'text-xs gap-1.5 px-2 py-0.5',
  lg: 'text-sm gap-2 px-2.5 py-1',
};

/* ------------------------------------------------------------------ */
/*  Format tipo as human-readable label                                 */
/* ------------------------------------------------------------------ */

function formatTipo(tipo: string): string {
  return tipo
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function EnfermedadBadge({
  tipo,
  label,
  icon: showIcon = true,
  pulse  = false,
  size   = 'md',
  className,
}: EnfermedadBadgeProps) {
  const config      = TIPO_CONFIG[tipo.toUpperCase()] ?? FALLBACK_CONFIG;
  const displayLabel = label ?? formatTipo(tipo);
  const sizeClass   = SIZE_CLASSES[size];

  return (
    <Badge
      variant={config.variant}
      className={[
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider leading-none',
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={config.description}
      aria-label={`${config.description}: ${displayLabel}`}
    >
      {/* Pulse status dot */}
      {pulse && (
        <span
          className="relative flex h-1.5 w-1.5 flex-shrink-0"
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}

      {/* Type icon */}
      {showIcon && (
        <span className="flex-shrink-0 opacity-80">{config.icon}</span>
      )}

      {/* Label */}
      <span>{displayLabel}</span>
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience re-export of tipo keys for use in other components     */
/* ------------------------------------------------------------------ */

export const TIPOS_DIAGNOSTICO = Object.keys(TIPO_CONFIG) as TipoDiagnostico[];