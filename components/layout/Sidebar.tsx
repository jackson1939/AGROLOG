'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◫' },
  { href: '/campo', label: 'Campo', icon: '◎' },
  { href: '/parcelas', label: 'Parcelas', icon: '⬡' },
  { href: '/diagnostico', label: 'Diagnóstico', icon: '◉' },
  { href: '/informes', label: 'Informes', icon: '▤' },
  { href: '/configuracion', label: 'Configuración', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-tierra-900 to-tierra-950 text-tierra-100 min-h-screen border-r border-tierra-800/50 shadow-xl">
      <div className="p-6 border-b border-tierra-800/60">
        <Link href="/dashboard" className="block group">
          <h1 className="font-serif text-2xl text-tierra-50 tracking-wide transition-all duration-300 group-hover:text-campo-300">AgroLog</h1>
          <p className="text-xs text-tierra-400 mt-1 font-sans font-light tracking-wider">
            Tu campo, tu historial
          </p>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item group flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm transition-all duration-300 relative overflow-hidden',
                active
                  ? 'bg-tierra-800/65 text-tierra-50 border border-tierra-700/40 shadow-inner'
                  : 'text-tierra-200 hover:bg-tierra-800/30 hover:text-tierra-50 hover:translate-x-1'
              )}
            >
              <span
                className={cn(
                  'nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-campo-300 to-campo-500 shadow-[0_0_8px_rgba(122,184,122,0.6)] rounded-r origin-left transition-transform duration-300',
                  active ? 'scale-y-100 scale-x-100' : 'scale-y-0 scale-x-0 group-hover:scale-y-100 group-hover:scale-x-100'
                )}
              />
              <span className="text-lg opacity-85 transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-tierra-800/60 text-center">
        <p className="text-[10px] text-tierra-400 font-mono tracking-widest uppercase">v1.0 · Bolivia</p>
      </div>
    </aside>
  );
}
