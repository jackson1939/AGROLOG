'use client';

import { Badge } from '@/components/ui/Badge';
import type { ClimaAlertas } from '@/types';

interface AlertaClimaProps {
  parcelaNombre: string;
  alertas: ClimaAlertas;
  temperatura?: number;
}

export function AlertaClima({ parcelaNombre, alertas, temperatura }: AlertaClimaProps) {
  const hasAlert = alertas.helada || alertas.sequia || alertas.viento;
  if (!hasAlert) return null;

  return (
    <div className="rounded-lg border border-alerta-400/30 bg-amber-50/50 p-3" data-gsap="stagger">
      <p className="text-sm font-medium text-text-1">{parcelaNombre}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {alertas.helada && <Badge variant="alerta">Riesgo helada</Badge>}
        {alertas.sequia && <Badge variant="alerta">Sequía</Badge>}
        {alertas.viento && <Badge variant="alerta">Viento fuerte</Badge>}
      </div>
      {temperatura !== undefined && (
        <p className="text-xs font-mono text-text-3 mt-1">{temperatura}°C actual</p>
      )}
    </div>
  );
}
