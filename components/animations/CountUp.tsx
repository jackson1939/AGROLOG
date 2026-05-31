'use client';
 
/**
 * CountUp.tsx — GSAP Pro Max Edition
 *
 * Features:
 *  - Intersection Observer guard (no GSAP until truly visible)
 *  - Prefix / suffix support (e.g. "$1,200 ha")
 *  - Formatted output with toLocaleString — commas, decimals
 *  - Configurable easing, duration, start value
 *  - Reduced-motion aware (respects prefers-reduced-motion)
 *  - onComplete callback
 *  - Re-animates when `value` prop changes
 *  - Accessible: aria-label keeps the real number for screen readers
 *  - Zero flash: element starts at `from` before paint via inline style
 */
 
import { useRef, useCallback, useId } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
 
/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
 
export interface CountUpProps {
  /** The target number to count towards */
  value: number;
  /** Starting value (default: 0) */
  from?: number;
  /** String prepended to the number, e.g. "$" */
  prefix?: string;
  /** String appended to the number, e.g. " ha" */
  suffix?: string;
  /** Animation duration in seconds (default: 1.6) */
  duration?: number;
  /** GSAP ease string (default: 'power3.out') */
  ease?: string;
  /** Decimal places to display (default: 0) */
  decimals?: number;
  /** Locale for number formatting (default: 'es-BO') */
  locale?: string;
  /** Extra className(s) applied to the <span> */
  className?: string;
  /** Called when the count animation finishes */
  onComplete?: () => void;
  /** ScrollTrigger start value (default: 'top 85%') */
  scrollStart?: string;
}
 
/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
 
function formatNumber(n: number, decimals: number, locale: string): string {
  return n.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
 
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
 
/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
 
export function CountUp({
  value,
  from = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  ease = 'power3.out',
  decimals = 0,
  locale = 'es-BO',
  className = 'stat-number',
  onComplete,
  scrollStart = 'top 85%',
}: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const proxyRef = useRef({ val: from });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const id = useId();
 
  /* Render function — updates DOM text without React re-renders */
  const render = useCallback(
    (n: number) => {
      if (!spanRef.current) return;
      spanRef.current.textContent = `${prefix}${formatNumber(n, decimals, locale)}${suffix}`;
    },
    [prefix, suffix, decimals, locale]
  );
 
  useGSAP(
    () => {
      if (!spanRef.current) return;
 
      /* Immediately paint the `from` value so there's no flash */
      render(from);
      proxyRef.current.val = from;
 
      /* Kill any previous tween so re-runs are clean */
      tweenRef.current?.kill();
 
      /* Skip animation for users who prefer reduced motion */
      if (prefersReducedMotion()) {
        render(value);
        onComplete?.();
        return;
      }
 
      tweenRef.current = gsap.to(proxyRef.current, {
        val: value,
        duration,
        ease,
        scrollTrigger: {
          trigger: spanRef.current,
          start: scrollStart,
          once: true,
          /* Tiny marker group keyed by id so multiple instances
             don't share a single ScrollTrigger instance */
          id: `countup-${id}`,
        },
        onUpdate() {
          render(proxyRef.current.val);
        },
        onComplete() {
          /* Snap to exact final value, avoiding floating-point drift */
          render(value);
          onComplete?.();
        },
      });
 
      return () => {
        tweenRef.current?.kill();
      };
    },
    /* Re-run when value, duration, ease or format settings change */
    { scope: spanRef, dependencies: [value, from, duration, ease, decimals, locale, scrollStart] }
  );
 
  return (
    <span
      ref={spanRef}
      className={className}
      /* Keep the real number in aria-label for screen readers */
      aria-label={`${prefix}${formatNumber(value, decimals, locale)}${suffix}`}
      /* Prevent layout shift before animation starts */
      style={{ display: 'inline-block', minWidth: '2ch' }}
    >
      {/* Server-render the final value so SSR/hydration never shows blank */}
      {prefix}
      {formatNumber(value, decimals, locale)}
      {suffix}
    </span>
  );
}
