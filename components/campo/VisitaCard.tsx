import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, SEVERIDAD_LABELS, CULTIVO_LABELS } from '@/lib/utils';
import type { Severidad } from '@/types';

interface VisitaCardProps {
  visita: {
    id: string;
    fecha: Date | string;
    fenologia: string;
    observaciones: string;
    fotosUrls: string[];
    severidad: Severidad;
    parcela?: { nombre: string; cultivo: string };
  };
}

const severityVariant: Record<Severidad, 'campo' | 'alerta' | 'critico'> = {
  BAJA: 'campo',
  MEDIA: 'alerta',
  ALTA: 'alerta',
  CRITICA: 'critico',
};

export function VisitaCard({ visita }: VisitaCardProps) {
  return (
    <Link href={`/campo/${visita.id}`}>
      <Card severity={visita.severidad} className="reveal-card hover:shadow-elevated transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-serif text-text-1">
                {visita.parcela?.nombre ?? 'Parcela'}
              </p>
              <p className="text-xs text-text-3 font-mono mt-0.5">
                {formatDate(visita.fecha)} · {visita.fenologia}
              </p>
            </div>
            <Badge variant={severityVariant[visita.severidad]}>
              {SEVERIDAD_LABELS[visita.severidad]}
            </Badge>
          </div>
          {visita.parcela?.cultivo && (
            <Badge variant="tierra" className="mt-2">
              {CULTIVO_LABELS[visita.parcela.cultivo] ?? visita.parcela.cultivo}
            </Badge>
          )}
          <p className="text-sm text-text-2 mt-2 line-clamp-2">{visita.observaciones}</p>
          {visita.fotosUrls.length > 0 && (
            <div className="flex gap-1 mt-3">
              {visita.fotosUrls.slice(0, 3).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-12 w-12 rounded object-cover border border-border"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
