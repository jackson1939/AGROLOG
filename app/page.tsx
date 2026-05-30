'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: '◎',
    title: 'Registro offline-first',
    desc: 'Captura visitas de campo sin señal. Sincroniza automáticamente al conectar.',
  },
  {
    icon: '◉',
    title: 'Diagnóstico con IA',
    desc: 'Gemini Vision analiza fotos y detecta enfermedades adaptado a cultivos bolivianos.',
  },
  {
    icon: '▤',
    title: 'Informes PDF',
    desc: 'Genera reportes fitosanitarios profesionales listos para compartir.',
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.hero-title', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
      gsap.from('.hero-char', {
        opacity: 0,
        y: 20,
        duration: 0.05,
        stagger: 0.03,
        ease: 'power2.out',
        delay: 0.3,
      });
      gsap.from('[data-gsap="stagger"]', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.8,
        clearProps: 'all',
      });
    },
    { scope: heroRef }
  );

  const title = 'Tu campo, tu historial, tu decisión.';

  return (
    <div ref={heroRef} className="min-h-screen noise-bg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <span className="font-serif text-2xl text-tierra-900">AgroLog</span>
        <Link href="/login">
          <Button variant="secondary" size="sm">Iniciar sesión</Button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <section className="text-center mb-20">
          <p className="hero-title text-sm font-mono text-campo-700 mb-4 tracking-wider uppercase">
            Sistema de Inteligencia de Campo
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-tierra-900 leading-tight mb-6">
            {title.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className="text-lg text-text-2 font-light max-w-2xl mx-auto mb-8" data-gsap="stagger">
            Herramienta profesional para agrónomos en Bolivia. Registra visitas,
            diagnostica con IA y genera informes desde el campo.
          </p>
          <div data-gsap="stagger">
            <Link href="/login">
              <Button size="lg">Empezar gratis</Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              data-gsap="stagger"
              className="rounded-lg bg-surface border border-border p-6 shadow-card"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-serif text-xl text-text-1 mt-4">{f.title}</h3>
              <p className="text-sm text-text-2 mt-2 font-light">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 text-center text-sm text-text-3 font-mono" data-gsap="stagger">
          Demo: demo@agrolog.bo / campo2024
        </section>
      </main>
    </div>
  );
}
