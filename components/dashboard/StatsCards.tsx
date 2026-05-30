'use client';

import { CountUp } from '@/components/animations/CountUp';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const statItems = [
  { key: 'totalParcelas' as const, label: 'Parcelas activas' },
  { key: 'visitasMes' as const, label: 'Visitas este mes' },
  { key: 'diagnosticos' as const, label: 'Diagnósticos' },
  { key: 'informes' as const, label: 'Informes generados' },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="stagger">
      {statItems.map((item) => (
        <div key={item.key} className="rounded-lg bg-surface p-4 border border-border/50">
          <p className="text-3xl font-mono font-medium text-text-1">
            <CountUp value={stats[item.key]} />
          </p>
          <p className="text-sm font-light text-text-3 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
