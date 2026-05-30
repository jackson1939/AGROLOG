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
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-tierra-900 text-tierra-100 min-h-screen">
      <div className="p-6 border-b border-tierra-800">
        <Link href="/dashboard" className="block">
          <h1 className="font-serif text-2xl text-tierra-50">AgroLog</h1>
          <p className="text-xs text-tierra-400 mt-1 font-sans font-light">
            Tu campo, tu historial
          </p>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors relative',
                active
                  ? 'bg-tierra-800/50 text-tierra-50'
                  : 'text-tierra-200 hover:bg-tierra-800/30 hover:text-tierra-50'
              )}
            >
              <span
                className={cn(
                  'nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-campo-500 rounded-r origin-left transition-transform duration-200',
                  active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}
              />
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-tierra-800">
        <p className="text-xs text-tierra-400 font-mono">v1.0 · Bolivia</p>
      </div>
    </aside>
  );
}
