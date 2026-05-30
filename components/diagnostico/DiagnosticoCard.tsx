'use client';

/**
 * DiagnosticoCard.tsx — GSAP Pro Max Edition
 *
 * Problemas corregidos en el original:
 *  1. Selector global `.gauge-arc` leaked entre múltiples instancias del gauge
 *  2. GSAP animaba `strokeDashoffset` sin considerar el valor inicial → flash
 *  3. No había `reduced-motion` guard
 *  4. El layout rompía en mobile (flex fijo sin wrap)
 *  5. Urgencia hardcodeada como string sin sistema de severidad visual
 *  6. Sin accordion/expand para texto largo de observaciones
 *
 * Mejoras:
 *  - ConfidenceGauge: animación via proxy object + useRef único por instancia
 *  - CountUp integrado dentro del gauge (animación del número en paralelo)
 *  - Colores derivados dinámicamente de CSS vars con fallback seguro
 *  - Urgencia con 4 niveles: BAJA | MEDIA | ALTA | CRÍTICA — chip animado
 *  - Expand/collapse de observaciones largas con GSAP height tween
 *  - Skeleton loading variant
 *  - `data-reveal` para integración con RevealOnScroll
 *  - Layout responsive: stack en mobile, row en desktop
 *  - Accessible: role="article", aria-labels, focus states
 */

import { useRef, useState, useCallback, useId } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/utils';
import type { HipotesisDiagnostico } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type UrgenciaNivel = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';

export interface DiagnosticoCardProps {
  hipotesis: HipotesisDiagnostico;
  index?: number;
  /** Show loading skeleton */
  skeleton?: boolean;
  /** Called when user clicks "Ver detalle" */
  onDetail?: (hipotesis: HipotesisDiagnostico) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Map confianza 0-100 to a CSS variable color token */
function confidenceColor(confianza: number): string {
  if (confianza > 75) return 'var(--color-campo-500, #16a34a)';
  if (confianza >= 50) return 'var(--color-alerta-400, #f59e0b)';
  return 'var(--color-tierra-400, #b45309)';
}

/** Urgencia → visual config */
const URGENCIA_CONFIG: Record<
  UrgenciaNivel,
  { label: string; bg: string; text: string; dot: string }
> = {
  BAJA:    { label: 'Urgencia baja',    bg: 'bg-emerald-50  dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  MEDIA:   { label: 'Urgencia media',   bg: 'bg-amber-50    dark:bg-amber-950/30',   text: 'text-amber-700  dark:text-amber-400',   dot: 'bg-amber-400'   },
  ALTA:    { label: 'Urgencia alta',    bg: 'bg-orange-50   dark:bg-orange-950/30',  text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-500'  },
  CRÍTICA: { label: 'Urgencia crítica', bg: 'bg-red-50      dark:bg-red-950/30',     text: 'text-red-700    dark:text-red-400',     dot: 'bg-red-500 animate-pulse' },
};

/* ------------------------------------------------------------------ */
/*  ConfidenceGauge — fully scoped, no selector leakage                */
/* ------------------------------------------------------------------ */

interface GaugeProps {
  confianza: number;
  animDelay?: number;
}

function ConfidenceGauge({ confianza, animDelay = 0.3 }: GaugeProps) {
  const svgRef        = useRef<SVGSVGElement>(null);
  const arcRef        = useRef<SVGCircleElement>(null);
  const textRef       = useRef<SVGTextElement>(null);
  const proxyRef      = useRef({ val: 0 });
  const id            = useId();

  const RADIUS        = 38;
  const STROKE        = 7;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const targetOffset  = CIRCUMFERENCE - (confianza / 100) * CIRCUMFERENCE;
  const color         = confidenceColor(confianza);

  useGSAP(
    () => {
      const arc  = arcRef.current;
      const text = textRef.current;
      if (!arc || !text) return;

      if (prefersReducedMotion()) {
        arc.style.strokeDashoffset = String(targetOffset);
        text.textContent = `${confianza}%`;
        return;
      }

      /* Set initial state before animation */
      gsap.set(arc, { strokeDashoffset: CIRCUMFERENCE });
      proxyRef.current.val = 0;

      const tl = gsap.timeline({ delay: animDelay, id: `gauge-${id}` });

      /* Arc stroke animation */
      tl.to(arc, {
        strokeDashoffset: targetOffset,
        duration: ANIMATION.GAUGE_DURATION ?? 1.4,
        ease: 'power3.out',
      });

      /* Number count-up in parallel */
      tl.to(
        proxyRef.current,
        {
          val: confianza,
          duration: ANIMATION.GAUGE_DURATION ?? 1.4,
          ease: 'power3.out',
          onUpdate() {
            if (text) text.textContent = `${Math.round(proxyRef.current.val)}%`;
          },
          onComplete() {
            if (text) text.textContent = `${confianza}%`;
          },
        },
        '<' /* same start time as arc */
      );

      return () => tl.kill();
    },
    { scope: svgRef, dependencies: [confianza, animDelay] }
  );

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <svg
        ref={svgRef}
        width="96"
        height="96"
        viewBox="0 0 96 96"
        aria-label={`Confianza: ${confianza}%`}
        role="img"
      >
        {/* Track ring */}
        <circle
          cx="48" cy="48" r={RADIUS}
          fill="none"
          stroke="var(--color-surface-3, #e5e7eb)"
          strokeWidth={STROKE}
        />
        {/* Animated arc */}
        <circle
          ref={arcRef}
          cx="48" cy="48" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* Percentage text */}
        <text
          ref={textRef}
          x="48" y="48"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '15px',
            fontFamily: 'var(--font-mono, monospace)',
            fill: 'var(--color-text-1, #1a1714)',
            fontWeight: 600,
          }}
        >
          0%
        </text>
      </svg>
      <span
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: 'var(--color-text-3, #9ca3af)' }}
      >
        confianza
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                            */
/* ------------------------------------------------------------------ */

function DiagnosticoCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-5 animate-pulse"
      aria-busy="true"
      aria-label="Cargando diagnóstico…"
    >
      <div className="flex gap-4">
        {/* Gauge skeleton */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="h-24 w-24 rounded-full bg-surface-2" />
          <div className="h-2 w-14 rounded bg-surface-2" />
        </div>
        {/* Text skeleton */}
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-3/4 rounded bg-surface-2" />
          <div className="h-3 w-1/4 rounded bg-surface-2" />
          <div className="h-3 w-full rounded bg-surface-2 mt-3" />
          <div className="h-3 w-5/6 rounded bg-surface-2" />
          <div className="h-3 w-2/3 rounded bg-surface-2" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-surface-2" />
            <div className="h-6 w-16 rounded-full bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Expand / Collapse button                                            */
/* ------------------------------------------------------------------ */

function ExpandSection({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef         = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    const el = bodyRef.current;
    if (!el) { setOpen((v) => !v); return; }

    if (!open) {
      /* Expand */
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    } else {
      /* Collapse */
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => setOpen(false),
      });
      return; /* setOpen called in onComplete */
    }
    setOpen(true);
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-xs font-mono text-text-3 hover:text-text-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        aria-expanded={open}
        aria-label={label}
      >
        <svg
          viewBox="0 0 12 12"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
        {open ? 'Ocultar' : 'Ver más'}
      </button>
      <div
        ref={bodyRef}
        style={{ overflow: 'hidden', height: open ? undefined : 0, opacity: open ? 1 : 0 }}
      >
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function DiagnosticoCard({
  hipotesis,
  index = 0,
  skeleton = false,
  onDetail,
}: DiagnosticoCardProps) {
  if (skeleton) return <DiagnosticoCardSkeleton />;

  const urgencia     = (hipotesis.urgencia?.toUpperCase() ?? 'MEDIA') as UrgenciaNivel;
  const urgConfig    = URGENCIA_CONFIG[urgencia] ?? URGENCIA_CONFIG.MEDIA;
  const descripLong  = (hipotesis.descripcion?.length ?? 0) > 140;

  return (
    <article
      className="reveal-card rounded-xl border border-border bg-surface shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-elevated"
      data-reveal
      data-gsap="stagger"
      style={{ '--stagger-index': index } as React.CSSProperties}
      aria-label={`Diagnóstico: ${hipotesis.nombre}`}
    >
      {/* Severity accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: confidenceColor(hipotesis.confianza),
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* Main content row */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Gauge */}
          <ConfidenceGauge
            confianza={hipotesis.confianza}
            animDelay={0.2 + index * 0.06}
          />

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Title + tipo */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg leading-snug text-text-1">
                  {hipotesis.nombre}
                </h3>
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-3 mt-0.5">
                  {hipotesis.tipo}
                </p>
              </div>

              {/* Urgencia chip */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${urgConfig.bg} ${urgConfig.text}`}
                aria-label={urgConfig.label}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${urgConfig.dot}`} aria-hidden="true" />
                {urgencia}
              </span>
            </div>

            {/* Descripción */}
            <div className="mt-2 text-sm text-text-2 leading-relaxed">
              {descripLong ? (
                <>
                  <p>{hipotesis.descripcion.slice(0, 140)}&hellip;</p>
                  <ExpandSection label={`Expandir descripción de ${hipotesis.nombre}`}>
                    <p className="text-sm text-text-2 leading-relaxed">
                      {hipotesis.descripcion}
                    </p>
                  </ExpandSection>
                </>
              ) : (
                <p>{hipotesis.descripcion}</p>
              )}
            </div>

            {/* Metadata grid */}
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {hipotesis.sintomas && (
                <div>
                  <dt className="font-semibold text-text-3">Síntomas</dt>
                  <dd className="text-text-2 mt-0.5">{hipotesis.sintomas}</dd>
                </div>
              )}
              {hipotesis.accion && (
                <div>
                  <dt className="font-semibold text-text-3">Acción recomendada</dt>
                  <dd className="text-text-2 mt-0.5">{hipotesis.accion}</dd>
                </div>
              )}
            </dl>

            {/* Footer actions */}
            {onDetail && (
              <div className="mt-4 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => onDetail(hipotesis)}
                  className="text-xs font-mono text-brand hover:text-brand-dark underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                >
                  Ver detalle completo →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
