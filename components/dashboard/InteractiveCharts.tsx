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
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo, Severidad } from '@/types';

interface InteractiveChartsProps {
  cropData: { name: Cultivo; value: number }[];
  visitasData: { fecha: string | Date; severidad: Severidad }[];
}

const CULTIVO_COLORS: Record<string, string> = {
  SOYA: '#3d8b3d',      // Campo verde
  MAIZ: '#eab308',      // Amarillo dorado
  QUINUA: '#a855f7',    // Púrpura
  PAPA: '#854d0e',      // Marrón papa
  TRIGO: '#f97316',     // Naranja trigo
  GIRASOL: '#fbbf24',   // Amarillo girasol
  CITRICOS: '#22c55e',  // Verde lima
  TOMATE: '#ef4444',    // Rojo tomate
  CEBOLLA: '#ec4899',   // Rosa
  OTRO: '#6b7280',      // Gris
};

const SEVERIDAD_VALORES: Record<Severidad, number> = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 4,
};

export function InteractiveCharts({ cropData, visitasData }: InteractiveChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 h-[320px] flex items-center justify-center">
          <span className="text-text-3 animate-pulse text-sm">Cargando gráficos...</span>
        </Card>
        <Card className="lg:col-span-2 h-[320px] flex items-center justify-center">
          <span className="text-text-3 animate-pulse text-sm">Cargando distribución...</span>
        </Card>
      </div>
    );
  }

  // Procesar tendencia de severidad
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

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const severityLabels = {
        1: 'Baja 🟢',
        2: 'Media 🟡',
        3: 'Alta 🟠',
        4: 'Crítica 🔴',
      };
      return (
        <div className="rounded-lg bg-tierra-900 text-white p-3 text-xs shadow-elevated border border-tierra-800">
          <p className="font-semibold">{data.fechaFormateada}</p>
          <p className="mt-1 font-mono text-campo-300">
            Nivel: {severityLabels[data.severidadValor as keyof typeof severityLabels]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6" data-gsap="stagger">
      {/* Gráfico de Tendencia */}
      <Card interactive={false} className="lg:col-span-3 h-[320px] flex flex-col p-4">
        <CardTitle className="text-base mb-1 font-semibold flex items-center gap-2">
          <span>📈</span> Tendencia de Severidad en Visitas
        </CardTitle>
        <p className="text-xs text-text-3 mb-4">Nivel de alerta promedio registrado cronológicamente</p>
        <div className="flex-1 min-h-0 w-full">
          {trendData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-3">
              Registra visitas para ver la tendencia fitosanitaria
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8975a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b8975a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fechaFormateada"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}
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
                  tick={{ fontSize: 10, fill: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}
                />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="severidadValor"
                  stroke="#b8975a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSeverity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Gráfico de Torta */}
      <Card interactive={false} className="lg:col-span-2 h-[320px] flex flex-col p-4">
        <CardTitle className="text-base mb-1 font-semibold flex items-center gap-2">
          <span>⬡</span> Cultivos Registrados
        </CardTitle>
        <p className="text-xs text-text-3 mb-4">Proporción de parcelas activas por tipo de cultivo</p>
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          {formattedCropData.length === 0 ? (
            <div className="text-xs text-text-3">Crea parcelas para ver estadísticas</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCropData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {formattedCropData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CULTIVO_COLORS[entry.rawName] || '#6b7280'}
                      className="transition-opacity duration-300 hover:opacity-80 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value} ${value === 1 ? 'parcela' : 'parcelas'}`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    background: 'var(--color-tierra-900)',
                    border: '1px solid var(--color-tierra-800)',
                    color: 'white',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
