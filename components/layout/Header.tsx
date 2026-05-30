'use client';

import { signOut, useSession } from 'next-auth/react';
import { SyncIndicator } from '@/components/campo/SyncIndicator';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-surface/75 backdrop-blur-md px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SyncIndicator />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-text-1">{session?.user?.name}</p>
          <p className="text-[10px] text-text-3 font-mono tracking-wider uppercase">{session?.user?.role}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
          Salir
        </Button>
      </div>
    </header>
  );
}
