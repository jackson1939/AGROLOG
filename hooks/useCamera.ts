'use client';

import { useRef, useCallback } from 'react';

export function useCamera() {
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const captureFromFile = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    []
  );

  return { inputRef, openCamera, captureFromFile };
}
