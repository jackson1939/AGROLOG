'use client';

interface InformePreviewProps {
  titulo: string;
  periodo: string;
  visitasCount: number;
}

export function InformePreview({ titulo, periodo, visitasCount }: InformePreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-card" data-gsap="stagger">
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="font-serif text-2xl text-text-1">{titulo || 'Vista previa'}</h2>
        <p className="text-sm text-text-3 font-mono mt-1">{periodo}</p>
      </div>
      <div className="space-y-2 text-sm text-text-2">
        <p>Visitas incluidas: <span className="font-mono">{visitasCount}</span></p>
        <p className="text-text-3">El PDF incluirá tabla de visitas, fotos y recomendaciones.</p>
      </div>
    </div>
  );
}
