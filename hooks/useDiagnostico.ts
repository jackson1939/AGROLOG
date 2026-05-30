'use client';

import { useState, useCallback } from 'react';
import type { DiagnosticoResult } from '@/types';
import { toast } from 'sonner';

export function useDiagnostico() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticoResult | null>(null);
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);

  const analyze = useCallback(async (foto: File, cultivo: string) => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('foto', foto);
      formData.append('cultivo', cultivo);

      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error en diagnóstico');
      }

      const data = await res.json();
      setResult(data.diagnostico);
      setDiagnosticoId(data.id);
      return data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error en diagnóstico');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setDiagnosticoId(null);
  }, []);

  return { loading, result, diagnosticoId, analyze, reset };
}
