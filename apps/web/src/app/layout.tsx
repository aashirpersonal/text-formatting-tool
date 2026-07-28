import type { Metadata } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
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
        <div className="shell">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <footer className="site-footer">
            <div className="container" style={{ paddingBlock: '1.25rem' }}>
              <p className="muted" style={{ margin: 0 }}>
                Open-source work in progress. Legacy v1 is preserved under the{' '}
                <code>legacy-v1</code> tag.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
