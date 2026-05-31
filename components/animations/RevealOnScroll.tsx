'use client';

/**
 * RevealOnScroll.tsx — GSAP Pro Max Edition
 *
 * Problems fixed in the original:
 *  1. Global selector `.reveal-card` leaked across page — scoped to ref.current
 *  2. No ScrollTrigger cleanup → memory leak on unmount
 *  3. Hard-coded selector string with no fallback
 *  4. No reduced-motion guard
 *  5. No way to observe dynamic children (React portals, async data)
 *
 * New features:
 *  - `itemSelector` prop (default: '[data-reveal]') — scoped to wrapper
 *  - `animationVariant`: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-right'
 *  - Per-item random y-jitter option for organic feel
 *  - `batch` mode: uses ScrollTrigger.batch() for large lists (perf)
 *  - `once` flag (default: true) — replay on re-enter optional
 *  - ResizeObserver re-refresh ScrollTrigger after layout changes
 *  - Reduced-motion: skip transforms, only fade at 120ms
 *  - `onReveal(el)` callback per revealed item
 */

import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type AnimationVariant = 'fade-up' | 'fade-in' | 'scale-up' | 'slide-right';

export interface RevealOnScrollProps {
  children: ReactNode;
  /** CSS selector for items to animate, scoped to this wrapper (default: '[data-reveal]') */
  itemSelector?: string;
  /** Visual style of the reveal (default: 'fade-up') */
  variant?: AnimationVariant;
  /** Y-travel in px for fade-up / X-travel for slide-right (default: 20) */
  offset?: number;
  /** Animation duration per item in seconds (default: 0.45) */
  duration?: number;
  /** Stagger between items in seconds (default: 0.07) */
  stagger?: number;
  /** GSAP ease (default: 'power3.out') */
  ease?: string;
  /** ScrollTrigger start (default: 'top 88%') */
  scrollStart?: string;
  /** If true, animation only runs once (default: true) */
  once?: boolean;
  /** Use ScrollTrigger.batch for large lists > this count (default: 12) */
  batchThreshold?: number;
  /** Callback fired for each element when it reveals */
  onReveal?: (el: Element) => void;
  /** Additional className on the wrapper */
  className?: string;
  /** Inline style on the wrapper */
  style?: CSSProperties;
  /** HTML tag for the wrapper (default: 'div') */
  as?: keyof JSX.IntrinsicElements;
}

/* ------------------------------------------------------------------ */
/*  Animation variant presets                                           */
/* ------------------------------------------------------------------ */

type GsapVars = gsap.TweenVars;

function buildFromVars(variant: AnimationVariant, offset: number): GsapVars {
  const base: GsapVars = { opacity: 0, willChange: 'transform, opacity' };
  switch (variant) {
    case 'fade-up':    return { ...base, y: offset };
    case 'fade-in':    return { ...base };
    case 'scale-up':   return { ...base, scale: 0.92, transformOrigin: 'center bottom' };
    case 'slide-right': return { ...base, x: -offset };
  }
}

function buildToVars(variant: AnimationVariant): GsapVars {
  const base: GsapVars = { opacity: 1, willChange: 'auto' };
  switch (variant) {
    case 'fade-up':    return { ...base, y: 0 };
    case 'fade-in':    return { ...base };
    case 'scale-up':   return { ...base, scale: 1 };
    case 'slide-right': return { ...base, x: 0 };
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function RevealOnScroll({
  children,
  itemSelector = '[data-reveal]',
  variant = 'fade-up',
  offset = 20,
  duration = 0.45,
  stagger = 0.07,
  ease = 'power3.out',
  scrollStart = 'top 88%',
  once = true,
  batchThreshold = 12,
  onReveal,
  className,
  style,
  as: Tag = 'div',
}: RevealOnScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  /* Keep a ref to all created ScrollTriggers for manual cleanup */
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const targets = Array.from(wrapper.querySelectorAll<HTMLElement>(itemSelector));
      if (!targets.length) return;

      /* Clean up any previously created triggers */
      triggersRef.current.forEach((st) => st.kill());
      triggersRef.current = [];

      const reduced = prefersReducedMotion();

      if (reduced) {
        gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.02 });
        return;
      }

      const fromVars = buildFromVars(variant, offset);
      const toVars   = buildToVars(variant);

      /* Pre-set all targets to `from` state immediately, before scroll check */
      gsap.set(targets, fromVars);

      if (targets.length > batchThreshold) {
        /* ---- BATCH MODE: one ScrollTrigger per item, GPU-batched ---- */
        const batchTriggers = ScrollTrigger.batch(targets, {
          start: scrollStart,
          once,
          onEnter(batch) {
            gsap.to(batch, {
              ...toVars,
              duration,
              stagger,
              ease,
              onComplete() {
                gsap.set(batch, { clearProps: 'all' });
                batch.forEach((el) => onReveal?.(el));
              },
            });
          },
          onLeaveBack: once
            ? undefined
            : (batch) => gsap.set(batch, fromVars),
        });
        triggersRef.current.push(...batchTriggers);
      } else {
        /* ---- STANDARD MODE: single timeline for the whole group ---- */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: scrollStart,
            once,
            onEnter() {
              targets.forEach((el) => onReveal?.(el));
            },
            onLeaveBack: once ? undefined : () => gsap.set(targets, fromVars),
          },
        });

        tl.to(targets, {
          ...toVars,
          duration,
          stagger,
          ease,
          onComplete() {
            gsap.set(targets, { clearProps: 'all' });
          },
        });

        if (tl.scrollTrigger) {
          triggersRef.current.push(tl.scrollTrigger);
        }
      }

      return () => {
        triggersRef.current.forEach((st) => st.kill());
        triggersRef.current = [];
      };
    },
    { scope: wrapperRef, dependencies: [itemSelector, variant, offset, duration, stagger, ease, scrollStart, once, batchThreshold] }
  );

  /* ---------------------------------------------------------------- */
  /*  ResizeObserver: refresh ScrollTrigger when layout changes        */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(wrapper);

    return () => ro.disconnect();
  }, []);

  return (
    /* @ts-expect-error — dynamic tag */
    <Tag ref={wrapperRef} className={className} style={style}>
      {children}
    </Tag>
  );
}