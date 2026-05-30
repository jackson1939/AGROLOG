'use client';

import { formatDate, SEVERIDAD_LABELS } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Visita, Severidad } from '@/types';

interface VisitaTimelineProps {
  visitas: (Visita & { parcela?: { nombre: string } })[];
  onSelect?: (visita: Visita) => void;
}

const severityVariant: Record<Severidad, 'campo' | 'alerta' | 'critico'> = {
  BAJA: 'campo',
  MEDIA: 'alerta',
  ALTA: 'alerta',
  CRITICA: 'critico',
};

export function VisitaTimeline({ visitas, onSelect }: VisitaTimelineProps) {
  if (visitas.length === 0) {
    return (
      <p className="text-text-3 text-sm py-8 text-center">No hay visitas registradas</p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
      {visitas.map((visita) => (
        <div
          key={visita.id}
          className="relative pl-10 pb-6 reveal-card cursor-pointer group"
          onClick={() => onSelect?.(visita)}
        >
          <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-campo-500 border-2 border-surface group-hover:scale-125 transition-transform" />
          <div className="rounded-lg bg-surface border border-border p-4 hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between gap-2">
              <time className="text-xs font-mono text-text-3">{formatDate(visita.fecha)}</time>
              <Badge variant={severityVariant[visita.severidad]}>
                {SEVERIDAD_LABELS[visita.severidad]}
              </Badge>
            </div>
            <p className="text-sm font-medium text-text-1 mt-1">{visita.fenologia}</p>
            <p className="text-sm text-text-2 mt-1 line-clamp-2">{visita.observaciones}</p>
            {visita.fotosUrls[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={visita.fotosUrls[0]}
                alt=""
                className="mt-2 h-16 w-16 rounded object-cover border border-border"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
