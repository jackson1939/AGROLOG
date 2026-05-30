'use client';

import { useRouter } from 'next/navigation';
import { ParcelaForm } from '@/components/parcelas/ParcelaForm';

export default function NuevaParcelaPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div data-gsap="stagger">
        <h1 className="font-serif text-2xl text-text-1">Nueva parcela</h1>
        <p className="text-text-3 text-sm">Registra una parcela georreferenciada</p>
      </div>
      <ParcelaForm onSuccess={() => router.push('/parcelas')} />
    </div>
  );
}
