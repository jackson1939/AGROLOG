'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { parcelaSchema, type ParcelaFormData } from '@/lib/validations/parcela.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGPS } from '@/hooks/useGPS';
import { toast } from 'sonner';
import { CULTIVO_LABELS } from '@/lib/utils';
import type { Cultivo } from '@/types';

const cultivos = Object.keys(CULTIVO_LABELS) as Cultivo[];

interface ParcelaFormProps {
  onSuccess?: () => void;
}

export function ParcelaForm({ onSuccess }: ParcelaFormProps) {
  const { position, loading: gpsLoading, getPosition } = useGPS();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
    defaultValues: { cultivo: 'SOYA', activa: true },
  });

  useEffect(() => {
    if (position) {
      setValue('lat', position.lat);
      setValue('lng', position.lng);
    }
  }, [position, setValue]);

  const onSubmit = async (data: ParcelaFormData) => {
    try {
      const res = await fetch('/api/parcelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error al crear parcela');
      }
      toast.success('Parcela creada');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-gsap="stagger">
      <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
      <div>
        <label className="block text-sm font-medium text-text-2 mb-1.5">Cultivo</label>
        <select {...register('cultivo')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
          {cultivos.map((c) => (
            <option key={c} value={c}>{CULTIVO_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <Input label="Superficie (ha)" type="number" step="0.1" {...register('superficie')} error={errors.superficie?.message} />
      <Input label="Productor" {...register('productor')} error={errors.productor?.message} />
      <Input label="Municipio" {...register('municipio')} error={errors.municipio?.message} />
      <Input label="Departamento" {...register('departamento')} error={errors.departamento?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitud" type="number" step="any" {...register('lat')} error={errors.lat?.message} />
        <Input label="Longitud" type="number" step="any" {...register('lng')} error={errors.lng?.message} />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={getPosition} loading={gpsLoading}>
        Usar GPS actual
      </Button>
      <Button type="submit" loading={isSubmitting}>Crear parcela</Button>
    </form>
  );
}
