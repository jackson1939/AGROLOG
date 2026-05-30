'use client';

import { useRef } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/utils';
import type { HipotesisDiagnostico } from '@/types';

interface DiagnosticoCardProps {
  hipotesis: HipotesisDiagnostico;
  index?: number;
}

function ConfidenceGauge({ confianza }: { confianza: number }) {
  const radius = 40;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confianza / 100) * circumference;

  const color =
    confianza > 75
      ? 'var(--color-campo-500)'
      : confianza >= 50
        ? 'var(--color-alerta-400)'
        : 'var(--color-tierra-400)';

  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.from('.gauge-arc', {
        strokeDashoffset: circumference,
        duration: ANIMATION.GAUGE_DURATION,
        ease: 'power3.out',
        delay: 0.3,
      });
    },
    { scope: ref, dependencies: [confianza] }
  );

  return (
    <div className="relative flex flex-col items-center">
      <svg ref={ref} width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={stroke}
        />
        <circle
          className="gauge-arc"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono text-lg fill-text-1"
          style={{ fontSize: '18px', fill: 'var(--color-text-1)' }}
        >
          {confianza}%
        </text>
      </svg>
    </div>
  );
}

export function DiagnosticoCard({ hipotesis, index = 0 }: DiagnosticoCardProps) {
  return (
    <div
      className="reveal-card rounded-lg border border-border bg-surface p-5 shadow-card"
      data-gsap="stagger"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex gap-4">
        <ConfidenceGauge confianza={hipotesis.confianza} />
        <div className="flex-1">
          <h3 className="font-serif text-lg text-text-1">{hipotesis.nombre}</h3>
          <p className="text-xs font-mono text-text-3 mt-0.5">{hipotesis.tipo}</p>
          <p className="text-sm text-text-2 mt-2">{hipotesis.descripcion}</p>
          <div className="mt-3 space-y-1 text-xs text-text-2">
            <p><strong>Síntomas:</strong> {hipotesis.sintomas}</p>
            <p><strong>Acción:</strong> {hipotesis.accion}</p>
            <p className="font-mono text-alerta-600">Urgencia: {hipotesis.urgencia}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
