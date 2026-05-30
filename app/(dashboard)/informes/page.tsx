import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default async function InformesPage() {
  const session = await auth();
  const informes = await prisma.informe.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <h1 className="font-serif text-2xl text-text-1">Informes</h1>
          <p className="text-text-3 text-sm">{informes.length} generados</p>
        </div>
        <Link href="/informes/nuevo">
          <Button>Nuevo informe</Button>
        </Link>
      </div>

      <div className="space-y-3 cards-container">
        {informes.length === 0 ? (
          <p className="text-text-3 text-sm text-center py-8">
            No hay informes generados
          </p>
        ) : (
          informes.map((inf) => (
            <div
              key={inf.id}
              className="reveal-card rounded-lg border border-border bg-surface p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-serif text-lg text-text-1">{inf.titulo}</h3>
                <p className="text-xs font-mono text-text-3">
                  {inf.periodo} · {inf.tipo} · {formatDate(inf.createdAt)}
                </p>
              </div>
              {inf.pdfUrl && (
                <a
                  href={inf.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-campo-700 hover:underline"
                >
                  Descargar
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
