import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AlertaClima } from '@/components/dashboard/AlertaClima';
import { ParcelaMap } from '@/components/parcelas/ParcelaMap';
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
      {/* ── Header greeting ── */}
      <div className="flex items-center justify-between" data-gsap="stagger">
        <div>
          <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest mb-1">
            Nimopaite · Bienvenido al Panel
          </p>
          <h1 className="font-serif text-2xl lg:text-3xl text-white">
            Hola, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Panel de gestión agronómica · <span className="text-emerald-400/70">Santa Cruz, Bolivia</span>
          </p>
        </div>
        <a
          href="/campo/nueva"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #4ade80, #16a34a)',
            boxShadow: '0 4px 16px rgba(74,222,128,0.25)',
          }}
        >
          + Nueva visita
        </a>
      </div>

      {/* ── KPI Stats ── */}
      <StatsCards stats={data.stats} />

      {/* ── Charts ── */}
      <InteractiveCharts cropData={cropData} visitasData={data.visitasTrend} />

      {/* ── Climate alerts ── */}
      {data.alertas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg text-white" data-gsap="stagger">
              Alertas Climáticas
            </h2>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">· Noxemo tapera</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
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

      {/* ── Activity + Map ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(74, 222, 128, 0.1)',
            boxShadow: '0 0 40px rgba(74, 222, 128, 0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="font-serif text-lg text-white">Actividad Reciente</h2>
              <p className="text-[9px] font-mono text-emerald-500/50 uppercase tracking-widest">Nopeyatime · Últimas visitas</p>
            </div>
            <a href="/campo" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="relative z-10">
            <RecentActivity visitas={data.recentVisitas} />
          </div>
        </div>

        {/* Map panel */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(74, 222, 128, 0.1)',
            boxShadow: '0 0 40px rgba(74, 222, 128, 0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          data-gsap="stagger"
        >
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />
          <div className="mb-3 relative z-10">
            <h2 className="font-serif text-lg text-white">Mapa de Lotes</h2>
            <p className="text-[9px] font-mono text-emerald-500/50 uppercase tracking-widest">Santa Cruz · Tapera Mapa</p>
          </div>
          <div className="relative z-10 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(74,222,128,0.1)' }}>
            <ParcelaMap parcelas={data.allParcelas} height="270px" />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <a
        href="/campo/nueva"
        className="sm:hidden fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full text-white font-black text-xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #4ade80, #16a34a)',
          boxShadow: '0 4px 20px rgba(74,222,128,0.4)',
        }}
      >
        +
      </a>
    </div>
  );
}
