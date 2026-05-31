'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',    label: 'Inicio',      icon: '◫' },
  { href: '/parcelas',     label: 'Lotes Clientes', icon: '⬡' },
  { href: '/marketplace',  label: 'Mercado',     icon: '🛒', highlight: true },
  { href: '/diagnostico',  label: 'Diag. IA',    icon: '◉' },
  { href: '/informes',     label: 'Informes',    icon: '▤' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-tierra-900/95 backdrop-blur-lg border-t border-tierra-800/60 safe-area-pb shadow-[0_-8px_30px_rgb(42,31,10,0.12)]">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-1 text-[10px] font-medium tracking-wide transition-all duration-300 ease-out active:scale-95',
                item.highlight
                  ? 'text-campo-300 -mt-6'
                  : active
                    ? 'text-campo-300'
                    : 'text-tierra-400 hover:text-tierra-200'
              )}
            >
              <span
                className={cn(
                  'text-xl transition-transform duration-300',
                  active && !item.highlight && 'scale-110 drop-shadow-[0_0_6px_rgba(122,184,122,0.4)]',
                  item.highlight &&
                    'flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-campo-500 to-campo-600 text-white text-2xl shadow-lg shadow-campo-500/35 glow-pulse border-2 border-tierra-900'
                )}
              >
                {item.icon}
              </span>
              {!item.highlight && (
                <span className={cn('transition-all duration-300', active ? 'font-semibold' : 'font-light')}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
