'use client';

import { CountUp } from '@/components/animations/CountUp';
import { MapPin, Activity, Scan, FileCheck } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { useLanguage } from '@/lib/language';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useLanguage();

  const statItems = [
    {
      key: 'totalParcelas' as const,
      label: t('totalLotes', 'dashboard'),
      sublabel: t('underCare', 'dashboard'),
      icon: MapPin,
      color: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.15)',
      border: 'rgba(74, 222, 128, 0.2)',
      unit: 'lotes',
    },
    {
      key: 'visitasMes' as const,
      label: t('recentVisits', 'dashboard'),
      sublabel: t('totalVisits', 'dashboard'),
      icon: Activity,
      color: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.12)',
      border: 'rgba(96, 165, 250, 0.18)',
      unit: 'visitas',
    },
    {
      key: 'diagnosticos' as const,
      label: t('diagnosticos', 'dashboard'),
      sublabel: t('iaDetections', 'dashboard'),
      icon: Scan,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.18)',
      unit: 'análisis',
    },
    {
      key: 'informes' as const,
      label: t('informes', 'sidebar'),
      sublabel: 'PDF Cooperativas',
      icon: FileCheck,
      color: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.12)',
      border: 'rgba(167, 139, 250, 0.18)',
      unit: 'informes',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="stagger">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="relative rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.border}`,
              boxShadow: `0 0 30px ${item.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Ambient glow background */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at top left, ${item.glow} 0%, transparent 70%)` }}
            />

            {/* Icon badge */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
            >
              <Icon style={{ color: item.color }} className="w-4.5 h-4.5" />
            </div>

            {/* Value */}
            <p className="text-3xl font-mono font-black text-white leading-none mb-1">
              <CountUp value={stats[item.key]} />
            </p>

            {/* Label */}
            <p className="text-sm font-medium text-slate-300 leading-tight">{item.label}</p>
            <p className="text-[9px] font-mono mt-0.5" style={{ color: `${item.color}99` }}>
              {item.sublabel}
            </p>

            {/* Bottom shimmer line */}
            <div
              className="absolute bottom-0 left-4 right-4 h-[1px] opacity-40"
              style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
            />
          </div>
        );
      })}
    </div>
  );
}

