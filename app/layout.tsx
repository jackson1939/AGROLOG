import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, DM_Mono, Outfit } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const serif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
});

const mono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
});

const sans = Outfit({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AgroLog — Sistema de Inteligencia de Campo',
  description: 'Tu campo, tu historial, tu decisión. Plataforma para agrónomos en Bolivia.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgroLog',
  },
};

export const viewport: Viewport = {
  themeColor: '#2a1f0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
