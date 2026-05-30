import { getPendingQueue, markSynced } from './queue';
import type { SyncResult } from '@/types';

export async function syncQueue(): Promise<{ synced: number; results: SyncResult[] }> {
  const pending = await getPendingQueue();
  if (pending.length === 0) return { synced: 0, results: [] };

  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitas: pending }),
  });

  if (!res.ok) throw new Error('Sync failed');

  const { results } = (await res.json()) as { results: SyncResult[] };

  await Promise.all(
    results
      .filter((r) => r.status !== 'ERROR')
      .map((r) => markSynced(r.offlineId))
  );

  return {
    synced: results.filter((r) => r.status === 'CREATED').length,
    results,
  };
}
