import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { visitaSchema } from '@/lib/validations/visita.schema';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const visitas = await prisma.visita.findMany({
    where: { userId: session.user.id },
    include: {
      parcela: { select: { nombre: true, cultivo: true } },
      diagnostico: true,
    },
    orderBy: { fecha: 'desc' },
  });

  return NextResponse.json(visitas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = visitaSchema.parse(body);

    const visita = await prisma.visita.create({
      data: {
        ...parsed,
        fecha: new Date(parsed.fecha),
        fotosUrls: parsed.fotosUrls ?? [],
        userId: session.user.id,
        syncedAt: new Date(),
      },
      include: { parcela: true },
    });

    return NextResponse.json(visita, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear visita';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
