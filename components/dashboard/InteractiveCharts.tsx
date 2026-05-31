'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo, Severidad } from '@/types';

interface InteractiveChartsProps {
  cropData: { name: Cultivo; value: number }[];
  visitasData: { fecha: string | Date; severidad: Severidad }[];
}

const CULTIVO_COLORS: Record<string, string> = {
  SOYA: '#4ade80',
  MAIZ: '#fbbf24',
  QUINUA: '#c084fc',
  PAPA: '#f97316',
  TRIGO: '#f59e0b',
  GIRASOL: '#facc15',
  CITRICOS: '#34d399',
  TOMATE: '#f87171',
  CEBOLLA: '#fb7185',
  OTRO: '#64748b',
};

const SEVERIDAD_VALORES: Record<Severidad, number> = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 4,
};

const glassPanelStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(74, 222, 128, 0.1)',
  boxShadow: '0 0 40px rgba(74, 222, 128, 0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
};

export function InteractiveCharts({ cropData, visitasData }: InteractiveChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid lg:grid-cols-5 gap-6">
        {[3, 2].map((span, i) => (
          <div
            key={i}
            className={`lg:col-span-${span} h-[320px] rounded-2xl flex items-center justify-center`}
            style={glassPanelStyle}
          >
            <span className="text-emerald-500/40 animate-pulse text-sm font-mono">cargando · tapera...</span>
          </div>
        ))}
      </div>
    );
  }

  const trendData = visitasData.map((v) => {
    const d = new Date(v.fecha);
    return {
      fechaFormateada: d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }),
      severidadValor: SEVERIDAD_VALORES[v.severidad],
      severidadLabel: v.severidad,
    };
  });

  const formattedCropData = cropData.map((c) => ({
    name: CULTIVO_LABELS[c.name] || c.name,
    rawName: c.name,
    value: c.value,
  }));

  // Chiquitano severity labels: bésiro language approximate translations
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const severityLabels: Record<number, string> = {
        1: 'Baja · Nopino 🟢',
        2: 'Media · Nopemo 🟡',
        3: 'Alta · Noxemo 🟠',
        4: 'Crítica · Noxikimo 🔴',
      };
      return (
        <div
          className="rounded-xl p-3 text-xs shadow-2xl"
          style={{
            background: 'rgba(5,13,7,0.95)',
            border: '1px solid rgba(74,222,128,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="font-bold text-white mb-1">{data.fechaFormateada}</p>
          <p className="font-mono text-emerald-400">
            {severityLabels[data.severidadValor as keyof typeof severityLabels]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6" data-gsap="stagger">
      {/* Severity Trend Chart */}
      <div
        className="lg:col-span-3 h-[320px] flex flex-col p-5 rounded-2xl relative overflow-hidden"
        style={glassPanelStyle}
      >
        {/* Ambient decoration */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Tendencia Fitosanitaria</h3>
            <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">
              Nixemo · Nivel de Severidad · SCZ
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-4">Evolución cronológica de alertas en lotes de clientes</p>

        <div className="flex-1 min-h-0 w-full">
          {trendData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-emerald-500/20" />
              <span className="text-xs text-slate-500 font-mono">Registra visitas para ver la tendencia</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSeverityDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fechaFormateada"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: '#4b5563', fontFamily: 'var(--font-mono)' }}
                />
                <YAxis
                  domain={[1, 4]}
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(val) => {
                    if (val === 1) return 'Baja';
                    if (val === 2) return 'Med';
                    if (val === 3) return 'Alta';
                    if (val === 4) return 'Crit';
                    return '';
                  }}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: '#4b5563', fontFamily: 'var(--font-mono)' }}
                />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="severidadValor"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSeverityDark)"
                  dot={{ fill: '#4ade80', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#4ade80', r: 5, strokeWidth: 0, filter: 'drop-shadow(0 0 6px #4ade80)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Crop Distribution Pie */}
      <div
        className="lg:col-span-2 h-[320px] flex flex-col p-5 rounded-2xl relative overflow-hidden"
        style={glassPanelStyle}
      >
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Cultivos en SCZ</h3>
            <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">
              Tapera · Distribución activa
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Proporción por tipo de cultivo en parcelas administradas</p>

        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          {formattedCropData.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <Layers className="w-8 h-8 text-emerald-500/20" />
              <span className="text-xs text-slate-500 font-mono">Crea lotes para ver estadísticas</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCropData}
                  cx="50%"
                  cy="43%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {formattedCropData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CULTIVO_COLORS[entry.rawName] || '#64748b'}
                      opacity={0.85}
                      className="transition-opacity duration-300 hover:opacity-100 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value} ${value === 1 ? 'parcela' : 'parcelas'}`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    background: 'rgba(5,13,7,0.95)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    color: 'white',
                    fontSize: '11px',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
