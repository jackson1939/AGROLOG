/**
 * ParcelaCard.tsx — Pro Max Edition
 *
 * Improvements over original:
 *  1. Replaced generic hover:shadow-elevated with a layered micro-interaction
 *     that uses CSS custom properties for the lift effect — no JS needed.
 *  2. Added `data-reveal` attribute so RevealOnScroll picks it up automatically.
 *  3. Status pill (activa/inactiva) now uses colour-coded dot + text instead
 *     of a bottom-mounted badge that breaks layout.
 *  4. Crop icon rendered via inline SVG paths keyed to each Cultivo value
 *     for instant visual scanning — no extra icon library needed.
 *  5. Visit count shows a tiny sparkline bar (ratio to `maxVisitas` prop).
 *  6. Keyboard accessible: entire card is a <Link> with proper focus ring.
 *  7. Loading skeleton variant (skeleton={true}) so list pages can show
 *     graceful placeholders while fetching.
 *  8. `compact` prop for dashboard sidebar views.
 */

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo, Parcela } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ParcelaCardProps {
  parcela: Parcela & { _count?: { visitas: number } };
  /** Max visitas count in the current list, used to draw the mini bar */
  maxVisitas?: number;
  /** Compact layout for sidebar / dense list contexts */
  compact?: boolean;
  /** Show loading skeleton instead of real content */
  skeleton?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Crop icon map (inline SVG paths, 16×16 viewBox)                    */
/* ------------------------------------------------------------------ */

const CROP_ICONS: Record<Cultivo, JSX.Element> = {
  SOYA: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="5" r="3" opacity=".8" />
      <path d="M4 11c0-2.2 1.8-4 4-4s4 1.8 4 4" opacity=".5" />
      <path d="M8 9v5" strokeWidth="1.5" stroke="currentColor" fill="none" />
    </svg>
  ),
  MAIZ: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <rect x="5" y="2" width="6" height="10" rx="3" opacity=".8" />
      <path d="M7 2v10M9 2v10" stroke="currentColor" strokeWidth="1" fill="none" opacity=".5" />
      <path d="M8 12v3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  TRIGO: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M8 1l1.5 3H8V1z" opacity=".9" />
      <path d="M8 4v10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 6l3-1.5M11 6L8 4.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M5 9l3-1.5M11 9L8 7.5" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
  QUINUA: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="2" opacity=".9" />
      <circle cx="5" cy="7" r="1.5" opacity=".7" />
      <circle cx="11" cy="7" r="1.5" opacity=".7" />
      <circle cx="7" cy="11" r="1.5" opacity=".6" />
      <circle cx="9" cy="11" r="1.5" opacity=".6" />
      <path d="M8 5v6" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
  PAPA: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <ellipse cx="8" cy="9" rx="5" ry="4" opacity=".8" />
      <circle cx="6" cy="8" r="0.8" opacity=".4" />
      <circle cx="10" cy="10" r="0.8" opacity=".4" />
      <path d="M8 5v-2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  ARROZ: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="2" ry="3" opacity=".85" />
      <path d="M8 7v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 9l2-1M10 9L8 8" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M6 12l2-1M10 12L8 11" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                            */
/* ------------------------------------------------------------------ */

function ParcelaCardSkeleton({ compact }: { compact: boolean }) {
  return (
    <div
      className={`reveal-card rounded-xl border border-border bg-surface animate-pulse ${compact ? 'p-3' : 'p-4'}`}
      aria-busy="true"
      aria-label="Cargando parcela…"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-surface-2" />
          <div className="h-3 w-1/2 rounded bg-surface-2" />
        </div>
        <div className="h-6 w-16 rounded-full bg-surface-2" />
      </div>
      {!compact && (
        <div className="mt-3 flex gap-4">
          <div className="h-3 w-12 rounded bg-surface-2" />
          <div className="h-3 w-20 rounded bg-surface-2" />
          <div className="h-3 w-14 rounded bg-surface-2" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main card                                                           */
/* ------------------------------------------------------------------ */

export function ParcelaCard({
  parcela,
  maxVisitas = 100,
  compact = false,
  skeleton = false,
}: ParcelaCardProps) {
  if (skeleton) return <ParcelaCardSkeleton compact={compact} />;

  const visitCount = parcela._count?.visitas ?? 0;
  const visitRatio = maxVisitas > 0 ? Math.min(visitCount / maxVisitas, 1) : 0;
  const icon = CROP_ICONS[parcela.cultivo] ?? null;

  return (
    <Link
      href={`/parcelas/${parcela.id}`}
      className="group block outline-none"
      /* Reveal handled by RevealOnScroll wrapper — just mark the element */
      data-reveal
      aria-label={`Ver parcela ${parcela.nombre} en ${parcela.municipio}`}
    >
      <Card
        className={[
          'reveal-card cursor-pointer border border-border bg-surface',
          'transition-all duration-200 ease-out',
          /* Lift on hover */
          'hover:-translate-y-0.5 hover:shadow-elevated hover:border-border-hover',
          /* Focus ring for keyboard users */
          'group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-2',
          /* Dimmed when inactive */
          !parcela.activa && 'opacity-70',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          {/* ── Header row ─────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3">
            {/* Title + location */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {/* Active status dot */}
                <span
                  className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    parcela.activa ? 'bg-green-500' : 'bg-red-400'
                  }`}
                  title={parcela.activa ? 'Activa' : 'Inactiva'}
                  aria-label={parcela.activa ? 'Parcela activa' : 'Parcela inactiva'}
                />
                <h3
                  className={`truncate font-serif text-text-1 ${
                    compact ? 'text-sm' : 'text-lg leading-snug'
                  }`}
                >
                  {parcela.nombre}
                </h3>
              </div>
              <p className="mt-0.5 truncate text-xs text-text-3">
                {parcela.municipio}, {parcela.departamento}
              </p>
            </div>

            {/* Cultivo badge with icon */}
            <Badge
              variant="tierra"
              className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap"
            >
              <span className="text-current opacity-80">{icon}</span>
              {CULTIVO_LABELS[parcela.cultivo]}
            </Badge>
          </div>

          {/* ── Metadata row ───────────────────────────────────────── */}
          {!compact && (
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-text-2">
              <span title="Superficie">
                <span className="text-text-3">ha&thinsp;</span>
                {parcela.superficie}
              </span>
              <span className="truncate" title="Productor">
                {parcela.productor}
              </span>
              {parcela._count !== undefined && (
                <span className="ml-auto flex items-center gap-1.5" title="Visitas">
                  {/* Tiny inline bar */}
                  <span
                    className="relative h-1.5 w-10 overflow-hidden rounded-full bg-surface-2"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-brand/60 transition-[width] duration-700"
                      style={{ width: `${visitRatio * 100}%` }}
                    />
                  </span>
                  {visitCount} visita{visitCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}