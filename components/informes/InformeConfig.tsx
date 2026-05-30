'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { TipoInforme } from '@/types';

interface InformeConfigProps {
  onGenerate: (config: {
    titulo: string;
    periodo: string;
    tipo: TipoInforme;
    visitasIds: string[];
  }) => void;
  visitasOptions: { id: string; label: string }[];
  loading?: boolean;
}

const tipos: { value: TipoInforme; label: string }[] = [
  { value: 'FITOSANITARIO', label: 'Fitosanitario' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'PARCELA', label: 'Por parcela' },
  { value: 'CAMPANA', label: 'Campaña' },
];

export function InformeConfig({
  onGenerate,
  visitasOptions,
  loading,
}: InformeConfigProps) {
  const [titulo, setTitulo] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [tipo, setTipo] = useState<TipoInforme>('MENSUAL');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4" data-gsap="stagger">
      <div>
        <label className="block text-sm font-medium text-text-2 mb-1.5">Título</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Informe fitosanitario Mayo 2025"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-2 mb-1.5">Período</label>
        <input
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Mayo 2025"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-2 mb-1.5">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoInforme)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-2 mb-2">
          Visitas incluidas ({selected.length})
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-md p-2">
          {visitasOptions.map((v) => (
            <label key={v.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-surface-2 rounded">
              <input
                type="checkbox"
                checked={selected.includes(v.id)}
                onChange={() => toggle(v.id)}
              />
              {v.label}
            </label>
          ))}
        </div>
      </div>
      <Button
        loading={loading}
        disabled={!titulo || !periodo || selected.length === 0}
        onClick={() =>
          onGenerate({ titulo, periodo, tipo, visitasIds: selected })
        }
      >
        Generar PDF
      </Button>
    </div>
  );
}
