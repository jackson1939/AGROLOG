'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VisitaTimeline } from '@/components/campo/VisitaTimeline';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatDate, SEVERIDAD_LABELS } from '@/lib/utils';
import type { Visita } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const severidadValue: Record<string, number> = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 4,
};

export default function BitacoraPage({ params }: { params: { id: string } }) {
  const [parcela, setParcela] = useState<{
    nombre: string;
    visitas: Visita[];
    lat: number;
    lng: number;
  } | null>(null);
  const [selected, setSelected] = useState<Visita | null>(null);
  const [clima, setClima] = useState<{ temperature: number } | null>(null);

  useEffect(() => {
    fetch(`/api/parcelas/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setParcela(data);
        return fetch(`/api/clima?lat=${data.lat}&lng=${data.lng}`);
      })
      .then((r) => r?.json())
      .then((c) => setClima(c?.current))
      .catch(console.error);
  }, [params.id]);

  if (!parcela) {
    return <div className="animate-shimmer h-64 rounded-lg bg-surface-2" />;
  }

  const chartData = [...parcela.visitas]
    .reverse()
    .map((v) => ({
      fecha: formatDate(v.fecha),
      severidad: severidadValue[v.severidad] ?? 1,
    }));

  return (
    <div className="space-y-6">
      <div data-gsap="stagger">
        <Link
          href={`/parcelas/${params.id}`}
          className="text-sm text-campo-700 hover:underline"
        >
          ← {parcela.nombre}
        </Link>
        <h1 className="font-serif text-2xl text-text-1 mt-2">Bitácora</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisitaTimeline visitas={parcela.visitas} onSelect={setSelected} />
        </div>
        <div className="space-y-4" data-gsap="stagger">
          {clima && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="font-serif text-lg">Clima actual</h3>
              <p className="font-mono text-3xl text-text-1 mt-2">
                {clima.temperature}°C
              </p>
            </div>
          )}
          {chartData.length > 1 && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="font-serif text-lg mb-3">Severidad en el tiempo</h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="severidad"
                    stroke="var(--color-campo-500)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? formatDate(selected.fecha) : ''}
      >
        {selected && (
          <div className="space-y-3">
            <Badge>{SEVERIDAD_LABELS[selected.severidad]}</Badge>
            <p className="text-sm font-medium">{selected.fenologia}</p>
            <p className="text-sm text-text-2">{selected.observaciones}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
