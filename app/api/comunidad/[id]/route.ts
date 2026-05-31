import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const post = await prisma.difusionPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    // Allow deletion strictly for ADMIN role only
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Solo el administrador central puede eliminar reportes.' }, { status: 403 });
    }

    await prisma.difusionPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Publicación eliminada correctamente' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar la publicación';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
