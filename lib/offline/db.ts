import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { VisitaLocal } from '@/types';

interface AgroLogDB extends DBSchema {
  visitas_queue: {
    key: string;
    value: VisitaLocal;
  };
  parcelas_cache: {
    key: string;
    value: Record<string, unknown> & { id: string; updatedAt?: string };
    indexes: { 'by-updated': string };
  };
  diagnosticos_cache: {
    key: string;
    value: Record<string, unknown> & { id: string };
  };
}

let dbPromise: Promise<IDBPDatabase<AgroLogDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<AgroLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AgroLogDB>('agrolog-v1', 1, {
      upgrade(db) {
        db.createObjectStore('visitas_queue', { keyPath: 'offlineId' });
        const parcelas = db.createObjectStore('parcelas_cache', {
          keyPath: 'id',
        });
        parcelas.createIndex('by-updated', 'updatedAt');
        db.createObjectStore('diagnosticos_cache', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
