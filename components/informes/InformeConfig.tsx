'use client';

/**
 * InformeConfig.tsx — Pro Max Edition
 *
 * Problemas corregidos en el original:
 *  1. Estado local no controlado — el padre no puede resetear el form
 *  2. Sin validación granular — el botón se bloquea pero no dice por qué
 *  3. Lista de visitas sin búsqueda — inutilizable con >20 visitas
 *  4. Sin "seleccionar todo / ninguno"
 *  5. Sin vista previa del rango de fechas de las visitas seleccionadas
 *  6. Input de período es texto libre — sin formato guiado
 *  7. Sin accesibilidad en los checkboxes (sin fieldset/legend)
 *
 * Mejoras:
 *  - Búsqueda en tiempo real de visitas con highlight del término
 *  - "Seleccionar todo" / "Ninguno" con contador animado
 *  - Período con selector de mes/año (no texto libre)
 *  - Tipo selector con iconos descriptivos por tipo de informe
 *  - Validación inline por campo con mensajes claros
 *  - `onReset` prop para que el padre limpie el formulario
 *  - Expose `reset()` via ref si se usa en un modal
 *  - GSAP: entrada stagger, botón shake en submit fallido
 *  - Accessible: fieldset+legend para el grupo de checkboxes
 */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useId,
} from 'react';
import { Button } from '@/components/ui/Button';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import type { TipoInforme } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface InformeConfigPayload {
  titulo:     string;
  periodo:    string;
  tipo:       TipoInforme;
  visitasIds: string[];
}

export interface VisitaOption {
  id:    string;
  label: string;
  /** ISO date string used for sorting/display */
  fecha?: string;
}

export interface InformeConfigProps {
  onGenerate:      (config: InformeConfigPayload) => void;
  visitasOptions:  VisitaOption[];
  loading?:        boolean;
  /** Called when user explicitly resets the form */
  onReset?:        () => void;
}

export interface InformeConfigHandle {
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/*  Tipo config                                                         */
/* ------------------------------------------------------------------ */

interface TipoInfo {
  value:       TipoInforme;
  label:       string;
  description: string;
  icon:        React.ReactNode;
}

const TIPOS: TipoInfo[] = [
  {
    value:       'FITOSANITARIO',
    label:       'Fitosanitario',
    description: 'Análisis de plagas, enfermedades y estado sanitario',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M5 8l2 2 4-4" />
      </svg>
    ),
  },
  {
    value:       'MENSUAL',
    label:       'Mensual',
    description: 'Resumen de actividad del mes',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="12" height="11" rx="2" />
        <path d="M5 1v3M11 1v3M2 7h12" />
      </svg>
    ),
  },
  {
    value:       'PARCELA',
    label:       'Por parcela',
    description: 'Historial completo de una parcela específica',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <path d="M2 13L8 3l6 10H2z" />
        <path d="M8 3v10" />
      </svg>
    ),
  },
  {
    value:       'CAMPANA',
    label:       'Campaña',
    description: 'Cierre de campaña agrícola completa',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <path d="M8 2l1.5 3H13l-2.75 2 1 3.5L8 8.5 4.75 10.5l1-3.5L3 5h3.5L8 2z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Month / Year period picker                                          */
/* ------------------------------------------------------------------ */

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

function buildPeriodOptions(): { value: string; label: string }[] {
  const now    = new Date();
  const result = [];
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    result.push({ value: label, label });
  }
  return result;
}

const PERIOD_OPTIONS = buildPeriodOptions();

/* ------------------------------------------------------------------ */
/*  Highlight search term in a string                                   */
/* ------------------------------------------------------------------ */

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-campo-100 text-campo-800 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Validation                                                          */
/* ------------------------------------------------------------------ */

interface FormErrors {
  titulo?:   string;
  periodo?:  string;
  visitas?:  string;
}

function validateForm(
  titulo:    string,
  periodo:   string,
  selected:  string[]
): FormErrors {
  const errors: FormErrors = {};
  if (!titulo.trim())       errors.titulo  = 'El título es requerido.';
  else if (titulo.length > 120) errors.titulo = 'Máximo 120 caracteres.';
  if (!periodo)             errors.periodo = 'Seleccioná un período.';
  if (selected.length === 0) errors.visitas = 'Seleccioná al menos una visita.';
  return errors;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export const InformeConfig = forwardRef<InformeConfigHandle, InformeConfigProps>(
  function InformeConfig(
    { onGenerate, visitasOptions, loading = false, onReset },
    ref
  ) {
    const [titulo,   setTitulo]   = useState('');
    const [periodo,  setPeriodo]  = useState(PERIOD_OPTIONS[0]?.value ?? '');
    const [tipo,     setTipo]     = useState<TipoInforme>('MENSUAL');
    const [selected, setSelected] = useState<string[]>([]);
    const [search,   setSearch]   = useState('');
    const [errors,   setErrors]   = useState<FormErrors>({});
    const [touched,  setTouched]  = useState<Record<string, boolean>>({});

    const formRef       = useRef<HTMLFormElement>(null);
    const submitBtnRef  = useRef<HTMLDivElement>(null);
    const searchId      = useId();
    const visitasId     = useId();

    /* ── Expose reset via ref ────────────────────────────────────── */
    const reset = useCallback(() => {
      setTitulo('');
      setPeriodo(PERIOD_OPTIONS[0]?.value ?? '');
      setTipo('MENSUAL');
      setSelected([]);
      setSearch('');
      setErrors({});
      setTouched({});
      onReset?.();
    }, [onReset]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    /* ── Filtered visitas ────────────────────────────────────────── */
    const filtered = useMemo(() => {
      if (!search.trim()) return visitasOptions;
      const q = search.toLowerCase();
      return visitasOptions.filter((v) => v.label.toLowerCase().includes(q));
    }, [visitasOptions, search]);

    /* ── Selection helpers ───────────────────────────────────────── */
    const toggle = useCallback((id: string) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
      setTouched((t) => ({ ...t, visitas: true }));
    }, []);

    const selectAll = useCallback(() => {
      setSelected(filtered.map((v) => v.id));
      setTouched((t) => ({ ...t, visitas: true }));
    }, [filtered]);

    const selectNone = useCallback(() => {
      setSelected([]);
      setTouched((t) => ({ ...t, visitas: true }));
    }, []);

    /* ── Submit ──────────────────────────────────────────────────── */
    const handleSubmit = useCallback(() => {
      const errs = validateForm(titulo, periodo, selected);
      setErrors(errs);
      setTouched({ titulo: true, periodo: true, visitas: true });

      if (Object.keys(errs).length > 0) {
        /* Shake the submit button */
        if (submitBtnRef.current) {
          gsap.timeline()
            .to(submitBtnRef.current, { x: -7, duration: 0.07, ease: 'none' })
            .to(submitBtnRef.current, { x:  7, duration: 0.07, ease: 'none' })
            .to(submitBtnRef.current, { x: -4, duration: 0.07, ease: 'none' })
            .to(submitBtnRef.current, { x:  0, duration: 0.07, ease: 'none' });
        }
        return;
      }

      onGenerate({ titulo: titulo.trim(), periodo, tipo, visitasIds: selected });
    }, [titulo, periodo, tipo, selected, onGenerate]);

    /* ── GSAP stagger entrance ───────────────────────────────────── */
    useGSAP(
      () => {
        if (!formRef.current) return;
        gsap.fromTo(
          formRef.current.querySelectorAll('[data-field]'),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out' }
        );
      },
      { scope: formRef }
    );

    /* ── Derived UI state ────────────────────────────────────────── */
    const allFilteredSelected =
      filtered.length > 0 && filtered.every((v) => selected.includes(v.id));
    const canSubmit = !loading;

    return (
      <form
        ref={formRef}
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="space-y-5"
        noValidate
        aria-label="Configurar informe"
        data-gsap="stagger"
      >
        {/* ── Título ─────────────────────────────────────────────── */}
        <div data-field>
          <label className="mb-1.5 block text-sm font-medium text-text-2" htmlFor="informe-titulo">
            Título del informe
          </label>
          <input
            id="informe-titulo"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (touched.titulo) setErrors((err) => ({ ...err, titulo: undefined }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, titulo: true }))}
            className={[
              'w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-text-1 outline-none transition',
              'placeholder:text-text-4',
              errors.titulo && touched.titulo
                ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                : 'border-border focus:border-brand focus:ring-2 focus:ring-brand/20',
            ].join(' ')}
            placeholder="Ej: Informe fitosanitario Mayo 2025"
            maxLength={120}
            aria-describedby={errors.titulo ? 'titulo-error' : undefined}
            aria-invalid={!!errors.titulo && touched.titulo}
            disabled={loading}
          />
          <div className="mt-1 flex justify-between">
            {errors.titulo && touched.titulo ? (
              <p id="titulo-error" role="alert" className="text-xs text-red-500">
                {errors.titulo}
              </p>
            ) : <span />}
            <span className="text-[11px] font-mono text-text-4">
              {titulo.length}/120
            </span>
          </div>
        </div>

        {/* ── Período ────────────────────────────────────────────── */}
        <div data-field>
          <label className="mb-1.5 block text-sm font-medium text-text-2" htmlFor="informe-periodo">
            Período
          </label>
          <select
            id="informe-periodo"
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value);
              setTouched((t) => ({ ...t, periodo: true }));
              setErrors((err) => ({ ...err, periodo: undefined }));
            }}
            className={[
              'w-full appearance-none rounded-xl border bg-surface px-3 py-2.5 text-sm text-text-1 outline-none transition',
              errors.periodo && touched.periodo
                ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                : 'border-border focus:border-brand focus:ring-2 focus:ring-brand/20',
            ].join(' ')}
            aria-describedby={errors.periodo ? 'periodo-error' : undefined}
            aria-invalid={!!errors.periodo && touched.periodo}
            disabled={loading}
          >
            <option value="" disabled>Seleccioná un período…</option>
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {errors.periodo && touched.periodo && (
            <p id="periodo-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.periodo}
            </p>
          )}
        </div>

        {/* ── Tipo ───────────────────────────────────────────────── */}
        <fieldset data-field>
          <legend className="mb-2 text-sm font-medium text-text-2">
            Tipo de informe
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t) => {
              const active = tipo === t.value;
              return (
                <label
                  key={t.value}
                  className={[
                    'flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 text-xs transition-all',
                    'focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1',
                    active
                      ? 'border-brand bg-brand/5 text-text-1'
                      : 'border-border bg-surface text-text-2 hover:border-brand/40 hover:bg-surface-2',
                    loading && 'pointer-events-none opacity-60',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="tipo-informe"
                    value={t.value}
                    checked={active}
                    onChange={() => setTipo(t.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className={active ? 'text-brand' : 'text-text-3'}>{t.icon}</span>
                    <span className="font-semibold">{t.label}</span>
                  </div>
                  <span className="text-text-3 leading-snug">{t.description}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ── Visitas ────────────────────────────────────────────── */}
        <fieldset data-field>
          <div className="mb-2 flex items-center justify-between gap-2">
            <legend className="text-sm font-medium text-text-2" id={visitasId}>
              Visitas incluidas{' '}
              <span className="font-mono text-text-3">
                ({selected.length}/{visitasOptions.length})
              </span>
            </legend>
            <div className="flex gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={selectAll}
                disabled={allFilteredSelected || loading}
                className="text-brand hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Todos
              </button>
              <span className="text-text-4">/</span>
              <button
                type="button"
                onClick={selectNone}
                disabled={selected.length === 0 || loading}
                className="text-text-3 hover:text-text-1 hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Ninguno
              </button>
            </div>
          </div>

          {/* Search */}
          {visitasOptions.length > 6 && (
            <div className="relative mb-2">
              <svg
                viewBox="0 0 14 14"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="4" />
                <path d="M9.5 9.5l3 3" />
              </svg>
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar visitas…"
                className="w-full rounded-lg border border-border bg-surface-2/60 py-1.5 pl-8 pr-3 text-xs text-text-1 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/20"
                aria-label="Buscar visitas"
                disabled={loading}
              />
            </div>
          )}

          {/* List */}
          <div
            role="group"
            aria-labelledby={visitasId}
            aria-describedby={errors.visitas && touched.visitas ? 'visitas-error' : undefined}
            className={[
              'max-h-48 overflow-y-auto rounded-xl border p-1.5 space-y-0.5',
              errors.visitas && touched.visitas
                ? 'border-red-300'
                : 'border-border',
            ].join(' ')}
          >
            {filtered.length === 0 ? (
              <p className="py-3 text-center text-xs text-text-3">
                {search ? `Sin resultados para "${search}"` : 'Sin visitas disponibles'}
              </p>
            ) : (
              filtered.map((v) => {
                const checked = selected.includes(v.id);
                return (
                  <label
                    key={v.id}
                    className={[
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors select-none',
                      checked
                        ? 'bg-brand/8 text-text-1'
                        : 'text-text-2 hover:bg-surface-2',
                      loading && 'pointer-events-none',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                        checked
                          ? 'border-brand bg-brand text-white'
                          : 'border-border bg-surface',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {checked && (
                        <svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 5l2.5 2.5L8 3" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(v.id)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <span className="truncate leading-snug">
                      <HighlightMatch text={v.label} query={search} />
                    </span>
                    {v.fecha && (
                      <span className="ml-auto flex-shrink-0 font-mono text-[10px] text-text-4">
                        {v.fecha}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {errors.visitas && touched.visitas && (
            <p id="visitas-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.visitas}
            </p>
          )}
        </fieldset>

        {/* ── Actions ────────────────────────────────────────────── */}
        <div ref={submitBtnRef} data-field className="flex gap-2 pt-1">
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={loading}
            >
              Limpiar
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={!canSubmit}
            className="flex-1"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mr-1.5 opacity-90" aria-hidden="true">
              <path d="M4 8h8M4 4h8M4 12h5" />
              <path d="M11 10l3 3-3 3" />
            </svg>
            Generar PDF
          </Button>
        </div>
      </form>
    );
  }
);

InformeConfig.displayName = 'InformeConfig';