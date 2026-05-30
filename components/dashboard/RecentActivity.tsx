import Link from 'next/link';
import { VisitaCard } from '@/components/campo/VisitaCard';

interface RecentActivityProps {
  visitas: {
    id: string;
    fecha: Date | string;
    fenologia: string;
    observaciones: string;
    fotosUrls: string[];
    severidad: import('@/types').Severidad;
    parcela?: { nombre: string; cultivo: string };
  }[];
}

export function RecentActivity({ visitas }: RecentActivityProps) {
  return (
    <div data-gsap="stagger">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-text-1">Actividad reciente</h2>
        <Link href="/campo" className="text-sm text-campo-700 hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="cards-container space-y-3">
        {visitas.length === 0 ? (
          <p className="text-text-3 text-sm">No hay visitas recientes</p>
        ) : (
          visitas.map((v) => <VisitaCard key={v.id} visita={v} />)
        )}
      </div>
    </div>
  );
}
