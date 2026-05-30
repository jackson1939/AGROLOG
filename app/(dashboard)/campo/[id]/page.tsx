import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, SEVERIDAD_LABELS, CULTIVO_LABELS } from '@/lib/utils';
import type { Severidad } from '@/types';

const severityVariant: Record<Severidad, 'campo' | 'alerta' | 'critico'> = {
  BAJA: 'campo',
  MEDIA: 'alerta',
  ALTA: 'alerta',
  CRITICA: 'critico',
};

export default async function VisitaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const visita = await prisma.visita.findFirst({
    where: { id: params.id, userId: session!.user!.id },
    include: { parcela: true, diagnostico: true },
  });

  if (!visita) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div data-gsap="stagger">
        <Link href="/campo" className="text-sm text-campo-700 hover:underline">
          ← Volver a visitas
        </Link>
        <h1 className="font-serif text-2xl text-text-1 mt-2">
          {visita.parcela.nombre}
        </h1>
        <p className="text-text-3 font-mono text-sm">
          {formatDate(visita.fecha)} · {visita.fenologia}
        </p>
      </div>

      <Card severity={visita.severidad} data-gsap="stagger">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={severityVariant[visita.severidad]}>
              {SEVERIDAD_LABELS[visita.severidad]}
            </Badge>
            <Badge variant="tierra">
              {CULTIVO_LABELS[visita.parcela.cultivo]}
            </Badge>
          </div>
          <div>
            <CardTitle className="text-base mb-1">Observaciones</CardTitle>
            <p className="text-text-2">{visita.observaciones}</p>
          </div>
          {visita.recomendacion && (
            <div>
              <CardTitle className="text-base mb-1">Recomendación</CardTitle>
              <p className="text-text-2">{visita.recomendacion}</p>
            </div>
          )}
          {visita.fotosUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visita.fotosUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-32 w-32 rounded-lg object-cover border border-border"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
