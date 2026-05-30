'use client';

import { useRef } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('[data-gsap="stagger"]', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });
    },
    { scope: containerRef }
  );

  return <div ref={containerRef}>{children}</div>;
}
