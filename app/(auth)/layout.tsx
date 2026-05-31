'use client';

import { useEffect, useRef } from 'react';
import { InteractiveAgroBackground } from '@/components/layout/InteractiveAgroBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * 0.012;
      const moveY = (clientY - window.innerHeight / 2) * 0.012;
      bg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center noise-bg p-4 relative overflow-hidden select-none bg-[#050b07]">
      {/* Parallax Background Image Wrapper */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out z-0 pointer-events-none scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1627920769842-6887c6df05ca?q=80&w=1920')",
          backgroundPosition: 'center 40%',
        }}
      />

      {/* Dark overlay matching the landing page perfectly to darken the image and make text pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b07]/90 via-[#050b07]/75 to-[#050b07]/95 z-10 pointer-events-none" />

      {/* Interactive Organic Agrotech Particle Background (Floating on top of overlay) */}
      <InteractiveAgroBackground />

      {/* High-tech agricultural background grids */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(#22c55e_1px,transparent_1px),linear-gradient(90deg,#22c55e_1px,transparent_1px)] bg-[size:30px_30px] z-10" />
      
      {/* Decorative premium floating glowing orbs representing seeds/drones */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-campo-500/10 blur-[120px] animate-pulse z-10" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] animate-pulse [animation-delay:2s] z-10" />

      <div className="w-full max-w-4xl relative z-20">{children}</div>
    </div>
  );
}
