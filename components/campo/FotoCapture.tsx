'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface FotoCaptureProps {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  max?: number;
}

export function FotoCapture({ fotos, onChange, max = 3 }: FotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newFotos: string[] = [];
    for (const file of files.slice(0, max - fotos.length)) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newFotos.push(dataUrl);
    }
    onChange([...fotos, ...newFotos]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (index: number) => {
    onChange(fotos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFile}
      />
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((foto, i) => (
          <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-tierra-900/70 text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
        {fotos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'aspect-square rounded-md border-2 border-dashed border-border',
              'flex flex-col items-center justify-center gap-1 text-text-3 hover:border-campo-500 hover:text-campo-500 transition-colors'
            )}
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs">Capturar</span>
          </button>
        )}
      </div>
      {fotos.length < max && (
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          Agregar foto ({fotos.length}/{max})
        </Button>
      )}
    </div>
  );
}
