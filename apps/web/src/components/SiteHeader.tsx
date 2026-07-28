'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

const primaryNav = [
  { href: '/app', label: 'Product' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/about', label: 'About' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          Text Formatting Tool
        </Link>
        <div className="nav-actions">
          <Link className="button button-primary button-compact desktop-only" href="/app">
            Open app
          </Link>
          <button
            type="button"
            className="nav-toggle button button-secondary"
            aria-expanded={open}
            aria-controls={menuId}
            data-testid="nav-toggle"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            {open ? 'Close menu' : 'Menu'}
          </button>
        </div>
        <nav
          aria-label="Primary"
          id={menuId}
          className={open ? 'nav-panel is-open' : 'nav-panel'}
          data-pathname={pathname}
          data-testid="primary-nav"
        >
          <ul className="nav-links">
            {primaryNav.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href="https://github.com/aashirpersonal/text-formatting-tool/tree/v2-rebuild"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
              >
                GitHub
              </a>
            </li>
            <li className="nav-subtle">
              <Link href="/app/advanced" onClick={() => setOpen(false)}>
                Advanced editor
              </Link>
            </li>
            <li className="mobile-only">
              <Link
                className="button button-primary button-block"
                href="/app"
                onClick={() => setOpen(false)}
              >
                Open app
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
