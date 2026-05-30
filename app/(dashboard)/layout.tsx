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
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
