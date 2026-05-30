'use client';

/**
 * DiagnosticoUploader.tsx — Pro Max Edition
 *
 * Problemas corregidos en el original:
 *  1. Sin validación de tamaño de archivo (puede subir 50MB sin control)
 *  2. Sin feedback de error de tipo de archivo
 *  3. El spinner era un círculo estático — no comunica progreso real
 *  4. Sin limpieza de blob URL → memory leak
 *  5. Sin drag-counter correcto (múltiples onDragLeave por child elements)
 *  6. `capture="environment"` bloquea galería en desktop
 *  7. Sin accesibilidad: falta aria-describedby, roles, live regions
 *
 * Mejoras:
 *  - Drag counter robusto con ref para evitar flicker en child elements
 *  - Validación de tamaño (configurable, default 10MB) con mensaje de error inline
 *  - Preview con botón de limpieza y nombre/tamaño del archivo
 *  - Dos modos de input: galería + cámara (botones separados en mobile)
 *  - Spinner de análisis con dots wave animation (CSS puro, sin JS)
 *  - GSAP: drop zone scale-bounce al soltar, shake en error
 *  - Cultivo selector mejorado con icono visual por tipo
 *  - `aria-live="polite"` para anunciar estado a screen readers
 *  - `onClear` callback cuando se elimina la imagen
 *  - Skeleton de preview durante lectura del blob
 */

import { useCallback, useState, useRef, useId } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { cn, CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

const cultivos = Object.keys(CULTIVO_LABELS) as Cultivo[];

export interface DiagnosticoUploaderProps {
  onAnalyze: (file: File, cultivo: Cultivo) => void;
  /** Called when the user removes the selected image */
  onClear?: () => void;
  loading?: boolean;
  /** Max file size in bytes (default: 10 MB) */
  maxSizeBytes?: number;
  /** Additional className on the root wrapper */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Cultivo option icons (reused from ParcelaCard)                     */
/* ------------------------------------------------------------------ */

const CULTIVO_ICONS: Record<Cultivo, string> = {
  SOYA:   '🫘',
  MAIZ:   '🌽',
  TRIGO:  '🌾',
  QUINUA: '🌱',
  PAPA:   '🥔',
  ARROZ:  '🍚',
};

/* ------------------------------------------------------------------ */
/*  Wave dots loading indicator (CSS-only, accessible)                 */
/* ------------------------------------------------------------------ */

function AnalysisSpinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2" role="status" aria-label={label}>
      <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-white"
            style={{
              height: '10px',
              animation: `waveDot 0.9s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          />
        ))}
      </span>
      <span className="text-sm">{label}</span>
      <style>{`
        @keyframes waveDot {
          from { height: 4px;  opacity: 0.5; }
          to   { height: 14px; opacity: 1;   }
        }
      `}</style>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  File size formatter                                                 */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function DiagnosticoUploader({
  onAnalyze,
  onClear,
  loading = false,
  maxSizeBytes = 10 * 1024 * 1024, // 10 MB
  className,
}: DiagnosticoUploaderProps) {
  const [preview,      setPreview]     = useState<string | null>(null);
  const [file,         setFile]        = useState<File | null>(null);
  const [cultivo,      setCultivo]     = useState<Cultivo>('SOYA');
  const [dragOver,     setDragOver]    = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);

  /* Drag counter: counts enter/leave events to avoid child-element flicker */
  const dragCounter = useRef(0);
  const zoneRef     = useRef<HTMLDivElement>(null);
  const galleryRef  = useRef<HTMLInputElement>(null);
  const cameraRef   = useRef<HTMLInputElement>(null);
  const liveRef     = useRef<HTMLParagraphElement>(null);
  const selectId    = useId();

  /* ── GSAP bounce on successful drop ──────────────────────────────── */
  const bounceZone = useCallback(() => {
    if (!zoneRef.current) return;
    gsap.fromTo(
      zoneRef.current,
      { scale: 0.97 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.5)' }
    );
  }, []);

  /* ── GSAP shake on error ─────────────────────────────────────────── */
  const shakeZone = useCallback(() => {
    if (!zoneRef.current) return;
    gsap.timeline()
      .to(zoneRef.current, { x: -8,  duration: 0.06, ease: 'none' })
      .to(zoneRef.current, { x:  8,  duration: 0.06, ease: 'none' })
      .to(zoneRef.current, { x: -5,  duration: 0.06, ease: 'none' })
      .to(zoneRef.current, { x:  5,  duration: 0.06, ease: 'none' })
      .to(zoneRef.current, { x:  0,  duration: 0.06, ease: 'none' });
  }, []);

  /* ── File processing ─────────────────────────────────────────────── */
  const processFile = useCallback(
    (f: File) => {
      setError(null);

      /* Type validation */
      if (!f.type.startsWith('image/')) {
        setError('Solo se aceptan imágenes (JPG, PNG, WebP, HEIC).');
        shakeZone();
        return;
      }

      /* Size validation */
      if (f.size > maxSizeBytes) {
        setError(
          `El archivo es demasiado grande (${formatBytes(f.size)}). Máximo: ${formatBytes(maxSizeBytes)}.`
        );
        shakeZone();
        return;
      }

      /* Revoke previous object URL to avoid memory leak */
      if (preview) URL.revokeObjectURL(preview);

      setPreviewReady(false);
      setFile(f);

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setPreviewReady(true);
        bounceZone();
        /* Announce to screen readers */
        if (liveRef.current) {
          liveRef.current.textContent = `Imagen "${f.name}" cargada. ${formatBytes(f.size)}.`;
        }
      };
      reader.readAsDataURL(f);
    },
    [preview, maxSizeBytes, bounceZone, shakeZone]
  );

  /* ── Clear ───────────────────────────────────────────────────────── */
  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setPreviewReady(false);
    setError(null);
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current)  cameraRef.current.value  = '';
    if (liveRef.current) liveRef.current.textContent = 'Imagen eliminada.';
    onClear?.();
  }, [preview, onClear]);

  /* ── Drag events ─────────────────────────────────────────────────── */
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragOver(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  /* ── Derived state ───────────────────────────────────────────────── */
  const canAnalyze = !!file && !loading;
  const isMobile   =
    typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div className={cn('space-y-4', className)} data-gsap="stagger">
      {/* Screen-reader live region */}
      <p
        ref={liveRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* ── Drop zone ──────────────────────────────────────────────── */}
      <div
        ref={zoneRef}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          dragOver
            ? 'border-campo-500 bg-campo-50/60 scale-[1.01]'
            : 'border-border hover:border-campo-300 bg-surface',
          error && 'border-red-400 bg-red-50/40'
        )}
        role="region"
        aria-label="Zona de carga de imagen"
      >
        {preview ? (
          /* ── Preview state ─────────────────────────────────────── */
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa de la imagen cargada"
              className={cn(
                'mx-auto max-h-72 w-full object-contain transition-opacity duration-300',
                previewReady ? 'opacity-100' : 'opacity-0'
              )}
            />
            {!previewReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-2/80 animate-pulse">
                <span className="text-sm text-text-3">Cargando previsualización…</span>
              </div>
            )}

            {/* File info bar */}
            {file && previewReady && (
              <div className="flex items-center justify-between px-4 py-2 bg-surface-2/70 backdrop-blur-sm border-t border-border">
                <span className="text-xs font-mono text-text-2 truncate max-w-[70%]">
                  {file.name}
                </span>
                <span className="text-xs font-mono text-text-3 ml-2 flex-shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
            )}

            {/* Clear button */}
            <button
              type="button"
              onClick={clearFile}
              disabled={loading}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/80 border border-border text-text-2 hover:text-text-1 hover:bg-surface shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
              aria-label="Eliminar imagen"
            >
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        ) : (
          /* ── Empty state ────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center select-none">
            {/* Icon */}
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200',
                dragOver ? 'bg-campo-100 text-campo-600' : 'bg-surface-2 text-text-3'
              )}
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 22l6-6 4 4 6-8 8 10" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="4" width="28" height="24" rx="3" />
                <circle cx="10" cy="12" r="2.5" />
              </svg>
            </div>

            <div>
              <p className="font-serif text-base text-text-1">
                {dragOver ? 'Suelta la imagen aquí' : 'Arrastrá una foto de campo'}
              </p>
              <p className="text-xs text-text-3 mt-0.5">
                JPG, PNG, WebP · Máx. {formatBytes(maxSizeBytes)}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-text-4 font-mono">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Upload buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              <label className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-2 hover:bg-surface-2 hover:text-text-1 transition-colors focus-within:ring-2 focus-within:ring-brand">
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onInputChange}
                  aria-label="Seleccionar imagen desde galería"
                />
                📁 Galería
              </label>

              {isMobile && (
                <label className="cursor-pointer rounded-lg border border-campo-300 bg-campo-50 px-3 py-1.5 text-xs font-medium text-campo-700 hover:bg-campo-100 transition-colors focus-within:ring-2 focus-within:ring-campo-500">
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={onInputChange}
                    aria-label="Capturar foto con cámara"
                  />
                  📷 Cámara
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Error message ──────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor" className="flex-shrink-0 mt-0.5" aria-hidden="true">
            <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zm0 3.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 1 0zm0 5.5a.75.75 0 1 1 0-1.5A.75.75 0 0 1 7 10z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Cultivo selector ───────────────────────────────────────── */}
      <div>
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-text-2"
        >
          Cultivo afectado
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={cultivo}
            onChange={(e) => setCultivo(e.target.value as Cultivo)}
            className="w-full appearance-none rounded-xl border border-border bg-surface pl-9 pr-9 py-2.5 text-sm text-text-1 outline-none transition focus:border-campo-500 focus:ring-2 focus:ring-campo-500/20"
            disabled={loading}
          >
            {cultivos.map((c) => (
              <option key={c} value={c}>
                {CULTIVO_ICONS[c]} {CULTIVO_LABELS[c]}
              </option>
            ))}
          </select>
          {/* Left icon */}
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none"
            aria-hidden="true"
          >
            {CULTIVO_ICONS[cultivo]}
          </span>
          {/* Right chevron */}
          <svg
            viewBox="0 0 12 12"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* ── Analyze button ─────────────────────────────────────────── */}
      <button
        type="button"
        disabled={!canAnalyze}
        onClick={() => file && onAnalyze(file, cultivo)}
        aria-busy={loading}
        aria-disabled={!canAnalyze}
        className={cn(
          'w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          canAnalyze
            ? 'bg-campo-700 text-white hover:bg-campo-800 active:scale-[0.98] focus-visible:ring-campo-700 shadow-sm hover:shadow-md'
            : 'bg-surface-3 text-text-4 cursor-not-allowed shadow-none'
        )}
      >
        {loading ? (
          <AnalysisSpinner label="Analizando con Gemini Vision…" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="opacity-90" aria-hidden="true">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 5v4l2.5 2.5" />
            </svg>
            Diagnosticar cultivo
          </span>
        )}
      </button>

      {!file && !loading && (
        <p className="text-center text-[11px] text-text-4 font-mono">
          Analizamos la imagen con IA para detectar enfermedades y plagas
        </p>
      )}
    </div>
  );
}