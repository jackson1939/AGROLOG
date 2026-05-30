import { getDB } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { VisitaLocal } from '@/types';

export async function addToQueue(
  visita: Omit<VisitaLocal, 'offlineId' | 'synced' | 'createdAt'>
): Promise<string> {
  const db = await getDB();
  const item: VisitaLocal = {
    ...visita,
    offlineId: uuidv4(),
    synced: false,
    createdAt: new Date().toISOString(),
  };
  await db.put('visitas_queue', item);
  return item.offlineId;
}

export async function getPendingQueue(): Promise<VisitaLocal[]> {
  const db = await getDB();
  const all = await db.getAll('visitas_queue');
  return all.filter((v) => !v.synced);
}

export async function markSynced(offlineId: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('visitas_queue', offlineId);
  if (item) await db.put('visitas_queue', { ...item, synced: true });
}

export async function getQueueCount(): Promise<number> {
  const pending = await getPendingQueue();
  return pending.length;
}
