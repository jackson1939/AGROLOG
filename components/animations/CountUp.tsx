'use client';

import { useRef } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';

interface CountUpProps {
  value: number;
  className?: string;
}

export function CountUp({ value, className = 'stat-number' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        textContent: 0,
        duration: 1.2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        },
      });
    },
    { scope: ref, dependencies: [value] }
  );

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
