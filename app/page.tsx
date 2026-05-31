'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { Button } from '@/components/ui/Button';
import {
  CloudSun,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sprout,
  ScanFace,
  WifiOff
} from 'lucide-react';

const features = [
  {
    icon: <WifiOff className="text-emerald-400 w-6 h-6" />,
    title: 'Arquitectura Offline-First',
    desc: 'Diseñado para la baja conectividad en las provincias cruceñas. Captura datos de parcelas sin señal y sincroniza de forma automática en CAICO o ANAPO.',
    tag: 'Provincias'
  },
  {
    icon: <ScanFace className="text-amber-400 w-6 h-6" />,
    title: 'Diagnóstico con Gemini Vision',
    desc: 'Análisis automatizado en tiempo real para la Roya de la Soya en el Norte Integrado y plagas fitosanitarias de hortalizas en los Valles.',
    tag: 'API Gemini'
  },
  {
    icon: <FileText className="text-teal-400 w-6 h-6" />,
    title: 'Informes Técnicos PDF',
    desc: 'Generación inmediata de reportes fitosanitarios profesionales con geolocalización, listos para cooperativas y exportación.',
    tag: 'Exportable'
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<'NORTE' | 'VALLES'>('NORTE');

  useGSAP(
    () => {
      gsap.from('.hero-title', {
        opacity: 0,
        y: -10,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('.hero-char', {
        opacity: 0,
        y: 30,
        rotateX: -90,
        duration: 0.6,
        stagger: 0.04,
        ease: 'back.out(1.7)',
        delay: 0.2,
      });
      gsap.from('.interactive-panel', {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8,
      });
    },
    { scope: heroRef }
  );

  // INTERACTIVIDAD TOTAL: Efecto Parallax con Scroll + Reacción al Movimiento del Mouse
  useEffect(() => {
    const bg = backgroundRef.current;
    if (!bg) return;

    // 1. Movimiento al hacer Scroll
    const handleScroll = () => {
      const offset = window.scrollY;
      bg.style.setProperty('--scroll-y', `${offset * 0.4}px`);
    };

    // 2. Movimiento interactivo al mover el Mouse (Efecto de profundidad de lente)
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * 0.015;
      const moveY = (clientY - window.innerHeight / 2) * 0.015;
      bg.style.setProperty('--mouse-x', `${moveX}px`);
      bg.style.setProperty('--mouse-y', `${moveY}px`);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Definición explícita de la constante title requerida para el mapeo inferior
  const title = 'Tu campo, tu historial, tu decisión.';

  return (
    <div ref={heroRef} className="min-h-screen relative overflow-hidden bg-[#050b07] text-slate-100 font-sans selection:bg-emerald-500/30">

      {/* ─── FONDO AGRO REAL E INTERACTIVO (CORREGIDO SIN OSOS) ─── */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 pointer-events-none scale-105 transition-transform duration-200 ease-out"
        style={{
          // Vista aérea de campos de siembra lineal agrícola optimizada para el entorno
          backgroundImage: "url('https://images.unsplash.com/photo-1627920769842-6887c6df05ca?q=80&w=1920')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundAttachment: 'fixed',
          transform: 'translate3d(var(--mouse-x, 0px), calc(var(--mouse-y, 0px) + var(--scroll-y, 0px)), 0px)',
        }}
      />

      {/* Capa de fusión Agro-Tech optimizada para que el verde de las plantaciones resalte sin tapar las letras */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b07]/85 via-[#050b07]/40 to-[#050b07]/95 z-0 pointer-events-none" />
      {/* Brillos ambientales adicionales estilo Clorofila */}
      <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#050b07]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:rotate-6 transition-transform">
            <Sprout size={18} />
          </div>
          <span className="font-serif text-2xl font-black text-white tracking-tight">
            AgroLog<span className="text-emerald-400 text-xs font-sans font-semibold tracking-widest block -mt-1 uppercase">Inteligencia Santa Cruz</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> GDG Hackathon 2026
          </span>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium text-slate-200 border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-xl">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── CONTENIDO EN PRIMER PLANO ─── */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative z-10">

        {/* Hero Section */}
        <section className="text-center mb-20 relative">
          <p className="hero-title text-xs font-mono text-emerald-400 mb-6 tracking-[0.2em] uppercase bg-emerald-500/10 px-4 py-2 rounded-full inline-block border border-emerald-500/20 backdrop-blur-sm">
            🌱 BIO-TECNOLOGÍA APLICADA AL DIAGNÓSTICO FOLIAR
          </p>

          {/* Corrección estructural para mantener las palabras unidas en saltos de línea responsivos */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.15] mb-6 tracking-tight [perspective:1000px] max-w-5xl mx-auto break-keep">
            {title.split(' ').map((word, wordIdx) => (
              <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
                {word.split('').map((char, charIdx) => (
                  <span key={charIdx} className="hero-char inline-block origin-bottom style-3d">
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-base md:text-xl text-slate-300 font-light max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Monitoreo agronómico avanzado y fitosanitario geolocalizado para el departamento de <strong className="text-emerald-400 font-medium">Santa Cruz</strong>. Resguarda tus parcelas y automatiza reportes directo en la zona de producción.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_4px_20px_rgba(16,185,129,0.35)] px-8 py-6 rounded-xl font-bold text-base gap-2 group transition-all duration-300 transform hover:scale-[1.02]">
                Acceder al Sistema Profesional <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Simulador Climático */}
        <section className="interactive-panel mb-24 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 transition-all duration-1000" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">Simulador de Monitoreo Crítico</h2>
              <p className="font-serif text-2xl font-bold text-white mt-1">Regiones Agro-Fitosanitarias Activas</p>
            </div>

            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto backdrop-blur-sm">
              <button
                onClick={() => setSelectedRegion('NORTE')}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 ${selectedRegion === 'NORTE' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🌾 Norte Integrado (Soya)
              </button>
              <button
                onClick={() => setSelectedRegion('VALLES')}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 ${selectedRegion === 'VALLES' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🥕 Valles Cruceños (Hortalizas)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 bg-white/5 px-4 py-2 rounded-xl inline-flex border border-white/5">
                <MapPin size={16} className={selectedRegion === 'NORTE' ? "text-emerald-400" : "text-amber-400"} />
                <span>Área de Cobertura: {selectedRegion === 'NORTE' ? 'Montero, San Pedro, Mineros, Cuatro Cañadas' : 'Comarapa, Vallegrande, Saipina'}</span>
              </div>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {selectedRegion === 'NORTE'
                  ? 'Protección enfocada en el control macro de la Roya de la Soya y brotes por humedad extrema. Integrado con Gemini Vision para escanear hojas directamente en parcelas de gran escala.'
                  : 'Monitoreo especializado de hortalizas familiares y minifundios. Protege cultivos de tomate, papa y frutas contra plagas fúngicas aceleradas por los cambios térmicos de la zona de los Valles.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> API Open-Meteo Activa
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-teal-400" /> Gemini Vision Ready
                </span>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-full min-h-[160px] transition-all duration-500 relative overflow-hidden shadow-2xl ${selectedRegion === 'NORTE' ? 'bg-gradient-to-br from-emerald-950/50 to-black/40 border-emerald-500/30' : 'bg-gradient-to-br from-amber-950/50 to-black/40 border-amber-500/30'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Estación Remota</p>
                  <p className="text-base font-bold text-white mt-0.5">{selectedRegion === 'NORTE' ? 'San Pedro, SCZ' : 'Comarapa, SCZ'}</p>
                </div>
                <CloudSun size={24} className={selectedRegion === 'NORTE' ? "text-emerald-400" : "text-amber-400"} />
              </div>
              <div className="mt-6">
                <div className="text-4xl font-mono font-bold tracking-tight text-white">{selectedRegion === 'NORTE' ? '28.5°C' : '19.2°C'}</div>
                <p className="text-xs text-slate-400 mt-1.5 font-mono">Humedad: {selectedRegion === 'NORTE' ? '82%' : '64%'} • Riesgo Fito: <span className="text-red-400 font-bold underline decoration-wavy animate-pulse">ALTO</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Grid de Características */}
        <section className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl bg-black/40 border border-white/5 p-6 shadow-xl hover:bg-black/60 hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-neutral-900/90 rounded-xl border border-white/10 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mt-5 tracking-tight group-hover:text-emerald-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed font-light">{f.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-mono font-medium text-emerald-400 transform translate-x-[-5px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                Saber más del módulo <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <section className="mt-24 text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-black/60 px-5 py-2.5 rounded-2xl border border-white/5 text-xs font-mono text-slate-300 shadow-xl backdrop-blur-md">
            <span className="font-bold text-emerald-400">🔑 Entorno de Evaluación:</span>
            <span>demo@agrolog.bo</span>
            <span className="text-white/10">|</span>
            <span>campo2024</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
            GDG Santa Cruz • Proyecto de Innovación Tecnológica Sostenible 2026
          </p>
        </section>
      </main>
    </div>
  );
}