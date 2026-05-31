import { InteractiveAgroBackground } from '@/components/layout/InteractiveAgroBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center noise-bg p-4 bg-[#F7FCF9] relative overflow-hidden select-none">
      
      {/* Interactive Organic Agrotech Particle Background */}
      <InteractiveAgroBackground />

      {/* High-tech agricultural background grids */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(#22c55e_1px,transparent_1px),linear-gradient(90deg,#22c55e_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* Decorative premium floating glowing orbs representing seeds/drones */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-campo-500/10 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] animate-pulse [animation-delay:2s]" />

      <div className="w-full max-w-4xl relative z-10">{children}</div>
    </div>
  );
}
