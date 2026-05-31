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

    // Allow deletion only if the user is an ADMIN or if the post belongs to the logged-in user
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = post.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden. No tienes permisos para eliminar este reporte.' }, { status: 403 });
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
