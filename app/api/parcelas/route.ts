import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parcelaSchema } from '@/lib/validations/parcela.schema';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parcelas = await prisma.parcela.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { visitas: true } } },
    orderBy: { nombre: 'asc' },
  });

  return NextResponse.json(parcelas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = parcelaSchema.parse(body);

    const parcela = await prisma.parcela.create({
      data: {
        ...parsed,
        userId: session.user.id,
      },
    });

    return NextResponse.json(parcela, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear parcela';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
