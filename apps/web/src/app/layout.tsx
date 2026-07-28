import type { Metadata } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-loaded',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Text Formatting Tool',
    template: '%s · Text Formatting Tool',
  },
  description:
    'Tell AI what to change. Apply it locally. Preview safe text transformations and process the full document in your browser.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body
        style={
          {
            '--font-sans': 'var(--font-sans-loaded), "Segoe UI", sans-serif',
            '--font-mono': 'var(--font-mono-loaded), ui-monospace, monospace',
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
