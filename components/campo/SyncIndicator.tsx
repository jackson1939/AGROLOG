'use client';

import { useEffect } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { useSyncStore } from '@/store/useSyncStore';
import { getQueueCount } from '@/lib/offline/queue';
import { syncQueue } from '@/lib/offline/sync';
import { useOffline } from '@/hooks/useOffline';
import { toast } from 'sonner';

export function SyncIndicator() {
  const { pendingCount, syncing, setPendingCount, setSyncing } = useSyncStore();
  const { isOnline } = useOffline();

  useEffect(() => {
    getQueueCount().then(setPendingCount);
  }, [setPendingCount]);

  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;

    const doSync = async () => {
      setSyncing(true);
      try {
        const { synced } = await syncQueue();
        if (synced > 0) {
          toast.success(`${synced} visita(s) sincronizada(s)`);
        }
        const count = await getQueueCount();
        setPendingCount(count);
      } catch {
        toast.error('Error al sincronizar');
      } finally {
        setSyncing(false);
      }
    };

    doSync();
  }, [isOnline, pendingCount, setPendingCount, setSyncing]);

  useGSAP(
    () => {
      if (pendingCount > 0) {
        const tl = gsap.timeline({ repeat: -1 });
        tl.to('.sync-dot', {
          scale: 1.4,
          opacity: 0.6,
          duration: 0.8,
          ease: 'power1.inOut',
        }).to('.sync-dot', {
          scale: 1,
          opacity: 1,
          duration: 0.8,
        });
      }
    },
    { dependencies: [pendingCount] }
  );

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-tierra-400/20 px-3 py-1.5 text-xs text-tierra-800">
        <span className="sync-dot h-2 w-2 rounded-full bg-tierra-600" />
        Modo campo — sincronizando al conectar
      </div>
    );
  }

  if (pendingCount === 0 && !syncing) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-campo-100 px-3 py-1.5 text-xs text-campo-700">
      <span className="sync-dot h-2 w-2 rounded-full bg-campo-500" />
      {syncing
        ? 'Sincronizando...'
        : `${pendingCount} pendiente(s) de sync`}
    </div>
  );
}
