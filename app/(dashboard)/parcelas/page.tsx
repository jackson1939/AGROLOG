import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ParcelaCard } from '@/components/parcelas/ParcelaCard';
import { ParcelaMap } from '@/components/parcelas/ParcelaMap';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';
import { Button } from '@/components/ui/Button';

export default async function ParcelasPage() {
  const session = await auth();
  const parcelas = await prisma.parcela.findMany({
    where: { userId: session!.user!.id },
    include: { _count: { select: { visitas: true } } },
    orderBy: { nombre: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <h1 className="font-serif text-2xl text-text-1">Parcelas</h1>
          <p className="text-text-3 text-sm">{parcelas.length} registradas</p>
        </div>
        <Link href="/parcelas/nueva">
          <Button>Nueva parcela</Button>
        </Link>
      </div>

      <div data-gsap="stagger">
        <ParcelaMap parcelas={parcelas} height="350px" />
      </div>

      <RevealOnScroll>
        <div className="cards-container grid sm:grid-cols-2 gap-4">
          {parcelas.map((p) => (
            <ParcelaCard key={p.id} parcela={p} />
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
