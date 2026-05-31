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
    <div className="space-y-2">
      {visitas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-2xl opacity-20">🌾</span>
          <p className="text-slate-500 text-sm font-mono">No hay visitas recientes</p>
          <p className="text-[10px] text-slate-600 font-mono">Nopeyatime pikio</p>
        </div>
      ) : (
        visitas.map((v) => <VisitaCard key={v.id} visita={v} />)
      )}
    </div>
  );
}
