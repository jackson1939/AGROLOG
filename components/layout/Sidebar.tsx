'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MapPin, ScanLine, ShoppingBag, FileText } from 'lucide-react';

// ─── Flujo exacto del modelo de negocio AgroLog ───
// 1. Dashboard → resumen de campo
// 2. Mis Lotes  → gestión de parcelas activas
// 3. Diagnóstico IA → foto foliar + Gemini Vision
// 4. Marketplace → adquisición directa de insumos (monetización 3.5%)
// 5. Informes → reportes PDF para cooperativas y exportación

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, badge: null },
  { href: '/parcelas', label: 'Lotes de Clientes', icon: MapPin, badge: null },
  { href: '/diagnostico', label: 'Diagnóstico IA', icon: ScanLine, badge: 'GEMINI' },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, badge: '3.5%', highlight: true },
  { href: '/informes', label: 'Informes PDF', icon: FileText, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-[#0d1a0f] to-[#060d07] text-tierra-100 min-h-screen border-r border-white/5 shadow-2xl">
      {/* Brand header */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4ade80] to-[#16a34a] flex items-center justify-center text-sm shadow-lg shadow-[#16a34a]/20">
              🌾
            </div>
            <div>
              <h1 className="font-serif text-xl text-white tracking-wide transition-all duration-300 group-hover:text-[#4ade80]">
                Agro<span className="text-[#4ade80]">Log</span>
              </h1>
              <p className="text-[9px] text-emerald-500/60 font-mono tracking-widest uppercase">v2.0 · Bolivia</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── Flujo del modelo de negocio ─── */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[9px] font-mono text-emerald-500/40 tracking-widest uppercase px-2 mb-2">Flujo de trabajo</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden',
                item.highlight
                  ? active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                  : active
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Step number */}
              <span className={cn(
                'text-[9px] font-mono font-black w-4 text-center shrink-0',
                item.highlight ? 'text-emerald-300' : active ? 'text-[#4ade80]' : 'text-slate-600'
              )}>
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Icon */}
              <Icon className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110',
                item.highlight ? (active ? 'text-white' : 'text-emerald-400') : active ? 'text-[#4ade80]' : 'text-slate-500'
              )} />

              {/* Label */}
              <span className="flex-1 tracking-wide text-[13px] font-medium">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className={cn(
                  'text-[8px] font-mono font-black px-1.5 py-0.5 rounded tracking-wider',
                  item.highlight
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/20'
                    : 'bg-white/5 text-slate-500 border border-white/5'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Commission indicator at bottom */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
          <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">Modelo de ingreso</p>
          <p className="text-xs text-emerald-300 font-bold font-mono mt-0.5">3.5% por transacción</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Mediación de insumos · SCZ</p>
        </div>
      </div>
    </aside>
  );
}
