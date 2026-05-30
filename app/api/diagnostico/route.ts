import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeImage } from '@/lib/gemini';
import { put } from '@vercel/blob';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const foto = formData.get('foto') as File;
    const cultivo = formData.get('cultivo') as string;

    if (!foto || !cultivo) {
      return NextResponse.json({ error: 'Foto y cultivo requeridos' }, { status: 400 });
    }

    const bytes = await foto.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const diagnostico = await analyzeImage(base64, foto.type, cultivo);

    let fotoUrl = '';
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`diagnosticos/${Date.now()}-${foto.name}`, foto, {
        access: 'public',
      });
      fotoUrl = blob.url;
    }

    const saved = await prisma.diagnostico.create({
      data: {
        fotoUrl,
        hipotesis: diagnostico.hipotesis as unknown as Prisma.InputJsonValue,
        modelVersion: 'gemini-1.5-flash',
      },
    });

    return NextResponse.json({ diagnostico, id: saved.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error en diagnóstico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
