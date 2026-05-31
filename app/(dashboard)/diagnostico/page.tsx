'use client';

import { DiagnosticoUploader } from '@/components/diagnostico/DiagnosticoUploader';
import { DiagnosticoCard } from '@/components/diagnostico/DiagnosticoCard';
import { AgroLogMarketplace } from '@/components/diagnostico/AgroLogMarketplace';
import { useDiagnostico } from '@/hooks/useDiagnostico';
import type { Cultivo } from '@/types';

export default function DiagnosticoPage() {
  const { loading, result, analyze, reset } = useDiagnostico();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div data-gsap="stagger">
        <h1 className="font-serif text-2xl text-text-1">Diagnóstico rápido</h1>
        <p className="text-text-3 text-sm mt-1">
          Analiza una foto con Gemini Vision
        </p>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          <DiagnosticoUploader
            onAnalyze={(file, cultivo) => analyze(file, cultivo as Cultivo)}
            loading={loading}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-surface/50 border border-border/40 p-4 rounded-xl backdrop-blur-sm space-y-2">
            <p className="text-sm text-text-2 leading-relaxed">{result.observacionGeneral}</p>
            <p className="text-xs font-mono text-alerta-600 font-bold uppercase tracking-wider">
              ⚠️ Riesgo económico: {result.riesgoEconomico}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.hipotesis.map((h, i) => (
              <DiagnosticoCard key={i} hipotesis={h} index={i} />
            ))}
          </div>

          {/* Integrated High-Tech Commercial Mediation and Transaccional Marketplace */}
          <AgroLogMarketplace 
            enfermedad={result.hipotesis[0]?.nombre || 'Enfermedad detectada'} 
            cultivo={result.hipotesis[0]?.tipo || 'Cultivo'} 
            urgencia={result.hipotesis[0]?.urgencia || 'MEDIA'} 
          />

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={reset}
              className="px-6 py-2.5 rounded-xl border border-campo-300 text-sm font-semibold text-campo-700 hover:bg-campo-50 transition-all duration-300"
            >
              Nuevo diagnóstico de campo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
