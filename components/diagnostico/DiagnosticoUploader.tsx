'use client';

import { useCallback, useState } from 'react';
import { cn, CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo } from '@/types';

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

  return (
    <div className="space-y-4" data-gsap="stagger">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 overflow-hidden',
          dragOver ? 'border-campo-500 bg-campo-50/50 shadow-inner' : 'border-border bg-surface hover:border-campo-400 hover:shadow-sm',
          loading && 'pointer-events-none'
        )}
      >
        {preview && loading && <div className="laser-scan" />}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className={cn("mx-auto max-h-64 rounded-lg object-contain transition-all duration-500", loading && "blur-[1px]")} />
        ) : (
          <div className="space-y-2 py-4">
            <p className="text-4xl animate-bounce duration-1000">🔬</p>
            <p className="font-serif text-lg text-text-1">Arrastra una foto de campo</p>
            <p className="text-sm text-text-3">o haz clic para abrir la cámara</p>
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

      <div>
        <label className="block text-sm font-medium text-text-2 mb-1.5">Cultivo</label>
        <select
          value={cultivo}
          onChange={(e) => setCultivo(e.target.value as Cultivo)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          {cultivos.map((c) => (
            <option key={c} value={c}>{CULTIVO_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={!file || loading}
        onClick={() => file && onAnalyze(file, cultivo)}
        className={cn(
          'w-full rounded-md py-3 font-medium transition-colors',
          file && !loading
            ? 'bg-campo-700 text-white hover:bg-campo-900'
            : 'bg-surface-3 text-text-3 cursor-not-allowed'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-pulse rounded-full bg-campo-300" />
            Analizando con Gemini...
          </span>
        ) : (
          'Diagnosticar'
        )}
      </button>
    </div>
  );
}
