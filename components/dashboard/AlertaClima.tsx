'use client';

import { AlertTriangle, Thermometer, Wind, Droplets } from 'lucide-react';
import type { ClimaAlertas } from '@/types';

interface AlertaClimaProps {
  parcelaNombre: string;
  alertas: ClimaAlertas;
  temperatura?: number;
}

export function AlertaClima({ parcelaNombre, alertas, temperatura }: AlertaClimaProps) {
  const hasAlert = alertas.helada || alertas.sequia || alertas.viento;
  if (!hasAlert) return null;

  // Pick the dominant alert type for styling
  const isCritical = alertas.helada;
  const accentColor = isCritical ? '#60a5fa' : alertas.sequia ? '#f97316' : '#fbbf24';
  const glowColor = isCritical ? 'rgba(96,165,250,0.15)' : alertas.sequia ? 'rgba(249,115,22,0.15)' : 'rgba(251,191,36,0.15)';

  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 0 30px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      data-gsap="stagger"
    >
      {/* Background ambient */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${glowColor} 0%, transparent 60%)` }}
      />

      {/* Alert icon with pulse */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
      >
        <AlertTriangle className="w-4.5 h-4.5 animate-pulse" style={{ color: accentColor }} />
      </div>

      <div className="flex-1 space-y-1.5 relative z-10">
        <p className="text-sm font-bold text-white leading-tight">{parcelaNombre}</p>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          Alerta climática · Noxemo tapera
        </p>

        {/* Alert badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {alertas.helada && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}
            >
              <Thermometer className="w-2.5 h-2.5" /> Riesgo Helada · Pixio
            </span>
          )}
          {alertas.sequia && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}
            >
              <Droplets className="w-2.5 h-2.5" /> Sequía · Nupiye
            </span>
          )}
          {alertas.viento && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
            >
              <Wind className="w-2.5 h-2.5" /> Viento Fuerte · Nuxemo
            </span>
          )}
        </div>

        {/* Recommendation */}
        <p className="text-[10px] text-slate-400 leading-snug pt-0.5">
          {alertas.helada && 'Evalúe cobertura térmica o riego por aspersión nocturno.'}
          {alertas.sequia && 'Optimice la frecuencia de riego y conserve la humedad del suelo.'}
          {alertas.viento && 'Postergue las aplicaciones foliares o pulverizaciones hasta calmar.'}
        </p>

        {temperatura !== undefined && (
          <p className="text-[9px] font-mono text-slate-600">
            Temp. actual: <span style={{ color: accentColor }}>{temperatura}°C</span>
          </p>
        )}
      </div>
    </div>
  );
}
