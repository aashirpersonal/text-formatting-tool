import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SiteHeader } from '@/components/SiteHeader';

describe('SiteHeader', () => {
  it('toggles the mobile navigation menu accessibly', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByTestId('nav-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  });
});
