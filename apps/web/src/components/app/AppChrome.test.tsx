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

import { AppChrome } from '@/components/app/AppChrome';

describe('AppChrome', () => {
  it('shows prototype status and opens the overflow menu', async () => {
    const user = userEvent.setup();
    render(<AppChrome />);
    expect(screen.getByTestId('prototype-notice')).toHaveTextContent(/prototype/i);
    expect(screen.queryByTestId('advanced-editor-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('rail-new')).toHaveClass('is-active');
    expect(screen.getByTestId('rail-examples')).toBeVisible();
    expect(screen.getByTestId('rail-help')).toBeVisible();
    const toggle = screen.getByTestId('app-menu-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('app-overflow-menu')).toBeVisible();
    expect(screen.getByTestId('advanced-editor-menu-link')).toHaveAttribute(
      'href',
      '/app/advanced',
    );
  });
});
