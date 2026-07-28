'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/app', label: 'Workspace' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
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

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          Text Formatting Tool
        </Link>
        <button
          type="button"
          className="nav-toggle button button-secondary"
          aria-expanded={open}
          aria-controls={menuId}
          data-testid="nav-toggle"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Close menu' : 'Menu'}
        </button>
        <nav
          aria-label="Primary"
          id={menuId}
          className={open ? 'nav-panel is-open' : 'nav-panel'}
          data-pathname={pathname}
        >
          <ul className="nav-links">
            {nav.map((item) => {
              const current =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
