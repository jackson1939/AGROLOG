'use client';

import { signOut, useSession } from 'next-auth/react';
import { SyncIndicator } from '@/components/campo/SyncIndicator';
import { LogOut, Leaf } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : 'AG';

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:px-6"
      style={{
        background: 'rgba(5, 13, 7, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(74, 222, 128, 0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left: sync + Chiquitano greeting */}
      <div className="flex items-center gap-4">
        <SyncIndicator />
        {/* Bilingual Santa Cruz — Chiquitano */}
        <div className="hidden md:flex items-center gap-1.5">
          <Leaf className="w-3 h-3 text-emerald-500/60" />
          <span className="text-[9px] font-mono text-emerald-500/50 tracking-widest uppercase">
            Santa Cruz · Taperaimi
          </span>
        </div>
      </div>

      {/* Right: user pill + sign out */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3">
          {/* Avatar ring */}
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              boxShadow: '0 0 0 2px rgba(74, 222, 128, 0.2)',
            }}
          >
            {initials}
          </div>
          {/* Name + role */}
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">{session?.user?.name}</p>
            <p className="text-[9px] text-emerald-400/80 font-mono tracking-widest uppercase leading-tight">
              {session?.user?.role} · AgroLog SCZ
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200 border border-transparent hover:border-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

