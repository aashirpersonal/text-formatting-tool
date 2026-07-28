import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    'Turn plain-English instructions into safe, reusable text transformations. v2 is under active development.',
};

const nav = [
  { href: '/', label: 'Home' },
  { href: '/app', label: 'Workspace' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
];

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
          <header className="site-header">
            <div className="container nav">
              <Link className="brand" href="/">
                Text Formatting Tool
              </Link>
              <nav aria-label="Primary">
                <ul className="nav-links">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </header>
          <main id="main">{children}</main>
          <footer className="site-footer">
            <div className="container" style={{ paddingBlock: '1.25rem' }}>
              <p className="muted" style={{ margin: 0 }}>
                Open-source work in progress. Legacy v1 is preserved in Git history under the{' '}
                <code>legacy-v1</code> tag.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
