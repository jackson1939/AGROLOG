import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageTransition } from '@/components/animations/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #050d07 0%, #071009 40%, #040c08 100%)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto relative">
          {/* Subtle ambient glow */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-700/4 blur-[100px]" />
          </div>
          <div className="relative z-10">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

