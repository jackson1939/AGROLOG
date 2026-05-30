'use client';

import { DiagnosticoUploader } from '@/components/diagnostico/DiagnosticoUploader';
import { DiagnosticoCard } from '@/components/diagnostico/DiagnosticoCard';
import { useDiagnostico } from '@/hooks/useDiagnostico';
import type { Cultivo } from '@/types';

export default function DiagnosticoPage() {
  const { loading, result, analyze, reset } = useDiagnostico();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div data-gsap="stagger">
        <h1 className="font-serif text-2xl text-text-1">Diagnóstico rápido</h1>
        <p className="text-text-3 text-sm mt-1">
          Analiza una foto con Gemini Vision
        </p>
      </div>

      {!result ? (
        <DiagnosticoUploader
          onAnalyze={(file, cultivo) => analyze(file, cultivo as Cultivo)}
          loading={loading}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-2">{result.observacionGeneral}</p>
          <p className="text-xs font-mono text-alerta-600">
            Riesgo económico: {result.riesgoEconomico}
          </p>
          {result.hipotesis.map((h, i) => (
            <DiagnosticoCard key={i} hipotesis={h} index={i} />
          ))}
          <button
            type="button"
            onClick={reset}
            className="text-sm text-campo-700 hover:underline"
          >
            Nuevo diagnóstico
          </button>
        </div>
      )}
    </div>
  );
}
