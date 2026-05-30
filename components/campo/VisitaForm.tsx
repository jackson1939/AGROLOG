'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { visitaSchema, type VisitaFormData } from '@/lib/validations/visita.schema';
import { FotoCapture } from './FotoCapture';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOffline } from '@/hooks/useOffline';
import { addToQueue } from '@/lib/offline/queue';
import { useSyncStore } from '@/store/useSyncStore';
import { getQueueCount } from '@/lib/offline/queue';
import { toast } from 'sonner';
import { cn, SEVERIDAD_LABELS } from '@/lib/utils';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import type { Parcela, Severidad } from '@/types';

interface VisitaFormProps {
  parcelas: Parcela[];
  defaultParcelaId?: string;
  onSuccess?: () => void;
}

const severidades: Severidad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

const severidadButtonStyles: Record<
  Severidad,
  { active: string; inactive: string }
> = {
  BAJA: {
    active: 'bg-campo-500 border-campo-600 text-white shadow-lg shadow-campo-500/25',
    inactive: 'border-campo-300 text-campo-700 hover:bg-campo-50',
  },
  MEDIA: {
    active: 'bg-alerta-400 border-alerta-500 text-white shadow-lg shadow-amber-500/25',
    inactive: 'border-amber-300 text-alerta-600 hover:bg-amber-50',
  },
  ALTA: {
    active: 'bg-alerta-600 border-amber-700 text-white shadow-lg shadow-amber-600/25',
    inactive: 'border-amber-400 text-alerta-600 hover:bg-amber-50',
  },
  CRITICA: {
    active: 'bg-critico-600 border-critico-700 text-white shadow-lg shadow-red-600/25',
    inactive: 'border-red-300 text-critico-600 hover:bg-red-50',
  },
};

export function VisitaForm({
  parcelas,
  defaultParcelaId,
  onSuccess,
}: VisitaFormProps) {
  const { isOnline } = useOffline();
  const { setPendingCount } = useSyncStore();
  const [fotos, setFotos] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stepRef.current) return;
      gsap.fromTo(
        stepRef.current,
        { x: 25, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    },
    { dependencies: [step] }
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VisitaFormData>({
    resolver: zodResolver(visitaSchema),
    defaultValues: {
      parcelaId: defaultParcelaId ?? '',
      fecha: new Date().toISOString().split('T')[0],
      severidad: 'BAJA',
      fotosUrls: [],
    },
  });

  const selectedSeveridad = watch('severidad');

  const onSubmit = async (data: VisitaFormData) => {
    setSubmitting(true);
    try {
      if (isOnline) {
        const res = await fetch('/api/visitas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, fotosUrls: fotos }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? 'Error al guardar');
        }
        toast.success('Visita registrada');
      } else {
        await addToQueue({
          parcelaId: data.parcelaId,
          fecha: data.fecha,
          fenologia: data.fenologia,
          observaciones: data.observaciones,
          severidad: data.severidad,
          fotosBase64: fotos,
          recomendacion: data.recomendacion,
        });
        const count = await getQueueCount();
        setPendingCount(count);
        toast.info('Guardado localmente — se sincronizará al conectar');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Timeline de Pasos */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-8 px-4" data-gsap="stagger">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <button
              type="button"
              onClick={() => s < step && setStep(s)}
              disabled={s >= step}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300',
                step === s
                  ? 'bg-campo-500 border-campo-500 text-white shadow-lg shadow-campo-500/20'
                  : step > s
                    ? 'bg-campo-50 border-campo-300 text-campo-700 cursor-pointer hover:bg-campo-100'
                    : 'bg-surface-3 border-border text-text-3 cursor-not-allowed'
              )}
            >
              {step > s ? '✓' : s}
            </button>
            {s < 3 && (
              <div
                className={cn(
                  'h-[2px] flex-1 mx-2 transition-all duration-300',
                  step > s ? 'bg-campo-500' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div ref={stepRef} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-text-1">1. Seleccionar parcela</h2>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">Parcela</label>
              <select
                {...register('parcelaId')}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {parcelas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.municipio}
                  </option>
                ))}
              </select>
              {errors.parcelaId && (
                <p className="text-xs text-critico-600 mt-1">{errors.parcelaId.message}</p>
              )}
            </div>
            <Input label="Fecha" type="date" {...register('fecha')} error={errors.fecha?.message} />
            <Button type="button" onClick={() => setStep(2)} disabled={!watch('parcelaId')}>
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-text-1">2. Foto y fenología</h2>
            <FotoCapture fotos={fotos} onChange={setFotos} />
            <Input
              label="Fenología"
              placeholder="Ej: V4 - cuarta hoja trifoliada"
              {...register('fenologia')}
              error={errors.fenologia?.message}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-text-1">3. Observaciones y severidad</h2>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">Observaciones</label>
              <textarea
                {...register('observaciones')}
                rows={4}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm resize-none"
                placeholder="Describe lo observado en campo..."
              />
              {errors.observaciones && (
                <p className="text-xs text-critico-600 mt-1">{errors.observaciones.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">Severidad</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severidades.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('severidad', s)}
                    className={cn(
                      'rounded-lg border px-3 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-1.5',
                      selectedSeveridad === s
                        ? severidadButtonStyles[s].active
                        : severidadButtonStyles[s].inactive
                    )}
                  >
                    <span className="text-lg">
                      {s === 'BAJA' && '🟢'}
                      {s === 'MEDIA' && '🟡'}
                      {s === 'ALTA' && '🟠'}
                      {s === 'CRITICA' && '🔴'}
                    </span>
                    <span>{SEVERIDAD_LABELS[s]}</span>
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Recomendación (opcional)"
              {...register('recomendacion')}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button type="submit" loading={submitting}>
                {isOnline ? 'Registrar visita' : 'Guardar offline'}
              </Button>
            </div>
            {!isOnline && (
              <p className="text-xs text-tierra-600 bg-tierra-100 rounded-md p-2 border border-tierra-200/30">
                Sin conexión — la visita se guardará localmente y se sincronizará automáticamente.
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
