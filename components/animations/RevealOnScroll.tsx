'use client';

import { useRef } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';

interface RevealOnScrollProps {
  children: React.ReactNode;
  containerClass?: string;
}

export function RevealOnScroll({
  children,
  containerClass = 'cards-container',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.reveal-card', {
        y: 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: `.${containerClass}`,
          start: 'top 85%',
        },
      });
    },
    { scope: ref, dependencies: [containerClass] }
  );

  return <div ref={ref}>{children}</div>;
}
