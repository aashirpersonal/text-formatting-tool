import type { ReactNode } from 'react';
import { AppChrome } from '@/components/app/AppChrome';

export default function ApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-root theme-warm-light" data-theme="warm-light" data-testid="app-root">
      <a className="skip-link" href="#app-main">
        Skip to workspace
      </a>
      <AppChrome />
      <div id="app-main" className="app-main">
        {children}
      </div>
    </div>
  );
}
