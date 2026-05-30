'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisitaForm } from '@/components/campo/VisitaForm';
import type { Parcela } from '@/types';

export default function NuevaVisitaPage() {
  const router = useRouter();
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  useEffect(() => {
    fetch('/api/parcelas')
      .then((r) => r.json())
      .then(setParcelas)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div data-gsap="stagger">
        <h1 className="font-serif text-2xl text-text-1">Nueva visita</h1>
        <p className="text-text-3 text-sm mt-1">
          Registra observaciones de campo — funciona offline
        </p>
      </div>
      <VisitaForm
        parcelas={parcelas}
        onSuccess={() => router.push('/campo')}
      />
    </div>
  );
}
