import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <footer className="site-footer" data-testid="site-footer">
        <div className="container" style={{ paddingBlock: '1.25rem' }}>
          <p className="muted" style={{ margin: 0 }}>
            Open-source work in progress. Legacy v1 is preserved under the <code>legacy-v1</code>{' '}
            tag.
          </p>
        </div>
      </footer>
    </div>
  );
}
