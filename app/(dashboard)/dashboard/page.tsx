import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AlertaClima } from '@/components/dashboard/AlertaClima';
import { ParcelaMap } from '@/components/parcelas/ParcelaMap';
import { Button } from '@/components/ui/Button';
import { fetchClima } from '@/lib/clima';
import { startOfMonth } from 'date-fns';
import { InteractiveCharts } from '@/components/dashboard/InteractiveCharts';

async function getDashboardData(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [parcelas, visitasMes, diagnosticos, informes, recentVisitas, visitasTrend] =
    await Promise.all([
      prisma.parcela.count({ where: { userId, activa: true } }),
      prisma.visita.count({
        where: { userId, fecha: { gte: monthStart } },
      }),
      prisma.diagnostico.count(),
      prisma.informe.count({ where: { userId } }),
      prisma.visita.findMany({
        where: { userId },
        include: { parcela: { select: { nombre: true, cultivo: true } } },
        orderBy: { fecha: 'desc' },
        take: 5,
      }),
      prisma.visita.findMany({
        where: { userId },
        select: { fecha: true, severidad: true },
        orderBy: { fecha: 'asc' },
        take: 15,
      }),
    ]);

  const parcelasActivas = await prisma.parcela.findMany({
    where: { userId, activa: true },
    take: 5,
  });

  const alertasClima = await Promise.allSettled(
    parcelasActivas.map(async (p) => {
      const clima = await fetchClima(p.lat, p.lng);
      return {
        parcela: p.nombre,
        alertas: clima.alertas,
        temperatura: clima.current.temperature,
      };
    })
  );

  const alertas = alertasClima
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<{ parcela: string; alertas: { helada: boolean; sequia: boolean; viento: boolean }; temperatura: number }>).value)
    .filter(
      (a) => a.alertas.helada || a.alertas.sequia || a.alertas.viento
    );

  const allParcelas = await prisma.parcela.findMany({
    where: { userId, activa: true },
  });

  return {
    stats: {
      totalParcelas: parcelas,
      visitasMes,
      diagnosticos,
      informes,
    },
    recentVisitas,
    alertas,
    allParcelas,
    visitasTrend: visitasTrend.map((v) => ({
      fecha: v.fecha.toISOString(),
      severidad: v.severidad,
    })),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user!.id);

  const cropCounts = data.allParcelas.reduce((acc, p) => {
    acc[p.cultivo] = (acc[p.cultivo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cropData = Object.entries(cropCounts).map(([cultivo, count]) => ({
    name: cultivo as any,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-text-1">
            Hola, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-text-3 text-sm mt-1">Resumen de campo</p>
        </div>
        <Link href="/campo/nueva" className="hidden sm:block">
          <Button>Nueva visita</Button>
        </Link>
      </div>

      <StatsCards stats={data.stats} />

      <InteractiveCharts cropData={cropData} visitasData={data.visitasTrend} />

      {data.alertas.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-serif text-lg text-text-1" data-gsap="stagger">
            Alertas climáticas
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.alertas.map((a) => (
              <AlertaClima
                key={a.parcela}
                parcelaNombre={a.parcela}
                alertas={a.alertas}
                temperatura={a.temperatura}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivity visitas={data.recentVisitas} />
        <div data-gsap="stagger">
          <h2 className="font-serif text-xl text-text-1 mb-4">Mapa de parcelas</h2>
          <ParcelaMap parcelas={data.allParcelas} height="300px" />
        </div>
      </div>

      <Link
        href="/campo/nueva"
        className="sm:hidden fixed bottom-20 right-4 z-40"
      >
        <Button size="lg" className="rounded-full shadow-elevated">
          + Nueva visita
        </Button>
      </Link>
    </div>
  );
}
