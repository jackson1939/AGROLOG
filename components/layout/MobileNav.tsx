'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '◫' },
  { href: '/campo', label: 'Campo', icon: '◎' },
  { href: '/campo/nueva', label: 'Nueva', icon: '+', highlight: true },
  { href: '/parcelas', label: 'Parcelas', icon: '⬡' },
  { href: '/diagnostico', label: 'Diag.', icon: '◉' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-tierra-900 border-t border-tierra-800 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                item.highlight
                  ? 'text-campo-300 -mt-4'
                  : active
                    ? 'text-campo-300'
                    : 'text-tierra-400'
              )}
            >
              <span
                className={cn(
                  'text-lg',
                  item.highlight &&
                    'flex h-12 w-12 items-center justify-center rounded-full bg-campo-500 text-white text-2xl shadow-elevated'
                )}
              >
                {item.icon}
              </span>
              {!item.highlight && item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
