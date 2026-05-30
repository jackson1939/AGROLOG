import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ParcelaMap } from '@/components/parcelas/ParcelaMap';
import { VisitaCard } from '@/components/campo/VisitaCard';
import { Badge } from '@/components/ui/Badge';
import { CULTIVO_LABELS } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default async function ParcelaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const parcela = await prisma.parcela.findFirst({
    where: { id: params.id, userId: session!.user!.id },
    include: {
      visitas: {
        orderBy: { fecha: 'desc' },
        take: 5,
        include: { parcela: { select: { nombre: true, cultivo: true } } },
      },
    },
  });

  if (!parcela) notFound();

  return (
    <div className="space-y-6">
      <div data-gsap="stagger">
        <Link href="/parcelas" className="text-sm text-campo-700 hover:underline">
          ← Parcelas
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="font-serif text-2xl text-text-1">{parcela.nombre}</h1>
            <p className="text-text-3 text-sm">
              {parcela.municipio}, {parcela.departamento}
            </p>
          </div>
          <Badge variant="tierra">{CULTIVO_LABELS[parcela.cultivo]}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ParcelaMap parcelas={[parcela]} center={[parcela.lat, parcela.lng]} zoom={14} />
        <div className="space-y-3 font-mono text-sm text-text-2" data-gsap="stagger">
          <p>Superficie: {parcela.superficie} ha</p>
          <p>Productor: {parcela.productor}</p>
          <p>Coords: {parcela.lat.toFixed(4)}, {parcela.lng.toFixed(4)}</p>
          <Link href={`/parcelas/${parcela.id}/bitacora`}>
            <Button variant="secondary">Ver bitácora</Button>
          </Link>
        </div>
      </div>

      <div data-gsap="stagger">
        <h2 className="font-serif text-lg mb-3">Visitas recientes</h2>
        <div className="space-y-3">
          {parcela.visitas.map((v) => (
            <VisitaCard key={v.id} visita={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
