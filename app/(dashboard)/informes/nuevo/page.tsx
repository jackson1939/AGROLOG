'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InformeConfig } from '@/components/informes/InformeConfig';
import { InformePreview } from '@/components/informes/InformePreview';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function NuevoInformePage() {
  const router = useRouter();
  const [visitasOptions, setVisitasOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    titulo: string;
    periodo: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/visitas')
      .then((r) => r.json())
      .then((visitas) =>
        setVisitasOptions(
          visitas.map(
            (v: {
              id: string;
              fecha: string;
              parcela: { nombre: string };
              fenologia: string;
            }) => ({
              id: v.id,
              label: `${formatDate(v.fecha)} — ${v.parcela.nombre} — ${v.fenologia}`,
            })
          )
        )
      );
  }, []);

  const handleGenerate = async (config: {
    titulo: string;
    periodo: string;
    tipo: string;
    visitasIds: string[];
  }) => {
    setLoading(true);
    setPreview({
      titulo: config.titulo,
      periodo: config.periodo,
      count: config.visitasIds.length,
    });

    try {
      const res = await fetch('/api/informes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error al generar');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.titulo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Informe generado');
      router.push('/informes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div data-gsap="stagger">
          <h1 className="font-serif text-2xl text-text-1">Nuevo informe</h1>
          <p className="text-text-3 text-sm">Configura y genera PDF</p>
        </div>
        <InformeConfig
          visitasOptions={visitasOptions}
          onGenerate={handleGenerate}
          loading={loading}
        />
      </div>
      {preview && (
        <InformePreview
          titulo={preview.titulo}
          periodo={preview.periodo}
          visitasCount={preview.count}
        />
      )}
    </div>
  );
}
