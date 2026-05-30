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
    <div className="rounded-xl border border-amber-300/40 bg-amber-50/70 backdrop-blur-sm p-4 shadow-sm flex items-start gap-3" data-gsap="stagger">
      <span className="text-2xl text-alerta-600 animate-pulse">⚠️</span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-text-1">{parcelaNombre}</p>
        <div className="flex flex-wrap gap-1.5">
          {alertas.helada && <Badge variant="alerta">❄️ Riesgo Helada</Badge>}
          {alertas.sequia && <Badge variant="alerta">🔥 Sequía</Badge>}
          {alertas.viento && <Badge variant="alerta">💨 Viento Fuerte</Badge>}
        </div>
        <p className="text-xs text-text-2 mt-1">
          {alertas.helada && "Sugerencia: Evalúe el uso de riego por aspersión o coberturas térmicas."}
          {alertas.sequia && "Sugerencia: Optimice la frecuencia de riego y conserve humedad."}
          {alertas.viento && "Sugerencia: Postergar aplicaciones foliares o pulverizaciones."}
        </p>
        {temperatura !== undefined && (
          <p className="text-[10px] font-mono text-text-3 mt-1">Temp. actual: {temperatura}°C</p>
        )}
      </div>
    </div>
  );
}
