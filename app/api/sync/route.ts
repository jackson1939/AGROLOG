import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { OfflineVisita, SyncResult } from '@/types';
import { Severidad } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { visitas } = (await req.json()) as { visitas: OfflineVisita[] };

  const results: SyncResult[] = await Promise.all(
    visitas.map(async (v) => {
      try {
        const existing = await prisma.visita.findUnique({
          where: { offlineId: v.offlineId },
        });
        if (existing) {
          return { id: existing.id, offlineId: v.offlineId, status: 'SKIPPED' as const };
        }

        const created = await prisma.visita.create({
          data: {
            offlineId: v.offlineId,
            parcelaId: v.parcelaId,
            fecha: new Date(v.fecha),
            fenologia: v.fenologia,
            observaciones: v.observaciones,
            severidad: (v.severidad as Severidad) ?? 'BAJA',
            fotosUrls: [],
            recomendacion: v.recomendacion,
            userId: session.user!.id,
            syncedAt: new Date(),
          },
        });

        return { id: created.id, offlineId: v.offlineId, status: 'CREATED' as const };
      } catch (err) {
        return {
          offlineId: v.offlineId,
          status: 'ERROR' as const,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    })
  );

  return NextResponse.json({ results });
}
