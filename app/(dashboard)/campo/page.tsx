import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VisitaCard } from '@/components/campo/VisitaCard';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';
import { Button } from '@/components/ui/Button';

export default async function CampoPage() {
  const session = await auth();
  const visitas = await prisma.visita.findMany({
    where: { userId: session!.user!.id },
    include: { parcela: { select: { nombre: true, cultivo: true } } },
    orderBy: { fecha: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <h1 className="font-serif text-2xl text-text-1">Visitas de campo</h1>
          <p className="text-text-3 text-sm">{visitas.length} registros</p>
        </div>
        <Link href="/campo/nueva">
          <Button>Nueva visita</Button>
        </Link>
      </div>

      <RevealOnScroll>
        <div className="cards-container space-y-3">
          {visitas.length === 0 ? (
            <p className="text-text-3 text-sm py-8 text-center">
              No hay visitas.{' '}
              <Link href="/campo/nueva" className="text-campo-700 underline">
                Registrar primera visita
              </Link>
            </p>
          ) : (
            visitas.map((v) => <VisitaCard key={v.id} visita={v} />)
          )}
        </div>
      </RevealOnScroll>
    </div>
  );
}
