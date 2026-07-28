'use client';

import {
  FileText,
  HelpCircle,
  Home,
  Keyboard,
  Menu,
  Plus,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

export function AppChrome() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const isAdvanced = pathname.startsWith('/app/advanced');
  const isAppHome = pathname === '/app' || pathname === '/app/';

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="app-bar" data-testid="app-bar">
        <Link className="app-brand" href="/app" aria-label="Text Formatting Tool home">
          <span className="app-brand-mark" aria-hidden />
          <span className="app-brand-text">Text Formatting Tool</span>
        </Link>

        <div className="app-bar-center">
          <Link
            className="button button-secondary button-compact"
            href="/app"
            data-testid="new-transformation"
          >
            <Plus size={16} aria-hidden />
            New transformation
          </Link>
          <span className="prototype-badge" role="status" data-testid="prototype-notice">
            Prototype
          </span>
        </div>

        <div className="app-bar-actions">
          <button
            type="button"
            className="icon-button desktop-only"
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
            data-testid="keyboard-help"
            onClick={() =>
              window.alert(
                'Useful shortcuts:\n\n• Cmd/Ctrl + Enter — generate when focused in the instruction field\n• Escape — close menus',
              )
            }
          >
            <Keyboard size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="button button-secondary button-compact"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            data-testid="app-menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <nav
        id={menuId}
        className={menuOpen ? 'app-overflow-menu is-open' : 'app-overflow-menu'}
        aria-label="Application menu"
        data-testid="app-overflow-menu"
        hidden={!menuOpen}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Home size={16} aria-hidden />
          Home
        </Link>
        <Link
          href="/app/advanced"
          onClick={() => setMenuOpen(false)}
          data-testid="advanced-editor-menu-link"
        >
          <FileText size={16} aria-hidden />
          Advanced editor
        </Link>
        <Link href="/privacy" onClick={() => setMenuOpen(false)}>
          <Shield size={16} aria-hidden />
          Privacy
        </Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>
          <HelpCircle size={16} aria-hidden />
          About
        </Link>
        <a
          href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
          target="_blank"
          rel="noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          GitHub
        </a>
      </nav>

      <aside className="app-rail" aria-label="Workspace utilities" data-testid="app-rail">
        <Link
          className={isAppHome && !isAdvanced ? 'rail-item is-active' : 'rail-item'}
          href="/app"
          title="New transformation"
          aria-label="New transformation"
          aria-current={isAppHome && !isAdvanced ? 'page' : undefined}
          data-testid="rail-new"
        >
          <Plus size={20} aria-hidden />
          <span>New</span>
        </Link>
        <button
          type="button"
          className="rail-item"
          title="Example transformations"
          aria-label="Example transformations"
          data-testid="rail-examples"
          onClick={() => {
            window.dispatchEvent(new Event('tft:open-examples'));
            document.getElementById('examples')?.scrollIntoView({ block: 'nearest' });
          }}
        >
          <Sparkles size={20} aria-hidden />
          <span>Examples</span>
        </button>
        <Link
          className="rail-item"
          href="/about"
          title="Help and about"
          aria-label="Help and about"
          data-testid="rail-help"
        >
          <HelpCircle size={20} aria-hidden />
          <span>Help</span>
        </Link>
      </aside>
    </>
  );
}
