'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/Toast';
import { LanguageProvider } from '@/lib/language';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </LanguageProvider>
    </SessionProvider>
  );
}

