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
    <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md" data-gsap="stagger">
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4ade80] mb-1.5">Título del Informe</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80]/20"
          placeholder="Informe fitosanitario Mayo 2026"
        />
      </div>
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4ade80] mb-1.5">Período de Análisis</label>
        <input
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80]/20"
          placeholder="Mayo 2026"
        />
      </div>
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4ade80] mb-1.5">Tipo de Consolidación</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoInforme)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4ade80]"
        >
          {tipos.map((t) => (
            <option key={t.value} value={t.value} className="bg-slate-900 text-white">{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4ade80] mb-2">
          Visitas de Campo Incluidas ({selected.length})
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1.5 border border-white/10 rounded-xl p-3 bg-black/40">
          {visitasOptions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 font-mono">
              Cargando visitas de parcelas regionales...
            </p>
          ) : (
            visitasOptions.map((v) => (
              <label key={v.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(v.id)}
                  onChange={() => toggle(v.id)}
                  className="rounded border-white/20 bg-black text-[#4ade80] focus:ring-0"
                />
                <span className="font-medium">{v.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
      <Button
        loading={loading}
        disabled={!titulo || !periodo || selected.length === 0}
        onClick={() =>
          onGenerate({ titulo, periodo, tipo, visitasIds: selected })
        }
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/20 disabled:opacity-50 disabled:pointer-events-none"
      >
        Generar PDF
      </Button>
    </div>
  );
}
