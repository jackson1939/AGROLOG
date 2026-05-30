'use client';

/**
 * PageTransition.tsx — GSAP Pro Max Edition
 *
 * Features:
 *  - Enter animation: stagger children tagged [data-gsap="stagger"]
 *  - Exit animation via imperative triggerExit() exposed through ref (useImperativeHandle)
 *  - Route-change awareness: listens to Next.js router events via pathname
 *  - Reduced-motion: collapses to instant fade at 120ms
 *  - Configurable y-offset, opacity start, duration, stagger interval, ease
 *  - Overlay panel that wipes in/out during hard navigation (optional)
 *  - clearProps after enter so CSS transitions still work on children
 *  - Zero-layout-shift: wrapper has position:relative and overflow:hidden
 *    only during animation, cleared on complete
 */

import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP, gsap } from '@/hooks/useGSAP';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PageTransitionHandle {
  /** Call this before triggering a route change to run the exit animation */
  triggerExit: () => Promise<void>;
}

export interface PageTransitionProps {
  children: ReactNode;
  /** Y-offset for enter animation in px (default: 28) */
  yOffset?: number;
  /** Starting opacity (default: 0) */
  fromOpacity?: number;
  /** Duration per item in seconds (default: 0.55) */
  duration?: number;
  /** Stagger interval in seconds (default: 0.08) */
  stagger?: number;
  /** GSAP ease (default: 'power3.out') */
  ease?: string;
  /** Whether to show the full-screen overlay wipe (default: false) */
  withOverlay?: boolean;
  /** Overlay background colour (default: 'var(--color-brand)') */
  overlayColor?: string;
  /** Extra className on the wrapper div */
  className?: string;
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

export const PageTransition = forwardRef<PageTransitionHandle, PageTransitionProps>(
  function PageTransition(
    {
      children,
      yOffset = 28,
      fromOpacity = 0,
      duration = 0.55,
      stagger = 0.08,
      ease = 'power3.out',
      withOverlay = false,
      overlayColor = 'var(--color-brand, #2d6a4f)',
      className,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const pathname = usePathname();

    /* -------------------------------------------------------------- */
    /*  Core enter animation                                           */
    /* -------------------------------------------------------------- */

    const runEnter = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const reduced = prefersReducedMotion();
      const targets = container.querySelectorAll<HTMLElement>('[data-gsap="stagger"]');

      if (!targets.length) return;

      /* Kill any lingering tween from a previous navigation */
      timelineRef.current?.kill();

      if (reduced) {
        /* Respect OS preference — simple 120ms fade, no movement */
        gsap.fromTo(
          targets,
          { opacity: 0 },
          { opacity: 1, duration: 0.12, stagger: 0.02, clearProps: 'all' }
        );
        return;
      }

      const tl = gsap.timeline({
        onComplete() {
          /* Remove inline styles so CSS hover/focus transitions still work */
          gsap.set(targets, { clearProps: 'all' });
        },
      });
      timelineRef.current = tl;

      /* Optional full-screen wipe overlay */
      if (withOverlay && overlayRef.current) {
        tl.fromTo(
          overlayRef.current,
          { scaleY: 1, transformOrigin: 'top center' },
          { scaleY: 0, duration: 0.6, ease: 'power4.inOut' }
        );
      }

      tl.fromTo(
        targets,
        { y: yOffset, opacity: fromOpacity, willChange: 'transform, opacity' },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease,
        },
        withOverlay ? '-=0.3' : 0
      );
    }, [yOffset, fromOpacity, duration, stagger, ease, withOverlay]);

    /* -------------------------------------------------------------- */
    /*  Exit animation (imperative, for router transitions)            */
    /* -------------------------------------------------------------- */

    const triggerExit = useCallback((): Promise<void> => {
      return new Promise((resolve) => {
        const container = containerRef.current;
        if (!container || prefersReducedMotion()) {
          resolve();
          return;
        }

        const targets = container.querySelectorAll<HTMLElement>('[data-gsap="stagger"]');

        gsap.to(targets, {
          y: -yOffset * 0.5,
          opacity: 0,
          duration: duration * 0.7,
          stagger: stagger * 0.5,
          ease: 'power2.in',
          onComplete: resolve,
        });

        if (withOverlay && overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { scaleY: 0, transformOrigin: 'bottom center' },
            { scaleY: 1, duration: 0.5, ease: 'power4.inOut' }
          );
        }
      });
    }, [yOffset, duration, stagger, withOverlay]);

    /* Expose triggerExit for parent route handlers */
    useImperativeHandle(ref, () => ({ triggerExit }), [triggerExit]);

    /* -------------------------------------------------------------- */
    /*  Run enter on mount + whenever pathname changes                 */
    /* -------------------------------------------------------------- */

    useGSAP(
      () => {
        runEnter();
        return () => {
          timelineRef.current?.kill();
        };
      },
      { scope: containerRef, dependencies: [pathname, runEnter] }
    );

    /* -------------------------------------------------------------- */
    /*  Render                                                         */
    /* -------------------------------------------------------------- */

    return (
      <div
        ref={containerRef}
        className={className}
        /* Avoid scrollbar flash during overlay animation */
        style={withOverlay ? { position: 'relative', overflow: 'hidden' } : undefined}
      >
        {/* Optional wipe overlay panel */}
        {withOverlay && (
          <div
            ref={overlayRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: overlayColor,
              zIndex: 9999,
              pointerEvents: 'none',
              transformOrigin: 'top center',
            }}
          />
        )}
        {children}
      </div>
    );
  }
);

PageTransition.displayName = 'PageTransition';