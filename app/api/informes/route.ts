import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReportBuffer } from '@/lib/pdf/generateReport';
import { put } from '@vercel/blob';
import { TipoInforme } from '@prisma/client';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const informes = await prisma.informe.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(informes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { titulo, periodo, tipo, visitasIds } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const visitas = await prisma.visita.findMany({
      where: {
        id: { in: visitasIds },
        userId: session.user.id,
      },
      include: { parcela: true },
    });

    const pdfBuffer = await generateReportBuffer({
      titulo,
      periodo,
      agronomo: user?.name ?? 'Agrónomo',
      organizacion: user?.organizacion ?? undefined,
      visitas,
    });

    let pdfUrl = '';
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`informes/${Date.now()}-${titulo}.pdf`, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });
      pdfUrl = blob.url;
    }

    const informe = await prisma.informe.create({
      data: {
        titulo,
        periodo,
        tipo: tipo as TipoInforme,
        pdfUrl: pdfUrl || null,
        visitasIds,
        metadata: {
          totalVisitas: visitas.length,
          agronomo: user?.name,
        },
        userId: session.user.id,
      },
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 201,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${titulo}.pdf"`,
        'X-Informe-Id': informe.id,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar informe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
