import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ParcelaCard } from '@/components/parcelas/ParcelaCard';
import { ParcelaMap } from '@/components/parcelas/ParcelaMap';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';
import { Button } from '@/components/ui/Button';

export default async function ParcelasPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const parcelas = await prisma.parcela.findMany({
    where: isAdmin ? {} : { userId: session!.user!.id },
    include: { _count: { select: { visitas: true } } },
    orderBy: { nombre: 'asc' },
  });

  const title = isAdmin ? 'Lotes de Productores' : 'Mis Parcelas';
  const subtitle = isAdmin
    ? `Gestión fitosanitaria de parcelas activas en Santa Cruz · ${parcelas.length} registradas`
    : `Tus parcelas activas registradas en el sistema · ${parcelas.length} en total`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <h1 className="font-serif text-2xl text-white">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        {!isAdmin && (
          <Link href="/parcelas/nueva">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/20">Nuevo lote</Button>
          </Link>
        )}
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
