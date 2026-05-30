'use client';

import { useState } from 'react';
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
import type { Parcela, Severidad } from '@/types';

interface VisitaFormProps {
  parcelas: Parcela[];
  defaultParcelaId?: string;
  onSuccess?: () => void;
}

const severidades: Severidad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

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
      {step === 1 && (
        <div data-gsap="stagger" className="space-y-4">
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
        <div data-gsap="stagger" className="space-y-4">
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
        <div data-gsap="stagger" className="space-y-4">
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
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    selectedSeveridad === s
                      ? 'border-campo-500 bg-campo-50 text-campo-700'
                      : 'border-border text-text-2 hover:bg-surface-2'
                  )}
                >
                  {SEVERIDAD_LABELS[s]}
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
            <p className="text-xs text-tierra-600 bg-tierra-100 rounded-md p-2">
              Sin conexión — la visita se guardará localmente y se sincronizará automáticamente.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
