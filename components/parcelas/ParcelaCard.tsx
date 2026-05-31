import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CULTIVO_LABELS } from '@/lib/utils';
import type { Parcela } from '@/types';

interface ParcelaCardProps {
  parcela: Parcela & { _count?: { visitas: number } };
}

export function ParcelaCard({ parcela }: ParcelaCardProps) {
  return (
    <Link href={`/parcelas/${parcela.id}`}>
      <Card className="reveal-card hover:shadow-elevated transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-text-1">{parcela.nombre}</h3>
              <p className="text-xs text-text-3 mt-0.5">
                {parcela.municipio}, {parcela.departamento}
              </p>
            </div>
            <Badge variant="tierra">{CULTIVO_LABELS[parcela.cultivo]}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs font-mono text-text-2">
            <span>{parcela.superficie} ha</span>
            <span className="text-[#4ade80]">👨‍🌾 {parcela.productor}</span>
            {parcela._count && <span>{parcela._count.visitas} visitas</span>}
          </div>
          {!parcela.activa && (
            <Badge variant="alerta" className="mt-2">Inactiva</Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
