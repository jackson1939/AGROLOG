'use client';

import { useCallback, useState, useEffect } from 'react';
import { cn, CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo } from '@/types';
import { Camera, Image as ImageIcon, Sparkles, AlertTriangle, CloudOff } from 'lucide-react';

interface DiagnosticoUploaderProps {
  onAnalyze: (file: File, cultivo: Cultivo) => void;
  loading?: boolean;
}

const cultivos = Object.keys(CULTIVO_LABELS) as Cultivo[];

export function DiagnosticoUploader({ onAnalyze, loading }: DiagnosticoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cultivo, setCultivo] = useState<Cultivo>('SOYA');
  const [dragOver, setDragOver] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Detectar estado de conectividad en tiempo real (Clave para los Valles Cruceños/Zonas rurales)
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  };

  // Cambiar el tema visual según la zona seleccionada para contextualizar Santa Cruz
  // Cultivos de los Valles Cruceños: TOMATE, CEBOLLA, PAPA, CITRICOS
  const cultivosValles: Cultivo[] = ['TOMATE', 'CEBOLLA', 'PAPA', 'CITRICOS'];
  const isValles = cultivosValles.includes(cultivo);

  return (
    <div className="space-y-5 bg-surface/40 p-6 rounded-2xl border border-border/60 backdrop-blur-md shadow-xl" data-gsap="stagger">

      {/* Indicador de Red Inteligente */}
      {isOffline && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs font-mono animate-pulse">
          <CloudOff size={16} />
          <span>Soporte Offline Activo: El diagnóstico se procesará con Gemini localmente o se encolará según cobertura.</span>
        </div>
      )}

      {/* Zona de Carga / Visor Fotográfico */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-500 overflow-hidden min-h-[280px] flex flex-col justify-center items-center',
          dragOver
            ? 'border-campo-500 bg-campo-500/10 scale-[1.01] shadow-[0_0_20px_rgba(var(--color-campo-500),0.15)]'
            : 'border-border/80 bg-surface/60 hover:border-campo-500/70 hover:shadow-md',
          loading && 'pointer-events-none ring-2 ring-campo-500/30'
        )}
      >
        {/* Línea de escaneo láser de alta fidelidad */}
        {preview && loading && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-campo-400 to-transparent shadow-[0_0_15px_#22c55e] animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-campo-500/5 mix-blend-overlay animate-pulse" />
          </div>
        )}

        {preview ? (
          <div className="relative group w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className={cn(
                "mx-auto max-h-72 rounded-xl object-contain transition-all duration-700 shadow-lg",
                loading && "blur-[0.5px] brightness-90 scale-[0.99]"
              )}
            />
            {!loading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center text-white text-xs font-medium backdrop-blur-sm">
                <Camera size={16} className="mr-1.5" /> Cambiar Fotografía de Campo
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-6 max-w-sm transition-all duration-300">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-inner",
              isValles
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-campo-500/10 border-campo-500/20 text-campo-500'
            )}>
              <Camera size={28} className="animate-pulse" />
            </div>
            <div>
              <p className="font-medium text-base text-text-1">Captura tejido vegetal afectado</p>
              <p className="text-xs text-text-3 mt-1 px-4">
                Sube o toma una foto nítida de las hojas. Optimizado para el diagnóstico foliar en Santa Cruz.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-surface-3 px-3 py-1.5 rounded-full border border-border/40 text-text-2">
              <ImageIcon size={12} /> Seleccionar archivo
            </span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={loading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Selector de Cultivo Estilizado y Contextualizado */}
      <div className="bg-surface-2/40 p-4 rounded-xl border border-border/40">
        <label className="block text-xs font-mono uppercase tracking-wider text-text-3 mb-2">
          Macro-Zona y Cultivo de Análisis
        </label>
        <div className="relative">
          <select
            value={cultivo}
            onChange={(e) => setCultivo(e.target.value as Cultivo)}
            className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-campo-500/40 transition-all text-text-1 shadow-sm"
          >
            {cultivos.map((c) => (
              <option key={c} value={c}>
                {CULTIVO_LABELS[c]} {c === 'SOYA' ? '— (Norte Integrado / Expansión)' : '— (Valles Cruceños)'}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-3">
            <Sparkles size={16} className={isValles ? "text-amber-500" : "text-campo-500"} />
          </div>
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <button
        type="button"
        disabled={!file || loading}
        onClick={() => file && onAnalyze(file, cultivo)}
        className={cn(
          'w-full rounded-xl py-3.5 font-semibold tracking-wide transition-all duration-300 shadow-md transform active:scale-[0.99] flex items-center justify-center gap-2',
          file && !loading
            ? isValles
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-orange-900/10'
              : 'bg-gradient-to-r from-campo-600 to-emerald-600 text-white hover:from-campo-700 hover:to-emerald-700 shadow-emerald-900/10'
            : 'bg-surface-3 text-text-3 cursor-not-allowed border border-border/30 shadow-none'
        )}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="font-mono text-sm tracking-widest animate-pulse">PROCESANDO IMAGEN CON GEMINI VISION API...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Ejecutar Diagnóstico Fitofortificado</span>
          </>
        )}
      </button>
    </div>
  );
}